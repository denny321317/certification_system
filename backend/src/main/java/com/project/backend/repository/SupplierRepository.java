package com.project.backend.repository;

import com.project.backend.model.Supplier;
import com.project.backend.model.Supplier.CertificateStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>{
    
    @EntityGraph(attributePaths = {"projects","commonCerts"})
    Optional<Supplier> findById(Long id);
    
    Optional<Supplier> findByEmail(String email);
    List<Supplier> findByType(String type);
    List<Supplier> findByCertificateStatus(CertificateStatus certificateStatus);
    List<Supplier> findByCountry(String country);
    
    @EntityGraph(attributePaths = {"projects","commonCerts"})
    List<Supplier> findAll();
    

    
}
