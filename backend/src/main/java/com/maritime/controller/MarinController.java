package com.maritime.controller;

import com.maritime.dto.MarinDtos;
import com.maritime.enums.SailorStatus;
import com.maritime.service.MarinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marins")
@RequiredArgsConstructor
public class MarinController {

    private final MarinService marinService;

    @GetMapping
    public ResponseEntity<List<MarinDtos.MarinResponse>> listMarins(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) SailorStatus status
    ) {
        return ResponseEntity.ok(marinService.searchMarins(search, grade, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarinDtos.MarinResponse> getMarin(@PathVariable Long id) {
        return ResponseEntity.ok(marinService.getMarin(id));
    }

    @PostMapping
    public ResponseEntity<MarinDtos.MarinResponse> createMarin(@Valid @RequestBody MarinDtos.MarinRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marinService.createMarin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarinDtos.MarinResponse> updateMarin(
            @PathVariable Long id,
            @Valid @RequestBody MarinDtos.MarinRequest request
    ) {
        return ResponseEntity.ok(marinService.updateMarin(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarin(@PathVariable Long id) {
        marinService.deleteMarin(id);
        return ResponseEntity.noContent().build();
    }
}
