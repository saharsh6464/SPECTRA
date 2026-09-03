package com.saharsh.Code.editor.Platform.controller;

import com.saharsh.Code.editor.Platform.model.Anomaly;
import com.saharsh.Code.editor.Platform.service.AnomalyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/anomalies")
public class AnomalyController {

    @Autowired
    private AnomalyService anomalyService;

    @GetMapping
    public ResponseEntity<List<Anomaly>> getAllAnomalies() {
        return new ResponseEntity<>(anomalyService.getAllAnomalies(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Anomaly> getAnomalyById(@PathVariable int id) {
        Optional<Anomaly> anomaly = anomalyService.getAnomalyById(id);
        return anomaly.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Anomaly> createAnomaly(@RequestBody Anomaly anomaly) {
        return new ResponseEntity<>(anomalyService.saveAnomaly(anomaly), HttpStatus.CREATED);
    }
}