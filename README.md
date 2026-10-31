# Blossom Care – Hospital Bed Allocation System

A modern hospital bed management and intelligent allocation platform designed to streamline inpatient admissions, monitor ward occupancy, manage clinical bed availability and support efficient patient placement.

Blossom Care provides hospital staff with a unified workspace to manage patients, wards, beds, admissions, waiting lists and allocation workflows through an intuitive interface.

---

## Overview

Hospital bed availability and patient placement are essential parts of hospital operations. Managing these processes manually can make it difficult to track occupancy, identify suitable beds and coordinate admissions efficiently.

**Blossom Care** aims to simplify these workflows through a centralized digital platform that helps hospital staff monitor bed availability, manage patient records and make informed bed allocation decisions.

The application includes an interactive dashboard, patient directory, ward management, bed monitoring and intelligent clinical bed matching.

## Key Features

### 1. Hospital Dashboard
- Overview of hospital bed occupancy.
- Total, available and occupied bed statistics.
- Waiting patient summaries.
- Ward-level occupancy information.
- Admission and discharge activity.
- Important alerts and operational indicators.

### 2. Patient Directory & Clinical Profiles
- Manage inpatient records.
- View patient profiles and admission information.
- Track clinical acuity information.
- Maintain patient placement status.
- Access relevant patient details from a centralized directory.

### 3. Interactive Hospital Bed Grid
- Visual representation of hospital beds.
- Monitor occupied, available and cleaning beds.
- View assigned patient information.
- Track bed cleaning and sanitization turnover.
- Monitor bed capabilities such as ventilator support, ECG and isolation requirements.

### 4. Intelligent Clinical Bed Matching
- Match patients with suitable available beds.
- Consider clinical acuity and care requirements.
- Account for ventilator support and isolation criteria.
- Support specialty ward and ICU placement workflows.
- Display available bed and waiting placement information.

### 5. Admission & Discharge Management
- Manage patient admission workflows.
- Track placement requests.
- Update bed occupancy following admissions and discharges.
- Maintain consistent patient and bed assignment records.

### 6. Waiting List Management
- View patients awaiting placement.
- Monitor placement requirements.
- Support prioritization and bed allocation workflows.

### 7. Ward & Bed Management
- Manage hospital wards and clinical units.
- Monitor occupancy and availability.
- View ward-level bed information.
- Track bed readiness and turnover status.

### 8. Reports & Activity Monitoring
- Review operational information.
- Monitor admission and discharge activity.
- View relevant system events and activity records.

---

## User Roles & Access

The application is designed around role-based staff access.

| Role | Responsibilities |
|---|---|
| Administrator | System management, staff management, wards, beds and configuration |
| Admission Staff | Patient records, admissions, waiting lists and bed placement |
| Ward Staff | Ward occupancy, assigned patients and permitted bed-status updates |

Access to application features depends on the permissions configured for each role.

## Technology & Architecture

The application is developed as a web-based hospital management system.

Its implementation may include:

- Frontend application for the user interface.
- Authentication for authorized hospital staff.
- Database integration for persistent application records.
- Application logic for bed allocation and patient placement.
- Dashboard visualizations for operational monitoring.

**Note:** Refer to the actual project dependencies and configuration files for the precise technologies and versions used in this repository.

## Demo Environment

The project may include fictional demonstration records to showcase application functionality.

Demo records can include:

- Sample patients.
- Hospital wards and beds.
- Admission and discharge records.
- Waiting placement requests.
- Clinical bed requirements.
- Bed occupancy and cleaning statuses.

All demonstration patient identities and records are fictional and must not be treated as real patient information.

A visible demo indicator should be used when demonstration data is active.

## Installation & Local Development

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Install dependencies using the package manager specified by the project:

```bash
npm install
```

Start the development server if the project uses the standard Vite development setup:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

**Important:** These commands assume a Node.js-based project. Check `package.json` for the actual scripts and dependencies before running them.

## Deployment

The frontend can be deployed through a compatible hosting provider such as Netlify.

A typical Vite deployment uses:

| Configuration | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |

These settings must be verified against the actual project configuration.

If the application uses external authentication, databases or backend APIs, those services must also be configured correctly.

## Environment Variables & Security

- Keep API keys and private credentials out of the source code.
- Store sensitive configuration in environment variables.
- Never expose server-side secrets in frontend code.
- Configure authentication and database permissions securely.
- Do not store passwords as plain text.
- Restrict access to patient and staff information.
- Use fictional demonstration data for academic presentations.

Do not upload `.env` files containing secrets to GitHub.

## Project Objectives

The primary objectives of Blossom Care are to:

1. Centralize hospital bed and patient information.
2. Improve visibility into ward occupancy and bed availability.
3. Simplify inpatient admission and placement workflows.
4. Support clinical compatibility-based bed matching.
5. Improve coordination between hospital staff.
6. Provide an organized and accessible hospital management interface.

## Scope & Limitations

Blossom Care is an academic software project and demonstration system.

It should not be considered a clinically validated hospital information system. Bed matching recommendations are intended to support demonstration workflows and do not replace professional clinical judgment.

Unless explicitly integrated and tested, the application does not represent a connection to real hospital equipment, monitoring devices or hospital information systems.

## Future Enhancements

Potential future improvements include:

- Integration with real hospital information systems.
- Live bed-status updates.
- Hospital equipment and sensor integration.
- Advanced patient placement optimization.
- Enhanced operational reporting.
- Additional interoperability and security capabilities.

---

## License

This project is developed for academic and educational purposes.

Add an appropriate license before permitting external reuse or distribution.

---

**Blossom Care – Smarter Bed Management. Better Hospital Coordination.**
