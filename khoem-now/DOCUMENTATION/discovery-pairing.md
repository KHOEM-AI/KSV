# Device Discovery & Pairing

**Domain:** `DEVICES/` · **API domains:** Discovery API, Pairing API

## Purpose
Covers how a device goes from "exists somewhere nearby" to "securely connected and controllable by an authorized user."

## Core Principle
> **Discovery is never authorization.**
> Finding a device does not grant permission to control it.

## Discovery Methods
- Bluetooth
- Wi-Fi
- Local network scanning
- QR code
- NFC
- Manufacturer/cloud discovery
- Gateway-connected device listing

## Pairing Flow
```
SCAN
  ↓
DEVICE FOUND
  ↓
IDENTITY VERIFIED
  ↓
OWNER VERIFIED
  ↓
PAIRING
  ↓
PERMISSION
  ↓
SECURE CONNECTION
  ↓
READY
```

## Pairing Mechanisms
- Device codes
- QR codes
- PINs
- Secure pairing procedures (protocol-specific handshakes)
- Manufacturer credentials
- Certificates or cryptographic keys
- Explicit owner approval

## Pairing Lifecycle
- Pairing has an expiration if not completed within a time window
- A device can be unpaired at any time by its owner
- A device can be re-paired (e.g. after a factory reset)
- A device can be revoked, immediately cutting off its access regardless of pairing state

## Related
- `device.md` — the identity record created once pairing succeeds
- `security.md` — key exchange and credential handling during pairing
- `authorization.md` — the permission step that follows successful pairing
- 
