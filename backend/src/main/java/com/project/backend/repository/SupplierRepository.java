package com.project.backend.repository;

import com.project.backend.model.Supplier;
import com.project.backend.model.Supplier.CertificateStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>{
    Optional<Supplier> findById(Long id);
    Optional<Supplier> findByEmail(String email);
    List<Supplier> findByType(String type);
    List<Supplier> findByCertificateStatus(CertificateStatus certificateStatus);
    List<Supplier> findByCountry(String country);
    

    
}
