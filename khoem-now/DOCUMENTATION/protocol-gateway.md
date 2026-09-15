# Protocols & Gateway

**Domain:** `PROTOCOLS/`, `GATEWAY/` · **API domains:** Protocol API, Gateway API

## Purpose
This is what makes "universal device control" actually possible: a translation layer between KSV's internal commands and whatever communication method a specific device actually speaks.

## Protocol Abstraction
```
Device Type → Manufacturer → Protocol → Authentication → Authorization → Command
```
KSV never assumes every device uses the same protocol. New device types and manufacturers should be addable by writing a new protocol adapter — not by redesigning the platform.

## Supported Communication Methods
- Bluetooth
- Wi-Fi
- Internet / HTTPS / secure APIs
- MQTT
- Infrared and remote-control interfaces
- Manufacturer-provided APIs
- Other authorized local network protocols

## Command Translation
```
KSV Command
     ↓
Protocol Adapter
     ↓
Bluetooth / Wi-Fi / API / MQTT / IR
     ↓
Manufacturer Device
```

## Gateway / Edge Layer
For devices that cannot reach KSV Cloud directly — local-only Bluetooth devices, IR-controlled equipment, devices on a private LAN — a Gateway acts as the bridge:

```
KSV Cloud
     ↓
KSV Gateway
     ↓
Local Network
     ├── Device A
     ├── Device B
     └── Device C
```

The Gateway is a **bridge, not a security bypass** — commands routed through it still pass through the full Authorization and Safety checks (see `authorization.md`, `safety.md`).

## Why This Matters
Different manufacturers (Sony, Samsung, LG, JBL, Panasonic, etc.) use different technologies, APIs, authentication systems, and communication protocols. Without this abstraction layer, every new device brand would require rebuilding large parts of the platform.

## Related
- `device.md` — the device record this protocol connects to
- `command.md` — what happens after the protocol layer delivers a command
- 
