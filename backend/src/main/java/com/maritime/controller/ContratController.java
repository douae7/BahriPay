package com.maritime.controller;

import com.maritime.dto.MarinDtos;
import com.maritime.service.MarinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@RequiredArgsConstructor
public class ContratController {

    private final MarinService marinService;

    @GetMapping
    public ResponseEntity<List<MarinDtos.ContratDto>> listContrats(@RequestParam(required = false) Long marinId) {
        return ResponseEntity.ok(marinService.listContrats(marinId));
    }

    @PostMapping
    public ResponseEntity<MarinDtos.ContratDto> createContrat(@Valid @RequestBody MarinDtos.ContratRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marinService.createContrat(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarinDtos.ContratDto> updateContrat(
            @PathVariable Long id,
            @Valid @RequestBody MarinDtos.ContratRequest request
    ) {
        return ResponseEntity.ok(marinService.updateContrat(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContrat(@PathVariable Long id) {
        marinService.deleteContrat(id);
        return ResponseEntity.noContent().build();
    }
}
