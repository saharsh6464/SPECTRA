import { useEffect, useCallback } from "react";
import { createAnomaly } from "../api/anomaly";
import SECURITY_CONFIG from "../config/securityConfig";

const SecurityBlocker = ({ testId }) => {
  const recordViolation = useCallback(async (type, riskScore = 1) => {
    // If master proctoring toggle is disabled, do nothing
    if (!SECURITY_CONFIG.ENABLE_PROCTORING) return;

    const current = Number(localStorage.getItem(`test_${testId}_violations`)) || 0;
    localStorage.setItem(`test_${testId}_violations`, current + riskScore);

    if (SECURITY_CONFIG.LOG_ANOMALIES_TO_BACKEND) {
      try {
        await createAnomaly({
          anomalyType: type,
          riskScore: riskScore,
        });
      } catch {
        console.warn("Anomaly logged locally:", type);
      }
    }
  }, [testId]);

  useEffect(() => {
    // If master proctoring switch is false, do not attach any listeners or restrictions
    if (!testId || !SECURITY_CONFIG.ENABLE_PROCTORING) return;

    const handleVisibilityChange = () => {
      if (!SECURITY_CONFIG.ALLOW_TAB_SWITCH && document.hidden) {
        recordViolation("Tab Switch / Minimized Window", 2);
      }
    };

    const handleBlur = () => {
      if (!SECURITY_CONFIG.ALLOW_WINDOW_BLUR) {
        recordViolation("Window Focus Lost", 1);
      }
    };

    const handleKeyDown = (event) => {
      const isCopyPaste = (event.ctrlKey || event.metaKey) && ["c", "v", "x"].includes(event.key.toLowerCase());
      const isOtherRestricted = event.key === "PrintScreen" || 
        ((event.ctrlKey || event.metaKey) && ["u", "s"].includes(event.key.toLowerCase())) ||
        event.key === "F12";

      // If copy/paste is blocked
      if (!SECURITY_CONFIG.ALLOW_COPY_PASTE && isCopyPaste) {
        event.preventDefault();
        recordViolation(`Blocked Shortcut (${event.key})`, 1);
        return;
      }

      // If other shortcuts/screenshots are blocked
      if (!SECURITY_CONFIG.ALLOW_SHORTCUTS && isOtherRestricted) {
        event.preventDefault();
        recordViolation(`Blocked Shortcut (${event.key})`, 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [testId, recordViolation]);

  return null;
};

export default SecurityBlocker;