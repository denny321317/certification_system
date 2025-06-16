package com.project.backend.service;

import com.project.backend.model.OperationHistory;
import com.project.backend.repository.OperationHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperationHistoryService {

    private final OperationHistoryRepository operationHistoryRepository;

    @Autowired
    public OperationHistoryService(OperationHistoryRepository operationHistoryRepository) {
        this.operationHistoryRepository = operationHistoryRepository;
    }

    /**
     * Records an operation in the history.
     *
     * @param projectId     The ID of the project.
     * @param operator      The person or system performing the operation.
     * @param operationType The type of operation.
     * @param details       Details about the operation.
     */
    public void recordHistory(Long projectId, String operator, String operationType, String details) {
        OperationHistory history = new OperationHistory(projectId, operator, operationType, details);
        operationHistoryRepository.save(history);
    }

    /**
     * Retrieves the history for a specific project.
     *
     * @param projectId The ID of the project.
     * @return A list of operation history records.
     */
    public List<OperationHistory> getHistoryForProject(Long projectId) {
        return operationHistoryRepository.findByProjectIdOrderByOperationTimeDesc(projectId);
    }
} 