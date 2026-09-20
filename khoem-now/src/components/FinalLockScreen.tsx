// src/components/FinalLockScreen.tsx
// The 4th and last lock before the dashboard.
//   Unlock: face scan first; if it fails (or isn't set up) → draw the pattern.
//   First time: draw a pattern twice, then optionally turn on face scan.
import { useEffect, useRef, useState } from "react";
import { PatternLock } from "./PatternLock";
import {
  MIN_PATTERN_DOTS,
  clearFinalLock,
  enrollFace,
  getLockRemainingMs,
  hasFace,
  hasPattern,
  isFaceSupported,
  savePattern,
  verifyFace,
  verifyPattern,
} from "../lib/finalLock";

type Props = {
  /** Stable id of the logged-in user (e.g. req.user.id). */
  userId: string;
  /** Call to enter the dashboard. */
  onUnlocked: () => void;
  /** User forgot the pattern. Local lock is cleared, then you should log out
   *  so the password is required again. */
  onForgot: () => void;
};

type Stage = "loading" | "setup-draw" | "setup-confirm" | "setup-face" | "unlock";
type Status = "idle" | "error" | "success";

// Move these into your i18n files when ready.
const T = {
  unlockTitle: "Final Lock",
  faceButton: "Scan face",
  usePattern: "Use pattern instead",
  drawHint: "Draw your pattern across the 9 dots",
  setupTitle: "Set pattern lock",
  setupDraw: `Draw a new pattern (at least ${MIN_PATTERN_DOTS} dots)`,
  setupConfirm: "Draw again to confirm",
  tooShort: `Connect at least ${MIN_PATTERN_DOTS} dots`,
  mismatch: "Patterns do not match. Try again",
  wrong: "Wrong pattern",
  locked: (s: number) => `Too many attempts. Wait ${s} seconds`,
  faceFail: "Face scan failed. Please draw your pattern",
  needSecure: "HTTPS or localhost is required to use this lock",
  faceOfferTitle: "Turn on face scan?",
  faceOfferBody: "Your phone verifies your face on-device. KSV never sees or stores your face.",
  enable: "Enable",
  skip: "Skip",
  forgot: "Forgot pattern?",
};

const styles = {
  screen: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 24,
    background: "#0b1220",
    color: "#e2e8f0",
    textAlign: "center",
  },
  title: { fontSize: 22, fontWeight: 600, margin: 0 },
  hint: { fontSize: 15, margin: 0, color: "#94a3b8", maxWidth: 320, lineHeight: 1.6 },
  message: { fontSize: 15, margin: 0, minHeight: 24 },
  primary: {
    padding: "14px 28px",
    borderRadius: 14,
    border: "none",
    background: "#38bdf8",
    color: "#06202e",
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
  },
  link: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 15,
    textDecoration: "underline",
    cursor: "pointer",
    padding: 8,
  },
} as const;

const skipKey = (u: string) => `ksv.faceOfferSkipped.v1.${u}`;
const faceOfferSkipped = (u: string) => {
  try { return sessionStorage.getItem(skipKey(u)) === "1"; } catch { return false; }
};
const markFaceOfferSkipped = (u: string) => {
  try { sessionStorage.setItem(skipKey(u), "1"); } catch { /* ignore */ }
};

