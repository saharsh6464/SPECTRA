import { useEffect, useRef, useState } from "react";
import { uploadProctoringSnapshot } from "../api/proctoringApi";

export default function useWebcamCapture({ sessionId, userId, deviceType = "laptop", videoConstraints = true }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("Waiting for first frame...");

  useEffect(() => {
    if (!sessionId || !navigator.mediaDevices?.getUserMedia) {
      return undefined;
    }

    let disposed = false;
    let uploadInFlight = false;
    let captureTimer;
    const videoElement = videoRef.current;
    const canvas = document.createElement("canvas");

    const captureFrame = () => {
      const video = videoElement;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob && !disposed && !uploadInFlight) {
          uploadInFlight = true;
          setUploadStatus("Uploading snapshot...");
          void uploadProctoringSnapshot(sessionId, userId, deviceType, blob).catch((error) => {
            setUploadStatus(`Upload failed (${error.status || "network"}): ${error.message}`);
            console.warn(
              "Could not upload proctoring snapshot:",
              error.response?.data || error.message,
            );
          }).finally(() => {
            uploadInFlight = false;
            if (!disposed) setUploadStatus((current) => current.startsWith("Upload failed") ? current : "Snapshot uploaded");
          });
        }
      }, "image/jpeg", 0.8);
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        videoElement.srcObject = stream;
        await videoElement.play();
        setIsActive(true);
        captureFrame();
        captureTimer = window.setInterval(captureFrame, 5000);
      } catch {
        if (!disposed) setPermissionError("Camera permission was denied. Camera proctoring is unavailable.");
      }
    };

    void startCamera();
    return () => {
      disposed = true;
      window.clearInterval(captureTimer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoElement) videoElement.srcObject = null;
      setIsActive(false);
    };
  }, [deviceType, sessionId, userId, videoConstraints]);

  return { videoRef, isActive, permissionError, uploadStatus };
}
