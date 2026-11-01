package com.blossomcare.hospital;

import com.blossomcare.hospital.exception.BedUnavailableException;
import com.blossomcare.hospital.exception.EntityNotFoundException;
import com.blossomcare.hospital.exception.InvalidAllocationRequestException;
import com.blossomcare.hospital.exception.UnauthorizedStaffActionException;
import com.blossomcare.hospital.model.Admission;
import com.blossomcare.hospital.model.Bed;
import com.blossomcare.hospital.model.DischargeRecord;
import com.blossomcare.hospital.model.GeneralBed;
import com.blossomcare.hospital.model.ICUBed;
import com.blossomcare.hospital.model.Patient;
import com.blossomcare.hospital.model.VitalSigns;
import com.blossomcare.hospital.model.Ward;
import com.blossomcare.hospital.model.enums.AcuityLevel;
import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.DischargeOutcome;
import com.blossomcare.hospital.model.enums.PatientStatus;
import com.blossomcare.hospital.model.enums.StaffRole;
import com.blossomcare.hospital.model.enums.WardType;
import com.blossomcare.hospital.service.AllocationService;
import com.blossomcare.hospital.service.OccupancyReport;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Comprehensive Automated Unit Test Suite for the Blossom Care Hospital Bed Allocation System.
 *
 * <p>Covers all 10 required academic verification areas:</p>
 * <ol>
 *   <li>Patient creation and encapsulation validation</li>
 *   <li>Bed creation ({@link GeneralBed} and {@link ICUBed} inheritance &amp; polymorphism)</li>
 *   <li>Ward assignment and capacity aggregation</li>
 *   <li>Successful bed allocation</li>
 *   <li>Attempted allocation of occupied/cleaning/maintenance beds ({@link BedUnavailableException})</li>
 *   <li>ICU suitability enforcement and compatibility scoring</li>
 *   <li>Invalid allocation requests ({@link InvalidAllocationRequestException})</li>
 *   <li>Priority-based patient selection and deterministic FIFO arrival-order tie-breaking</li>
 *   <li>Staff override functionality and RBAC authorization</li>
 *   <li>Patient discharge, bed release ({@code CLEANING} vs {@code AVAILABLE}), and sanitization</li>
 * </ol>
 */
public class AllocationServiceTest {

    private int passedTests = 0;
    private int failedTests = 0;

    public static void main(String[] args) {
        AllocationServiceTest suite = new AllocationServiceTest();
        boolean allPassed = suite.runAllTests();
        if (!allPassed) {
            System.exit(1);
        }
    }

    public boolean runAllTests() {
        System.out.println("========================================================================================================");
        System.out.println("           BLOSSOM CARE — AUTOMATED UNIT TEST SUITE (10 CORE OOP & CLINICAL SCENARIOS)                 ");
        System.out.println("========================================================================================================");

        executeTest("Test 01: Patient Creation, Priority Score Calculation & Encapsulation Validation",
                this::test01_patientCreationAndValidation);
        executeTest("Test 02: Bed Creation & Polymorphic Behavior (ICUBed vs GeneralBed)",
                this::test02_bedCreationAndPolymorphism);
        executeTest("Test 03: Ward Assignment, Duplicate Prevention & Capacity Aggregation",
                this::test03_wardAssignmentAndAggregation);
        executeTest("Test 04: Successful Clinical Bed Allocation & State Transitions",
                this::test04_successfulBedAllocation);
        executeTest("Test 05: Attempted Allocation of Occupied, Cleaning & Maintenance Beds",
                this::test05_attemptedAllocationOfUnavailableBeds);
        executeTest("Test 06: ICU Suitability Enforcement & 50/25/20 Compatibility Scoring",
                this::test06_icuSuitabilityEnforcementAndScoring);
        executeTest("Test 07: Invalid Allocation Requests (Already Admitted, Discharged, Missing Override Reason)",
                this::test07_invalidAllocationRequests);
        executeTest("Test 08: Priority-Based Patient Selection & Arrival-Order (FIFO) Tie-Breaking",
                this::test08_prioritySelectionAndArrivalTieBreaking);
        executeTest("Test 09: Staff Override Functionality & RBAC Permission Checks",
                this::test09_staffOverrideAndRbacAuthorization);
        executeTest("Test 10: Patient Discharge, Bed Release (CLEANING/AVAILABLE) & Occupancy Report",
                this::test10_dischargeBedReleaseAndOccupancyReport);

        System.out.println("--------------------------------------------------------------------------------------------------------");
        System.out.printf("TEST EXECUTION SUMMARY: %d Passed | %d Failed | Total: %d%n",
                passedTests, failedTests, (passedTests + failedTests));
        System.out.println("========================================================================================================");
        return failedTests == 0;
    }

