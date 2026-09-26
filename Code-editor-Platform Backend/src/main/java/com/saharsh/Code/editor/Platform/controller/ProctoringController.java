package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.service.ProctoringSupabaseService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/proctoring")
public class ProctoringController {
    private final ProctoringSupabaseService proctoringService;

    public ProctoringController(ProctoringSupabaseService proctoringService) {
        this.proctoringService = proctoringService;
    }

    @PostMapping(value = "/snapshots", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadSnapshot(
            @RequestParam(required = false) String testId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "laptop") String deviceType,
            @RequestPart("image") MultipartFile image) throws IOException {
        String resolvedTestId = resolveTestId(testId, sessionId);
        String resolvedUserId = resolveUserId(userId, sessionId);
        return ResponseEntity.ok(proctoringService.uploadSnapshot(resolvedTestId, resolvedUserId, deviceType, image.getBytes()));
    }

    @PostMapping("/telemetry")
    public ResponseEntity<Map<String, Object>> updateTelemetry(
            @RequestParam(required = false) String testId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String sessionId,
            @RequestBody Map<String, Object> updates) {
        String resolvedTestId = resolveTestId(testId, sessionId);
        String resolvedUserId = resolveUserId(userId, sessionId);
        return ResponseEntity.ok(proctoringService.updateTelemetry(resolvedTestId, resolvedUserId, updates));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<Map<String, Object>> getAnomalies(
            @RequestParam String testId,
            @RequestParam String userId) {
        return ResponseEntity.ok(proctoringService.getAnomalyFactors(testId, userId));
    }

    @GetMapping("/flagged-images")
    public ResponseEntity<List<Map<String, Object>>> getFlaggedImages(
            @RequestParam String testId,
            @RequestParam String userId) {
        return ResponseEntity.ok(proctoringService.getFlaggedImages(testId, userId));
    }

    @GetMapping("/phone-status")
    public ResponseEntity<Map<String, Object>> getPhoneStatus(
            @RequestParam String testId,
            @RequestParam String userId) {
        return ResponseEntity.ok(proctoringService.getLatestPhoneCapture(testId, userId));
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleSupabaseError(RestClientResponseException exception) {
        return ResponseEntity.status(exception.getStatusCode().value()).body(Map.of(
                "error", "Supabase request failed",
                "status", exception.getStatusCode().value(),
                "details", exception.getResponseBodyAsString()));
    }

    private String resolveTestId(String testId, String sessionId) {
        String value = testId != null && !testId.isBlank() ? testId : sessionId;
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("testId is required");
        }
        return value.startsWith("test-") ? value.substring("test-".length()) : value;
    }

    private String resolveUserId(String userId, String sessionId) {
        if (userId != null && !userId.isBlank()) return userId;
        return sessionId != null && !sessionId.isBlank() ? sessionId : "unknown";
    }
}
