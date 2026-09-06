package com.saharsh.Code.editor.Platform.service;

import com.saharsh.Code.editor.Platform.Dto.AiMcqDto;
import com.saharsh.Code.editor.Platform.Dto.AiMcqResponse;
import com.saharsh.Code.editor.Platform.model.MCQ;
import com.saharsh.Code.editor.Platform.model.Test;
import com.saharsh.Code.editor.Platform.repo.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private MCQService mcqService;

    @Autowired
    private AiGenerationService aiGenerationService;

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    public Optional<Test> getTestById(int id) {
        return testRepository.findById(id);
    }

    // Simplified for basic CRUD as requested
    public Test saveTest(Test test) {

        List<Integer> newMcqIds = generateAndSaveMCQs(test.getTopic(), test.getDifficulty(), test.getMcqCount());
        test.setMcqIds(newMcqIds);
        return testRepository.save(test);
    }

    public void deleteTest(int id) {
        testRepository.deleteById(id);
    }

    public Test generateAndAttachMCQs(int testId, String topic, String difficulty, int count) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found: " + testId));
        test.setTopic(topic);
        test.setDifficulty(difficulty);
        test.setMcqCount(count);
        test.setMcqIds(generateAndSaveMCQs(topic, difficulty, count));
        return testRepository.save(test);
    }

    public List<Integer> generateAndSaveMCQs(String topic, String difficulty, int count) {
        List<Integer> generatedMcqIds = new ArrayList<>();

        // 1. Call standard REST AI service
        AiMcqResponse generatedResponse = aiGenerationService.generateMCQs(topic, difficulty, count);

        // 2. Save each MCQ to the database and collect their new Primary Keys
        for (AiMcqDto dto : generatedResponse.mcqs()) {
            MCQ mcq = new MCQ();
            mcq.setQuestion(dto.question());
            mcq.setOptions(dto.options());
            mcq.setCorrectAnswer(dto.correctAnswer());
            System.out.println(dto.question());
            MCQ savedMcq = mcqService.saveMCQ(mcq); // Saves to DB

            generatedMcqIds.add(savedMcq.getMcqId()); // Grabs the generated PK
        }

        return generatedMcqIds;
    }

}