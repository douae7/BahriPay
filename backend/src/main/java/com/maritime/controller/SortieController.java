package com.maritime.controller;

import com.maritime.dto.FlotteDtos;
import com.maritime.enums.TripStatus;
import com.maritime.service.FlotteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sorties")
@RequiredArgsConstructor
public class SortieController {

    private final FlotteService flotteService;

    @GetMapping
    public ResponseEntity<List<FlotteDtos.SortieResponse>> listSorties(
            @RequestParam(required = false) TripStatus status
    ) {
        return ResponseEntity.ok(flotteService.listSorties(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlotteDtos.SortieResponse> getSortie(@PathVariable Long id) {
        return ResponseEntity.ok(flotteService.getSortie(id));
    }

    @PostMapping
    public ResponseEntity<FlotteDtos.SortieResponse> createSortie(@Valid @RequestBody FlotteDtos.SortieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flotteService.createSortie(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlotteDtos.SortieResponse> updateSortie(
            @PathVariable Long id,
            @Valid @RequestBody FlotteDtos.SortieRequest request
    ) {
        return ResponseEntity.ok(flotteService.updateSortie(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FlotteDtos.SortieResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        TripStatus status = TripStatus.fromValue(payload.get("status"));
        return ResponseEntity.ok(flotteService.updateSortieStatus(id, status));
    }

    @PutMapping("/{id}/equipage")
    public ResponseEntity<FlotteDtos.SortieResponse> assignCrew(
            @PathVariable Long id,
            @RequestBody List<Long> crewIds
    ) {
        return ResponseEntity.ok(flotteService.assignCrew(id, crewIds));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSortie(@PathVariable Long id) {
        flotteService.deleteSortie(id);
        return ResponseEntity.noContent().build();
    }
}
