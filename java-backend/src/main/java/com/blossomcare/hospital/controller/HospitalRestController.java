package com.blossomcare.hospital.controller;

import com.blossomcare.hospital.dto.AllocationRequestDto;
import com.blossomcare.hospital.dto.DischargeRequestDto;
import com.blossomcare.hospital.dto.PatientRegistrationDto;
import com.blossomcare.hospital.model.Admission;
import com.blossomcare.hospital.model.AllocationRequest;
import com.blossomcare.hospital.model.Bed;
import com.blossomcare.hospital.model.DischargeRecord;
import com.blossomcare.hospital.model.MedicalEquipment;
import com.blossomcare.hospital.model.Patient;
import com.blossomcare.hospital.model.Staff;
import com.blossomcare.hospital.model.VitalSigns;
import com.blossomcare.hospital.model.Ward;
import com.blossomcare.hospital.repository.HospitalRepository;
import com.blossomcare.hospital.service.AllocationService;
import com.blossomcare.hospital.service.OccupancyReport;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller exposing endpoints for the Blossom Care Intelligent Hospital
 * Bed Allocation System.
 *
 * <p>Base path: {@code /api/v1}</p>
 */
@RestController
@RequestMapping("/api/v1")
public class HospitalRestController {

    private final HospitalRepository repository;
    private final AllocationService allocationService;

    public HospitalRestController(HospitalRepository repository) {
        this.repository = repository;
        this.allocationService = repository.getAllocationService();
    }

    // 1. Patients
    @GetMapping("/patients")
    public List<Patient> getAllPatients() {
        return allocationService.getAllPatients();
    }

    @GetMapping("/patients/{id}")
    public Patient getPatientById(@PathVariable String id) {
        return allocationService.getPatientById(id);
    }

    @PostMapping("/patients")
    public ResponseEntity<AllocationRequest> registerPatient(
            @Valid @RequestBody PatientRegistrationDto dto
    ) {
        String id = "PAT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Patient patient = new Patient(
                id,
                dto.getName(),
                dto.getAge(),
                dto.getGender(),
                dto.getBloodGroup(),
                dto.getDiagnosis(),
                dto.getAcuity(),
                dto.getRequiredWardType(),
                dto.isNeedsVentilator(),
                dto.isNeedsIsolation(),
                dto.getAttendingDoctor(),
                dto.getEmergencyContact(),
                "",
                VitalSigns.defaultStableVitals()
        );
        AllocationRequest request = allocationService.registerPatientForAdmission(
                patient,
                "Admissions REST API"
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(request);
    }

    // 2. Beds
    @GetMapping("/beds")
    public List<Bed> getAllBeds() {
        return allocationService.getAllBeds();
    }

    @GetMapping("/beds/recommendations/{patientId}")
    public List<Bed> getRecommendedBeds(@PathVariable String patientId) {
        return allocationService.getRecommendedBedsForPatient(patientId);
    }

    @PostMapping("/beds/{bedId}/sanitize")
    public Bed completeBedSanitization(@PathVariable String bedId) {
        return allocationService.markBedAvailableAfterCleaning(bedId, "Environmental Services API");
    }

    // 3. Wards & Occupancy Report
    @GetMapping("/wards")
    public List<Ward> getAllWards() {
        return allocationService.getAllWards();
    }

    @GetMapping("/wards/{id}")
    public Ward getWardById(@PathVariable String id) {
        return allocationService.getWardById(id);
    }

    @GetMapping("/occupancy-report")
    public OccupancyReport getOccupancyReport() {
        return allocationService.generateOccupancyReport();
    }

    // 4. Waiting List
    @GetMapping("/waiting-list")
    public List<AllocationRequest> getWaitingList() {
        return allocationService.getPriorityOrderedWaitingQueue();
    }

    // 5. Intelligent Bed Allocations
    @PostMapping("/allocations")
    public ResponseEntity<Admission> allocateBed(
            @Valid @RequestBody AllocationRequestDto dto
    ) {
        Admission admission = allocationService.allocateBed(
                dto.getPatientId(),
                dto.getBedId(),
                dto.getStaffActor(),
                dto.isStaffOverride(),
                dto.getOverrideReason()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(admission);
    }

    @PostMapping("/allocations/next-priority")
    public ResponseEntity<Admission> allocateNextPriorityPatient() {
        Optional<Admission> admission =
                allocationService.allocateNextHighestPriorityPatient("Priority Allocation Engine");
        return admission
                .map(value -> ResponseEntity.status(HttpStatus.CREATED).body(value))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // 6. Admissions
    @GetMapping("/admissions")
    public List<Admission> getAllAdmissions() {
        return allocationService.getAdmissions();
    }

    // 7. Discharges
    @GetMapping("/discharges")
    public List<DischargeRecord> getAllDischarges() {
        return allocationService.getDischargeRecords();
    }

    @PostMapping("/discharges")
    public ResponseEntity<DischargeRecord> dischargePatient(
            @Valid @RequestBody DischargeRequestDto dto
    ) {
        DischargeRecord record = allocationService.dischargePatient(
                dto.getPatientId(),
                dto.getOutcome(),
                dto.getDischargedBy(),
                dto.getSummaryNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    // 8. Hospital Medical Equipment
    @GetMapping("/equipment")
    public List<MedicalEquipment> getAllEquipment() {
        return repository.findAllEquipment();
    }

    // 9. Hospital Staff
    @GetMapping("/staff")
    public List<Staff> getAllStaff() {
        return repository.findAllStaff();
    }
}
