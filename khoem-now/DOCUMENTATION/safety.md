# Safety Engine

**Domain:** `SAFETY/` · **API domain:** Safety API

## Purpose
Security and Safety are treated as two separate concerns in KSV. Security asks "is this person allowed to do this?" Safety asks "is it actually safe to do this right now, regardless of permission?"

## Core Principle
```
User Authorized ✓
        ↓
Security Check ✓
        ↓
Safety Check ✗
        ↓
COMMAND BLOCKED
```
Having permission to perform an action does not mean it is always safe to execute at this moment.

## Where Safety Applies
- Doors and gates
- Machines and motors
- Industrial equipment
- Vehicles
- Electrical / energy systems
- Any high-power or physically hazardous equipment

## Safety Engine Responsibilities
- Safety policies per device/device-type
- Operating limits (e.g. a motor cannot exceed a defined speed via KSV)
- Interlocks (action A cannot happen while condition B is active)
- Emergency-stop integration
- Approval requirements for high-risk actions
- Safe-state fallback behavior
- Conflict detection (two commands that would be unsafe together)
- Human confirmation requirement for designated high-risk commands

## Relationship to Cybersecurity
Cybersecurity and physical safety are handled as **separate layers that work together**. A command can be fully authenticated, authorized, and cryptographically legitimate, and still be rejected by the Safety Engine because executing it right now would be physically unsafe.

## Related
- `command-automation.md` — where the Safety Engine sits in the execution chain
- `authorization.md` — the security check that happens before this one
- 
