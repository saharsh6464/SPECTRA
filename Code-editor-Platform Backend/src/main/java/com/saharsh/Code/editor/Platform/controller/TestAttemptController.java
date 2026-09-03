package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.model.TestAttempt;
import com.saharsh.Code.editor.Platform.service.TestAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/testattempts")
public class TestAttemptController {

    @Autowired
    private TestAttemptService testAttemptService;

    @GetMapping
    public ResponseEntity<List<TestAttempt>> getAllTestAttempts() {
        return new ResponseEntity<>(testAttemptService.getAllTestAttempts(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestAttempt> getTestAttemptById(@PathVariable int id) {
        Optional<TestAttempt> testAttempt = testAttemptService.getTestAttemptById(id);
        return testAttempt.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<TestAttempt> createTestAttempt(@RequestBody TestAttempt testAttempt) {
        return new ResponseEntity<>(testAttemptService.saveTestAttempt(testAttempt), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestAttempt> updateTestAttempt(@PathVariable int id, @RequestBody TestAttempt testAttempt) {
        if (testAttemptService.getTestAttemptById(id).isPresent()) {
            testAttempt.setId(id);
            return new ResponseEntity<>(testAttemptService.saveTestAttempt(testAttempt), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestAttempt(@PathVariable int id) {
        if (testAttemptService.getTestAttemptById(id).isPresent()) {
            testAttemptService.deleteTestAttempt(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}