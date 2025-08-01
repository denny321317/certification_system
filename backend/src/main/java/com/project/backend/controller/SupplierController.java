package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

import com.project.backend.service.SupplierService;
import com.project.backend.model.Supplier;
import com.project.backend.dto.SupplierDTO;

@RestController
@RequestMapping("/api/supplier-management")
@CrossOrigin(origins = "http://localhost:3000")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping("/allSuppliers")
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        List<SupplierDTO> suppliers = supplierService.getAllSuppliers();
        return ResponseEntity.ok(suppliers);
    }


    @GetMapping("/getSupplierInfo/{id}")
    public ResponseEntity<?> getSupplierInfo(@PathVariable Long id) {
        try {
            Optional<SupplierDTO> supplierOptional = supplierService.getSupplier(id);
            if (supplierOptional.isPresent()) {
                return ResponseEntity.ok(supplierOptional.get());
            } else {
                return ResponseEntity.notFound().build();
            }    
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured: " + e.getMessage());
        }
    }


    /**
     * Request Body Example: 
     * {
            "name": "頂尖電子有限公司",
            "type": "原材料供應商",
            "product": "塑膠製品",
            "country": "TW",
            "address": "新北市某路某號",
            "telephone": "02-12345678",
            "email": "contact@top-electronics.com",
            "collabStart": "2023-01-15T00:00:00.000Z",
            "certificateStatus": "CERTIFICATED",
            "riskProfile": "LOW",
            "projects":[
                {
                    "id":1
                }
            ] 
        }
     * @param supplierDTO
     * @return
     */
    @PostMapping("/createSupplier")
    public ResponseEntity<?> createSupplier(@RequestBody SupplierDTO supplierDTO) {
        try {
            Supplier newSupplier = supplierService.createSupplier(supplierDTO);
            SupplierDTO responseDTO = supplierService.convertToDTO(newSupplier);
            return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured while creating the supplier.");
        }
    }

    @DeleteMapping("/deleteSupplier/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteSupplier(id);
            return ResponseEntity.ok().body("Supplier with ID: " + id + " is successfully deleted");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred while deleting the supplier");
        }
    }








}
