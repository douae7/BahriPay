package com.maritime.controller;

import com.maritime.dto.AiDtos;
import com.maritime.service.OceanAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final OceanAiService oceanAiService;

    @GetMapping("/analyse")
    public ResponseEntity<AiDtos.AiAnalysisResponse> analyzeFleet() {
        return ResponseEntity.ok(oceanAiService.analyzeFleet());
    }

    @PostMapping("/ask")
    public ResponseEntity<AiDtos.AiAskResponse> askQuestion(@Valid @RequestBody AiDtos.AiAskRequest request) {
        return ResponseEntity.ok(oceanAiService.askQuestion(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AiDtos.PredictionHistoryDto>> getHistory() {
        return ResponseEntity.ok(oceanAiService.getPredictionHistory());
    }
}
