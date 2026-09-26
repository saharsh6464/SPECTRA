import { useEffect, useState } from "react";

export default function useSpeechTranscription() {
  const [permissionError, setPermissionError] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);

  useEffect(() => {
    setIsSupported(false);
    setIsMicActive(false);
    setPermissionError("");
  }, []);

  return { isSupported, isMicActive, permissionError };
}
