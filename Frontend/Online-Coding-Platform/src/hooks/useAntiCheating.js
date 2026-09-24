import { useEffect, useRef } from "react";
import { updateProctoringTelemetry } from "../api/proctoringApi";

const initialTelemetry = {
  copyPasteCount: 0,
  copyCount: 0,
  pasteCount: 0,
  windowBlurCount: 0,
  fullscreenExitCount: 0,
};

export default function useAntiCheating({ sessionId, userId, onViolation }) {
  const telemetryRef = useRef(initialTelemetry);
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  useEffect(() => {
    if (!sessionId) return undefined;

    const increment = (key, eventType, metadata, databaseKey = key) => {
      const next = { ...telemetryRef.current, [key]: telemetryRef.current[key] + 1 };
      if (databaseKey !== key) next[databaseKey] = telemetryRef.current[databaseKey] + 1;
      telemetryRef.current = next;
      onViolationRef.current?.(eventType, { ...metadata, count: next[key] });
      void updateProctoringTelemetry(sessionId, userId, next).catch((error) => {
        console.warn("Could not sync proctoring telemetry:", error.message);
      });
    };
    const handleContextMenu = (event) => event.preventDefault();
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["c", "v"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        const isCopy = event.key.toLowerCase() === "c";
        increment(
          "copyPasteCount",
          "blocked_copy_paste",
          { key: event.key },
          isCopy ? "copyCount" : "pasteCount",
        );
      }
    };
    const handleBlur = () => increment("windowBlurCount", "window_blur");
    const handleVisibility = () => {
      if (document.hidden) increment("windowBlurCount", "tab_hidden");
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        increment("fullscreenExitCount", "fullscreen_exit");
        onViolationRef.current?.("Please return to fullscreen mode.", { warning: true });
      }
    };
    const syncTelemetry = () => {
      void updateProctoringTelemetry(sessionId, userId, telemetryRef.current).catch((error) => {
        console.warn("Could not sync telemetry:", error.message);
      });
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    window.addEventListener("blur", handleBlur);
    const syncTimer = window.setInterval(syncTelemetry, 30000);
    window.addEventListener("beforeunload", syncTelemetry);

    return () => {
      window.clearInterval(syncTimer);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", syncTelemetry);
      syncTelemetry();
    };
  }, [sessionId, userId]);

  return telemetryRef;
}