export function FinalLockScreen({ userId, onUnlocked, onForgot }: Props) {
  const [stage, setStage] = useState<Stage>("loading");
  const [faceSupported, setFaceSupported] = useState(false);
  const [showPad, setShowPad] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [lockLeft, setLockLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const firstPattern = useRef<number[] | null>(null);

  // Decide which stage to show.
  useEffect(() => {
    let alive = true;
    (async () => {
      const supported = await isFaceSupported();
      if (!alive) return;
      setFaceSupported(supported);
      if (hasPattern(userId)) {
        setShowPad(!(supported && hasFace(userId)));
        setStage("unlock");
      } else {
        setStage("setup-draw");
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  // Countdown while locked out.
  useEffect(() => {
    const tick = () => setLockLeft(Math.ceil(getLockRemainingMs(userId) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [userId]);

  const flash = (s: Status, msg: string) => {
    setStatus(s);
    setMessage(msg);
    window.setTimeout(() => setStatus("idle"), 800);
  };

  // ----- setup -----

  const onSetupDraw = (pattern: number[]) => {
    if (pattern.length < MIN_PATTERN_DOTS) {
      flash("error", T.tooShort);
      return;
    }
    firstPattern.current = pattern;
    setMessage("");
    setStage("setup-confirm");
  };

  const onSetupConfirm = async (pattern: number[]) => {
    if (pattern.join("-") !== firstPattern.current?.join("-")) {
      firstPattern.current = null;
      flash("error", T.mismatch);
      setStage("setup-draw");
      return;
    }
    setBusy(true);
    try {
      await savePattern(userId, pattern);
    } catch {
      flash("error", T.needSecure);
      return;
    } finally {
      setBusy(false);
    }
    setStatus("success");
    if (faceSupported && !hasFace(userId)) setStage("setup-face");
    else window.setTimeout(onUnlocked, 250);
  };

  const onEnableFace = async () => {
    setBusy(true);
    await enrollFace(userId);
    setBusy(false);
    onUnlocked();
  };

  // ----- unlock -----

  const onUnlockDraw = async (pattern: number[]) => {
    try {
      const res = await verifyPattern(userId, pattern);
      if (res === "ok") {
        setStatus("success");
        if (faceSupported && !hasFace(userId) && !faceOfferSkipped(userId)) setStage("setup-face");
        else window.setTimeout(onUnlocked, 250);
      } else if (res === "locked") {
        setLockLeft(Math.ceil(getLockRemainingMs(userId) / 1000));
        flash("error", T.locked(Math.ceil(getLockRemainingMs(userId) / 1000)));
      } else {
        flash("error", T.wrong);
      }
    } catch {
      flash("error", T.needSecure);
    }
  };

  const onFace = async () => {
    setBusy(true);
    const ok = await verifyFace(userId);
    setBusy(false);
    if (ok) {
      setStatus("success");
      onUnlocked();
    } else {
      setShowPad(true);
      flash("error", T.faceFail);
    }
  };

  const forgot = () => {
    clearFinalLock(userId);
    onForgot();
  };

  // ----- render -----

  if (stage === "loading") return <div style={styles.screen} />;

  if (stage === "setup-face") {
    return (
      <div style={styles.screen}>
        <h1 style={styles.title}>{T.faceOfferTitle}</h1>
        <p style={styles.hint}>{T.faceOfferBody}</p>
        <button style={styles.primary} onClick={onEnableFace} disabled={busy}>
          {T.enable}
        </button>
        <button style={styles.link} onClick={() => { markFaceOfferSkipped(userId); onUnlocked(); }} disabled={busy}>
          {T.skip}
        </button>
      </div>
    );
  }

  if (stage === "setup-draw" || stage === "setup-confirm") {
    return (
      <div style={styles.screen}>
        <h1 style={styles.title}>{T.setupTitle}</h1>
        <p style={styles.hint}>{stage === "setup-draw" ? T.setupDraw : T.setupConfirm}</p>
        <PatternLock
          key={stage}
          onComplete={stage === "setup-draw" ? onSetupDraw : onSetupConfirm}
          disabled={busy}
          error={status === "error"}
          success={status === "success"}
        />
        <p style={styles.message} aria-live="polite">
          {message}
        </p>
      </div>
    );
  }

  const canFace = faceSupported && hasFace(userId);
  const locked = lockLeft > 0;

  return (
    <div style={styles.screen}>
      <h1 style={styles.title}>{T.unlockTitle}</h1>

      {canFace && (
        <button style={styles.primary} onClick={onFace} disabled={busy}>
          {T.faceButton}
        </button>
      )}

      {canFace && !showPad && (
        <button style={styles.link} onClick={() => setShowPad(true)}>
          {T.usePattern}
        </button>
      )}

      {showPad && (
        <>
          <p style={styles.hint}>{T.drawHint}</p>
          <PatternLock
            onComplete={onUnlockDraw}
            disabled={locked || busy}
            error={status === "error"}
            success={status === "success"}
          />
        </>
      )}

      <p style={styles.message} aria-live="polite">
        {locked ? T.locked(lockLeft) : message}
      </p>

      <button style={styles.link} onClick={forgot}>
        {T.forgot}
      </button>
    </div>
  );
}
