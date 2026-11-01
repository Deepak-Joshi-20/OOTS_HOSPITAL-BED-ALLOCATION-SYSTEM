# Blossom Care — Intelligent Hospital Bed Allocation System (Java 17 & Spring Boot Backend)

**Course:** Object Oriented Techniques using Java (`CCSE0355`)  
**Team:** G-66  
**Live Website:** [https://blossom-care-hospital.netlify.app/](https://blossom-care-hospital.netlify.app/)  
**GitHub Repository:** [https://github.com/Deepak-Joshi-20/OOTS_HOSPITAL-BED-ALLOCATION-SYSTEM](https://github.com/Deepak-Joshi-20/OOTS_HOSPITAL-BED-ALLOCATION-SYSTEM)

---

## 1. Architecture Overview

This directory (`java-backend/`) contains the **Java 17 + Spring Boot 3.2.5** backend and object-oriented domain engine for the **Blossom Care — Intelligent Hospital Bed Allocation System**.

```text
Existing React + TypeScript Frontend (Vite SPA)
                     |
                     | HTTP REST API (/api/v1/*) with Safe Local Fallback
                     v
Java 17 + Spring Boot Backend (java-backend/)
                     |
                     v
Object-Oriented Hospital Allocation Engine & In-Memory Repository
```

---

## 2. Package Structure (`com.blossomcare.hospital`)

```text
java-backend/
├── pom.xml                                                 # Maven configuration (Java 17, Spring Boot 3.2.5, JUnit 5)
├── compile-and-test.sh                                     # Standalone CLI compiler & test runner script
├── README.md                                               # Backend & REST API documentation
└── src/
    ├── main/java/com/blossomcare/hospital/
    │   ├── BlossomCareApplication.java                     # @SpringBootApplication entry point
    │   ├── Main.java                                       # Standalone CLI simulation runner
    │   ├── config/
    │   │   └── CorsConfig.java                             # CORS configuration for React frontend
    │   ├── controller/
    │   │   └── HospitalRestController.java                 # REST API endpoints (/api/v1/*)
    │   ├── dto/
    │   │   ├── PatientRegistrationDto.java                 # Validated DTO for patient registration
    │   │   ├── AllocationRequestDto.java                   # Validated DTO for bed allocation
    │   │   └── DischargeRequestDto.java                    # Validated DTO for patient discharge
    │   ├── exception/
    │   │   ├── BedUnavailableException.java                # Thrown when target bed is Occupied/Cleaning/Maintenance
    │   │   ├── InvalidAllocationRequestException.java      # Thrown on clinical suitability violations
    │   │   ├── PatientNotFoundException.java               # Thrown when Patient ID is not found
    │   │   ├── WardNotFoundException.java                  # Thrown when Ward ID is not found
    │   │   ├── EntityNotFoundException.java                # Base not-found exception
    │   │   ├── UnauthorizedStaffActionException.java       # Thrown on RBAC permission violations
    │   │   └── GlobalExceptionHandler.java                 # @RestControllerAdvice structured JSON error responses
    │   ├── model/
    │   │   ├── enums/                                      # AcuityLevel, WardType, BedStatus, PatientStatus, StaffRole, DischargeOutcome
    │   │   ├── Bed.java                                    # Abstract base class for hospital beds
    │   │   ├── ICUBed.java                                 # Subclass for critical-care ICU beds
    │   │   ├── GeneralBed.java                             # Subclass for general & specialty ward beds
    │   │   ├── Patient.java                                # Encapsulated patient entity with priority calculation
    │   │   ├── VitalSigns.java                             # Encapsulated clinical vitals value object
    │   │   ├── Ward.java                                   # Aggregation of polymorphic Bed objects
    │   │   ├── WaitingQueueItem.java                       # Priority + FIFO waiting list item
    │   │   ├── AllocationRequest.java                      # Admission placement request
    │   │   ├── Admission.java                              # Association linking Patient, Bed, and Ward
    │   │   ├── DischargeRecord.java                        # Immutable discharge & bed release record
    │   │   ├── MedicalEquipment.java                       # Hospital biomedical equipment asset
    │   │   ├── Staff.java                                  # Staff account with RBAC role & permissions
    │   │   └── AuditLogEntry.java                          # Clinical activity log entry
    │   ├── repository/
    │   │   └── HospitalRepository.java                     # @Repository managing seeded hospital entities
    │   └── service/
    │       ├── BedAllocationPolicy.java                    # Interface defining bed suitability contract
    │       ├── ClinicalBedAllocationPolicy.java            # 50/25/20 clinical scoring & ICU safety rules
    │       ├── PriorityCalculator.java                     # Triage priority & FIFO tie-breaking calculator
    │       ├── OccupancyReport.java                        # Hospital-wide and ward-level capacity report
    │       └── AllocationService.java                      # Core service orchestrating admissions & discharges
    └── test/java/com/blossomcare/hospital/
        ├── HospitalAllocationJUnitTest.java                # JUnit 5 (@Test) unit test suite (15 test methods)
        └── AllocationServiceTest.java                      # Standalone CLI assertion runner
```

---

## 3. REST API Documentation (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/patients` | List all registered patients |
| `GET` | `/api/v1/patients/{id}` | Retrieve a single patient by ID (throws `404` `PatientNotFoundException` if missing) |
| `POST` | `/api/v1/patients` | Register a new patient and add to the priority waiting queue |
| `GET` | `/api/v1/beds` | List all hospital beds across all wards |
| `GET` | `/api/v1/beds/recommendations/{patientId}` | Rank available, clinically suitable beds for a patient |
| `POST` | `/api/v1/beds/{bedId}/sanitize` | Complete sanitization on a `CLEANING` bed and mark `AVAILABLE` |
| `GET` | `/api/v1/wards` | List all hospital wards and occupancy metrics |
| `GET` | `/api/v1/wards/{id}` | Retrieve a ward by ID (throws `404` `WardNotFoundException` if missing) |
| `GET` | `/api/v1/waiting-list` | Retrieve the waiting list ordered by priority score (descending) and FIFO arrival time |
| `POST` | `/api/v1/allocations` | Allocate a specific bed to a waiting patient (supports `staffOverride`) |
| `POST` | `/api/v1/allocations/next-priority` | Automatically allocate the optimal bed to the highest-priority waiting patient |
| `GET` | `/api/v1/admissions` | List all inpatient admission records |
| `GET` | `/api/v1/discharges` | List all completed patient discharge records |
| `POST` | `/api/v1/discharges` | Discharge an admitted patient and transition their bed to `CLEANING` |
| `GET` | `/api/v1/equipment` | List all hospital medical equipment assets and calibration status |
| `GET` | `/api/v1/staff` | List hospital staff accounts and RBAC roles |

### Sample Request & Response Formats

#### 1. Register a Patient (`POST /api/v1/patients`)
```json
{
  "name": "Evelyn Vance",
  "age": 64,
  "gender": "Female",
  "bloodGroup": "O+",
  "diagnosis": "Acute Decompensated Heart Failure",
  "acuity": "CRITICAL",
  "requiredWardType": "ICU",
  "needsVentilator": true,
  "needsIsolation": false,
  "attendingDoctor": "Dr. Julian Sterling",
  "emergencyContact": "+1 (555) 234-8891"
}
```

#### 2. Allocate a Bed (`POST /api/v1/allocations`)
```json
{
  "patientId": "PAT-1001",
  "bedId": "ICU-02",
  "staffActor": "Marcus Thorne",
  "staffOverride": false,
  "overrideReason": ""
}
```

#### 3. Discharge a Patient (`POST /api/v1/discharges`)
```json
{
  "patientId": "PAT-1001",
  "outcome": "RECOVERED_HOME",
  "dischargedBy": "Dr. Julian Sterling",
  "summaryNotes": "Patient hemodynamically stable and cleared for home recovery."
}
```

---

## 4. Running the Java Backend & JUnit 5 Tests Locally

### Prerequisite
Ensure **Java 17+** and **Apache Maven 3.8+** are installed on your machine.

### Run JUnit 5 Unit Tests
```bash
cd java-backend
mvn test
```

### Start the Spring Boot REST API Server (Port 8080)
```bash
cd java-backend
mvn spring-boot:run
```

### Run the Standalone CLI Simulation
```bash
cd java-backend
./compile-and-test.sh
```

> **Academic Disclaimer:** The Blossom Care allocation algorithm is an academic decision-support demonstration developed for **CCSE0355 (Object Oriented Techniques using Java)** and is not a medically validated clinical triage system.
