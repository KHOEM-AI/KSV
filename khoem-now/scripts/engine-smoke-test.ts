import "dotenv/config";
import { connectDatabase } from "../src/infrastructure/database/connection.ts";
import { AutomationRule, AuditLog, Command, Device } from "../src/infrastructure/database/models.ts";

const CODE = "DEV-5004";
const COMMAND = "PING";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await connectDatabase();

  const device: any = await Device.findOne({ deviceCode: CODE }).lean();
  if (!device) {
    console.error(`Device ${CODE} not found. Aborting.`);
    process.exit(1);
  }
  console.log(`Device: ${device.name} | type=${device.type} | criticality=${device.criticality ?? "facility"} | status=${device.status}`);
  if (device.criticality === "life_support") {
    console.error("Device is life_support. Aborting.");
    process.exit(1);
  }

  const others: any[] = await AutomationRule.find({ isEnabled: true }).select("name trigger").lean();
  if (others.length > 0 && process.env.FORCE !== "1") {
    console.error("Other ENABLED automation rules exist (the engine would run them too):");
    for (const r of others) console.error(` - ${r.name} ${JSON.stringify(r.trigger)}`);
    console.error("Disable them first, or re-run with FORCE=1. Aborting.");
    process.exit(1);
  }

  const start = new Date();
  const when = new Date(start.getTime() + 2 * 60_000);
  const hh = String(when.getUTCHours()).padStart(2, "0");
  const mm = String(when.getUTCMinutes()).padStart(2, "0");

  const rule: any = await AutomationRule.create({
    organizationId: device.organizationId,
    name: "ENGINE-SMOKE-TEST (auto-deleted)",
    trigger: { type: "time_of_day", time: `${hh}:${mm}`, timezone: "UTC" },
    action: { deviceId: String(device._id), commandType: COMMAND },
    isEnabled: true,
  });
  console.log(`Test rule created: fires at ${hh}:${mm} UTC (in ~2 min). Waiting... (Ctrl+C to abort; the rule is deleted either way)`);

  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return;
    cleaned = true;
    await AutomationRule.deleteOne({ _id: rule._id });
    console.log("Test rule deleted.");
  };
  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(130);
  });

  try {
    const deadline = when.getTime() + 90_000;
    let cmd: any = null;
    while (Date.now() < deadline + 60_000) {
      cmd = await Command.findOne({ deviceId: device._id, type: COMMAND, createdAt: { $gte: start } })
        .sort({ createdAt: -1 })
        .lean();
      if (cmd && cmd.status !== "pending") break;
      if (!cmd && Date.now() > deadline) break;
      await sleep(5000);
    }

    const fresh: any = await AutomationRule.findById(rule._id).lean();
    console.log("\n=== RESULT ===");
    console.log("rule.lastRunKey :", fresh?.lastRunKey ?? "(never ran — engine off or not started?)");
    console.log("command         :", cmd ? `${cmd.status} ${JSON.stringify(cmd.response ?? {})}` : "(none created)");
    const audits: any[] = await AuditLog.find({ deviceId: device._id, createdAt: { $gte: start } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    console.log("audit entries   :", audits.length);
    for (const a of audits) console.log(` - ${a.action} | ${a.result} | ${a.reason ?? ""}`);
  } finally {
    await cleanup();
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
