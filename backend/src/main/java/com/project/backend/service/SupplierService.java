package com.project.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import com.project.backend.model.Supplier;
import com.project.backend.model.Project;
import com.project.backend.repository.ProjectRepository;
import com.project.backend.repository.SupplierRepository;
import com.project.backend.dto.ProjectDetailDTO;
import com.project.backend.dto.SupplierDTO;



@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProjectRepository projectRepository;


    public SupplierService(SupplierRepository supplierRepository, ProjectRepository projectRepository){
        this.supplierRepository = supplierRepository;
        this.projectRepository = projectRepository;
    }

    public SupplierDTO convertToDTO(Supplier supplier){
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setType(supplier.getType());
        dto.setProduct(supplier.getProduct());
        dto.setCountry(supplier.getCountry());
        dto.setAddress(supplier.getAddress());
        dto.setTelephone(supplier.getTelephone());
        dto.setEmail(supplier.getEmail());
        dto.setCollabStart(supplier.getCollabStart());
        dto.setCertificateStatus(supplier.getCertificateStatus());
        dto.setRiskProfile(supplier.getRiskProfile());

        // 如果有 projects 欄位且已載入，則轉換為 ProjectDetailDTO
        if (supplier.getProjects() != null) {
            List<ProjectDetailDTO> projectDTOs = supplier.getProjects().stream()
                .map(project -> new ProjectDetailDTO(
                    project.getId(),
                    project.getName(),
                    project.getStatus(),
                    null, null, null, null, null, null, null, 0, null, null, null, null, null, null
                ))
                .collect(Collectors.toList());
            dto.setProjects(projectDTOs);
        }
        // 將 DB 的認證清單帶回前端
        dto.setCommonCerts(
        supplier.getCommonCerts() == null ? null : new ArrayList<>(supplier.getCommonCerts()));

        // 其他需要的欄位可在此補充
        return dto;

    }

    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public Supplier createSupplier(SupplierDTO dto) {
        Supplier supplier = new Supplier();
        supplier.setName(dto.getName());
        supplier.setType(dto.getType());
        supplier.setProduct(dto.getProduct());
        supplier.setCountry(dto.getCountry());
        supplier.setAddress(dto.getAddress());
        supplier.setTelephone(dto.getTelephone());
        supplier.setEmail(dto.getEmail());
        supplier.setCollabStart(dto.getCollabStart());
        supplier.setCertificateStatus(dto.getCertificateStatus());
        supplier.setRiskProfile(dto.getRiskProfile());
        supplier.setCommonCerts(
        dto.getCommonCerts() == null ? new HashSet<>() : new HashSet<>(dto.getCommonCerts()));


        // 如果有 projects 欄位，且 ProjectRepository 可查詢
        if (dto.getProjects() != null) {
            List<Project> projects = dto.getProjects().stream()
                .map(projectDTO -> projectRepository.findById(projectDTO.getId()).orElse(null))
                .filter(project -> project != null)
                .collect(Collectors.toList());
            supplier.setProjects(projects);
        }

        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplierToBeDeleted = supplierRepository.findById(id)
            .orElseThrow(() -> new IllegalThreadStateException("Supplier with ID: "+ id + " not found"));

        supplierRepository.delete(supplierToBeDeleted);
    }

    public Optional<SupplierDTO> getSupplier(Long id) {
        Optional<Supplier> supplierOptional = supplierRepository.findById(id);

        if (supplierOptional.isEmpty()) {
            return Optional.empty();
        }

        Supplier supplier = supplierOptional.get();

        SupplierDTO supplierDTO = convertToDTO(supplier);

        return Optional.of(supplierDTO);
    }
    
    public Supplier updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Supplier with ID: " + id + " not found"));

        // 覆寫基本欄位（需要局部更新就改成判空再設值）
        supplier.setName(dto.getName());
        supplier.setType(dto.getType());
        supplier.setProduct(dto.getProduct());
        supplier.setCountry(dto.getCountry());
        supplier.setAddress(dto.getAddress());
        supplier.setTelephone(dto.getTelephone());
        supplier.setEmail(dto.getEmail());
        supplier.setCollabStart(dto.getCollabStart());
        supplier.setCertificateStatus(dto.getCertificateStatus());
        supplier.setRiskProfile(dto.getRiskProfile());
        // 更新時：若前端有帶 commonCerts，就整體覆寫；若沒帶則不動
        if (dto.getCommonCerts() != null) {
            supplier.setCommonCerts(new HashSet<>(dto.getCommonCerts()));
        }
        // 若前端有帶 projects，就整體替換關聯
        if (dto.getProjects() != null) {
            List<Project> projects = dto.getProjects().stream()
                .map(p -> projectRepository.findById(p.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found: " + p.getId())))
                .collect(Collectors.toList());
            supplier.setProjects(projects);
        }

        return supplierRepository.save(supplier);
    }

    
}
