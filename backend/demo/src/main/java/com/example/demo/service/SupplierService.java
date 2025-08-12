package com.example.demo.service;
import com.example.demo.model.Supplier;
import com.example.demo.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
@Service
public class SupplierService {
     private final SupplierRepository repo;

    public SupplierService(SupplierRepository repo) {
        this.repo = repo;
    }

    /** 取得所有供應商 */
    public List<Supplier> getAllSuppliers() {
        return repo.findAll();
    }

    /** 用主鍵取得單一供應商 */
    public Optional<Supplier> getById(Long id) {
        return repo.findById(id);
    }

    /** 依狀態篩選 */
    public List<Supplier> getByStatus(String status) {
        return repo.findByStatus(status);
    }

    /** 名稱模糊搜尋 */
    public List<Supplier> searchByName(String keyword) {
        return repo.findByNameContaining(keyword);
    }

    /** 新增一筆供應商 */
    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        return repo.save(supplier);
    }

    /**
     * 更新一筆供應商：
     *  1) 先確認該 ID 是否存在  
     *  2) 複製前端傳來的欄位到已存在的物件上  
     *  3) 再存回資料庫
     */
    @Transactional
    public Supplier updateSupplier(Long id, Supplier data) {
        return repo.findById(id)
            .map(existing -> {
                existing.setName(data.getName());
                existing.setStatus(data.getStatus());
                existing.setLocation(data.getLocation());
                existing.setSince(data.getSince());
                existing.setCertifications(data.getCertifications());
                existing.setRiskLevel(data.getRiskLevel());
                existing.setCategories(data.getCategories());
                existing.setLatestCertificationName(data.getLatestCertificationName());
                existing.setLatestCertificationDate(data.getLatestCertificationDate());
                existing.setExpirationCertificationName(data.getExpirationCertificationName());
                existing.setDaysLeft(data.getDaysLeft());
                existing.setOngoingCertificationName(data.getOngoingCertificationName());
                existing.setOngoingCertificationProgress(data.getOngoingCertificationProgress());
                existing.setRiskReason(data.getRiskReason());
                existing.setActionNeededName(data.getActionNeededName());
                existing.setOverdueDays(data.getOverdueDays());
                return repo.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("找不到 ID=" + id + " 的供應商"));
    }

    /** 刪除指定 ID 的供應商 */
    @Transactional
    public void deleteById(Long id) {
        repo.deleteById(id);
}
}
    