    // =========================================================================
    // TEST 1: Patient Creation and Validation
    // =========================================================================
    public void test01_patientCreationAndValidation() {
        Patient criticalPatient = new Patient(
                "PAT-001", "Harold Chen-Sterling", 69, "Male", "B+",
                "Septic Shock", AcuityLevel.CRITICAL, WardType.ICU,
                true, true, "Dr. Elena Vance", "555-0101", "Urgent ICU",
                new VitalSigns(128, 89, "88/54", 39.2)
        );

        assertEquals("PAT-001", criticalPatient.getId(), "Patient ID should match");
        assertEquals(PatientStatus.WAITING, criticalPatient.getStatus(), "Initial status must be WAITING");
        assertTrue(criticalPatient.requiresIntensiveCare(), "Critical ventilator patient must require ICU");
        // Base CRITICAL (95) + Vent (2) + Isolation (1) + Acute Distress Vitals (1) = 99
        assertEquals(99, criticalPatient.getPriorityScore(), "Calculated priority score should be 99");

        // Verify encapsulation input validation rejects invalid age, blank name, and invalid vitals
        assertThrows(IllegalArgumentException.class, () ->
                new Patient("PAT-BAD", "", 40, "Female", "Flu", AcuityLevel.STABLE, WardType.GENERAL, false, false),
                "Blank patient name must throw IllegalArgumentException");

        assertThrows(IllegalArgumentException.class, () ->
                new Patient("PAT-BAD2", "Jane Doe", -5, "Female", "Flu", AcuityLevel.STABLE, WardType.GENERAL, false, false),
                "Negative age must throw IllegalArgumentException");

        assertThrows(IllegalArgumentException.class, () ->
                new VitalSigns(400, 98, "120/80", 37.0),
                "Out-of-range heart rate must throw IllegalArgumentException");
    }

    // =========================================================================
    // TEST 2: Bed Creation (GeneralBed and ICUBed)
    // =========================================================================
    public void test02_bedCreationAndPolymorphism() {
        Bed icuBed = new ICUBed("BED-ICU-1", "ICU-101", "WARD-ICU", "Blossom ICU", 1, BedStatus.AVAILABLE, true, true);
        Bed generalBed = new GeneralBed("BED-GEN-1", "GEN-401", "WARD-GEN", "Lotus General", WardType.GENERAL, 4, BedStatus.AVAILABLE, false, false);

        assertEquals("Intensive Care Unit (ICU) Bed", icuBed.getBedCategory(), "ICUBed polymorphic category");
        assertEquals("General Inpatient Bed", generalBed.getBedCategory(), "GeneralBed polymorphic category");
        assertTrue(icuBed.isHasTelemetry(), "All ICU beds must include continuous telemetry");

        // Verify GeneralBed cannot be created with WardType.ICU
        assertThrows(IllegalArgumentException.class, () ->
                new GeneralBed("BED-BAD", "BAD-101", "WARD-ICU", "ICU", WardType.ICU, 1, BedStatus.AVAILABLE, true, false),
                "GeneralBed with WardType.ICU must throw IllegalArgumentException");
    }

