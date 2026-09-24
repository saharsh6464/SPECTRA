from pathlib import Path
from contextlib import asynccontextmanager
import asyncio
import logging
from typing import Optional
import json
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db, save_enrollment, save_tick, get_enrollment, get_results
from .features import face_match, liveness, face_count, device_detection
from .features import head_position, voice_monitoring, occupant_count, posture, typing_writing
from .services import supabase

settings = get_settings()


logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    Path("data").mkdir(exist_ok=True)
    init_db()
    poller = asyncio.create_task(supabase_poller())
    try:
        yield
    finally:
        poller.cancel()
        await asyncio.gather(poller, return_exceptions=True)


async def supabase_poller():
    while True:
        try:
            if supabase.is_configured():
                result = await asyncio.to_thread(
                    supabase.process_pending_results,
                    settings.supabase_poll_batch_size,
                )
                if result["processed"] or result["errors"]:
                    logger.info(
                        "Supabase poll: processed=%d errors=%d",
                        len(result["processed"]),
                        len(result["errors"]),
                    )
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Supabase polling failed; retrying on next cycle")
        await asyncio.sleep(settings.supabase_poll_interval_seconds)


app = FastAPI(title="OA Proctoring Server", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def auth(request: Request):
    if settings.api_key and request.headers.get("X-API-Key") != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

async def image(upload: Optional[UploadFile]):
    if upload is None:
        return None
    raw = await upload.read()
    if len(raw) > settings.max_image_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large")
    frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    return frame

async def audio(upload: Optional[UploadFile]):
    if upload is None:
        return None
    raw = await upload.read()
    if len(raw) > settings.max_audio_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio too large")
    return raw

def reference(session_id):
    row = get_enrollment(session_id)
    if not row or not row.face_embedding:
        return None
    return np.asarray(json.loads(row.face_embedding), dtype=np.float32)

@app.get("/")
def root():
    return {"service": "OA Proctoring Server", "status": "ok", "docs": "/docs"}

@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "server": "macbook",
        "supabase_configured": supabase.is_configured(),
    }


@app.get("/api/v1/risk")
def risk(
    request: Request,
    user_id: str = Query(..., alias="userId"),
    test_id: str = Query(..., alias="testId"),
):
    auth(request)
    try:
        return {"risk_percent": supabase.calculate_risk(user_id, test_id)}
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Risk calculation failed: {exc}") from exc

@app.post("/api/v1/enroll")
async def enroll(request: Request, session_id: str = Form(...), image_file: UploadFile = File(...)):
    auth(request)
    frame = await image(image_file)
    embedding, face_info = face_match.extract_embedding(frame)
    live = liveness.analyze(frame) if settings.enable_liveness else {"status": "disabled"}
    save_enrollment(session_id, embedding, live)
    return {
        "session_id": session_id,
        "face_embedding_stored": embedding is not None,
        "face_info": face_info,
        "liveness": live,
    }

@app.post("/api/v1/tick")
async def tick(
    request: Request,
    session_id: str = Form(...),
    tick_id: str = Form(...),
    laptop_frame: Optional[UploadFile] = File(None),
    phone_frame: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
):
    auth(request)
    laptop = await image(laptop_frame)
    phone = await image(phone_frame)
    audio_bytes = await audio(audio_file)
    ref = reference(session_id)

    laptop_result = None
    if laptop is not None:
        laptop_result = {
            "face_match": face_match.verify(laptop, ref) if settings.enable_face_match else {"status": "disabled"},
            "liveness": liveness.analyze(laptop) if settings.enable_liveness else {"status": "disabled"},
            "face_count": face_count.analyze(laptop) if settings.enable_face_count else {"status": "disabled"},
            "head_position": head_position.analyze(laptop) if settings.enable_head_position else {"status": "disabled"},
            "device_detection": device_detection.analyze(laptop) if settings.enable_device_detection else {"status": "disabled"},
        }
        save_tick(session_id, tick_id, "laptop", laptop_result)

    phone_result = None
    if phone is not None:
        phone_result = {
            "occupant_count": occupant_count.analyze(phone) if settings.enable_occupant_count else {"status": "disabled"},
            "device_detection": device_detection.analyze(phone) if settings.enable_device_detection else {"status": "disabled"},
            "posture": posture.analyze(phone) if settings.enable_posture else {"status": "disabled"},
            "head_position": head_position.analyze(phone) if settings.enable_head_position else {"status": "disabled"},
            "typing_writing": typing_writing.analyze(phone) if settings.enable_typing_writing else {"status": "disabled"},
        }
        save_tick(session_id, tick_id, "phone", phone_result)

    audio_result = None
    if audio_bytes is not None:
        audio_result = voice_monitoring.analyze(audio_bytes) if settings.enable_voice_monitoring else {"status": "disabled"}
        save_tick(session_id, tick_id, "audio", audio_result)

    return {
        "session_id": session_id,
        "tick_id": tick_id,
        "laptop": laptop_result,
        "phone": phone_result,
        "audio": audio_result,
    }

@app.get("/api/v1/results/{session_id}")
def results(session_id: str):
    return {"session_id": session_id, "results": get_results(session_id)}


@app.post("/api/v1/supabase/process/{result_id}")
def process_supabase_result(result_id: str, request: Request):
    auth(request)
    try:
        return {"result": supabase.process_test_result(supabase.get_test_result(result_id))}
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Supabase image processing failed: {exc}") from exc


@app.post("/api/v1/supabase/process")
def process_supabase_results(request: Request, test_id: Optional[str] = None, limit: int = 100):
    auth(request)
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 1000")
    try:
        if test_id:
            with supabase.processing_lock:
                rows = supabase.list_test_results(test_id=test_id, limit=limit)
                processed = []
                errors = []
                for row in rows:
                    try:
                        processed.append(supabase.process_test_result(row))
                    except Exception as exc:
                        errors.append({"id": row["id"], "error": str(exc)})
                return {"processed": processed, "errors": errors}
        return supabase.process_pending_results(limit)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Supabase image processing failed: {exc}") from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=settings.debug)
