# Blossom Care — Intelligent Hospital Bed Allocation System

**Course:** Object Oriented Techniques using Java (`CCSE0355`)  
**Team:** G-66  
**Live Website:** [https://blossom-care-hospital.netlify.app/](https://blossom-care-hospital.netlify.app/)  
**GitHub Repository:** [https://github.com/Deepak-Joshi-20/OOTS_HOSPITAL-BED-ALLOCATION-SYSTEM](https://github.com/Deepak-Joshi-20/OOTS_HOSPITAL-BED-ALLOCATION-SYSTEM)

---

## 1. Project Overview

**Blossom Care — Intelligent Hospital Bed Allocation System** is an academic healthcare operations platform combining:

1. **Interactive React + TypeScript Frontend (`src/`)**: A dual-theme (**Blossom Care** & **Arctic Bloom**) hospital bed allocation and clinical coordination web application.
2. **Java 17 + Spring Boot Backend (`java-backend/`)**: A genuine object-oriented Java implementation demonstrating Encapsulation, Inheritance (`Bed` → `ICUBed`, `GeneralBed`), Polymorphism, Abstraction (`BedAllocationPolicy`), Aggregation (`Ward` → `Bed`), custom Exception Handling, REST API endpoints (`/api/v1/*`), and JUnit 5 unit testing.

---

## 2. Core Hospital Modules

1. **Hospital Dashboard (`/`)**: Live hospital bed occupancy, ICU critical care suite availability, general & specialty capacity, priority waiting queue, ward occupancy charts, bed status donut breakdown, recent admissions/discharges, and interactive biomedical equipment telemetry chart.
2. **Patient Management (`/patients`)**: Inpatient & waiting patient directory, new patient registration, patient record editing, vital signs, and visit/admission history.
3. **Bed Management (`/beds`)**: Interactive hospital bed floor grid across 36 beds with ventilator, telemetry, and isolation badges plus cleaning/maintenance status transitions.
4. **Ward Management (`/wards`)**: Live capacity, nurse-to-patient ratios, oxygen line pressure, and bed readiness across 6 clinical wards (ICU, Cardiac, Surgical, General, Pediatrics, Maternity).
5. **Waiting List (`/waiting-list`)**: Priority-ordered inpatient placement queue with transparent clinical priority scores and FIFO tie-breaking.
6. **Intelligent Bed Allocation (`/allocation`)**: Clinical decision-support workspace ranking available beds by ward specialty (`+50`), ventilator support (`+25`), and isolation capability (`+20`).
7. **Admissions (`/admissions`) & Discharges (`/discharges`)**: Complete inpatient placement logs and one-click discharge processing with automatic bed sanitization queueing.
8. **Hospital Equipment Management (`/equipment`, `/alerts`, `/doctors`, `/appointments`, `/departments`, `/billing`)**: Medical equipment inventory and service alerts, clinical alerts, specialist doctors, outpatient appointment scheduling, hospital departments, and patient billing.
9. **Analytics (`/analytics`), Audit Logs (`/audit-logs`), Staff Management (`/staff`), & Settings (`/settings`)**: Utilization charts, CSV export, role-based access control (`Administrator`, `Admission Staff`, `Ward Staff`), and theme switching.

---

## 3. Running the Frontend (React + TypeScript + Vite)

```bash
npm install
npm run dev
```

Build and type-check for production:

```bash
npm run lint
npm run build
```

### Optional Java Backend Connection
By default, the React frontend operates seamlessly using its built-in demonstration dataset so it works offline and on static hosts like Netlify. To connect the frontend to the local Java Spring Boot server, set `VITE_HOSPITAL_API_URL="http://localhost:8080/api/v1"` in `.env`.

---

## 4. Running the Java 17 + Spring Boot Backend (`java-backend/`)

See [`java-backend/README.md`](./java-backend/README.md) for complete documentation of the OOP class hierarchy, REST API endpoints, and JUnit 5 test suite.

```bash
cd java-backend
mvn test
mvn spring-boot:run
```

---

## 5. Academic Disclaimer

Blossom Care is an academic software project developed for **CCSE0355 — Object Oriented Techniques using Java**. All patient identities, clinical metrics, and equipment telemetry are fictional demonstration data. The bed allocation scoring algorithm is an educational decision-support model and does not replace professional clinical judgment.
