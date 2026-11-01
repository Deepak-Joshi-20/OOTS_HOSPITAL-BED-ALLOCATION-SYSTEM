package com.blossomcare.hospital;

import com.blossomcare.hospital.exception.BedUnavailableException;
import com.blossomcare.hospital.exception.InvalidAllocationRequestException;
import com.blossomcare.hospital.exception.PatientNotFoundException;
import com.blossomcare.hospital.exception.WardNotFoundException;
import com.blossomcare.hospital.model.Admission;
import com.blossomcare.hospital.model.AllocationRequest;
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
import com.blossomcare.hospital.model.enums.WardType;
import com.blossomcare.hospital.service.AllocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * JUnit 5 Test Suite for the Blossom Care Intelligent Hospital Bed Allocation System.
 *
 * <p>Course: Object Oriented Techniques using Java (CCSE0355) — Team G-66</p>
 */
class HospitalAllocationJUnitTest {

    private AllocationService service;
    private Ward icuWard;
    private Ward cardiacWard;
    private Ward generalWard;
    private ICUBed icuVentIsoBed;
    private ICUBed icuStandardBed;
    private GeneralBed cardiacIsoBed;
    private GeneralBed generalBed;

    @BeforeEach
    void setUp() {
        service = new AllocationService();

        icuWard = new Ward(
                "WARD-ICU",
                "Intensive Care Unit (ICU)",
                WardType.ICU,
                2,
                "North Critical Pavilion",
                "Nurse Clara Sterling",
                "Ext. 4100",
                "High-acuity critical care"
        );
        cardiacWard = new Ward(
                "WARD-CARD",
                "Cardiac & Telemetry Ward",
                WardType.CARDIAC,
                3,
                "East Heart Wing",
                "Nurse Priya Kapoor",
                "Ext. 4200",
                "Continuous ECG telemetry"
        );
        generalWard = new Ward(
                "WARD-GEN",
                "General Medicine Ward",
                WardType.GENERAL,
                4,
                "West Recovery Wing",
                "Nurse Marcus Thorne",
                "Ext. 4400",
                "Inpatient internal medicine"
        );

        service.registerWard(icuWard);
        service.registerWard(cardiacWard);
        service.registerWard(generalWard);

        icuVentIsoBed = new ICUBed(
                "BED-ICU-01", "ICU-01", "WARD-ICU", "Intensive Care Unit (ICU)", 2,
                BedStatus.AVAILABLE, true, true, true, 58, 99.4
        );
        icuStandardBed = new ICUBed(
                "BED-ICU-02", "ICU-02", "WARD-ICU", "Intensive Care Unit (ICU)", 2,
                BedStatus.AVAILABLE, false, false, true, 55, 98.1
        );
        cardiacIsoBed = new GeneralBed(
                "BED-CARD-01", "CARD-01", "WARD-CARD", "Cardiac & Telemetry Ward",
                WardType.CARDIAC, 3, BedStatus.AVAILABLE, false, true, true, true, "East-A"
        );
        generalBed = new GeneralBed(
                "BED-GEN-01", "GEN-01", "WARD-GEN", "General Medicine Ward",
                WardType.GENERAL, 4, BedStatus.AVAILABLE, false, false, false, true, "West-B"
        );

        service.registerBedInWard("WARD-ICU", icuVentIsoBed);
        service.registerBedInWard("WARD-ICU", icuStandardBed);
        service.registerBedInWard("WARD-CARD", cardiacIsoBed);
        service.registerBedInWard("WARD-GEN", generalBed);
    }

    @Test
    @DisplayName("1. Patient creation & encapsulation validation")
    void testPatientCreationAndEncapsulation() {
        Patient patient = new Patient(
                "PAT-101", "Evelyn Vance", 64, "Female",
                "Acute Respiratory Failure", AcuityLevel.CRITICAL, WardType.ICU, true, true
        );
        assertEquals("PAT-101", patient.getId());
        assertEquals(PatientStatus.WAITING, patient.getStatus());
        assertTrue(patient.requiresIntensiveCare());
        assertThrows(IllegalArgumentException.class, () -> patient.setAge(-5));
        assertThrows(IllegalArgumentException.class, () -> patient.setName("   "));
    }

    @Test
    @DisplayName("2. Ward creation & capacity aggregation")
    void testWardCreationAndAggregation() {
        assertEquals(2, icuWard.getTotalCapacity());
        assertEquals(2, icuWard.getAvailableCount());
        assertEquals(0.0, icuWard.getOccupancyPercentage(), 0.01);
    }

