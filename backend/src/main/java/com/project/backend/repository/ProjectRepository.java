package com.project.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.backend.dto.CertTypeCountDTO;
import com.project.backend.dto.ProjectDeadlineDTO;
import com.project.backend.model.Project;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    public Optional<Project> findById(Long id);
    List<Project> findByStatus(String status);
    List<Project> findByStatusIgnoreCase(String status);
    List<Project> findByEndDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT new com.project.backend.dto.ProjectDeadlineDTO(p.id, p.name, p.endDate) " +
       "FROM Project p WHERE p.endDate BETWEEN :start AND :end")
    List<ProjectDeadlineDTO> findUpcomingProjectDeadlines(@Param("start") LocalDate start,
                                                       @Param("end") LocalDate end);

   @Query("SELECT p.certType AS certType, COUNT(p) AS count FROM Project p GROUP BY p.certType")
   List<CertTypeCount> countProjectsByCertType();
   

   public interface CertTypeCount {
      String getCertType();
      Long getCount();
   }

   @Query("SELECT new com.project.backend.dto.CertTypeCountDTO(COALESCE(p.certType, '無認證'), COUNT(p)) " +
           "FROM Project p GROUP BY p.certType")
    List<CertTypeCountDTO> countCertType();
   

}

