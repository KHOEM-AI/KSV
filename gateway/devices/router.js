// KSV — router ឧបករណ៍ទូទៅ (ភ្ជាប់នៅ /api/ksv ក្រោយ token check ក្នុង server.js)
import { Router } from "express";
import * as svc from "./service.js";

const send = (res, r) => res.status(r.status).json(r.body);
const router = Router();

router.get("/types", (_req, res) => send(res, svc.types()));
router.get("/types/:type", (req, res) => send(res, svc.typeDetail(req.params.type)));

router.get("/devices", (_req, res) => send(res, svc.devices()));
router.post("/devices", (req, res) => send(res, svc.register(req.body)));
router.get("/devices/:id", (req, res) => send(res, svc.device(req.params.id)));

router.post("/devices/:id/command", async (req, res) => send(res, await svc.command(req.params.id, req.body)));
router.post("/devices/:id/state", (req, res) => send(res, svc.reportState(req.params.id, req.body)));
router.post("/devices/:id/disable", (req, res) => send(res, svc.disable(req.params.id, true)));
router.post("/devices/:id/enable", (req, res) => send(res, svc.disable(req.params.id, false)));

export default router;
