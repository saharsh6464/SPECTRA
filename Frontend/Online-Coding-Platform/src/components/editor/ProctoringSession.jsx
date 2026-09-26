import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import useAntiCheating from "../../hooks/useAntiCheating";
import useSpeechTranscription from "../../hooks/useSpeechTranscription";
import useWebcamCapture from "../../hooks/useWebcamCapture";
import { getPhoneStatus } from "../../api/proctoringApi";
import { createTestAttempt } from "../../api/testAttempt";
import SECURITY_CONFIG from "../../config/securityConfig";

const ProctoringSession = ({ children }) => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = loggedUser?.id ? String(loggedUser.id) : null;
  const sessionId = SECURITY_CONFIG.ENABLE_PROCTORING && testId && userId ? testId : null;
  const [warning, setWarning] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [phoneSeen, setPhoneSeen] = useState(false);
  const [phoneLastSeen, setPhoneLastSeen] = useState(null);
  const [fullscreenSeconds, setFullscreenSeconds] = useState(30);
  const [autoFailed, setAutoFailed] = useState(false);
  const [windowAway, setWindowAway] = useState(false);
  const warningTimer = useRef(null);

  const mobileProctorUrl = `https://td5g7npg-5173.inc1.devtunnels.ms/mobile-proctor?testId=${encodeURIComponent(testId || "")}&userId=${encodeURIComponent(userId || "")}`;
  const captureSessionId = examStarted ? sessionId : null;

  const handleViolation = useCallback((eventType, metadata) => {
    if (metadata?.warning) {
      setWarning(eventType);
      window.clearTimeout(warningTimer.current);
      warningTimer.current = window.setTimeout(() => setWarning(""), 5000);
    }
  }, []);

  const telemetry = useAntiCheating({ sessionId: captureSessionId, userId, onViolation: handleViolation });
  const webcam = useWebcamCapture({ sessionId: captureSessionId, userId, deviceType: "laptop" });
  const speech = useSpeechTranscription({ sessionId, userId });

  useEffect(() => {
    if (!sessionId) return undefined;
    let disposed = false;
    const checkPhone = async () => {
      try {
        const latest = await getPhoneStatus(testId, userId);
        const timestamp = latest?.created_at ? new Date(latest.created_at).getTime() : 0;
        const connected = Boolean(timestamp && Date.now() - timestamp <= 12000);
        if (!disposed) {
          setPhoneConnected(connected);
          if (timestamp) {
            setPhoneSeen(true);
            setPhoneLastSeen(new Date(timestamp));
          }
        }
      } catch (error) {
        console.warn("Could not check phone proctor status:", error.message);
      }
    };
    void checkPhone();
    const phoneTimer = window.setInterval(checkPhone, 5000);
    return () => {
      disposed = true;
      window.clearInterval(phoneTimer);
    };
  }, [sessionId, testId, userId]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && examStarted) {
        setFullscreenSeconds(30);
        setWarning("Fullscreen exited. Return within 30 seconds or the test will fail.");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [examStarted, sessionId]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const handleAway = () => {
      if (examStarted) {
        setWindowAway(true);
        setWarning("Window focus was lost. Return to the test and resume fullscreen.");
      }
    };
    const handleReturn = () => {
      if (!document.hidden && examStarted) setWindowAway(false);
    };
    window.addEventListener("blur", handleAway);
    document.addEventListener("visibilitychange", handleReturn);
    return () => {
      window.removeEventListener("blur", handleAway);
      document.removeEventListener("visibilitychange", handleReturn);
    };
  }, [examStarted, sessionId]);

  useEffect(() => {
    if (!examStarted || isFullscreen || autoFailed) return undefined;
    const timer = window.setInterval(() => {
      setFullscreenSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [autoFailed, examStarted, isFullscreen]);

  useEffect(() => {
    if (fullscreenSeconds !== 0 || autoFailed || !examStarted || isFullscreen) return;
    setAutoFailed(true);
    localStorage.setItem(`test_${testId}_violations`, "100");
    void createTestAttempt({
      test: { testId: parseInt(testId, 10) },
      user: { id: loggedUser.id },
      totalScore: 0,
      totalRisk: 100,
    }).finally(() => navigate("/student/history"));
  }, [autoFailed, examStarted, fullscreenSeconds, isFullscreen, loggedUser.id, navigate, testId]);

  const enterFullscreen = async () => {
    if (!phoneConnected) {
      setWarning("Scan the QR code and keep the phone camera page open before starting.");
      return;
    }
    try {
      await document.documentElement.requestFullscreen();
      setExamStarted(true);
      setIsFullscreen(true);
      setFullscreenSeconds(30);
      setWarning("");
    } catch {
      setWarning("Fullscreen permission was denied. Click the button to try again.");
    }
  };

  useEffect(() => () => window.clearTimeout(warningTimer.current), []);

  const locked = sessionId && (!examStarted || !phoneConnected || !isFullscreen || autoFailed || windowAway);

  return (
    <div className="relative h-full">
      <div className={locked ? "h-full blur-sm pointer-events-none" : "h-full"}>{children}</div>
      <video ref={webcam.videoRef} muted autoPlay playsInline className="hidden" aria-hidden="true" />

      {locked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/90 p-6 text-center text-white">
          <div className={`max-w-lg border-4 border-black p-8 text-black shadow-[8px_8px_0_0_#000] ${autoFailed || (examStarted && !isFullscreen) ? "bg-[var(--neo-red)]" : "bg-[var(--neo-yellow)]"}`}>
            <h2 className="text-2xl font-black">{autoFailed ? "TEST FAILED" : windowAway ? "RETURN TO TEST" : examStarted && !isFullscreen ? "FULLSCREEN REQUIRED" : "BEFORE YOU START"}</h2>
            <p className="mt-4 text-sm font-bold">
              {autoFailed
                ? "This test was failed for leaving fullscreen. Contact the organizer."
                : windowAway
                  ? "Window switching is not allowed. Return to this page and click Resume Fullscreen to continue."
                  : examStarted && !isFullscreen
                  ? `Return to fullscreen within ${fullscreenSeconds} seconds or the test will automatically fail with 100 cheating risk.`
                  : "Scan the QR code, allow the phone camera, keep the phone page open, and remain in fullscreen. The test will not open until the phone is connected."}
            </p>
            {!autoFailed && <QRCodeCanvas value={mobileProctorUrl} size={170} bgColor="#ffffff" fgColor="#000000" includeMargin className="mx-auto mt-5 border-2 border-black" />}
            {!autoFailed && <p className="mt-3 text-xs font-bold">{phoneConnected ? `Phone connected${phoneLastSeen ? ` · Last image ${phoneLastSeen.toLocaleTimeString()}` : ""}` : phoneSeen ? "Phone disconnected. Reopen the QR page to continue." : "Waiting for phone camera..."}</p>}
            {!autoFailed && <button type="button" onClick={enterFullscreen} disabled={!phoneConnected} className="mt-6 bg-[var(--neo-green)] px-5 py-3 text-black disabled:cursor-not-allowed disabled:opacity-50">{examStarted ? "Resume Fullscreen" : "Start Exam & Enter Fullscreen"}</button>}
          </div>
        </div>
      )}

      {(warning || webcam.permissionError || speech.permissionError) && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-amber-400/40 bg-amber-950/95 px-4 py-3 text-xs text-amber-100 shadow-xl">
          {warning || webcam.permissionError || speech.permissionError}
        </div>
      )}
      {captureSessionId && (
        <span className="fixed bottom-2 right-3 z-40 text-[10px] text-slate-500" title="Proctoring telemetry status">
          {webcam.isActive ? "Camera linked" : "Camera unavailable"} · {telemetry.current.windowBlurCount} focus events
        </span>
      )}
    </div>
  );
};

export default ProctoringSession;
