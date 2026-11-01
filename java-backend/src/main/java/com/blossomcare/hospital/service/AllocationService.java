package com.blossomcare.hospital.service;

import com.blossomcare.hospital.exception.BedUnavailableException;
import com.blossomcare.hospital.exception.EntityNotFoundException;
import com.blossomcare.hospital.exception.InvalidAllocationRequestException;
import com.blossomcare.hospital.exception.UnauthorizedStaffActionException;
import com.blossomcare.hospital.model.Admission;
import com.blossomcare.hospital.model.AllocationRequest;
import com.blossomcare.hospital.model.AuditLogEntry;
import com.blossomcare.hospital.model.Bed;
import com.blossomcare.hospital.model.DischargeRecord;
import com.blossomcare.hospital.model.ICUBed;
import com.blossomcare.hospital.model.Patient;
import com.blossomcare.hospital.model.Ward;
import com.blossomcare.hospital.model.enums.AcuityLevel;
import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.DischargeOutcome;
import com.blossomcare.hospital.model.enums.PatientStatus;
import com.blossomcare.hospital.model.enums.StaffRole;
import com.blossomcare.hospital.model.enums.WardType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Core domain service orchestrating the Intelligent Hospital Bed Allocation System
 * for the Blossom Care platform.
 *
 * <p>Key Object-Oriented Responsibilities &amp; Techniques Demonstrated:</p>
 * <ul>
 *   <li><b>Abstraction &amp; Dependency Inversion</b>: Delegates bed compatibility scoring
 *       and suitability validation to the {@link BedAllocationPolicy} interface.</li>
 *   <li><b>Polymorphism (Dynamic &amp; Static)</b>:
 *       <ul>
 *         <li><i>Runtime Polymorphism</i>: Operates on abstract {@link Bed} references that
 *             resolve dynamically to {@link ICUBed} or {@link com.blossomcare.hospital.model.GeneralBed}.</li>
 *         <li><i>Compile-Time Polymorphism (Method Overloading)</i>: Provides overloaded
 *             {@code allocateBed(...)} and {@code dischargePatient(...)} methods for standard,
 *             staff-override, and role-authenticated clinical workflows.</li>
 *       </ul>
 *   </li>
 *   <li><b>Association &amp; Aggregation</b>: Coordinates {@link Ward}, {@link Bed},
 *       {@link Patient}, {@link AllocationRequest}, {@link Admission}, and {@link DischargeRecord}.</li>
 *   <li><b>Exception Handling</b>: Enforces clinical invariants using custom domain exceptions
 *       ({@link BedUnavailableException}, {@link InvalidAllocationRequestException},
 *       {@link EntityNotFoundException}, {@link UnauthorizedStaffActionException}).</li>
 * </ul>
 */
public class AllocationService {

    private final BedAllocationPolicy allocationPolicy;
    private final Map<String, Ward> wardsById;
    private final Map<String, Bed> bedsById;
    private final Map<String, Patient> patientsById;
    private final Map<String, AllocationRequest> waitingQueueByPatientId;
    private final List<Admission> admissions;
    private final List<DischargeRecord> dischargeRecords;
    private final List<AuditLogEntry> auditLogs;
    private final AtomicLong sequenceGenerator;

    public AllocationService(BedAllocationPolicy allocationPolicy) {
        if (allocationPolicy == null) {
            throw new IllegalArgumentException("BedAllocationPolicy cannot be null.");
        }
        this.allocationPolicy = allocationPolicy;
        this.wardsById = new LinkedHashMap<>();
        this.bedsById = new LinkedHashMap<>();
        this.patientsById = new LinkedHashMap<>();
        this.waitingQueueByPatientId = new LinkedHashMap<>();
        this.admissions = new ArrayList<>();
        this.dischargeRecords = new ArrayList<>();
        this.auditLogs = new ArrayList<>();
        this.sequenceGenerator = new AtomicLong(1L);
    }

    /**
     * Default constructor initialized with the standard {@link ClinicalBedAllocationPolicy}.
     */
    public AllocationService() {
        this(new ClinicalBedAllocationPolicy());
    }

