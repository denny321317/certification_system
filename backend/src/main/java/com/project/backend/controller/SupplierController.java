package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

import com.project.backend.dto.SupplierDTO;
import com.project.backend.model.Supplier;
import com.project.backend.service.SupplierService;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = {"http://localhost:3000"})
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    // GET /api/suppliers
    @GetMapping
    public List<SupplierDTO> list() {
        return supplierService.getAllSuppliers();
    }

    // GET /api/suppliers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> get(@PathVariable Long id) {
        return supplierService.getSupplier(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /api/suppliers
    @PostMapping
    public ResponseEntity<SupplierDTO> create(@RequestBody SupplierDTO dto) {
        Supplier saved = supplierService.createSupplier(dto);
        return new ResponseEntity<>(supplierService.convertToDTO(saved), HttpStatus.CREATED);
    }

    // PUT /api/suppliers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO> update(@PathVariable Long id, @RequestBody SupplierDTO dto) {
        Supplier updated = supplierService.updateSupplier(id, dto);
        return ResponseEntity.ok(supplierService.convertToDTO(updated));
    }

    // DELETE /api/suppliers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
