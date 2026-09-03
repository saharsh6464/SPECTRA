package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.model.Submission;
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