    // =========================================================================
    // 1. WARD & BED REGISTRATION
    // =========================================================================

    public Ward registerWard(Ward ward) {
        if (ward == null) {
            throw new IllegalArgumentException("Ward cannot be null.");
        }
        if (wardsById.containsKey(ward.getId())) {
            throw new IllegalArgumentException("Ward with ID '" + ward.getId() + "' is already registered.");
        }
        wardsById.put(ward.getId(), ward);
        for (Bed bed : ward.getBeds()) {
            bedsById.put(bed.getId(), bed);
        }
        recordAudit("Ward Registered", "Ward", "System Admin",
                String.format("Registered %s (%s) on Floor %d.", ward.getName(), ward.getType(), ward.getFloor()));
        return ward;
    }

    public Bed registerBedInWard(String wardId, Bed bed) {
        Ward ward = getWardById(wardId);
        if (bed == null) {
            throw new IllegalArgumentException("Bed cannot be null.");
        }
        if (bedsById.containsKey(bed.getId())) {
            throw new IllegalArgumentException("Bed with ID '" + bed.getId() + "' already exists.");
        }
        ward.addBed(bed);
        bedsById.put(bed.getId(), bed);
        return bed;
    }

    // =========================================================================
    // 2. PATIENT REGISTRATION & WAITING QUEUE MANAGEMENT
    // =========================================================================

    /**
     * Registers a patient and automatically places them in the priority-ranked waiting queue
     * if their status is {@link PatientStatus#WAITING}.
     */
    public AllocationRequest registerPatientForAdmission(Patient patient, String requestedByStaff) {
        return registerPatientForAdmission(patient, LocalDateTime.now(), false, "", requestedByStaff);
    }

