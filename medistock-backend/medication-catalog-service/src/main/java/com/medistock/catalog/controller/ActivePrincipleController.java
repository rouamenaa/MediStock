package com.medistock.catalog.controller;

import com.medistock.catalog.dto.ActivePrincipleDto;
import com.medistock.catalog.service.ActivePrincipleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/active-principles")
public class ActivePrincipleController {

    private final ActivePrincipleService service;

    public ActivePrincipleController(ActivePrincipleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ActivePrincipleDto>> findAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(service.search(search));
        }
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivePrincipleDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ActivePrincipleDto> create(@Valid @RequestBody ActivePrincipleDto dto) {
        ActivePrincipleDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivePrincipleDto> update(@PathVariable Long id, @Valid @RequestBody ActivePrincipleDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
