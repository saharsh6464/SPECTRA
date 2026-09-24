import tempfile
from pathlib import Path

def analyze(audio_bytes):
    if not audio_bytes:
        return {"status": "no_audio", "voice_detected": None}
    try:
        import soundfile as sf
        import numpy as np
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            path = Path(f.name)
        data, _ = sf.read(path)
        path.unlink(missing_ok=True)
        if data.size == 0:
            return {"status": "empty_audio", "voice_detected": False}
        energy = float(np.sqrt(np.mean(np.square(data.astype(np.float32)))))
        return {
            "status": "energy_baseline",
            "voice_detected": energy > 0.01,
            "energy": energy,
            "note": "Replace baseline with Silero VAD for production.",
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc), "voice_detected": None}
