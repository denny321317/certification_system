package com.project.backend.controller;

import com.project.backend.dto.CertTypeDTO;
import com.project.backend.dto.ProjectDeadlineDTO;
import com.project.backend.dto.RecentActivityDTO;
import com.project.backend.model.FileEntity;
import com.project.backend.model.OperationHistory;
import com.project.backend.model.Project;
import com.project.backend.service.OperationHistoryService;
import com.project.backend.service.ProjectService;
import com.project.backend.repository.FileRepository;
import com.project.backend.repository.ProjectRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private OperationHistoryService operationHistoryService;
    @Autowired
    private ProjectService projectService;

    //回傳文件總數
    @GetMapping("/document-count")
    public ResponseEntity<?> getTotalDocumentCount() {
        long count = fileRepository.count();
        return ResponseEntity.ok(Map.of("totalDocuments", count));
    }

    //回傳完成專案總數和細項
    @GetMapping("/project-count")
    public ResponseEntity<?> getProjectCountWithProgress() {
        List<Project> allProjects = projectRepository.findAll();

        long total = allProjects.size();
        long completed = allProjects.stream()
                .filter(p -> p.getProgress() != null && p.getProgress() == 100)
                .count();

        List<Map<String, Object>> projects = allProjects.stream().map(project -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", project.getName());
            map.put("progress", project.getProgress());
            map.put("status", (project.getProgress() != null && project.getProgress() == 100) ? "completed" : "in-progress");

            // 將 LocalDate 轉成 yyyy-MM-dd 字串
            if (project.getEndDate() != null) {
                map.put("deadline", project.getEndDate().toString()); // LocalDate 的 toString 就是 ISO 格式 yyyy-MM-dd
            } else {
                map.put("deadline", null);
            }

            return map;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("totalProjects", total);
        response.put("completedProjects", completed);
        response.put("incompleteProjects", total - completed);
        response.put("summary", completed + " / " + total);
        response.put("projects", projects);

        return ResponseEntity.ok(response);
    }



    //回傳 30 天內即將到期的專案
    @GetMapping("/upcoming-deadlines")
    public ResponseEntity<?> getProjectsWithUpcomingDeadlines() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        List<ProjectDeadlineDTO> upcomingProjects = projectRepository.findUpcomingProjectDeadlines(today, in30Days);

        //細項: 名稱 剩幾天到期 到期日
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProjectDeadlineDTO project : upcomingProjects) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", project.getName());
            map.put("deadline", project.getEndDate());
            long daysLeft = ChronoUnit.DAYS.between(today, project.getEndDate());
            map.put("daysLeft", daysLeft);
            result.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalUpcoming", result.size());
        response.put("projects", result);

        return ResponseEntity.ok(response);
    }

    //回傳所有專案的歷史紀錄
    @GetMapping("/recent-history")
    public ResponseEntity<List<RecentActivityDTO>> getRecentTop5() {
        return ResponseEntity.ok(operationHistoryService.getTop5ClosestToNow());
    }

    @GetMapping("/certification-distribution")
    public ResponseEntity<CertTypeDTO> getCertificationDistribution() {
        return ResponseEntity.ok(projectService.getCertificationDistribution());
    }
}