    // =========================================================================
    // TEST 3: Ward Assignment and Aggregation
    // =========================================================================
    public void test03_wardAssignmentAndAggregation() {
        Ward icuWard = new Ward("WARD-ICU", "Blossom ICU", WardType.ICU, 1, "North Wing", "Nurse Hannah", "4101", "ICU");
        ICUBed bed1 = new ICUBed("BED-1", "ICU-101", "WARD-ICU", "Blossom ICU", 1, BedStatus.AVAILABLE, true, true);
        ICUBed bed2 = new ICUBed("BED-2", "ICU-102", "WARD-ICU", "Blossom ICU", 1, BedStatus.CLEANING, true, false);

        icuWard.addBed(bed1);
        icuWard.addBed(bed2);

        assertEquals(2, icuWard.getTotalCapacity(), "Ward total capacity must be 2");
        assertEquals(1L, icuWard.getAvailableCount(), "Ward available count must be 1");
        assertEquals(1L, icuWard.getCleaningCount(), "Ward cleaning count must be 1");

        // Prevent adding a bed belonging to a different ward
        GeneralBed wrongWardBed = new GeneralBed("BED-3", "GEN-401", "WARD-GEN", "General", WardType.GENERAL, 4, BedStatus.AVAILABLE, false, false);
        assertThrows(IllegalArgumentException.class, () -> icuWard.addBed(wrongWardBed),
                "Adding a bed with mismatched wardId must throw IllegalArgumentException");

        // Prevent duplicate bed numbers in the same ward
        ICUBed duplicateBed = new ICUBed("BED-1-DUP", "ICU-101", "WARD-ICU", "Blossom ICU", 1, BedStatus.AVAILABLE, true, false);
        assertThrows(IllegalArgumentException.class, () -> icuWard.addBed(duplicateBed),
                "Duplicate bed number in the same ward must throw IllegalArgumentException");
    }

    // =========================================================================
    // TEST 4: Successful Bed Allocation
    // =========================================================================
    public void test04_successfulBedAllocation() {
        AllocationService service = createTestHospitalService();
        Patient cardiacPatient = new Patient(
                "PAT-201", "Miriam Goldstein", 74, "Female",
                "Unstable Angina", AcuityLevel.HIGH, WardType.CARDIAC, false, false
        );
        service.registerPatientForAdmission(cardiacPatient, "Nurse Clara");

        Admission admission = service.allocateBed("PAT-201", "CARD-201");

        assertNotNull(admission, "Admission record must not be null");
        assertEquals(PatientStatus.ADMITTED, cardiacPatient.getStatus(), "Patient status must transition to ADMITTED");
        assertEquals("BED-CARD-201", cardiacPatient.getAssignedBedId(), "Patient assignedBedId must be updated");
        assertEquals(BedStatus.OCCUPIED, service.getBedByIdOrNumber("CARD-201").getStatus(), "Bed status must be OCCUPIED");
        assertEquals("PAT-201", service.getBedByIdOrNumber("CARD-201").getPatientId(), "Bed patientId must match");
        assertEquals(0, service.getPriorityOrderedWaitingQueue().size(), "Patient must be removed from waiting queue");
    }

