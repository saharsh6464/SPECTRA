package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.model.TestCase;
import com.saharsh.Code.editor.Platform.service.TestCaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {

    @Autowired
    private TestCaseService testCaseService;

    @GetMapping
    public ResponseEntity<List<TestCase>> getAllTestCases() {
        return new ResponseEntity<>(testCaseService.getAllTestCases(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestCase> getTestCaseById(@PathVariable int id) {
        Optional<TestCase> testCase = testCaseService.getTestCaseById(id);
        return testCase.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<TestCase> getFirstTestCaseByQuestionId(@PathVariable int questionId) {
        Optional<TestCase> testCase = testCaseService.getFirstTestCaseByQuestionId(questionId);
        return testCase.map(tc -> new ResponseEntity<>(tc, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<TestCase> createTestCase(@RequestBody TestCase testCase) {
        return new ResponseEntity<>(testCaseService.saveTestCase(testCase), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestCase> updateTestCase(@PathVariable int id, @RequestBody TestCase testCase) {
        if (testCaseService.getTestCaseById(id).isPresent()) {
            testCase.setTestCaseId(id);
            return new ResponseEntity<>(testCaseService.saveTestCase(testCase), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable int id) {
        if (testCaseService.getTestCaseById(id).isPresent()) {
            testCaseService.deleteTestCase(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}