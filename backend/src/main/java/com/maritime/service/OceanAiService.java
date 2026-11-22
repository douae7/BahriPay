package com.maritime.service;

import com.maritime.dto.AiDtos;

import java.util.List;

public interface OceanAiService {
    AiDtos.AiAnalysisResponse analyzeFleet();
    AiDtos.AiAskResponse askQuestion(AiDtos.AiAskRequest request);
    List<AiDtos.PredictionHistoryDto> getPredictionHistory();
}
