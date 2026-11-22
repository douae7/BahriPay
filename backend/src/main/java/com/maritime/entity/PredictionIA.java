package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions_ia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analysis_type", nullable = false, length = 60)
    private String analysisType;

    @Column(name = "prompt_question", length = 500)
    private String promptQuestion;

    @Column(name = "answer_summary", nullable = false, columnDefinition = "TEXT")
    private String answerSummary;

    @Column(name = "predicted_catch_kg", precision = 12, scale = 2)
    private BigDecimal predictedCatchKg;

    @Column(name = "predicted_revenue", precision = 12, scale = 2)
    private BigDecimal predictedRevenue;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "sufficient_data", nullable = false)
    private boolean sufficientData;

    @Column(name = "data_points_used", nullable = false)
    private int dataPointsUsed;

    @Column(name = "is_prediction", nullable = false)
    @Builder.Default
    private boolean prediction = true;

    @Column(name = "model_name", length = 80)
    private String modelName;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
