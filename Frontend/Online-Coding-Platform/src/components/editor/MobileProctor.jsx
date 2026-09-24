import { useSearchParams } from "react-router-dom";
import useWebcamCapture from "../../hooks/useWebcamCapture";
import SECURITY_CONFIG from "../../config/securityConfig";

const PHONE_VIDEO_CONSTRAINTS = { facingMode: "user" };

const MobileProctor = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const userId = searchParams.get("userId");
  const sessionId = SECURITY_CONFIG.ENABLE_PROCTORING && testId && userId ? testId : null;
  const { videoRef, isActive, permissionError, uploadStatus } = useWebcamCapture({
    sessionId,
    userId,
    videoConstraints: PHONE_VIDEO_CONSTRAINTS,
  });

  if (!SECURITY_CONFIG.ENABLE_PROCTORING) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-slate-200">Proctoring is disabled for this environment.</main>;
  }

  if (!testId || !userId) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-slate-200">Missing proctoring session.</main>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-6 text-center text-white">
      <div>
        <h1 className="text-xl font-semibold">Mobile Proctor Camera</h1>
        <p className="mt-2 text-sm text-slate-400">Keep this page open with your camera facing you.</p>
      </div>
      <video ref={videoRef} muted autoPlay playsInline className="aspect-[3/4] w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 object-cover" />
      <p className={isActive ? "text-sm text-emerald-400" : "text-sm text-amber-400"}>
        {isActive ? "Camera Linked and Streaming Proctoring Data" : permissionError || "Requesting camera access..."}
      </p>
      <p className="max-w-sm break-words text-xs text-slate-300">{uploadStatus}</p>
    </main>
  );
};

export default MobileProctor;
