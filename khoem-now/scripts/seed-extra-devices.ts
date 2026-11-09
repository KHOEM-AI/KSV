/**
 * KSV — register the extra dashboard devices (sections 9-13) in MongoDB so the panels can reach them.
 *
 *   npm run seed:devices -- you@example.com          devices only (honest: no network address yet)
 *   npm run seed:devices -- you@example.com --sim    + point every device at the local fake device (127.0.0.1)
 *
 * Uses the same .env as the server (DATABASE_URL). Safe to run again: existing devices are updated, not duplicated.
 * It creates / reuses the protocols PROTO_WIFI and PROTO_MQTT and links each device to PROTO_WIFI.
 */

import { connectDatabase, disconnectDatabase } from '../src/infrastructure/database/connection.ts';
import { Device, Discovery, Protocol, User } from '../src/infrastructure/database/models.ts';
import { EXTRA_DEVICES } from '../src/components/extraDevices.ts';
import { deviceRecordFor } from './seed-extra-devices.logic.ts';

async function main() {
  const args = process.argv.slice(2);
  const email = args.find((a) => !a.startsWith('--'));
  const sim = args.includes('--sim');
  if (!email) {
    console.error('Usage: npm run seed:devices -- <admin-email> [--sim]');
    process.exit(1);
  }

  await connectDatabase();
  try {
    const user = (await User.findOne({ email: email.toLowerCase() }).lean()) as { organizationId?: unknown } | null;
    if (!user) throw new Error(`No user with email ${email}.`);
    if (!user.organizationId) throw new Error(`User ${email} has no organization.`);

    const wifi = (await Protocol.findOneAndUpdate(
      { code: 'PROTO_WIFI' },
      { $setOnInsert: { name: 'Wi-Fi / HTTP (LAN)', code: 'PROTO_WIFI', securityType: 'LAN' } },
      { upsert: true, new: true },
    )) as { _id: unknown };
    await Protocol.findOneAndUpdate(
      { code: 'PROTO_MQTT' },
      { $setOnInsert: { name: 'MQTT (own broker)', code: 'PROTO_MQTT', securityType: 'TLS' } },
      { upsert: true },
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const d of EXTRA_DEVICES) {
      const rec = deviceRecordFor(d);
      const existing = (await Device.findOne({ deviceCode: rec.deviceCode })) as
        | { _id: unknown; organizationId?: unknown; save: () => Promise<unknown>; [k: string]: unknown }
        | null;
      let id: unknown;
      if (existing) {
        if (String(existing.organizationId) !== String(user.organizationId)) {
          console.warn(`! ${rec.deviceCode}: belongs to another organization — skipped`);
          skipped++;
          continue;
        }
        existing.name = rec.name;
        existing.type = rec.type;
        existing.criticality = rec.criticality;
        existing.protocolId = wifi._id;
        await existing.save();
        id = existing._id;
        updated++;
      } else {
        const made = (await Device.create({ ...rec, organizationId: user.organizationId, protocolId: wifi._id })) as { _id: unknown };
        id = made._id;
        created++;
      }
      if (sim) {
        await Discovery.findOneAndUpdate({ deviceId: id, method: 'wifi' }, { $set: { ipAddress: '127.0.0.1' } }, { upsert: true });
      }
    }

    console.log(`✔ devices: ${created} created, ${updated} updated, ${skipped} skipped (of ${EXTRA_DEVICES.length})`);
    console.log(sim
      ? '✔ --sim: every device points to 127.0.0.1. Set DEVICE_HTTP_PORT=8899 in .env, restart the server, run "npm run fake:device".'
      : '• No network address was set. Commands will report "No network address known" until a Discovery record or --sim exists.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch((e) => {
  console.error('✘', e instanceof Error ? e.message : e);
  process.exit(1);
});