    @Test
    @DisplayName("3. Bed creation & inheritance hierarchy (ICUBed vs GeneralBed)")
    void testBedCreationAndInheritance() {
        assertTrue(icuVentIsoBed instanceof Bed);
        assertTrue(cardiacIsoBed instanceof Bed);
        assertEquals("ICU Critical Care Suite", icuVentIsoBed.getBedCategory());
        assertTrue(cardiacIsoBed.getBedCategory().contains("CARDIAC"));
    }

    @Test
    @DisplayName("4. General bed suitability rules")
    void testGeneralBedSuitability() {
        Patient generalPatient = new Patient(
                "PAT-GEN", "Arthur Pendelton", 51, "Male",
                "Community-Acquired Pneumonia", AcuityLevel.MODERATE, WardType.GENERAL, false, false
        );
        assertTrue(generalBed.isSuitableFor(generalPatient));
    }

    @Test
    @DisplayName("5. ICU bed suitability enforcement (reject critical patient on GeneralBed)")
    void testIcuBedSuitability() {
        Patient criticalPatient = new Patient(
                "PAT-CRIT", "Sora Takahashi", 68, "Female",
                "Septic Shock", AcuityLevel.CRITICAL, WardType.ICU, true, false
        );
        assertFalse(generalBed.isSuitableFor(criticalPatient));
        assertTrue(icuVentIsoBed.isSuitableFor(criticalPatient));
    }

    @Test
    @DisplayName("6. Mechanical ventilator requirement matching")
    void testVentilatorMatching() {
        Patient ventPatient = new Patient(
                "PAT-VENT", "Lucas Moreau", 59, "Male",
                "ARDS Requiring Intubation", AcuityLevel.CRITICAL, WardType.ICU, true, false
        );
        assertTrue(icuVentIsoBed.isSuitableFor(ventPatient));
        assertFalse(icuStandardBed.isSuitableFor(ventPatient));
    }

    @Test
    @DisplayName("7. Negative-pressure isolation requirement matching")
    void testIsolationMatching() {
        Patient isoPatient = new Patient(
                "PAT-ISO", "Nadia Al-Mansoor", 47, "Female",
                "Infectious Endocarditis", AcuityLevel.HIGH, WardType.CARDIAC, false, true
        );
        assertTrue(cardiacIsoBed.isSuitableFor(isoPatient));
        assertFalse(generalBed.isSuitableFor(isoPatient));
    }

    @Test
    @DisplayName("8. Transparent priority score calculation")
    void testPriorityScoreCalculation() {
        VitalSigns distressVitals = new VitalSigns(128, 88, "155/98", 38.9);
        Patient criticalPatient = new Patient(
                "PAT-P1", "Critical Case", 70, "Male", "O+",
                "Cardiogenic Shock", AcuityLevel.CRITICAL, WardType.ICU,
                true, true, "Dr. Sterling", "555-0100", "", distressVitals
        );
        // Base CRITICAL (95) + Vent (2) + Iso (1) + Distress Vitals (1) = 99
        assertEquals(99, criticalPatient.getPriorityScore());
    }

    @Test
    @DisplayName("9. Successful clinical bed allocation")
    void testSuccessfulAllocation() {
        Patient patient = new Patient(
                "PAT-201", "Clara Sterling", 62, "Female",
                "Acute Respiratory Distress", AcuityLevel.CRITICAL, WardType.ICU, true, true
        );
        service.registerPatientForAdmission(patient, "Admissions");
        Admission admission = service.allocateBed("PAT-201", "ICU-01");

        assertNotNull(admission);
        assertEquals(PatientStatus.ADMITTED, patient.getStatus());
        assertEquals("BED-ICU-01", patient.getAssignedBedId());
        assertEquals(BedStatus.OCCUPIED, icuVentIsoBed.getStatus());
    }

    @Test
    @DisplayName("10. Rejection of occupied bed allocation (BedUnavailableException)")
    void testRejectOccupiedBedAllocation() {
        Patient p1 = new Patient(
                "PAT-301", "First Patient", 55, "Male",
                "Observation", AcuityLevel.MODERATE, WardType.GENERAL, false, false
        );
        Patient p2 = new Patient(
                "PAT-302", "Second Patient", 49, "Female",
                "Observation", AcuityLevel.MODERATE, WardType.GENERAL, false, false
        );
        service.registerPatientForAdmission(p1, "Admissions");
        service.registerPatientForAdmission(p2, "Admissions");

        service.allocateBed("PAT-301", "GEN-01");
        assertThrows(BedUnavailableException.class, () -> service.allocateBed("PAT-302", "GEN-01"));
    }

