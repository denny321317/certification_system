package com.example.demo.repository;


import com.example.demo.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierRepository  extends JpaRepository<Supplier, Long> {
     List<Supplier> findByStatus(String status);
    List<Supplier> findByNameContaining(String keyword);
    List<Supplier> findByRiskLevel(String riskLevel);
}
