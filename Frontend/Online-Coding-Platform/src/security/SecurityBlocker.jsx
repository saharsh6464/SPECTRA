import { useEffect, useState } from "react";

const SecurityBlocker = () => {
  const [counter, setCounter] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wasHidden, setWasHidden] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    console.log("SecurityBlocker is running...");

    const incrementCounter = () => {
      setCounter((prev) => prev + 1);
    };

    // 🔹 Force fullscreen when component mounts
    const requestFullScreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };

    requestFullScreen();

    // 🔹 Detect if user exits fullscreen → re-enter
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        requestFullScreen();
        incrementCounter();
        alert("⚠ Fullscreen mode is required!");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const blockScreenshotAndRecording = (event) => {
      if (
        event.key === "PrintScreen" ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          ["S", "4", "R", "5"].includes(event.key))
      ) {
        event.preventDefault();
        alert("⚠ Screenshots & Screen Recording are disabled!");
      }
    };

    document.addEventListener("keydown", blockScreenshotAndRecording);

    const showAlert = (message) => {
      if (!alertActive) {
        setAlertActive(true);
        incrementCounter();
        setTimeout(() => {
          alert(message);
          setAlertActive(false);
        }, 100);
      }
    };

    const blockShortcuts = (event) => {
      if ((event.ctrlKey || event.metaKey) && [67, 86, 84].includes(event.keyCode)) {
        event.preventDefault();
        showAlert("⚠ Keyboard shortcuts are disabled!");
      }
    };
    document.addEventListener("keydown", blockShortcuts);

    document.addEventListener("visibilitychange", () => {
      setWasHidden(document.hidden);
    });

    window.onbeforeunload = (event) => {
      event.preventDefault();
      event.returnValue = "Are you sure you want to leave?";
      incrementCounter();
    };

    const detectAppSwitch = () => {
      if (!document.hasFocus() && !wasHidden && !alertActive) {
        setAlertActive(true);
        incrementCounter();
        setTimeout(() => {
          alert("⚠ You switched apps! Please stay on this page.");
          setAlertActive(false);
        }, 100);
      }
    };
    window.addEventListener("blur", detectAppSwitch);

    const detectRemoteAccess = setInterval(() => {
      navigator.usb.getDevices().then((devices) => {
        setDeviceCount(devices.length);
      });
    }, 5000);

    const preventResize = () => {
      if ((window.innerWidth < 800 || window.innerHeight < 600) && !alertActive) {
        showAlert("⚠ You must keep the window in full size!");
        requestFullScreen();
      }
    };
    window.addEventListener("resize", preventResize);

    const blockScreenshot = (event) => {
      if (event.key === "PrintScreen") {
        event.preventDefault();
        showAlert("⚠ Screenshots are not allowed!");
      }
    };
    document.addEventListener("keyup", blockScreenshot);

    return () => {
      clearInterval(detectRemoteAccess);
      window.removeEventListener("blur", detectAppSwitch);
      window.removeEventListener("resize", preventResize);
      document.removeEventListener("keydown", blockShortcuts);
      document.removeEventListener("keyup", blockScreenshotAndRecording);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [wasHidden, alertActive]);

  useEffect(() => {
    if (counter > 0 && counter % 4 === 0) {
      setText("");
    }
  }, [counter]);

  const handleSubmit = () => {
    if (counter < 10) {
      setSubmitted(true);
      alert("✅ Submission successful!");
    } else {
      alert("❌ Submission failed! Too many security violations.");
    }
  };

  return (
    < >
   
    </>
  );
};

export default SecurityBlocker;