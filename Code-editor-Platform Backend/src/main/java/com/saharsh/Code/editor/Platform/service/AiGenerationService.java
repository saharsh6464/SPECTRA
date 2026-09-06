package com.saharsh.Code.editor.Platform.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saharsh.Code.editor.Platform.Dto.AiMcqResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiGenerationService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    public AiMcqResponse generateMCQs(String topic, String difficulty, int count) {
        // 1. Set up headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        // 2. Craft the strict JSON prompt
        // 2. Craft the strict JSON prompt
        String prompt = String.format(
                "Generate %d multiple choice questions about %s at a %s difficulty level. " +
                        "Return ONLY a valid JSON object with a single root key 'mcqs' containing an array of objects. " +
                        "Each object MUST strictly follow this exact schema: " +
                        "{ " +
                        "\"question\": \"The question text here?\", " +
                        "\"options\": \"A) First option, B) Second option, C) Third option, D) Fourth option\", " +
                        "\"correctAnswer\": \"Just the correct text, without the A/B/C/D prefix\" " +
                        "}",
                count, topic, difficulty
        );

        // 3. Build the request body
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-5-nano");
        requestBody.put("messages", List.of(message));

        // This flag guarantees OpenAI will return valid JSON matching your prompt
        requestBody.put("response_format", Map.of("type", "json_object"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 4. Fire the REST call
            ResponseEntity<String> response = restTemplate.exchange(OPENAI_URL, HttpMethod.POST, entity, String.class);

            // 5. Parse the nested OpenAI JSON response
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String contentString = rootNode.path("choices").get(0).path("message").path("content").asText();

            // 6. Map the extracted string directly to our Java Record
            return objectMapper.readValue(contentString, AiMcqResponse.class);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate MCQs using OpenAI REST API: " + e.getMessage(), e);
        }
    }
}