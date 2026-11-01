package com.blossomcare.hospital.repository;

import com.blossomcare.hospital.Main;
import com.blossomcare.hospital.model.MedicalEquipment;
import com.blossomcare.hospital.model.Staff;
import com.blossomcare.hospital.model.enums.StaffRole;
import com.blossomcare.hospital.service.AllocationService;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Spring {@link Repository} component managing the in-memory hospital domain state
 * (Wards, Beds, Patients, Waiting Queue, Admissions, Discharges, MedicalEquipment, and Staff).
 */
@Repository
public class HospitalRepository {

    private final AllocationService allocationService;
    private final Map<String, MedicalEquipment> equipmentById;
    private final Map<String, Staff> staffById;

    public HospitalRepository() {
        this.allocationService = new AllocationService();
        this.equipmentById = new LinkedHashMap<>();
        this.staffById = new LinkedHashMap<>();
        seedInitialHospitalState();
    }

    private void seedInitialHospitalState() {
        Main.seedBlossomCareHospital(allocationService);

        // Seed Hospital Medical Equipment
        registerEquipment(new MedicalEquipment(
                "EQ-01", "BLC-VENT-01", "Hamilton G5 Mechanical Ventilator",
                "Life Support", "WARD-ICU", "Intensive Care Unit (ICU)",
                MedicalEquipment.AvailabilityStatus.IN_USE,
                MedicalEquipment.EquipmentCondition.EXCELLENT,
                LocalDate.of(2026, 9, 14), LocalDate.of(2027, 3, 14), "SN-HG5-88210"
        ));
        registerEquipment(new MedicalEquipment(
                "EQ-02", "BLC-VENT-02", "Hamilton G5 Mechanical Ventilator",
                "Life Support", "WARD-ICU", "Intensive Care Unit (ICU)",
                MedicalEquipment.AvailabilityStatus.AVAILABLE,
                MedicalEquipment.EquipmentCondition.EXCELLENT,
                LocalDate.of(2026, 10, 2), LocalDate.of(2027, 4, 2), "SN-HG5-88211"
        ));
        registerEquipment(new MedicalEquipment(
                "EQ-03", "BLC-MON-04", "Philips IntelliVue MX800 Bedside Monitor",
                "Patient Monitoring", "WARD-CARD", "Cardiac & Telemetry Ward",
                MedicalEquipment.AvailabilityStatus.IN_USE,
                MedicalEquipment.EquipmentCondition.GOOD,
                LocalDate.of(2026, 8, 19), LocalDate.of(2027, 2, 19), "SN-MX8-44109"
        ));
        registerEquipment(new MedicalEquipment(
                "EQ-04", "BLC-IMG-02", "GE Optima XR240amx Portable Digital X-Ray",
                "Diagnostic Imaging", "WARD-SURG", "Surgical Recovery Ward",
                MedicalEquipment.AvailabilityStatus.UNDER_MAINTENANCE,
                MedicalEquipment.EquipmentCondition.NEEDS_CALIBRATION,
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 11, 5), "SN-GEX-19042"
        ));

        // Seed Hospital Staff Accounts
        registerStaff(new Staff(
                "STF-01", "Dr. Elena Vance", "admin@aurelia-hospital.org",
                StaffRole.ADMINISTRATOR, "Clinical Operations",
                "Chief Medical Operations Officer", true
        ));
        registerStaff(new Staff(
                "STF-02", "Marcus Thorne", "admissions@aurelia-hospital.org",
                StaffRole.ADMISSION_STAFF, "Patient Intake & Triage",
                "Senior Admissions Coordinator", true
        ));
        registerStaff(new Staff(
                "STF-03", "Nurse Priya Kapoor", "ward@aurelia-hospital.org",
                StaffRole.WARD_STAFF, "Inpatient Nursing",
                "Charge Nurse — Critical Care", true
        ));
    }

    public AllocationService getAllocationService() {
        return allocationService;
    }

    public MedicalEquipment registerEquipment(MedicalEquipment equipment) {
        equipmentById.put(equipment.getId(), equipment);
        return equipment;
    }

    public List<MedicalEquipment> findAllEquipment() {
        return new ArrayList<>(equipmentById.values());
    }

    public Optional<MedicalEquipment> findEquipmentById(String id) {
        return Optional.ofNullable(equipmentById.get(id));
    }

    public Staff registerStaff(Staff staff) {
        staffById.put(staff.getId(), staff);
        return staff;
    }

    public List<Staff> findAllStaff() {
        return Collections.unmodifiableList(new ArrayList<>(staffById.values()));
    }
}
