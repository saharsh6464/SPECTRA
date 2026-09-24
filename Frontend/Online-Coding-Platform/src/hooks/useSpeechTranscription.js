import { useEffect, useRef, useState } from "react";
import { updateProctoringTelemetry } from "../api/proctoringApi";

export default function useSpeechTranscription({ sessionId, userId }) {
  const [permissionError, setPermissionError] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const audioStreamRef = useRef(null);
  const bufferRef = useRef("");

  useEffect(() => {
    if (!sessionId) return undefined;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    let stopped = false;
    let restartTimer;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) {
          const nextTranscript = `${bufferRef.current} ${event.results[index][0].transcript.trim()}`.trim();
          bufferRef.current = nextTranscript;
          console.log("Transcript updated:", nextTranscript);
        }
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPermissionError("Microphone permission was denied. Speech telemetry is unavailable.");
      }
    };
    recognition.onend = () => {
      if (!stopped) {
        window.clearTimeout(restartTimer);
        restartTimer = window.setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // The browser may still be closing the previous recognition session.
          }
        }, 100);
      }
    };

    const syncTranscript = () => {
      const currentTranscript = bufferRef.current.trim();
      console.log("Sending transcript to anomaly_factors:", currentTranscript || "(empty)");
      void updateProctoringTelemetry(sessionId, userId, { transcript: currentTranscript }).catch((error) => {
        console.warn("Could not sync speech transcript:", error.message);
      });
    };

    const startMicrophone = async () => {
      try {
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
          return;
        }
        setIsMicActive(true);
        recognition.start();
        console.log("Microphone stream active; speech recognition started");
      } catch {
        setIsMicActive(false);
        setPermissionError("Microphone permission was denied. Speech telemetry is unavailable.");
      }
    };

    void startMicrophone();
    const flushTimer = window.setInterval(syncTranscript, 10000);

    return () => {
      stopped = true;
      window.clearInterval(flushTimer);
      window.clearTimeout(restartTimer);
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // Recognition may already have ended.
      }
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      syncTranscript();
    };
  }, [sessionId, userId]);

  return { isSupported, isMicActive, permissionError };
}
