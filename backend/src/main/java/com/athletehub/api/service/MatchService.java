package com.athletehub.api.service;

import com.athletehub.api.dto.MatchRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.Match;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.enums.MatchStatus;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.MatchRepository;
import com.athletehub.api.repository.TournamentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final AthleteRepository athleteRepository;

    public MatchService(MatchRepository matchRepository, TournamentRepository tournamentRepository, AthleteRepository athleteRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.athleteRepository = athleteRepository;
    }

    @Transactional
    public Match createMatch(MatchRequest request, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new Exception("Tournament not found"));

        Event event = tournament.getEvent();

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new Exception("End Time must be after Start Time.");
        }

        if (request.getMatchDate().isBefore(event.getEventStartDate()) || request.getMatchDate().isAfter(event.getEventEndDate())) {
            throw new Exception("Matches cannot exist outside the parent Event dates.");
        }

        Athlete p1 = request.getParticipantOneId() != null ? athleteRepository.findById(request.getParticipantOneId()).orElse(null) : null;
        Athlete p2 = request.getParticipantTwoId() != null ? athleteRepository.findById(request.getParticipantTwoId()).orElse(null) : null;

        Match match = new Match();
        match.setTournament(tournament);
        match.setMatchNumber(request.getMatchNumber());
        match.setRound(request.getRound());
        match.setParticipantOne(p1);
        match.setParticipantTwo(p2);
        match.setVenue(request.getVenue());
        match.setMatchDate(request.getMatchDate());
        match.setStartTime(request.getStartTime());
        match.setEndTime(request.getEndTime());
        match.setRemarks(request.getRemarks());
        
        if (request.getStatus() != null) {
            match.setStatus(MatchStatus.valueOf(request.getStatus()));
        } else {
            match.setStatus(MatchStatus.SCHEDULED);
        }

        match.setCreatedBy(userId);
        match.setUpdatedBy(userId);

        match = matchRepository.save(match);
        match.setMatchCode(String.format("MAT%06d", match.getId()));
        return matchRepository.save(match);
    }

    @Transactional
    public Match updateMatch(Integer id, MatchRequest request, Integer userId) throws Exception {
        Match match = matchRepository.findById(id).orElseThrow(() -> new Exception("Match not found"));
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new Exception("Tournament not found"));
        Event event = tournament.getEvent();

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new Exception("End Time must be after Start Time.");
        }

        if (request.getMatchDate().isBefore(event.getEventStartDate()) || request.getMatchDate().isAfter(event.getEventEndDate())) {
            throw new Exception("Matches cannot exist outside the parent Event dates.");
        }

        Athlete p1 = request.getParticipantOneId() != null ? athleteRepository.findById(request.getParticipantOneId()).orElse(null) : null;
        Athlete p2 = request.getParticipantTwoId() != null ? athleteRepository.findById(request.getParticipantTwoId()).orElse(null) : null;
        Athlete winner = request.getWinnerId() != null ? athleteRepository.findById(request.getWinnerId()).orElse(null) : null;

        match.setTournament(tournament);
        match.setMatchNumber(request.getMatchNumber());
        match.setRound(request.getRound());
        match.setParticipantOne(p1);
        match.setParticipantTwo(p2);
        match.setVenue(request.getVenue());
        match.setMatchDate(request.getMatchDate());
        match.setStartTime(request.getStartTime());
        match.setEndTime(request.getEndTime());
        match.setWinner(winner);
        match.setRemarks(request.getRemarks());
        
        if (request.getStatus() != null) {
            match.setStatus(MatchStatus.valueOf(request.getStatus()));
        }
        match.setUpdatedBy(userId);

        return matchRepository.save(match);
    }

    public Match getMatchById(Integer id) throws Exception {
        return matchRepository.findById(id).orElseThrow(() -> new Exception("Match not found"));
    }

    public Page<Match> searchMatches(String search, Integer tournamentId, String status, Integer organizationId, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Match> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), MatchStatus.valueOf(status)));
            }
            if (tournamentId != null) {
                predicates.add(cb.equal(root.get("tournament").get("id"), tournamentId));
            }
            if (organizationId != null) {
                predicates.add(cb.equal(root.get("tournament").get("event").get("organization").get("id"), organizationId));
            }
            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(root.get("matchCode"), likeSearch),
                        cb.like(root.get("round"), likeSearch),
                        cb.like(root.get("venue"), likeSearch)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return matchRepository.findAll(spec, pageable);
    }

    @Transactional
    public void deleteMatch(Integer id, Integer userId) throws Exception {
        Match match = matchRepository.findById(id).orElseThrow(() -> new Exception("Match not found"));
        match.setIsDeleted(true);
        match.setUpdatedBy(userId);
        matchRepository.save(match);
    }
}
