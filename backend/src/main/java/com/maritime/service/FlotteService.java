package com.maritime.service;

import com.maritime.dto.FlotteDtos;
import com.maritime.enums.TripStatus;
import com.maritime.enums.VesselStatus;

import java.util.List;

public interface FlotteService {
    List<FlotteDtos.BateauResponse> listBateaux();
    FlotteDtos.BateauResponse getBateau(Long id);
    FlotteDtos.BateauResponse createBateau(FlotteDtos.BateauRequest request);
    FlotteDtos.BateauResponse updateBateau(Long id, FlotteDtos.BateauRequest request);
    FlotteDtos.BateauResponse updateBateauStatus(Long id, VesselStatus status);
    void deleteBateau(Long id);

    List<FlotteDtos.EspeceDto> listEspeces();
    FlotteDtos.EspeceDto createEspece(FlotteDtos.EspeceDto request);
    FlotteDtos.EspeceDto updateEspece(Long id, FlotteDtos.EspeceDto request);
    void deleteEspece(Long id);

    List<FlotteDtos.SortieResponse> listSorties(TripStatus status);
    FlotteDtos.SortieResponse getSortie(Long id);
    FlotteDtos.SortieResponse createSortie(FlotteDtos.SortieRequest request);
    FlotteDtos.SortieResponse updateSortie(Long id, FlotteDtos.SortieRequest request);
    FlotteDtos.SortieResponse updateSortieStatus(Long id, TripStatus status);
    FlotteDtos.SortieResponse assignCrew(Long sortieId, List<Long> crewIds);
    void deleteSortie(Long id);

    List<FlotteDtos.ProductionDto> listProductions(Long sortieId);
    FlotteDtos.ProductionDto addProduction(FlotteDtos.ProductionCreateRequest request);
    void deleteProduction(Long id);
}
