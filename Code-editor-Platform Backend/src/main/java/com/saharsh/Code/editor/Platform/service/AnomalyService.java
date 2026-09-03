package com.saharsh.Code.editor.Platform.service;

import com.saharsh.Code.editor.Platform.model.Anomaly;
import com.saharsh.Code.editor.Platform.repo.AnomalyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnomalyService {

    @Autowired
    private AnomalyRepository anomalyRepository;

    public List<Anomaly> getAllAnomalies() {
        return anomalyRepository.findAll();
    }

    public Optional<Anomaly> getAnomalyById(int id) {
        return anomalyRepository.findById(id);
    }

    public Anomaly saveAnomaly(Anomaly anomaly) {
        return anomalyRepository.save(anomaly);
    }

    public void deleteAnomaly(int id) {
        anomalyRepository.deleteById(id);
    }
}