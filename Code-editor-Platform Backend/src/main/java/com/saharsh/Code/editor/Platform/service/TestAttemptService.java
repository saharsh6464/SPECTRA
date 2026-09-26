package com.saharsh.Code.editor.Platform.service;

import com.saharsh.Code.editor.Platform.model.TestAttempt;
import com.saharsh.Code.editor.Platform.repo.TestAttemptRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class TestAttemptService {
    @Autowired
    private TestAttemptRepository testAttemptRepository;


    private final RestTemplate restTemplate = new RestTemplate();


    public List<TestAttempt> getAllTestAttempts() { return testAttemptRepository.findAll(); }
    public Optional<TestAttempt> getTestAttemptById(int id) { return testAttemptRepository.findById(id); }

    public TestAttempt saveTestAttempt(TestAttempt testAttempt) {
        int userId = testAttempt.getUser().getId();
        int testId = testAttempt.getTest().getTestId();
        Integer riskScore = callRiskApi(userId,testId);

        System.out.println("rishab ka working yey"+riskScore);
        testAttempt.setTotalRisk(riskScore);
        return testAttemptRepository.save(testAttempt);
    }


    public Integer callRiskApi(int userId, int testId) {
        System.out.println("Call hiting rishab api");

        String url = "https://www3h8jn-8000.inc1.devtunnels.ms/api/v1/risk"
                + "?userId=" + userId
                + "&testId=" + testId;

        JsonNode response = restTemplate.getForObject(url, JsonNode.class);

        System.out.println("API Response: " + response);

        if (response == null || response.isNull()) {
            return 0;
        }

        if (response.isNumber()) {
            return response.asInt();
        }

        for (String field : List.of(
                "riskScore",
                "risk_score",
                "score",
                "risk",
                "totalRisk",
                "risk_percent"
        )) {
            JsonNode value = response.get(field);

            if (value != null && value.isNumber()) {
                return value.asInt();
            }
        }

        return 0;
    }

    public void deleteTestAttempt(int id) { testAttemptRepository.deleteById(id); }
}