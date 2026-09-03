package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.model.MCQ;
import com.saharsh.Code.editor.Platform.service.MCQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mcqs")
public class MCQController {

    @Autowired
    private MCQService mcqService;

    @GetMapping
    public ResponseEntity<List<MCQ>> getAllMCQs() {
        return new ResponseEntity<>(mcqService.getAllMCQs(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MCQ> getMCQById(@PathVariable int id) {
        Optional<MCQ> mcq = mcqService.getMCQById(id);
        return mcq.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<MCQ> createMCQ(@RequestBody MCQ mcq) {
        return new ResponseEntity<>(mcqService.saveMCQ(mcq), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MCQ> updateMCQ(@PathVariable int id, @RequestBody MCQ mcq) {
        if (mcqService.getMCQById(id).isPresent()) {
            mcq.setMcqId(id);
            return new ResponseEntity<>(mcqService.saveMCQ(mcq), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMCQ(@PathVariable int id) {
        if (mcqService.getMCQById(id).isPresent()) {
            mcqService.deleteMCQ(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}