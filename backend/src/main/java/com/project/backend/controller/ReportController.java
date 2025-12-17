package com.project.backend.controller;

import com.project.backend.dto.DeficiencyItemDTO;
import com.project.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/deficiency-items")
    public ResponseEntity<List<DeficiencyItemDTO>> getDeficiencyItems() {
        List<DeficiencyItemDTO> items = reportService.getDeficiencyItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/deficiency-items/count")
    public ResponseEntity<Long> getDeficiencyItemCount() {
        long count = reportService.getDeficiencyItemCount();
        return ResponseEntity.ok(count);
    }
}
