#!/bin/bash
BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
curl "$BASE_URL/api/v1/health"
echo
echo "Example:"
echo "curl -X POST \"$BASE_URL/api/v1/enroll\" -F \"session_id=demo\" -F \"image_file=@face.jpg\""