    // =========================================================================
    // TEST 5: Attempted Allocation of Occupied / Cleaning / Maintenance Beds
    // =========================================================================
    public void test05_attemptedAllocationOfUnavailableBeds() {
        AllocationService service = createTestHospitalService();

        Patient p1 = new Patient("PAT-301", "Patient One", 55, "Male", "Arrhythmia", AcuityLevel.HIGH, WardType.CARDIAC, false, false);
        Patient p2 = new Patient("PAT-302", "Patient Two", 60, "Female", "Atrial Fibrillation", AcuityLevel.HIGH, WardType.CARDIAC, false, false);
        service.registerPatientForAdmission(p1, "Triage");
        service.registerPatientForAdmission(p2, "Triage");

        // Allocate CARD-201 to p1 -> now OCCUPIED
        service.allocateBed("PAT-301", "CARD-201");

        // Attempt to allocate already OCCUPIED bed CARD-201 to p2
        assertThrows(BedUnavailableException.class, () ->
                service.allocateBed("PAT-302", "CARD-201"),
                "Allocating an OCCUPIED bed must throw BedUnavailableException");

        // Attempt to allocate CLEANING bed ICU-103
        Patient icuPatient = new Patient("PAT-303", "ICU Candidate", 68, "Male", "Respiratory Failure", AcuityLevel.CRITICAL, WardType.ICU, true, false);
        service.registerPatientForAdmission(icuPatient, "Triage");
        assertThrows(BedUnavailableException.class, () ->
                service.allocateBed("PAT-303", "ICU-103"),
                "Allocating a CLEANING bed must throw BedUnavailableException");

        // Attempt to allocate MAINTENANCE bed ICU-104
        assertThrows(BedUnavailableException.class, () ->
                service.allocateBed("PAT-303", "ICU-104"),
                "Allocating a MAINTENANCE bed must throw BedUnavailableException");
    }

    // =========================================================================
    // TEST 6: ICU Suitability Enforcement & Compatibility Scoring
    // =========================================================================
    public void test06_icuSuitabilityEnforcementAndScoring() {
        AllocationService service = createTestHospitalService();

        Patient criticalVentIsoPatient = new Patient(
                "PAT-401", "Critical Vent Iso Patient", 70, "Male",
                "ARDS & Sepsis", AcuityLevel.CRITICAL, WardType.ICU, true, true
        );
        service.registerPatientForAdmission(criticalVentIsoPatient, "Dr. Vance");

        Bed icuFullMatch = service.getBedByIdOrNumber("ICU-101"); // ICU (+50) + Vent (+25) + Iso (+20) + ICU Hemodynamic (+5) = 100
        Bed generalBed = service.getBedByIdOrNumber("GEN-401");   // Non-ICU, no vent, no iso = 0

        assertTrue(icuFullMatch.isSuitableFor(criticalVentIsoPatient), "ICU-101 with vent & isolation must be suitable");
        assertFalse(generalBed.isSuitableFor(criticalVentIsoPatient), "General bed GEN-401 must NOT be suitable for critical ICU patient");
        assertEquals(100, icuFullMatch.calculateSuitabilityScore(criticalVentIsoPatient), "Full ICU match score must be 100");
        assertEquals(0, generalBed.calculateSuitabilityScore(criticalVentIsoPatient), "General bed score for ICU patient must be 0");

        // Attempting to allocate critical ICU patient to GeneralBed without override must fail
        assertThrows(InvalidAllocationRequestException.class, () ->
                service.allocateBed("PAT-401", "GEN-401"),
                "Allocating critical ventilator patient to GeneralBed without override must throw InvalidAllocationRequestException");
    }

    // =========================================================================
    // TEST 7: Invalid Allocation Requests
    // =========================================================================
    public void test07_invalidAllocationRequests() {
        AllocationService service = createTestHospitalService();
        Patient patient = new Patient("PAT-501", "Devon Brooks", 41, "Male", "Appendectomy", AcuityLevel.MODERATE, WardType.SURGICAL, false, false);
        service.registerPatientForAdmission(patient, "Nurse Clara");

        // 1. Ward mismatch without override (Surgical patient -> General bed GEN-401)
        assertThrows(InvalidAllocationRequestException.class, () ->
                service.allocateBed("PAT-501", "GEN-401"),
                "Ward specialty mismatch without override must throw InvalidAllocationRequestException");

        // 2. Staff override flag set to true but with blank overrideReason
        assertThrows(InvalidAllocationRequestException.class, () ->
                service.allocateBed("PAT-501", "GEN-401", "Dr. Vance", true, "   "),
                "Staff override without a documented reason must throw InvalidAllocationRequestException");

        // 3. Allocate properly to SURG-301, then attempt second allocation while already ADMITTED
        service.allocateBed("PAT-501", "SURG-301");
        assertThrows(InvalidAllocationRequestException.class, () ->
                service.allocateBed("PAT-501", "SURG-302"),
                "Re-allocating an already ADMITTED patient must throw InvalidAllocationRequestException");

        // 4. Non-existent patient or bed must throw EntityNotFoundException
        assertThrows(EntityNotFoundException.class, () ->
                service.allocateBed("PAT-NON-EXISTENT", "SURG-302"),
                "Unknown patient ID must throw EntityNotFoundException");
    }