    /**
     * Overloaded registration method supporting custom arrival timestamps and override metadata.
     */
    public AllocationRequest registerPatientForAdmission(
            Patient patient,
            LocalDateTime requestedAt,
            boolean staffOverride,
            String overrideReason,
            String requestedByStaff
    ) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null.");
        }
        patientsById.put(patient.getId(), patient);

        long seq = sequenceGenerator.getAndIncrement();
        String reqId = String.format("REQ-%04d", seq);
        AllocationRequest request = new AllocationRequest(
                reqId,
                patient,
                requestedAt,
                seq,
                staffOverride,
                overrideReason,
                requestedByStaff
        );

        if (patient.getStatus() == PatientStatus.WAITING) {
            waitingQueueByPatientId.put(patient.getId(), request);
            recordAudit(
                    "Patient Added to Waiting Queue",
                    "Admission",
                    requestedByStaff != null ? requestedByStaff : "Admissions Desk",
                    String.format("Registered %s (%s, Priority %d) requesting %s ward.",
                            patient.getName(), patient.getAcuity(), patient.getPriorityScore(), patient.getRequiredWardType())
            );
        }
        return request;
    }

    /**
     * Returns all waiting-list allocation requests sorted by descending priority score
     * and FIFO arrival order for ties.
     */
    public List<AllocationRequest> getPriorityOrderedWaitingQueue() {
        return PriorityCalculator.sortWaitingQueue(new ArrayList<>(waitingQueueByPatientId.values()));
    }

    /**
     * Returns all waiting patients in priority order (highest priority first, FIFO tie-breaker).
     */
    public List<Patient> getPriorityOrderedWaitingPatients() {
        return getPriorityOrderedWaitingQueue().stream()
                .map(AllocationRequest::getPatient)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 3. BED AVAILABILITY & SUITABILITYRECOMMENDATIONS
    // =========================================================================

    /**
     * Ranks available beds for a specific patient using the configured {@link BedAllocationPolicy}.
     */
    public List<Bed> getRecommendedBedsForPatient(String patientId) {
        Patient patient = getPatientById(patientId);
        return allocationPolicy.rankAvailableBedsForPatient(patient, new ArrayList<>(bedsById.values()));
    }

    // =========================================================================
    // 4. BED ALLOCATION (METHOD OVERLOADING & POLYMORPHIC VALIDATION)
    // =========================================================================

    /**
     * Overloaded Method #1: Standard clinical bed allocation without staff override.
     * Enforces strict ward/equipment suitability rules.
     *
     * @param patientId ID of the waiting patient
     * @param bedId     ID or bed number of the target bed
     * @return created {@link Admission} record
     */
    public Admission allocateBed(String patientId, String bedId) {
        return allocateBed(patientId, bedId, "Clinical Triage Engine", false, "");
    }

    /**
     * Overloaded Method #2: RBAC-checked bed allocation performed by a specific {@link StaffRole}.
     */
    public Admission allocateBed(
            String patientId,
            String bedId,
            StaffRole staffRole,
            String staffActor,
            boolean staffOverride,
            String overrideReason
    ) {
        if (staffRole == null || !staffRole.hasPermission(StaffRole.Permission.ALLOCATE_BEDS)) {
            throw new UnauthorizedStaffActionException(staffRole, StaffRole.Permission.ALLOCATE_BEDS);
        }
        if (staffOverride && !staffRole.hasPermission(StaffRole.Permission.OVERRIDE_ALLOCATION_POLICY)) {
            throw new UnauthorizedStaffActionException(staffRole, StaffRole.Permission.OVERRIDE_ALLOCATION_POLICY);
        }
        return allocateBed(patientId, bedId, staffActor, staffOverride, overrideReason);
    }

    /**
     * Overloaded Method #3: Full bed allocation with optional clinical staff override.
     *
     * <p>Validates:</p>
     * <ol>
     *   <li>Patient exists and is currently in {@link PatientStatus#WAITING} status.</li>
     *   <li>Target bed exists and is in {@link BedStatus#AVAILABLE} status (throws {@link BedUnavailableException} otherwise).</li>
     *   <li>Bed is clinically suitable for the patient (e.g., ICU vs General Bed rules, ventilator, isolation)
     *       OR a valid {@code staffOverride} with a documented clinical reason is supplied
     *       (throws {@link InvalidAllocationRequestException} otherwise).</li>
     * </ol>
     */
    public Admission allocateBed(
            String patientId,
            String bedId,
            String staffActor,
            boolean staffOverride,
            String overrideReason
    ) {
        if (patientId == null || patientId.isBlank()) {
            throw new InvalidAllocationRequestException("Patient ID cannot be null or blank.");
        }
        if (bedId == null || bedId.isBlank()) {
            throw new InvalidAllocationRequestException("Bed ID cannot be null or blank.");
        }

        Patient patient = getPatientById(patientId);
        Bed bed = getBedByIdOrNumber(bedId);
        Ward ward = getWardById(bed.getWardId());

        // 1. Validate patient admission eligibility
        if (patient.getStatus() == PatientStatus.ADMITTED) {
            throw new InvalidAllocationRequestException(
                    patient.getId(),
                    bed.getBedNumber(),
                    String.format("Patient '%s' (%s) is already admitted to bed '%s'.",
                            patient.getName(), patient.getId(), patient.getAssignedBedId())
            );
        }
        if (patient.getStatus() == PatientStatus.DISCHARGED) {
            throw new InvalidAllocationRequestException(
                    patient.getId(),
                    bed.getBedNumber(),
                    String.format("Patient '%s' (%s) has already been discharged and cannot be allocated a bed without re-admission.",
                            patient.getName(), patient.getId())
            );
        }

        // 2. Validate bed availability (throws BedUnavailableException if Occupied, Cleaning, or Maintenance)
        if (!bed.isAvailable()) {
            throw new BedUnavailableException(bed.getBedNumber(), bed.getStatus());
        }

        // 3. Validate override documentation if staffOverride is requested
        if (staffOverride && (overrideReason == null || overrideReason.isBlank())) {
            throw new InvalidAllocationRequestException(
                    patient.getId(),
                    bed.getBedNumber(),
                    "A clinical override reason must be provided when overriding standard bed suitability rules."
            );
        }

        // 4. Validate clinical suitability via polymorphic BedAllocationPolicy
        if (!allocationPolicy.canAllocate(patient, bed, staffOverride)) {
            String mismatchExplanation = buildSuitabilityMismatchReason(patient, bed);
            throw new InvalidAllocationRequestException(
                    patient.getId(),
                    bed.getBedNumber(),
                    mismatchExplanation
            );
        }

        // 5. Execute state transitions on Bed and Patient
        LocalDateTime now = LocalDateTime.now();
        int compatibilityScore = allocationPolicy.evaluateCompatibilityScore(patient, bed);
        bed.assignPatient(patient.getId());
        patient.markAdmitted(bed.getId(), now);
        waitingQueueByPatientId.remove(patient.getId());

        String rationale = staffOverride
                ? "STAFF OVERRIDE: " + overrideReason.trim()
                : String.format("Standard Clinical Match (Suitability Score: %d pts)", compatibilityScore);

        String admissionId = String.format("ADM-%04d", sequenceGenerator.getAndIncrement());
        Admission admission = new Admission(
                admissionId,
                patient,
                bed,
                ward,
                patient.getAttendingDoctor(),
                staffActor != null ? staffActor : "Clinical Triage Engine",
                now,
                compatibilityScore,
                staffOverride,
                rationale
        );
        admissions.add(admission);

        recordAudit(
                staffOverride ? "Bed Allocated (Staff Override)" : "Bed Allocated",
                "Allocation",
                staffActor != null ? staffActor : "Clinical Triage Engine",
                String.format("Assigned %s (%s, Priority %d) to %s in %s. %s",
                        patient.getName(), patient.getAcuity(), patient.getPriorityScore(),
                        bed.getBedNumber(), ward.getName(), rationale)
        );

        return admission;
    }

    /**
     * Automatically selects the highest-priority patient in the waiting queue (using
     * priority score + FIFO arrival tie-breaking) and allocates the highest-scoring
     * suitable available bed for them.
     *
     * @param staffActor name of the staff member or automated scheduler triggering allocation
     * @return Optional containing the resulting {@link Admission} if a match was found
     */
    public Optional<Admission> allocateNextHighestPriorityPatient(String staffActor) {
        List<AllocationRequest> orderedQueue = getPriorityOrderedWaitingQueue();
        List<Bed> allBeds = new ArrayList<>(bedsById.values());

        for (AllocationRequest request : orderedQueue) {
            Patient candidatePatient = request.getPatient();
            Optional<Bed> optimalBed = allocationPolicy.selectOptimalBed(
                    candidatePatient,
                    allBeds,
                    request.isStaffOverride()
            );
            if (optimalBed.isPresent()) {
                Admission admission = allocateBed(
                        candidatePatient.getId(),
                        optimalBed.get().getId(),
                        staffActor,
                        request.isStaffOverride(),
                        request.getOverrideReason()
                );
                return Optional.of(admission);
            }
        }
        return Optional.empty();
    }

    private String buildSuitabilityMismatchReason(Patient patient, Bed bed) {
        if (patient.requiresIntensiveCare() && !(bed instanceof ICUBed)) {
            return String.format(
                    "Clinical Safety Violation: Patient '%s' (Acuity=%s, ReqWard=%s, Ventilator=%s) requires an ICUBed, "
                            + "but bed '%s' is a '%s' in %s. Provide an authorized staff override if emergency boarding is required.",
                    patient.getName(), patient.getAcuity(), patient.getRequiredWardType(),
                    patient.isNeedsVentilator(), bed.getBedNumber(), bed.getBedCategory(), bed.getWardName()
            );
        }
        if (patient.isNeedsVentilator() && !bed.isHasVentilator()) {
            return String.format(
                    "Equipment Mismatch: Patient '%s' requires mechanical ventilation, which is not available on bed '%s'.",
                    patient.getName(), bed.getBedNumber()
            );
        }
        if (patient.isNeedsIsolation() && !bed.isIsolationCapable()) {
            return String.format(
                    "Infection Control Mismatch: Patient '%s' requires negative-pressure isolation, which is not supported by bed '%s'.",
                    patient.getName(), bed.getBedNumber()
            );
        }
        return String.format(
                "Ward Specialty Mismatch: Patient '%s' requires '%s' care, but bed '%s' belongs to '%s' (%s). "
                        + "Enable staffOverride to authorize cross-ward placement.",
                patient.getName(), patient.getRequiredWardType(), bed.getBedNumber(),
                bed.getWardName(), bed.getWardType()
        );
    }

    // =========================================================================
    // 5. PATIENT DISCHARGE & BED RELEASE
    // =========================================================================

    /**
     * Overloaded Discharge Method #1: Discharges an admitted patient and transitions their
     * released bed to {@link BedStatus#CLEANING} for terminal sanitization by default.
     */
    public DischargeRecord dischargePatient(
            String patientId,
            DischargeOutcome outcome,
            String dischargedBy,
            String summaryNotes
    ) {
        return dischargePatient(patientId, outcome, BedStatus.CLEANING, dischargedBy, summaryNotes);
    }

    /**
     * Overloaded Discharge Method #2: Discharges an admitted patient and transitions their
     * released bed to the caller-specified post-discharge status ({@link BedStatus#CLEANING}
     * or {@link BedStatus#AVAILABLE}).
     */
    public DischargeRecord dischargePatient(
            String patientId,
            DischargeOutcome outcome,
            BedStatus postDischargeBedStatus,
            String dischargedBy,
            String summaryNotes
    ) {
        Patient patient = getPatientById(patientId);
        if (patient.getStatus() != PatientStatus.ADMITTED || patient.getAssignedBedId() == null) {
            throw new InvalidAllocationRequestException(
                    "Cannot discharge patient '" + patient.getName() + "' (" + patient.getId()
                            + ") because they are not currently admitted to a bed."
            );
        }
        if (postDischargeBedStatus == BedStatus.OCCUPIED) {
            throw new InvalidAllocationRequestException("Post-discharge bed status cannot be OCCUPIED.");
        }

        Bed releasedBed = getBedByIdOrNumber(patient.getAssignedBedId());
        Ward ward = getWardById(releasedBed.getWardId());
        LocalDateTime now = LocalDateTime.now();

        BedStatus targetBedStatus = (postDischargeBedStatus != null) ? postDischargeBedStatus : BedStatus.CLEANING;
        releasedBed.releaseBed(targetBedStatus);
        patient.markDischarged();

        // Mark corresponding active Admission record as completed
        admissions.stream()
                .filter(adm -> adm.getPatient().getId().equals(patient.getId())
                        && adm.getState() == Admission.AdmissionState.ACTIVE)
                .findFirst()
                .ifPresent(adm -> adm.markCompletedOnDischarge(now));

        String dischargeId = String.format("DSC-%04d", sequenceGenerator.getAndIncrement());
        DischargeRecord record = new DischargeRecord(
                dischargeId,
                patient.getId(),
                patient.getName(),
                releasedBed.getId(),
                releasedBed.getBedNumber(),
                ward.getName(),
                dischargedBy != null ? dischargedBy : "Attending Physician",
                now,
                outcome != null ? outcome : DischargeOutcome.RECOVERED_HOME,
                targetBedStatus,
                summaryNotes
        );
        dischargeRecords.add(record);

        recordAudit(
                "Patient Discharged & Bed Released",
                "Discharge",
                dischargedBy != null ? dischargedBy : "Attending Physician",
                String.format("Discharged %s from %s (%s). Outcome: %s. Bed transitioned to %s.",
                        patient.getName(), releasedBed.getBedNumber(), ward.getName(),
                        record.getOutcome().getDisplayName(), targetBedStatus.getDisplayName())
        );

        return record;
    }

    /**
     * Completes environmental sanitization on a bed in {@link BedStatus#CLEANING} or
     * {@link BedStatus#MAINTENANCE} status, returning it to {@link BedStatus#AVAILABLE}.
     */
    public Bed markBedAvailableAfterCleaning(String bedIdOrNumber, String staffActor) {
        Bed bed = getBedByIdOrNumber(bedIdOrNumber);
        bed.completeSanitization();
        recordAudit(
                "Bed Sanitization Completed",
                "Sanitation",
                staffActor != null ? staffActor : "Environmental Services",
                String.format("Bed %s (%s) sanitized and marked AVAILABLE for allocation.",
                        bed.getBedNumber(), bed.getWardName())
        );
        return bed;
    }

    // =========================================================================
    // 6. REPORTING & QUERYING
    // =========================================================================

    public OccupancyReport generateOccupancyReport() {
        List<Bed> allBeds = new ArrayList<>(bedsById.values());
        int total = allBeds.size();
        int occupied = (int) allBeds.stream().filter(b -> b.getStatus() == BedStatus.OCCUPIED).count();
        int available = (int) allBeds.stream().filter(b -> b.getStatus() == BedStatus.AVAILABLE).count();
        int cleaning = (int) allBeds.stream().filter(b -> b.getStatus() == BedStatus.CLEANING).count();
        int maintenance = (int) allBeds.stream().filter(b -> b.getStatus() == BedStatus.MAINTENANCE).count();

        int totalIcu = (int) allBeds.stream().filter(b -> b.getWardType() == WardType.ICU).count();
        int availIcu = (int) allBeds.stream()
                .filter(b -> b.getWardType() == WardType.ICU && b.getStatus() == BedStatus.AVAILABLE)
                .count();

        int waitingCount = waitingQueueByPatientId.size();
        int criticalWaiting = (int) waitingQueueByPatientId.values().stream()
                .filter(req -> req.getPatient().getAcuity() == AcuityLevel.CRITICAL)
                .count();

        int activeAdmCount = (int) admissions.stream()
                .filter(a -> a.getState() == Admission.AdmissionState.ACTIVE)
                .count();

        List<OccupancyReport.WardSummary> wardSummaries = wardsById.values().stream()
                .map(OccupancyReport.WardSummary::new)
                .collect(Collectors.toList());

        return new OccupancyReport(
                LocalDateTime.now(),
                total,
                occupied,
                available,
                cleaning,
                maintenance,
                totalIcu,
                availIcu,
                waitingCount,
                criticalWaiting,
                activeAdmCount,
                dischargeRecords.size(),
                wardSummaries
        );
    }

    public Ward getWardById(String wardId) {
        if (wardId == null || wardId.isBlank()) {
            throw new com.blossomcare.hospital.exception.WardNotFoundException(String.valueOf(wardId));
        }
        Ward ward = wardsById.get(wardId.trim());
        if (ward == null) {
            throw new com.blossomcare.hospital.exception.WardNotFoundException(wardId);
        }
        return ward;
    }

    public Bed getBedByIdOrNumber(String bedIdOrNumber) {
        if (bedIdOrNumber == null || bedIdOrNumber.isBlank()) {
            throw new EntityNotFoundException("Bed", String.valueOf(bedIdOrNumber));
        }
        Bed direct = bedsById.get(bedIdOrNumber.trim());
        if (direct != null) {
            return direct;
        }
        return bedsById.values().stream()
                .filter(b -> b.getBedNumber().equalsIgnoreCase(bedIdOrNumber.trim()))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Bed", bedIdOrNumber));
    }

    public Patient getPatientById(String patientId) {
        if (patientId == null || patientId.isBlank()) {
            throw new com.blossomcare.hospital.exception.PatientNotFoundException(String.valueOf(patientId));
        }
        Patient patient = patientsById.get(patientId.trim());
        if (patient == null) {
            throw new com.blossomcare.hospital.exception.PatientNotFoundException(patientId);
        }
        return patient;
    }

    public List<Ward> getAllWards() {
        return List.copyOf(wardsById.values());
    }

    public List<Bed> getAllBeds() {
        return List.copyOf(bedsById.values());
    }

    public List<Patient> getAllPatients() {
        return List.copyOf(patientsById.values());
    }

    public List<Admission> getAdmissions() {
        return Collections.unmodifiableList(admissions);
    }

    public List<DischargeRecord> getDischargeRecords() {
        return Collections.unmodifiableList(dischargeRecords);
    }

    public List<AuditLogEntry> getAuditLogs() {
        return Collections.unmodifiableList(auditLogs);
    }

    private void recordAudit(String action, String category, String actor, String details) {
        String logId = String.format("AUD-%04d", sequenceGenerator.getAndIncrement());
        auditLogs.add(0, new AuditLogEntry(logId, action, category, actor, LocalDateTime.now(), details));
    }
}
