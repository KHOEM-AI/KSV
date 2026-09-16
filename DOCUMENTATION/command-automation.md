# Command Engine & Automation

**Domain:** `COMMAND/`, `AUTOMATION/` · **API domains:** Command API, Automation API

## Purpose
The Command Engine is what actually executes an action on a device — after every required check has passed. Automation is the same engine triggered by rules instead of a direct user action.

## Command Execution Chain
```
User Command
   ↓
Authentication
   ↓
Authorization
   ↓
Device Capability Check
   ↓
Safety Policy Check
   ↓
Execute
   ↓
Result
   ↓
Audit
```
A command that fails **any** step is rejected — never partially executed.

## Command Engine Responsibilities
- Command parsing
- Command validation (does this command even make sense for this device type?)
- Device capability check (can this specific device actually do this?)
- Permission check (see `authorization.md`)
- Safety check (see `safety.md`)
- Execution
- Error handling
- Command timeout
- Retry policy

## AI Command Layer (Natural Language, Optional)
```
Natural Language ("Turn on the living room fan")
      ↓
AI Interpretation
      ↓
Structured Command
      ↓
Authorization
      ↓
Safety
      ↓
Execution
```
The AI's role is strictly **interpretation** — turning a sentence into a structured command. It never bypasses authorization or safety checks, and never executes a command directly.

## Automation Engine
```
IF condition
THEN action
```
Trigger types: time-based, sensor-based, location-based, device-state-based, schedule, event-based.

**Critical rule:** An automated action passes through the exact same Authorization and Safety checks as a manual one. Automation is never granted elevated privileges over what its owner is allowed to do manually.

## Related
- `safety.md` — the check that can still block an otherwise-authorized command
- `protocol-gateway.md` — how the command physically reaches the device
- `audit.md` — every command, successful or blocked, is logged
- 
