package com.saharsh.Code.editor.Platform.service;

import com.saharsh.Code.editor.Platform.model.MCQ;
import com.saharsh.Code.editor.Platform.model.Test;
import com.saharsh.Code.editor.Platform.repo.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private MCQService mcqService;

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    public Optional<Test> getTestById(int id) {
        return testRepository.findById(id);
    }

    public List<MCQ> getMCQsByTestId(int testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found: " + testId));

        return test.getMcqIds().stream()
                .map(mcqService::getMCQById)
                .flatMap(Optional::stream)
                .toList();
    }

    public Test saveTest(Test test) {
        return testRepository.save(test);
    }

    public void deleteTest(int id) {
        testRepository.deleteById(id);
    }

}