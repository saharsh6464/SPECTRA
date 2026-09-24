# OA Proctoring — MacBook Server

FastAPI server for server-side proctoring. It is designed to run on a MacBook and listen on `0.0.0.0`, so it is not restricted to the local Wi-Fi network. Your router/reverse-proxy/tunnel can expose the API publicly.

## Key design

- Changing deployment values live in `.env`.
- CORS is controlled by `CORS_ORIGINS`.
- API and frontend public addresses live in `.env` / frontend config.
- Every proctoring feature is a separate Python file.
- Models are lazy-loaded so one missing model does not prevent the API from starting.
- SQLite stores enrollment and tick results.
- Sampling can remain at one tick every 5 seconds.

## Install

Recommended Python: 3.11.

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`, then:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Docs: `http://127.0.0.1:8000/docs`

## Supabase image processing

The server can read image rows from the `public.test_results` table, download each
`image_url`, run the existing image analysis, and save anomalous annotated images
to the `anomaly_detected` Storage bucket. Anomalies are recorded in the
`public.flagged_results` table. Set these values in `.env`:

```text
SUPABASE_URL=https://wqptgifvevgauvmeszgs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For the local demo, place images in `demo_resource` and start both the API
server and demo producer together:

```powershell
.\.venv\Scripts\python.exe run_demo.py
```

Press `Ctrl+C` once to stop both processes.

Keep the service-role key on the backend only. Process one row by its Supabase
`id`, or process up to 100 rows (optionally filtered by `test_id`):

```bash
curl -X POST http://127.0.0.1:8000/api/v1/supabase/process/ROW_ID
curl -X POST "http://127.0.0.1:8000/api/v1/supabase/process?test_id=TEST_ID&limit=100"
```

The processing response includes the flagged image URL when an anomaly is found.

When the server is running, it automatically checks `test_results` every 10
seconds and processes up to 100 rows per cycle. New rows added by another
service are picked up automatically. Change `SUPABASE_POLL_INTERVAL_SECONDS`
and `SUPABASE_POLL_BATCH_SIZE` in `.env` to adjust this behavior. Failed rows
remain in `test_results` and are retried on a later cycle.

After an image is processed successfully, the server deletes its original
Supabase Storage object and then deletes the matching `test_results` row. If an
anomaly is found, its annotated image and `flagged_results` row are created
before that cleanup. If download, analysis, upload, or cleanup fails, the source
row remains available for retry.

## Internet / CORS

The server binds to `0.0.0.0`, not `127.0.0.1`.

Example:

```text
CORS_ORIGINS=https://frontend.example.com
PUBLIC_API_URL=https://api.example.com
```

The browser's frontend origin must be present in `CORS_ORIGINS`.

CORS does not make the API public; port forwarding/reverse proxy/tunnel does that. Port forwarding also does not secure the API. For Internet exposure, use HTTPS and add authentication/rate limiting.

## API

`POST /api/v1/enroll`

- `session_id`
- `image`

`POST /api/v1/tick`

- `session_id`
- `tick_id`
- `laptop_frame` optional
- `phone_frame` optional
- `audio` optional

`GET /api/v1/results/{session_id}`

## Risk scoring

`risk_factor_calculator.py` converts pre-aggregated session signals such as
tab switches, paste activity, and camera anomalies into a 0-100 risk score,
risk level, category breakdown, and review flags.

```python
from risk_factor_calculator import RiskFactorCalculator

result = RiskFactorCalculator().calculate({"paste_count": 2, "chars_pasted": 300})
print(result.to_dict())
```

`GET /api/v1/health`

## Feature files

- `face_match.py`
- `liveness.py`
- `face_count.py`
- `device_detection.py`
- `head_position.py`
- `voice_monitoring.py`
- `occupant_count.py`
- `posture.py`
- `typing_writing.py`

The active liveness module is intentionally separated from face matching. A real challenge-response flow should keep state across several frames; a single frame cannot prove that a person is live.
