package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.Dto.CodeSubmissionRequest;
import com.saharsh.Code.editor.Platform.Dto.CodeSubmissionResponse;
import com.saharsh.Code.editor.Platform.model.Submission;
import com.saharsh.Code.editor.Platform.service.QuestionSolveService;
import com.saharsh.Code.editor.Platform.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private QuestionSolveService questionSolveService;


    // Hit this for running code against sample test cases
    @PostMapping("/run")
    public ResponseEntity<CodeSubmissionResponse> runCode(@RequestBody CodeSubmissionRequest request) {
        CodeSubmissionResponse result = questionSolveService.runCode(request);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // Hit this for submitting code against all main test cases
    @PostMapping("/submit")
    public ResponseEntity<CodeSubmissionResponse> submitCode(@RequestBody CodeSubmissionRequest request) {
        CodeSubmissionResponse result = questionSolveService.submitCode(request);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return new ResponseEntity<>(submissionService.getAllSubmissions(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable int id) {
        Optional<Submission> submission = submissionService.getSubmissionById(id);
        return submission.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Submission> createSubmission(@RequestBody Submission submission) {
        return new ResponseEntity<>(submissionService.saveSubmission(submission), HttpStatus.CREATED);
    }
}