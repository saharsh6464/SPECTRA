package com.saharsh.Code.editor.Platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class ProctoringSupabaseService {
        private static final String IMAGE_BUCKET = "test-images";
    private final RestClient client;
    private final String supabaseUrl;
    private final String serviceRoleKey;

    public ProctoringSupabaseService(
            RestClient.Builder restClientBuilder,
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service-role-key}") String serviceRoleKey) {
        this.client = restClientBuilder.build();
        this.supabaseUrl = supabaseUrl;
        this.serviceRoleKey = serviceRoleKey;
    }

        public Map<String, Object> uploadSnapshot(String testId, String userId, String deviceType, byte[] image) {
                requireConfigured();
                String path = testId + "_" + userId + "_" + deviceType + "_" + System.currentTimeMillis() + ".jpg";
        String storageUrl = supabaseUrl + "/storage/v1/object/" + IMAGE_BUCKET + "/" + path;

        client.post()
                .uri(storageUrl)
                .headers(this::applyAuth)
                .contentType(MediaType.IMAGE_JPEG)
                .body(image)
                .retrieve()
                .toBodilessEntity();

        String imageUrl = supabaseUrl + "/storage/v1/object/public/" + IMAGE_BUCKET + "/" + path;
        Map<String, Object> imageRecord = client.post()
                .uri(supabaseUrl + "/rest/v1/test_results")
                .headers(this::applyAuth)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Prefer", "return=representation")
                .body(Map.of(
                        "user_id", userId,
                        "test_id", testId,
                        "image_url", imageUrl))
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .stream()
                .findFirst()
                .orElse(Map.of("image_url", imageUrl));

        return imageRecord;
    }

        public Map<String, Object> updateTelemetry(String testId, String userId, Map<String, Object> updates) {
                requireConfigured();
        List<Map<String, Object>> existingRows = client.get()
                                .uri(supabaseUrl + "/rest/v1/anomaly_factors?user_id=eq." + userId + "&test_id=eq." + testId + "&order=created_at.desc&limit=1")
                .headers(this::applyAuth)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

        Map<String, Object> values = Map.of(
                "user_id", userId,
                "test_id", testId,
                "window_blur_count", updates.getOrDefault("windowBlurCount", 0),
                "paste_count", updates.getOrDefault("pasteCount", 0),
                "copy_count", updates.getOrDefault("copyCount", 0),
                "fullscreen_exit_count", updates.getOrDefault("fullscreenExitCount", 0),
                "transcript", updates.getOrDefault("transcript", ""));

        if (existingRows != null && !existingRows.isEmpty()) {
            Object id = existingRows.get(0).get("id");
            return client.patch()
                    .uri(supabaseUrl + "/rest/v1/anomaly_factors?id=eq." + id)
                    .headers(this::applyAuth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Prefer", "return=representation")
                    .body(values)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .stream()
                    .findFirst()
                    .orElse(values);
        }

        return client.post()
                .uri(supabaseUrl + "/rest/v1/anomaly_factors")
                .headers(this::applyAuth)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Prefer", "return=representation")
                .body(values)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .stream()
                .findFirst()
                .orElse(values);
    }

    public Map<String, Object> getAnomalyFactors(String testId, String userId) {
        requireConfigured();
        List<Map<String, Object>> rows = client.get()
                .uri(supabaseUrl + "/rest/v1/anomaly_factors?user_id=eq." + userId + "&test_id=eq." + testId + "&order=created_at.desc&limit=1")
                .headers(this::applyAuth)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        return rows == null || rows.isEmpty() ? Map.of(
                "user_id", userId,
                "test_id", testId,
                "window_blur_count", 0,
                "paste_count", 0,
                "copy_count", 0,
                "fullscreen_exit_count", 0,
                "transcript", "") : rows.get(0);
    }

    public List<Map<String, Object>> getFlaggedImages(String testId, String userId) {
        requireConfigured();
        return client.get()
                .uri(supabaseUrl + "/rest/v1/flagged_results?user_id=eq." + userId + "&test_id=eq." + testId + "&order=created_at.desc")
                .headers(this::applyAuth)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
    }

        public Map<String, Object> getLatestPhoneCapture(String testId, String userId) {
                requireConfigured();
                List<Map<String, Object>> rows = client.get()
                                .uri(supabaseUrl + "/rest/v1/test_results?user_id=eq." + userId + "&test_id=eq." + testId + "&image_url=like.*phone_*&order=created_at.desc&limit=1")
                                .headers(this::applyAuth)
                                .retrieve()
                                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
                return rows == null || rows.isEmpty() ? Map.of() : rows.get(0);
        }

    private void applyAuth(HttpHeaders headers) {
        headers.set("apikey", serviceRoleKey);
        headers.setBearerAuth(serviceRoleKey);
    }

        private void requireConfigured() {
                if (serviceRoleKey == null || serviceRoleKey.isBlank()) {
                        throw new IllegalStateException("SUPABASE_SERVICE_ROLE_KEY is missing. Add it to the backend .env file.");
                }
        }
}