    @Test
    @DisplayName("11. Rejection of invalid allocation requests (InvalidAllocationRequestException)")
    void testInvalidAllocationRequests() {
        Patient criticalPatient = new Patient(
                "PAT-401", "Critical ICU Patient", 66, "Male",
                "Ventilator Dependent", AcuityLevel.CRITICAL, WardType.ICU, true, false
        );
        service.registerPatientForAdmission(criticalPatient, "Admissions");

        // Allocating a critical ventilator patient to a General bed without staff override must fail
        assertThrows(
                InvalidAllocationRequestException.class,
                () -> service.allocateBed("PAT-401", "GEN-01")
        );
    }

    @Test
    @DisplayName("12. Waiting-list priority ordering & FIFO tie-breaking")
    void testWaitingListPriorityAndFifoTieBreaking() {
        LocalDateTime t1 = LocalDateTime.of(2026, 11, 1, 8, 0);
        LocalDateTime t2 = LocalDateTime.of(2026, 11, 1, 8, 15);

        Patient moderateEarly = new Patient(
                "PAT-MOD-1", "Moderate Early", 40, "Male",
                "Fever", AcuityLevel.MODERATE, WardType.GENERAL, false, false
        );
        Patient highEarlier = new Patient(
                "PAT-HIGH-1", "High Earlier", 61, "Female",
                "Arrhythmia", AcuityLevel.HIGH, WardType.CARDIAC, false, false
        );
        Patient highLater = new Patient(
                "PAT-HIGH-2", "High Later", 63, "Male",
                "Unstable Angina", AcuityLevel.HIGH, WardType.CARDIAC, false, false
        );

        service.registerPatientForAdmission(moderateEarly, t1, false, "", "Admissions");
        service.registerPatientForAdmission(highLater, t2, false, "", "Admissions");
        service.registerPatientForAdmission(highEarlier, t1, false, "", "Admissions");

        List<AllocationRequest> queue = service.getPriorityOrderedWaitingQueue();
        assertEquals("PAT-HIGH-1", queue.get(0).getPatient().getId());
        assertEquals("PAT-HIGH-2", queue.get(1).getPatient().getId());
        assertEquals("PAT-MOD-1", queue.get(2).getPatient().getId());
    }

    @Test
    @DisplayName("13. Admission record creation & compatibility score tracking")
    void testAdmissionRecordCreation() {
        Patient cardiacPatient = new Patient(
                "PAT-501", "Nadia Al-Mansoor", 58, "Female",
                "Atrial Fibrillation with Isolation", AcuityLevel.HIGH, WardType.CARDIAC, false, true
        );
        service.registerPatientForAdmission(cardiacPatient, "Admissions");
        Admission adm = service.allocateBed("PAT-501", "CARD-01");

        assertEquals(Admission.AdmissionState.ACTIVE, adm.getState());
        assertTrue(adm.getCompatibilityScore() >= 70);
        assertEquals(1, service.getAdmissions().size());
    }

    @Test
    @DisplayName("14. Discharge processing & bed release to CLEANING / AVAILABLE")
    void testDischargeProcessingAndBedRelease() {
        Patient patient = new Patient(
                "PAT-601", "Jonas Lindholm", 45, "Male",
                "Dehydration", AcuityLevel.MODERATE, WardType.GENERAL, false, false
        );
        service.registerPatientForAdmission(patient, "Admissions");
        service.allocateBed("PAT-601", "GEN-01");

        DischargeRecord discharge = service.dischargePatient(
                "PAT-601",
                DischargeOutcome.RECOVERED_HOME,
                "Dr. Vance",
                "Recovered fully."
        );

        assertNotNull(discharge);
        assertEquals(PatientStatus.DISCHARGED, patient.getStatus());
        assertNull(patient.getAssignedBedId());
        assertEquals(BedStatus.CLEANING, generalBed.getStatus());

        // Complete environmental sanitization to return bed to AVAILABLE
        service.markBedAvailableAfterCleaning("GEN-01", "Environmental Services");
        assertEquals(BedStatus.AVAILABLE, generalBed.getStatus());
    }

    @Test
    @DisplayName("15. Custom exception handling (PatientNotFoundException & WardNotFoundException)")
    void testCustomNotFoundExceptions() {
        assertThrows(
                PatientNotFoundException.class,
                () -> service.getPatientById("NON-EXISTENT-PATIENT")
        );
        assertThrows(
                WardNotFoundException.class,
                () -> service.getWardById("NON-EXISTENT-WARD")
        );
    }
}
