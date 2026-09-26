package com.saharsh.Code.editor.Platform.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.saharsh.Code.editor.Platform.Dto.CodeSubmissionRequest;
import com.saharsh.Code.editor.Platform.Dto.CodeSubmissionResponse;
import com.saharsh.Code.editor.Platform.model.Question;
import com.saharsh.Code.editor.Platform.model.TestCase;
import com.saharsh.Code.editor.Platform.repo.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QuestionSolveService {

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private RealtimeInterviewService realtimeInterviewService;

    @Autowired
    private QuestionService questionService;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String COMPILER_API_URL =
            "https://code-compiler-887o.onrender.com/api/run";


    public CodeSubmissionResponse runCode(CodeSubmissionRequest request) {
        return processExecution(request, true);
    }

//    intergrated here calling of  Interview API:))
    public CodeSubmissionResponse submitCode(CodeSubmissionRequest request) {
        System.out.println("Submitted object"+request.toString());
        CodeSubmissionResponse codeResponse =  processExecution(request, false);

        if(codeResponse.getError()==null && codeResponse.getFailed().isEmpty()){
            Question question = questionService
                    .getQuestionById(request.getProblemId())
                    .orElseThrow(() ->
                            new RuntimeException("Question not found")
                    );
//            Map<String, Object> response = new HashMap<>();
            Map<String, Object> response = realtimeInterviewService.createRealtimeInterviewSession(question, request.getSubmittedCode(), request.getLanguage());
            codeResponse.setRealtimeClientSecret((String) response.get("value"));
            codeResponse.setRealtimeSecretExpiresAt(
                    ((Number) response.get("expires_at")).longValue()
            );
        }

        return codeResponse;
    }

    private CodeSubmissionResponse processExecution(
            CodeSubmissionRequest request,
            boolean isRunAction
    ) {

        CodeSubmissionResponse response = new CodeSubmissionResponse();

        Optional<TestCase> testCaseOptional =
                testCaseRepository.findByQuestionProblemId(
                        request.getProblemId()
                );

        if (testCaseOptional.isEmpty()) {
            response.setError("No test case found");
            return response;
        }

        TestCase tc = testCaseOptional.get();

        String inputData = isRunAction
                ? tc.getSampleInputFile()
                : tc.getTestCaseFile();

        String expectedOutput = isRunAction
                ? tc.getSampleOutputFile()
                : tc.getOutputFile();

        Map<String, String> payload = new HashMap<>();

        payload.put("language", request.getLanguage());
        payload.put("stdin", inputData);
        payload.put("code", request.getSubmittedCode());

        try {

            JsonNode apiResponse = restTemplate.postForObject(
                    COMPILER_API_URL,
                    payload,
                    JsonNode.class
            );

            if (apiResponse == null
                    || !apiResponse.has("results")
                    || !apiResponse.get("results").isArray()) {

                response.setError("Invalid response from compiler API");
                return response;
            }

            JsonNode results = apiResponse.get("results");

            // Split expected output into individual expected results
            String[] expectedOutputs =
                    expectedOutput.trim().split("\\R");

            // Number of returned results must match expected outputs
            if (results.size() != expectedOutputs.length) {

                response.setError(
                        "Result count mismatch. Expected: "
                                + expectedOutputs.length
                                + ", Received: "
                                + results.size()
                );

                return response;
            }

            // Compare each compiler result
            for (int i = 0; i < results.size(); i++) {

                JsonNode result = results.get(i);

                String verdict = result.has("verdict")
                        ? result.get("verdict").asText()
                        : "";

                String actualOutput = result.has("output")
                        && !result.get("output").isNull()
                        ? result.get("output").asText().trim()
                        : "";

                String error = result.has("error")
                        && !result.get("error").isNull()
                        ? result.get("error").asText()
                        : "";

                // If compiler/runtime error occurred
                if (!error.isEmpty()) {
                    response.setError(error);
                    response.getFailed().add(i + 1);
                    return response;
                }

                String expected = expectedOutputs[i].trim();

                if (actualOutput.equals(expected)) {
                    response.getPassed().add(i + 1);
                } else {
                    response.getFailed().add(i + 1);
                }
            }
        } catch (Exception e) {

            response.setError("Compiler API error: " + e.getMessage());
            return response;
        }

        return response;
    }
}