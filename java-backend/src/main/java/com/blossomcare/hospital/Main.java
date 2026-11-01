package com.blossomcare.hospital;

import com.blossomcare.hospital.exception.BedUnavailableException;
import com.blossomcare.hospital.exception.InvalidAllocationRequestException;
import com.blossomcare.hospital.model.Admission;
import com.blossomcare.hospital.model.AllocationRequest;
import com.blossomcare.hospital.model.AuditLogEntry;
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
import com.blossomcare.hospital.model.enums.StaffRole;
import com.blossomcare.hospital.model.enums.WardType;
import com.blossomcare.hospital.service.AllocationService;
import com.blossomcare.hospital.service.OccupancyReport;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Runnable entry point for the Blossom Care — Intelligent Hospital Bed Allocation System
 * (Academic Course: Object Oriented Techniques using Java — CCSE0355).
 *
 * <p>Demonstrates the complete end-to-end hospital workflow:</p>
 * <pre>
 * Admission Request -> Bed Availability &amp; Compatibility Check -> Priority-Based Allocation
 * -> Staff Override Allocation -> Admission Record -> Discharge -> Bed Release -> Occupancy Report
 * </pre>
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("========================================================================================================");
        System.out.println("  BLOSSOM CARE — INTELLIGENT HOSPITAL BED ALLOCATION SYSTEM (JAVA 17 OOP IMPLEMENTATION - CCSE0355)    ");
        System.out.println("========================================================================================================\n");

        AllocationService service = new AllocationService();

        // -----------------------------------------------------------------------------------------
        // STEP 1: Initialize Hospital Wards & Polymorphic Bed Inventory (ICUBed + GeneralBed)
        // -----------------------------------------------------------------------------------------
        System.out.println("[STEP 1] Initializing Blossom Care Wards & Polymorphic Bed Inventory...");
        seedBlossomCareHospital(service);
        System.out.println("Registered " + service.getAllWards().size() + " wards and "
                + service.getAllBeds().size() + " total beds (ICUBed & GeneralBed instances).\n");

        // -----------------------------------------------------------------------------------------
        // STEP 2: Register Incoming Patients & Populate Priority Waiting Queue
        // -----------------------------------------------------------------------------------------
        System.out.println("[STEP 2] Registering Incoming Triage Patients into Priority Waiting Queue...");
        LocalDateTime baseTime = LocalDateTime.of(2026, 11, 1, 8, 0);

        Patient harold = new Patient(
                "PAT-107",
                "Harold Chen-Sterling",
                69,
                "Male",
                "B+",
                "Septic Shock with Acute Hypoxemic Respiratory Failure",
                AcuityLevel.CRITICAL,
                WardType.ICU,
                true,  // Needs Mechanical Ventilator
                true,  // Needs Negative-Pressure Isolation
                "Dr. Elena Vance",
                "+1 (555) 234-8891",
                "Requires immediate ICU ventilator & airborne isolation suite.",
                new VitalSigns(126, 88, "88/54", 39.1)
        );

        Patient miriam = new Patient(
                "PAT-108",
                "Miriam Goldstein",
                74,
                "Female",
                "A+",
                "Unstable Angina & Paroxysmal Atrial Fibrillation",
                AcuityLevel.HIGH,
                WardType.CARDIAC,
                false,
                false,
                "Dr. Marcus Sterling",
                "+1 (555) 391-7742",
                "Continuous 12-lead cardiac telemetry required.",
                new VitalSigns(114, 94, "158/96", 37.0)
        );

        Patient evelynTieBreakerSecond = new Patient(
                "PAT-109",
                "Lucas Vance-Moreau",
                64,
                "Male",
                "O-",
                "Acute NSTEMI Observation",
                AcuityLevel.HIGH,
                WardType.CARDIAC,
                false,
                false,
                "Dr. Marcus Sterling",
                "+1 (555) 488-1209",
                "Arrived 15 minutes after Miriam Goldstein with identical High acuity score.",
                new VitalSigns(102, 95, "148/90", 36.9)
        );

        Patient devon = new Patient(
                "PAT-110",
                "Devon Brooks",
                41,
                "Male",
                "O+",
                "Post-Laparoscopic Appendectomy Recovery",
                AcuityLevel.MODERATE,
                WardType.SURGICAL,
                false,
                false,
                "Dr. Sophia Al-Mansoor",
                "+1 (555) 602-3310",
                "Post-op surgical monitoring.",
                new VitalSigns(84, 98, "124/80", 37.2)
        );

        Patient ananya = new Patient(
                "PAT-111",
                "Ananya Chatterjee",
                29,
                "Female",
                "AB+",
                "Dehydration & Viral Gastroenteritis Observation",
                AcuityLevel.STABLE,
                WardType.GENERAL,
                false,
                false,
                "Dr. Priya Nair",
                "+1 (555) 719-4401",
                "IV fluid hydration in General Medicine ward.",
                new VitalSigns(78, 99, "116/74", 36.8)
        );

        // Register in non-priority order to demonstrate automatic priority + FIFO sorting
        service.registerPatientForAdmission(ananya, baseTime.plusMinutes(5), false, "", "Nurse Clara Oswald");
        service.registerPatientForAdmission(miriam, baseTime.plusMinutes(10), false, "", "Nurse Clara Oswald");
        service.registerPatientForAdmission(evelynTieBreakerSecond, baseTime.plusMinutes(25), false, "", "Nurse Clara Oswald");
        service.registerPatientForAdmission(harold, baseTime.plusMinutes(30), false, "", "Dr. Elena Vance");
        service.registerPatientForAdmission(devon, baseTime.plusMinutes(20), false, "", "Nurse Clara Oswald");

        System.out.println("\n--- Priority-Ordered Waiting Queue (Descending Priority Score + FIFO Arrival Tie-Breaking) ---");
        List<AllocationRequest> queue = service.getPriorityOrderedWaitingQueue();
        for (int i = 0; i < queue.size(); i++) {
            AllocationRequest req = queue.get(i);
            Patient p = req.getPatient();
            System.out.printf("  #%d | Priority: %3d | %-22s (%s) | Acuity: %-8s | ReqWard: %-9s | Arrived: %s%n",
                    (i + 1), p.getPriorityScore(), p.getName(), p.getId(),
                    p.getAcuity(), p.getRequiredWardType(), req.getRequestedAt().toLocalTime());
        }

        // -----------------------------------------------------------------------------------------
        // STEP 3: Candidate Bed Suitability Ranking for Critical ICU Patient
        // -----------------------------------------------------------------------------------------
        System.out.println("\n[STEP 3] Evaluating Polymorphic Bed Suitability Scores for Critical Patient: " + harold.getName());
        List<Bed> rankedBedsForHarold = service.getRecommendedBedsForPatient(harold.getId());
        for (int i = 0; i < Math.min(4, rankedBedsForHarold.size()); i++) {
            Bed candidate = rankedBedsForHarold.get(i);
            int score = candidate.calculateSuitabilityScore(harold);
            System.out.printf("  Candidate #%d: %-8s (%-26s) | Category: %-28s | Vent: %-5s | Iso: %-5s | Suitability Score: %3d pts | Suitable: %s%n",
                    (i + 1), candidate.getBedNumber(), candidate.getWardName(),
                    candidate.getBedCategory(), candidate.isHasVentilator(),
                    candidate.isIsolationCapable(), score, candidate.isSuitableFor(harold));
        }

        // -----------------------------------------------------------------------------------------
        // STEP 4: Demonstrate Exception Handling (Invalid General Bed for ICU Patient & Occupied Bed)
        // -----------------------------------------------------------------------------------------
        System.out.println("\n[STEP 4] Demonstrating Clinical Safety Guards & Exception Handling...");
        try {
            System.out.println("  -> Attempting to allocate Critical ICU patient Harold Chen-Sterling to General Bed GEN-401 without override...");
            service.allocateBed(harold.getId(), "GEN-401");
        } catch (InvalidAllocationRequestException ex) {
            System.out.println("  [BLOCKED AS EXPECTED - InvalidAllocationRequestException]: " + ex.getMessage());
        }

        try {
            System.out.println("  -> Attempting to allocate patient to already OCCUPIED bed ICU-101...");
            service.allocateBed(harold.getId(), "ICU-101");
        } catch (BedUnavailableException ex) {
            System.out.println("  [BLOCKED AS EXPECTED - BedUnavailableException]: " + ex.getMessage());
        }

        // -----------------------------------------------------------------------------------------
        // STEP 5: Priority-Based Automated Bed Allocation
        // -----------------------------------------------------------------------------------------
        System.out.println("\n[STEP 5] Executing Automated Priority-Based Allocations from Waiting Queue...");
        for (int round = 1; round <= 3; round++) {
            Optional<Admission> admissionOpt = service.allocateNextHighestPriorityPatient("Dr. Elena Vance (Triage Command)");
            if (admissionOpt.isPresent()) {
                Admission adm = admissionOpt.get();
                System.out.printf("  [ADMITTED #%d] %s%n", round, adm);
            }
        }

        // -----------------------------------------------------------------------------------------
        // STEP 6: Demonstrate Authorized Staff Override Allocation
        // -----------------------------------------------------------------------------------------
        System.out.println("\n[STEP 6] Demonstrating Authorized Staff Override Allocation...");
        Admission overrideAdmission = service.allocateBed(
                ananya.getId(),
                "SURG-302",
                StaffRole.ADMINISTRATOR,
                "Dr. Elena Vance",
                true,
                "General Medicine ward nearing capacity; boarding stable hydration patient in available Surgical Step-Down bed SURG-302."
        );
        System.out.println("  [OVERRIDE ADMISSION CREATED]: " + overrideAdmission);

        // -----------------------------------------------------------------------------------------
        // STEP 7: Demonstrate Patient Discharge, Bed Release (CLEANING), and Sanitization Turnaround
        // -----------------------------------------------------------------------------------------
        System.out.println("\n[STEP 7] Executing Patient Discharge & Environmental Sanitization Turnaround...");
        DischargeRecord discharge = service.dischargePatient(
                "PAT-101", // Arthur Pendelton (pre-admitted in ICU-101)
                DischargeOutcome.TRANSFERRED_REHAB,
                BedStatus.CLEANING,
                "Dr. Elena Vance",
                "Hemodynamically stable; weaned from ventilator and transferred to cardiopulmonary rehabilitation."
        );
        System.out.println("  [DISCHARGED]: " + discharge);
        System.out.println("  [BED STATUS AFTER DISCHARGE]: " + service.getBedByIdOrNumber("ICU-101"));

        Bed sanitizedBed = service.markBedAvailableAfterCleaning("ICU-101", "Environmental Services Team");
        System.out.println("  [BED STATUS AFTER SANITIZATION]: " + sanitizedBed);

        // -----------------------------------------------------------------------------------------
        // STEP 8: Generate Complete Hospital Occupancy & Telemetry Report
        // -----------------------------------------------------------------------------------------
        System.out.println("\n[STEP 8] Generating Hospital-Wide Occupancy & Clinical Telemetry Report...");
        OccupancyReport report = service.generateOccupancyReport();
        System.out.println(report.toFormattedReportString());

        // Print recent audit logs
        System.out.println("\nRecent Clinical & Administrative Audit Trail (Top 6 Entries):");
        List<AuditLogEntry> logs = service.getAuditLogs();
        for (int i = 0; i < Math.min(6, logs.size()); i++) {
            System.out.println("  " + logs.get(i));
        }
        System.out.println("\nSimulation completed successfully.");
    }

    /**
     * Seeds the 6 signature Blossom Care wards, polymorphic beds ({@link ICUBed} and
     * {@link GeneralBed}), and initial admitted patients.
     */
    public static void seedBlossomCareHospital(AllocationService service) {
        // 1. Wards
        Ward icuWard = new Ward("WARD-ICU", "Blossom Intensive Care Unit", WardType.ICU, 1,
                "North Pavilion", "Charge Nurse Hannah Abbott", "Ext. 4101",
                "High-acuity critical care unit with invasive monitoring and mechanical ventilation.");
        Ward cardiacWard = new Ward("WARD-CARD", "Rosewood Cardiac Telemetry Ward", WardType.CARDIAC, 2,
                "East Pavilion", "Charge Nurse Julian Bashir", "Ext. 4201",
                "Continuous 12-lead cardiac telemetry and coronary care step-down unit.");
        Ward surgicalWard = new Ward("WARD-SURG", "Magnolia Surgical Recovery Suite", WardType.SURGICAL, 3,
                "West Pavilion", "Charge Nurse Christine Chapel", "Ext. 4301",
                "Post-operative surgical recovery and wound care ward.");
        Ward generalWard = new Ward("WARD-GEN", "Lotus Acute Internal Medicine", WardType.GENERAL, 4,
                "South Pavilion", "Charge Nurse Rory Williams", "Ext. 4401",
                "General inpatient internal medicine and diagnostic observation.");
        Ward pediatricWard = new Ward("WARD-PED", "Starlight Pediatric Care Unit", WardType.PEDIATRICS, 5,
                "Children's Wing", "Charge Nurse Carla Espinosa", "Ext. 4501",
                "Family-centered pediatric inpatient care.");
        Ward maternityWard = new Ward("WARD-MAT", "Serenity Blossom Maternity Suite", WardType.MATERNITY, 6,
                "Garden Wing", "Charge Nurse Callie Torres", "Ext. 4601",
                "Labor, delivery, and postpartum maternal-fetal care.");

        service.registerWard(icuWard);
        service.registerWard(cardiacWard);
        service.registerWard(surgicalWard);
        service.registerWard(generalWard);
        service.registerWard(pediatricWard);
        service.registerWard(maternityWard);

        // 2. Polymorphic ICU Beds (ICUBed subclass)
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-101", "ICU-101", "WARD-ICU", icuWard.getName(), 1, BedStatus.AVAILABLE, true, true));
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-102", "ICU-102", "WARD-ICU", icuWard.getName(), 1, BedStatus.AVAILABLE, true, true));
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-103", "ICU-103", "WARD-ICU", icuWard.getName(), 1, BedStatus.CLEANING, true, false));
        service.registerBedInWard("WARD-ICU", new ICUBed("BED-ICU-104", "ICU-104", "WARD-ICU", icuWard.getName(), 1, BedStatus.MAINTENANCE, false, false));

        // 3. Polymorphic Specialty & General Beds (GeneralBed subclass)
        service.registerBedInWard("WARD-CARD", new GeneralBed("BED-CARD-201", "CARD-201", "WARD-CARD", cardiacWard.getName(), WardType.CARDIAC, 2, BedStatus.AVAILABLE, true, false));
        service.registerBedInWard("WARD-CARD", new GeneralBed("BED-CARD-202", "CARD-202", "WARD-CARD", cardiacWard.getName(), WardType.CARDIAC, 2, BedStatus.AVAILABLE, true, true));
        service.registerBedInWard("WARD-SURG", new GeneralBed("BED-SURG-301", "SURG-301", "WARD-SURG", surgicalWard.getName(), WardType.SURGICAL, 3, BedStatus.AVAILABLE, true, false));
        service.registerBedInWard("WARD-SURG", new GeneralBed("BED-SURG-302", "SURG-302", "WARD-SURG", surgicalWard.getName(), WardType.SURGICAL, 3, BedStatus.AVAILABLE, false, false));
        service.registerBedInWard("WARD-GEN", new GeneralBed("BED-GEN-401", "GEN-401", "WARD-GEN", generalWard.getName(), WardType.GENERAL, 4, BedStatus.AVAILABLE, false, false));
        service.registerBedInWard("WARD-GEN", new GeneralBed("BED-GEN-402", "GEN-402", "WARD-GEN", generalWard.getName(), WardType.GENERAL, 4, BedStatus.CLEANING, false, true));
        service.registerBedInWard("WARD-PED", new GeneralBed("BED-PED-501", "PED-501", "WARD-PED", pediatricWard.getName(), WardType.PEDIATRICS, 5, BedStatus.AVAILABLE, true, false));
        service.registerBedInWard("WARD-MAT", new GeneralBed("BED-MAT-601", "MAT-601", "WARD-MAT", maternityWard.getName(), WardType.MATERNITY, 6, BedStatus.AVAILABLE, false, false));

        // 4. Pre-admit Arthur Pendelton into ICU-101 to represent active hospital state
        Patient arthur = new Patient(
                "PAT-101",
                "Arthur Pendelton",
                72,
                "Male",
                "O+",
                "Acute Decompensated Heart Failure & Cardiogenic Shock",
                AcuityLevel.CRITICAL,
                WardType.ICU,
                true,
                false,
                "Dr. Elena Vance",
                "+1 (555) 101-2020",
                "On mechanical ventilation in ICU-101.",
                new VitalSigns(118, 91, "94/60", 37.6)
        );
        service.registerPatientForAdmission(arthur, "Dr. Elena Vance");
        service.allocateBed("PAT-101", "ICU-101", "Dr. Elena Vance", false, "");
    }
}
