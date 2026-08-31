package com.athletehub.api.service;

import com.athletehub.api.dto.CoachDTO;
import com.athletehub.api.dto.CoachMapper;
import com.athletehub.api.dto.CoachRequest;
import com.athletehub.api.dto.CoachResponse;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.entity.enums.Gender;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CoachServiceImpl implements CoachService {

    private final CoachRepository coachRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final CoachMapper coachMapper;

    public CoachServiceImpl(CoachRepository coachRepository, OrganizationRepository organizationRepository, UserRepository userRepository, CoachMapper coachMapper) {
        this.coachRepository = coachRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.coachMapper = coachMapper;
    }

    @Override
    @Transactional
    public Coach createCoach(Integer userId, CoachRequest request) throws Exception {
        if (coachRepository.findByUserId(userId) != null) {
            throw new Exception("Coach profile already exists for this user.");
        }

        Coach coach = new Coach();
        coach.setUserId(userId);
        coach.setCreatedBy(userId);
        coach.setUpdatedBy(userId);
        
        coachMapper.updateEntityFromRequest(request, coach);
        
        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new Exception("Selected organization does not exist."));
            coach.setOrganization(org);
        }

        // First save to generate the ID
        coach = coachRepository.save(coach);

        // Generate coach code using the ID
        coach.setCoachCode(String.format("COA%06d", coach.getId()));

        // Save again with the generated code
        return coachRepository.save(coach);
    }

    @Override
    @Transactional
    public Coach updateCoach(Integer coachId, CoachRequest request, Integer updaterId) throws Exception {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new Exception("Coach not found."));

        if (coach.getStatus() == CoachStatus.DELETED) {
            throw new Exception("Cannot update a deleted coach.");
        }

        coachMapper.updateEntityFromRequest(request, coach);
        
        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new Exception("Selected organization does not exist."));
            coach.setOrganization(org);
        }

        coach.setUpdatedBy(updaterId);
        return coachRepository.save(coach);
    }

    @Override
    public Coach getCoachById(Integer id) {
        return coachRepository.findById(id).orElse(null);
    }

    @Override
    public CoachResponse searchCoaches(String search, Integer organizationId, String specialization, String status, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Coach> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), CoachStatus.DELETED));

            if (status != null && !status.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("status"), CoachStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (organizationId != null) {
                predicates.add(cb.equal(root.get("organizationId"), organizationId));
            }

            if (specialization != null && !specialization.isEmpty()) {
                predicates.add(cb.like(root.get("specialization"), "%" + specialization + "%"));
            }

            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                Join<Coach, Organization> orgJoin = root.join("organization", JoinType.LEFT);
                Join<Coach, User> userJoin = root.join("user", JoinType.INNER);

                predicates.add(cb.or(
                        cb.like(root.get("coachCode"), likeSearch),
                        cb.like(root.get("firstName"), likeSearch),
                        cb.like(root.get("lastName"), likeSearch),
                        cb.like(root.get("email"), likeSearch),
                        cb.like(root.get("phone"), likeSearch),
                        cb.like(root.get("specialization"), likeSearch),
                        cb.like(orgJoin.get("name"), likeSearch),
                        cb.equal(userJoin.get("email"), search)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Coach> paginated = coachRepository.findAll(spec, pageable);

        List<CoachDTO> dtos = paginated.getContent().stream()
                .map(coachMapper::toDto)
                .collect(Collectors.toList());

        return new CoachResponse(dtos, paginated.getTotalElements(), paginated.getTotalPages(), page, pageSize);
    }

    @Override
    @Transactional
    public void softDeleteCoach(Integer id, Integer deleterId) throws Exception {
        Coach coach = coachRepository.findById(id)
                .orElseThrow(() -> new Exception("Coach not found."));
        coach.setStatus(CoachStatus.DELETED);
        coach.setUpdatedBy(deleterId);
        coachRepository.save(coach);
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        long totalCoaches = coachRepository.countByStatus(CoachStatus.ACTIVE) + coachRepository.countByStatus(CoachStatus.INACTIVE);
        long activeCoaches = coachRepository.countByStatus(CoachStatus.ACTIVE);
        long inactiveCoaches = coachRepository.countByStatus(CoachStatus.INACTIVE);

        double activePercentage = totalCoaches > 0 ? ((double) activeCoaches / totalCoaches) * 100 : 0;
        double inactivePercentage = totalCoaches > 0 ? ((double) inactiveCoaches / totalCoaches) * 100 : 0;

        Double avgExperienceActive = coachRepository.getAverageExperienceByStatus(CoachStatus.ACTIVE);
        
        List<Object[]> orgStatsRaw = coachRepository.countCoachesByOrganizationAndStatus(CoachStatus.ACTIVE);
        List<Map<String, Object>> coachesByOrg = new ArrayList<>();
        for (Object[] row : orgStatsRaw) {
            Integer orgId = (Integer) row[0];
            Long count = (Long) row[1];
            String orgName = "Unassigned";
            if (orgId != null) {
                orgName = organizationRepository.findById(orgId).map(Organization::getName).orElse("Unknown");
            }
            Map<String, Object> stat = new HashMap<>();
            stat.put("organizationId", orgId);
            stat.put("organizationName", orgName);
            stat.put("count", count);
            coachesByOrg.add(stat);
        }
        
        List<Object[]> specStatsRaw = coachRepository.countCoachesBySpecializationAndStatus(CoachStatus.ACTIVE);
        List<Map<String, Object>> coachesBySpec = new ArrayList<>();
        for (Object[] row : specStatsRaw) {
            String spec = (String) row[0];
            Long count = (Long) row[1];
            Map<String, Object> stat = new HashMap<>();
            stat.put("specialization", spec == null || spec.isEmpty() ? "Unspecified" : spec);
            stat.put("count", count);
            coachesBySpec.add(stat);
        }

        // Recently added coaches (last 5)
        Pageable topFive = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Coach> notDeletedSpec = (root, query, cb) -> cb.notEqual(root.get("status"), CoachStatus.DELETED);
        Page<Coach> recentCoachesPage = coachRepository.findAll(notDeletedSpec, topFive);
        List<CoachDTO> recentlyAdded = recentCoachesPage.getContent().stream()
                .map(coachMapper::toDto)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCoaches", totalCoaches);
        stats.put("activeCoaches", activeCoaches);
        stats.put("inactiveCoaches", inactiveCoaches);
        stats.put("activePercentage", activePercentage);
        stats.put("inactivePercentage", inactivePercentage);
        stats.put("averageExperience", avgExperienceActive != null ? avgExperienceActive : 0.0);
        stats.put("coachesByOrganization", coachesByOrg);
        stats.put("coachesBySpecialization", coachesBySpec);
        stats.put("recentlyAdded", recentlyAdded);

        return stats;
    }

    @Override
    public List<String> validateCoachRequest(CoachRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) errors.add("First name is required.");
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) errors.add("Last name is required.");
        if (request.getGender() == null || request.getGender().trim().isEmpty()) {
            errors.add("Gender is required.");
        } else {
            try {
                Gender.valueOf(request.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid gender.");
            }
        }
        if (request.getDateOfBirth() == null) errors.add("Date of birth is required.");
        else if (request.getDateOfBirth().isAfter(LocalDate.now())) errors.add("Date of birth cannot be in the future.");

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                errors.add("Invalid email format.");
            }
        }
        
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (!request.getPhone().matches("^\\+?[0-9]{7,15}$")) {
                errors.add("Invalid phone number format.");
            }
        }

        if (request.getExperienceYears() != null && request.getExperienceYears() < 0) {
            errors.add("Experience years cannot be negative.");
        }
        
        if (request.getOrganizationId() != null) {
            if (!organizationRepository.existsById(request.getOrganizationId())) {
                errors.add("Selected organization does not exist.");
            }
        }

        return errors;
    }
}
