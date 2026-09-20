# KSV — Healthcare & Robotics Safety Model

Status: design document (2026-09-20). Only the `criticality` policy described here is implemented.

## 1. Principle

Discovery is not authorization, and authorization is not safety. In healthcare the cost of a wrong command is a human life,
so KSV treats medical and life-sustaining equipment differently from ordinary devices.

## 2. What KSV does and does not do for medical devices

| Tier (`criticality`) | Examples | KSV behavior |
|---|---|---|
| `life_support` | Ventilators, oxygen supply, infusion pumps | **Read-only.** Monitoring and alarms only. No remote control commands. |
| `clinical` | Patient beds, exam-room equipment | Control only with a clinician role, a named patient link, and second-person confirmation (planned) |
| `robot_mobile` | Delivery, cart-pushing, cleaning robots | High-level tasks only; zone/geofence enforced by Safety Engine (planned) |
| `facility` | Lighting, HVAC, doors, elevators, parking | Normal permission + safety flow |
| `consumer` | Home appliances | Normal permission + safety flow |

Remote control of life-support equipment must never use the generic command path. If ever required, it must go through a
manufacturer-approved, regulator-cleared integration (for example HL7 FHIR or IEEE 11073) with clinical and legal review.
Relevant regimes include FDA, CE marking, ISO 13485 and IEC 62304. KSV is not certified for this today.

## 3. Requirements before any clinical control

1. Named, verified identity with a clinical role (least privilege; no shared accounts).
2. Explicit link between the operator and the patient/asset (no anonymous control).
3. Second-person confirmation for high-risk actions.
4. Local/offline safety: loss of cloud or network must never interrupt oxygen or other life support.
5. Full audit trail (who, what, which device, when, result). No secrets or patient data in logs.
6. Patient data (PHI) protected under applicable law (for example HIPAA or PDPA) before storage.
7. Automation, AI and patients themselves must never be able to switch off or alter life-support devices.

## 4. Robots as devices

Robots are a new device type in the existing Device / Capability model, not a separate system.

- Each robot has its own identity and least-privilege permissions (never admin rights).
- KSV sends high-level tasks (for example "deliver order #12 to room 5"), not direct motion control from the cloud.
- Emergency stop and obstacle avoidance live on the robot itself.
- Medication delivery requires order verification, patient verification and human confirmation at hand-over, all audited.
- Allowed zones are enforced by the Safety Engine (geofence signals).
- Protocol adapters (for example ROS 2, VDA5050, MQTT) belong in the Protocol Layer.

## 5. Recommended low-risk starting points

- Read-only monitoring: oxygen tank level and pressure, device status, battery, alarms.
- Alerts to staff: low oxygen, device offline.
- Building systems: lighting, HVAC, doors, access control, elevators, parking.
- Maintenance: tickets, service history, calibration expiry, asset tracking.
- Audit and compliance reporting.