    // =========================================================================
    // TEST 8: Priority-Based Patient Selection & Arrival-Order Tie-Breaking
    // =========================================================================
    public void test08_prioritySelectionAndArrivalTieBreaking() {
        AllocationService service = createTestHospitalService();
        LocalDateTime t0 = LocalDateTime.of(2026, 11, 1, 9, 0);

        // Two Cardiac patients with identical HIGH acuity (Priority Score = 82)
        Patient firstArrivalHigh = new Patient("PAT-TIE-1", "First Arrival Cardiac", 62, "Female", "Angina", AcuityLevel.HIGH, WardType.CARDIAC, false, false);
        Patient secondArrivalHigh = new Patient("PAT-TIE-2", "Second Arrival Cardiac", 62, "Male", "Angina", AcuityLevel.HIGH, WardType.CARDIAC, false, false);
        // One Critical ICU patient (Priority Score = 97) who arrived LATER than both
        Patient lateCritical = new Patient("PAT-CRIT-1", "Late Arrival Critical", 75, "Male", "Septic Shock", AcuityLevel.CRITICAL, WardType.ICU, true, false);

        service.registerPatientForAdmission(secondArrivalHigh, t0.plusMinutes(20), false, "", "Triage");
        service.registerPatientForAdmission(firstArrivalHigh, t0.plusMinutes(5), false, "", "Triage");
        service.registerPatientForAdmission(lateCritical, t0.plusMinutes(40), false, "", "Triage");

        List<Patient> ordered = service.getPriorityOrderedWaitingPatients();
        assertEquals("PAT-CRIT-1", ordered.get(0).getId(), "Highest priority score (CRITICAL) must be #1 regardless of later arrival");
        assertEquals("PAT-TIE-1", ordered.get(1).getId(), "Earlier arrival (t0+5m) must win tie-breaker over identical score at t0+20m");
        assertEquals("PAT-TIE-2", ordered.get(2).getId(), "Later arrival (t0+20m) with tied score must be #3");

        // Verify automated priority allocation serves PAT-CRIT-1 first, then PAT-TIE-1, then PAT-TIE-2
        Optional<Admission> adm1 = service.allocateNextHighestPriorityPatient("AutoTriage");
        Optional<Admission> adm2 = service.allocateNextHighestPriorityPatient("AutoTriage");
        Optional<Admission> adm3 = service.allocateNextHighestPriorityPatient("AutoTriage");

        assertEquals("PAT-CRIT-1", adm1.orElseThrow().getPatient().getId(), "1st allocated must be PAT-CRIT-1");
        assertEquals("PAT-TIE-1", adm2.orElseThrow().getPatient().getId(), "2nd allocated must be PAT-TIE-1 (FIFO tie-breaker)");
        assertEquals("PAT-TIE-2", adm3.orElseThrow().getPatient().getId(), "3rd allocated must be PAT-TIE-2");
    }

