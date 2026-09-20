import { useCallback, useEffect, useState } from "react";
import { updateMyLocation } from "@/lib/api";

interface Props {
  onGranted: () => void;
}

type Status = "asking" | "denied" | "unsupported" | "error";

export default function LocationGate({ onGranted }: Props) {
  const [status, setStatus] = useState<Status>("asking");

  const request = useCallback(() => {
    setStatus("asking");
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateMyLocation(pos.coords.latitude, pos.coords.longitude);
          onGranted();
        } catch {
          setStatus("error");
        }
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, [onGranted]);

  useEffect(() => {
    request();
  }, [request]);

  const message: Record<Status, string> = {
    asking: "Requesting location permission…",
    denied: "Location permission is required to use KSV. Allow location in your browser settings, then try again.",
    unsupported: "This device does not support location services, which KSV requires.",
    error: "Could not get or save your location. Check your connection and try again.",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0e17",
      }}
    >
      <div style={{ background: "#131a29", padding: 32, borderRadius: 12, width: 320 }}>
        <h1 style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>Location Required</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>{message[status]}</p>
        {status !== "asking" && status !== "unsupported" && (
          <button
            type="button"
            onClick={request}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: "#0ea5e9",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
