package com.saharsh.Code.editor.Platform.service;

import com.saharsh.Code.editor.Platform.model.MCQ;
import com.saharsh.Code.editor.Platform.repo.MCQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MCQService {

    @Autowired
    private MCQRepository mcqRepository;

    public List<MCQ> getAllMCQs() {
        return mcqRepository.findAll();
    }

    public Optional<MCQ> getMCQById(int id) {
        return mcqRepository.findById(id);
    }

    public MCQ saveMCQ(MCQ mcq) {
        return mcqRepository.save(mcq);
    }

    public void deleteMCQ(int id) {
        mcqRepository.deleteById(id);
    }
}