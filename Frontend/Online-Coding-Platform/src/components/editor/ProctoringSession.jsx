import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useAntiCheating from "../../hooks/useAntiCheating";
import useSpeechTranscription from "../../hooks/useSpeechTranscription";
import useWebcamCapture from "../../hooks/useWebcamCapture";
import SECURITY_CONFIG from "../../config/securityConfig";

const ProctoringSession = ({ children }) => {
  const { testId } = useParams();
  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = loggedUser?.id ? String(loggedUser.id) : null;
  const sessionId = SECURITY_CONFIG.ENABLE_PROCTORING && testId && userId ? testId : null;
  const [warning, setWarning] = useState("");
  const [fullscreenStarted, setFullscreenStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const warningTimer = useRef(null);
  const handleViolation = useCallback((eventType, metadata) => {
    if (metadata?.warning) {
      setWarning(eventType);
      window.clearTimeout(warningTimer.current);
      warningTimer.current = window.setTimeout(() => setWarning(""), 5000);
    }
  }, []);
  const telemetry = useAntiCheating({ sessionId, userId, onViolation: handleViolation });
  const webcam = useWebcamCapture({ sessionId, userId });
  const speech = useSpeechTranscription({ sessionId, userId });

  useEffect(() => {
    if (!sessionId) return undefined;
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && fullscreenStarted) {
        setWarning("Fullscreen was exited. Re-enter fullscreen to continue the test.");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [fullscreenStarted, sessionId]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenStarted(true);
      setIsFullscreen(true);
      setWarning("");
    } catch {
      setWarning("Fullscreen permission was denied. Click the button to try again.");
    }
  };

  useEffect(() => () => window.clearTimeout(warningTimer.current), []);

  return (
    <div className="relative h-full">
      {children}
      <video ref={webcam.videoRef} muted autoPlay playsInline className="hidden" aria-hidden="true" />
      {sessionId && (!fullscreenStarted || !isFullscreen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 text-center text-white">
          <div className="max-w-md border-4 border-black bg-[var(--neo-yellow)] p-8 text-black shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-black">{fullscreenStarted ? "FULLSCREEN REQUIRED" : "READY TO START?"}</h2>
            <p className="mt-4 text-sm font-bold">
              {fullscreenStarted
                ? "Return to fullscreen before continuing your test."
                : "Start the exam to enable fullscreen and proctoring."}
            </p>
            <button
              type="button"
              onClick={enterFullscreen}
              className="mt-6 bg-[var(--neo-green)] px-5 py-3 text-black"
            >
              {fullscreenStarted ? "Re-enter Fullscreen" : "Start Exam & Enter Fullscreen"}
            </button>
          </div>
        </div>
      )}
      {(warning || webcam.permissionError || speech.permissionError) && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-amber-400/40 bg-amber-950/95 px-4 py-3 text-xs text-amber-100 shadow-xl">
          {warning || webcam.permissionError || speech.permissionError}
        </div>
      )}
      {sessionId && (
        <span className="fixed bottom-2 right-3 z-40 text-[10px] text-slate-500" title="Proctoring telemetry status">
          {webcam.isActive ? "Camera linked" : "Camera unavailable"} · {telemetry.current.windowBlurCount} focus events
          {speech.isMicActive && <span className="ml-2 text-emerald-400">● Mic active</span>}
        </span>
      )}
    </div>
  );
};

export default ProctoringSession;
