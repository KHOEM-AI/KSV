# Device Identity & Capability

**Domain:** `DEVICES/` · **API domain:** Device API

## Purpose
KSV needs to know not just *that* a device exists, but exactly what it is and what it can actually do.

## Device Identity Fields
- Device ID
- Manufacturer
- Brand
- Model
- Serial number
- Device type
- Firmware version
- Hardware version
- Owner (individual or organization node — see `organization.md`)
- Status (online/offline/suspended/revoked)
- Security state

## Capability Model
KSV should never stop at "this is a TV." It needs to know what a TV of this exact model can do:

```
TV
 ├── Power
 ├── Volume
 ├── Channel
 ├── Input
 ├── Display
 └── Network
```

Every device type declares its own capability set. This is what the Command Engine checks against before allowing an action (see `command.md`).

## Device Ownership
A device is owned by one of:
- An individual
- A family
- A company
- A building
- A warehouse
- A factory
- Another authorized organization node

Ownership includes the ability to:
- Grant permission to other users
- Modify existing permissions
- Revoke permission at any time
- Transfer ownership to another user/organization

## Device Lifecycle
```
Discovered → Verified → Paired → Active → Updated →
Suspended → Revoked → Removed
```
Each stage has its own rules for what actions are possible (e.g. a "Suspended" device cannot receive commands, but can still be reactivated by its owner).

## Device Categories (extensible registry, not a fixed list)
Home (light, fan, AC, TV, speaker, appliance, lock) · Building (door, elevator, access control, parking, HVAC, security) · Vehicle (car, EV, fleet) · Industrial (machine, motor, pump, sensor, controller, robot, PLC, conveyor) · Warehouse (door, scanner, conveyor, automation) · Energy (solar, inverter, battery, meter).

## Firmware & Software Updates
- Version tracking per device
- Compatibility checks before applying an update
- Signed updates only
- Rollback capability
- Update history log
- Recovery path if an update fails mid-process

## Related
- `discovery-pairing.md` — how a device becomes known to KSV in the first place
- `protocol-gateway.md` — how KSV actually talks to the device
- `authorization.md` — who is allowed to send it commands

