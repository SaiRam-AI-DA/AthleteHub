package com.athletehub.api.repository;

import com.athletehub.api.entity.Athlete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AthleteRepository extends JpaRepository<Athlete, Integer>, JpaSpecificationExecutor<Athlete> {
    Athlete findByUserId(Integer userId);
    List<Athlete> findByOrganizationIdAndStatusNot(Integer organizationId, String status);
    
    @Query(value = "SELECT id FROM athletes ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Integer findLastInsertedId();
    
    @Query("SELECT a.organizationId as orgId, COUNT(a) as count FROM Athlete a WHERE a.organizationId IN :orgIds AND a.status != 'Deleted' GROUP BY a.organizationId")
    List<Object[]> countActiveAthletesByOrganizationIds(@org.springframework.data.repository.query.Param("orgIds") java.util.List<Integer> orgIds);
    
    @Query("SELECT COUNT(a) FROM Athlete a WHERE a.organizationId = :orgId AND a.status != 'Deleted'")
    long countActiveAthletesByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Integer orgId);

    long countByStatusNot(String status);
    long countByStatusNotAndOrganizationIdIsNull(String status);
}
