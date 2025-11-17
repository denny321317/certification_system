package com.project.backend.service;

import com.project.backend.dto.DeficiencyItemDTO;
import com.project.backend.repository.ReviewIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReviewIssueRepository reviewIssueRepository;

    public List<DeficiencyItemDTO> getDeficiencyItems() {
        List<DeficiencyItemDTO> items = reviewIssueRepository.findDeficiencyItems();

        return items.stream().map(item -> {
            // Handle certType null value
            if (item.getCertType() == null || item.getCertType().isEmpty()) {
                item.setCertType("無");
            }

            // Handle status mapping
            if ("open".equalsIgnoreCase(item.getStatus())) {
                item.setStatus("進行中");
            } else if ("closed".equalsIgnoreCase(item.getStatus())) {
                item.setStatus("已解決");
            }

            return item;
        }).collect(Collectors.toList());
    }
}
