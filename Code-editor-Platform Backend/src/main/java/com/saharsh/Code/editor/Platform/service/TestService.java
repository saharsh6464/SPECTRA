package com.saharsh.Code.editor.Platform.service;

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

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    public Optional<Test> getTestById(int id) {
        return testRepository.findById(id);
    }

    // Simplified for basic CRUD as requested
    public Test saveTest(Test test) {
        return testRepository.save(test);
    }

    public void deleteTest(int id) {
        testRepository.deleteById(id);
    }
}