package com.example.demo.controller;   
import com.example.demo.model.Supplier;
import com.example.demo.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "http://localhost:3000")  // 若前端在 3000 port
public class SupplierController {
     private final SupplierService service;

    public SupplierController(SupplierService service) {
        this.service = service;
    }

    @GetMapping
    public List<Supplier> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        if (status != null) {
            return service.getByStatus(status);
        }
        if (search != null) {
            return service.searchByName(search);
        }
        return service.getAllSuppliers();
    }

    @PostMapping
    public Supplier create(@RequestBody Supplier supplier) {
        return service.createSupplier(supplier);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getOne(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(
            @PathVariable Long id,
            @RequestBody Supplier supplier) {
        return ResponseEntity.ok(service.updateSupplier(id, supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
