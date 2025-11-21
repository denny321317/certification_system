package com.project.backend.service;

import com.project.backend.dto.RecentActivityDTO;
import com.project.backend.model.OperationHistory;
import com.project.backend.repository.OperationHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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


    private String mapOperationTypeToActivityType(String operationType) {
        String op = operationType.toUpperCase();
        if (op.contains("CREATE") || op.contains("ADD")) {
            return "create";
        } else if (op.contains("UPDATE") || op.contains("EDIT")) {
            return "update";
        } else if (op.contains("DELETE") || op.contains("REMOVE")) {
            return "delete";
        }
        return "operation";
    }
    
    //所有History
    public List<RecentActivityDTO> getAllHistory() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return operationHistoryRepository.findAll().stream()
                .map(history -> new RecentActivityDTO(
                        history.getId(),
                        history.getOperator(),
                        history.getOperationType(),
                        history.getDetails(),
                        history.getOperationTime().format(formatter),
                        mapOperationTypeToActivityType(history.getOperationType())
                ))
                .collect(Collectors.toList());
    }
    //距離當前時間前5近的
    public List<RecentActivityDTO> getTop5ClosestToNow() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime now = LocalDateTime.now();

        return operationHistoryRepository.findAll().stream()
            // 計算和現在的時間差絕對值，並排序
            .sorted(Comparator.comparingLong(h -> Math.abs(Duration.between(h.getOperationTime(), now).toMillis())))
            .limit(5)
            .map(history -> new RecentActivityDTO(
                history.getId(),
                history.getOperator(),
                history.getOperationType(),
                history.getDetails(),
                history.getOperationTime().format(formatter),
                mapOperationTypeToActivityType(history.getOperationType())
            ))
            .collect(Collectors.toList());
    }
} 