    // =========================================================================
    // TEST 9: Staff Override Functionality & RBAC Authorization
    // =========================================================================
    public void test09_staffOverrideAndRbacAuthorization() {
        AllocationService service = createTestHospitalService();
        Patient generalPatient = new Patient("PAT-601", "Ananya Chatterjee", 29, "Female", "Dehydration", AcuityLevel.STABLE, WardType.GENERAL, false, false);
        service.registerPatientForAdmission(generalPatient, "Admissions");

        // Ward Staff lacks OVERRIDE_ALLOCATION_POLICY permission
        assertThrows(UnauthorizedStaffActionException.class, () ->
                service.allocateBed("PAT-601", "SURG-301", StaffRole.WARD_STAFF, "Ward Nurse", true, "Overflow boarding"),
                "WARD_STAFF attempting policy override must throw UnauthorizedStaffActionException");

        // Administrator has OVERRIDE_ALLOCATION_POLICY permission -> succeeds
        Admission overrideAdm = service.allocateBed(
                "PAT-601", "SURG-301", StaffRole.ADMINISTRATOR, "Dr. Elena Vance", true,
                "Authorized overflow placement into Surgical Ward bed SURG-301"
        );
        assertTrue(overrideAdm.isAllocatedViaOverride(), "Admission must be flagged as allocatedViaOverride");
        assertEquals("BED-SURG-301", generalPatient.getAssignedBedId(), "Patient must be assigned to SURG-301");
    }

    // =========================================================================
    // TEST 10: Discharge, Bed Release & Occupancy Report
    // =========================================================================
    public void test10_dischargeBedReleaseAndOccupancyReport() {
        AllocationService service = createTestHospitalService();
        Patient patient = new Patient("PAT-701", "Arthur Pendelton", 72, "Male", "Heart Failure", AcuityLevel.CRITICAL, WardType.ICU, true, true);
        service.registerPatientForAdmission(patient, "Dr. Vance");
        service.allocateBed("PAT-701", "ICU-101");

        OccupancyReport beforeDischarge = service.generateOccupancyReport();
        assertEquals(1, beforeDischarge.getOccupiedBeds(), "1 bed must be occupied before discharge");

        // Discharge patient -> bed transitions to CLEANING
        DischargeRecord record = service.dischargePatient(
                "PAT-701", DischargeOutcome.RECOVERED_HOME, BedStatus.CLEANING, "Dr. Vance", "Full recovery"
        );

        assertEquals(PatientStatus.DISCHARGED, patient.getStatus(), "Patient status must be DISCHARGED");
        assertNull(patient.getAssignedBedId(), "Discharged patient must have null assignedBedId");
        assertEquals(BedStatus.CLEANING, service.getBedByIdOrNumber("ICU-101").getStatus(), "Released bed must enter CLEANING status");
        assertEquals(DischargeOutcome.RECOVERED_HOME, record.getOutcome(), "Discharge outcome must match");

        // Sanitize bed -> returns to AVAILABLE
        service.markBedAvailableAfterCleaning("ICU-101", "Environmental Services");
        assertEquals(BedStatus.AVAILABLE, service.getBedByIdOrNumber("ICU-101").getStatus(), "Sanitized bed must be AVAILABLE");

        OccupancyReport afterSanitization = service.generateOccupancyReport();
        assertEquals(0, afterSanitization.getOccupiedBeds(), "0 beds must be occupied after discharge");
        assertEquals(1, afterSanitization.getCompletedDischargesCount(), "Completed discharges count must be 1");
    }

    // =========================================================================
    // Test Helper & Assertion Methods
    // =========================================================================

