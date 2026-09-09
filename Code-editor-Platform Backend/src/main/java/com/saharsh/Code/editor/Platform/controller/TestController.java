package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.Dto.GenerateMcqRequest;
import com.saharsh.Code.editor.Platform.model.MCQ;
import com.saharsh.Code.editor.Platform.model.Test;
import com.saharsh.Code.editor.Platform.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    @Autowired
    private TestService testService;

    @GetMapping
    public ResponseEntity<List<Test>> getAllTests() {
        return new ResponseEntity<>(testService.getAllTests(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTestById(@PathVariable int id) {
        Optional<Test> test = testService.getTestById(id);
        return test.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Test> createTest(@RequestBody Test test) {
        return new ResponseEntity<>(testService.saveTest(test), HttpStatus.CREATED);
    }

    @GetMapping("/{testId}/mcqs")
    public ResponseEntity<List<MCQ>> getMCQsByTestId(@PathVariable int testId) {
        try {
            return new ResponseEntity<>(testService.getMCQsByTestId(testId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Test> updateTest(@PathVariable int id, @RequestBody Test test) {
        if (testService.getTestById(id).isPresent()) {
            test.setTestId(id);
            return new ResponseEntity<>(testService.saveTest(test), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable int id) {
        if (testService.getTestById(id).isPresent()) {
            testService.deleteTest(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    @PostMapping("/{testId}/generate-mcqs")
    public ResponseEntity<Test> generateMCQsForTest(
            @PathVariable int testId,
            @RequestBody GenerateMcqRequest request) {

        try {
            Test updatedTest = testService.generateAndAttachMCQs(
                    testId,
                    request.topic(),
                    request.difficulty(),
                    request.count()
            );
            return new ResponseEntity<>(updatedTest, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}