    private AllocationService createTestHospitalService() {
        AllocationService service = new AllocationService();

        Ward icuWard = new Ward("WARD-ICU", "Blossom ICU", WardType.ICU, 1, "North", "Nurse Hannah", "4101", "ICU");
        Ward cardiacWard = new Ward("WARD-CARD", "Rosewood Cardiac", WardType.CARDIAC, 2, "East", "Nurse Julian", "4201", "Cardiac");
        Ward surgicalWard = new Ward("WARD-SURG", "Magnolia Surgical", WardType.SURGICAL, 3, "West", "Nurse Chapel", "4301", "Surgical");
        Ward generalWard = new Ward("WARD-GEN", "Lotus General", WardType.GENERAL, 4, "South", "Nurse Rory", "4401", "General");

        service.registerWard(icuWard);
        service.registerWard(cardiacWard);
        service.registerWard(surgicalWard);
        service.registerWard(generalWard);

        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-101", "ICU-101", "WARD-ICU", icuWard.getName(), 1, BedStatus.AVAILABLE, true, true));
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-102", "ICU-102", "WARD-ICU", icuWard.getName(), 1, BedStatus.AVAILABLE, true, false));
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-103", "ICU-103", "WARD-ICU", icuWard.getName(), 1, BedStatus.CLEANING, true, false));
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-104", "ICU-104", "WARD-ICU", icuWard.getName(), 1, BedStatus.MAINTENANCE, false, false));

        service.registerBedInWard("WARD-CARD", new GeneralBed("BED-CARD-201", "CARD-201", "WARD-CARD", cardiacWard.getName(), WardType.CARDIAC, 2, BedStatus.AVAILABLE, true, false));
        service.registerBedInWard("WARD-CARD", new GeneralBed("BED-CARD-202", "CARD-202", "WARD-CARD", cardiacWard.getName(), WardType.CARDIAC, 2, BedStatus.AVAILABLE, true, true));

        service.registerBedInWard("WARD-SURG", new GeneralBed("BED-SURG-301", "SURG-301", "WARD-SURG", surgicalWard.getName(), WardType.SURGICAL, 3, BedStatus.AVAILABLE, true, false));
        service.registerBedInWard("WARD-SURG", new GeneralBed("BED-SURG-302", "SURG-302", "WARD-SURG", surgicalWard.getName(), WardType.SURGICAL, 3, BedStatus.AVAILABLE, false, false));

        service.registerBedInWard("WARD-GEN", new GeneralBed("BED-GEN-401", "GEN-401", "WARD-GEN", generalWard.getName(), WardType.GENERAL, 4, BedStatus.AVAILABLE, false, false));

        return service;
    }

    private void executeTest(String testName, Runnable testLogic) {
        try {
            testLogic.run();
            passedTests++;
            System.out.printf("  [PASS] %s%n", testName);
        } catch (Throwable t) {
            failedTests++;
            System.out.printf("  [FAIL] %s -> %s%n", testName, t.getMessage());
            t.printStackTrace(System.out);
        }
    }

    private static void assertEquals(Object expected, Object actual, String message) {
        if (expected == null && actual == null) return;
        if (expected != null && expected.equals(actual)) return;
        throw new AssertionError(String.format("%s | Expected: <%s> but was: <%s>", message, expected, actual));
    }

    private static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message + " | Expected true but was false.");
        }
    }

    private static void assertFalse(boolean condition, String message) {
        if (condition) {
            throw new AssertionError(message + " | Expected false but was true.");
        }
    }

    private static void assertNotNull(Object obj, String message) {
        if (obj == null) {
            throw new AssertionError(message + " | Expected non-null value.");
        }
    }

    private static void assertNull(Object obj, String message) {
        if (obj != null) {
            throw new AssertionError(message + " | Expected null but was: " + obj);
        }
    }

    private static <T extends Throwable> void assertThrows(Class<T> expectedType, Runnable executable, String message) {
        try {
            executable.run();
        } catch (Throwable actual) {
            if (expectedType.isInstance(actual)) {
                return;
            }
            throw new AssertionError(String.format("%s | Expected exception <%s> but caught <%s: %s>",
                    message, expectedType.getSimpleName(), actual.getClass().getSimpleName(), actual.getMessage()));
        }
        throw new AssertionError(String.format("%s | Expected exception <%s> to be thrown, but nothing was thrown.",
                message, expectedType.getSimpleName()));
    }
}
