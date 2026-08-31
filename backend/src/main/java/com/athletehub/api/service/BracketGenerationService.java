package com.athletehub.api.service;

import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.AthleteRegistration;
import com.athletehub.api.entity.Match;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.enums.MatchStatus;
import com.athletehub.api.entity.enums.RegistrationStatus;
import com.athletehub.api.repository.AthleteRegistrationRepository;
import com.athletehub.api.repository.MatchRepository;
import com.athletehub.api.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BracketGenerationService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final AthleteRegistrationRepository registrationRepository;

    public BracketGenerationService(MatchRepository matchRepository,
                                    TournamentRepository tournamentRepository,
                                    AthleteRegistrationRepository registrationRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional
    public List<Match> generateBracket(Integer tournamentId, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new Exception("Tournament not found"));

        // Check if matches already exist
        if (matchRepository.countByTournamentId(tournamentId) > 0) {
            throw new Exception("Bracket already exists for this tournament");
        }

        // Fetch approved participants
        List<AthleteRegistration> registrations = registrationRepository.findByTournamentId(tournamentId).stream()
                .filter(reg -> reg.getStatus() == RegistrationStatus.APPROVED)
                .collect(Collectors.toList());

        if (registrations.isEmpty()) {
            throw new Exception("No approved participants to generate bracket");
        }

        List<Athlete> athletes = registrations.stream().map(AthleteRegistration::getAthlete).collect(Collectors.toList());
        
        // Shuffle for random seeding (could be replaced by ranking-based seeding)
        Collections.shuffle(athletes);

        // Calculate power of 2 for bracket size
        int n = athletes.size();
        int bracketSize = 1;
        while (bracketSize < n) {
            bracketSize *= 2;
        }

        int byes = bracketSize - n;
        
        // Setup initial round (leaf nodes)
        List<Match> currentRoundMatches = new ArrayList<>();
        int matchCounter = 1;
        
        // Add padding with nulls to represent byes
        List<Athlete> paddedAthletes = new ArrayList<>(athletes);
        for (int i = 0; i < byes; i++) {
            paddedAthletes.add(null);
        }

        // First Round creation
        for (int i = 0; i < bracketSize / 2; i++) {
            Match match = new Match();
            match.setTournament(tournament);
            match.setMatchNumber(matchCounter++);
            match.setRound("Round 1");
            match.setParticipantOne(paddedAthletes.get(i * 2));
            match.setParticipantTwo(paddedAthletes.get(i * 2 + 1));
            match.setStatus(MatchStatus.SCHEDULED);
            match.setCreatedBy(userId);

            // Auto-advance if there is a bye
            if (match.getParticipantOne() == null && match.getParticipantTwo() != null) {
                match.setWinner(match.getParticipantTwo());
                match.setStatus(MatchStatus.COMPLETED);
            } else if (match.getParticipantTwo() == null && match.getParticipantOne() != null) {
                match.setWinner(match.getParticipantOne());
                match.setStatus(MatchStatus.COMPLETED);
            } else if (match.getParticipantOne() == null && match.getParticipantTwo() == null) {
                 // double bye - edge case not normally happening if seeded right
                 match.setStatus(MatchStatus.COMPLETED);
            }

            match = matchRepository.save(match);
            currentRoundMatches.add(match);
        }

        // Build subsequent rounds bottom-up
        int roundNum = 2;
        while (currentRoundMatches.size() > 1) {
            List<Match> nextRoundMatches = new ArrayList<>();
            for (int i = 0; i < currentRoundMatches.size(); i += 2) {
                Match prev1 = currentRoundMatches.get(i);
                Match prev2 = currentRoundMatches.get(i + 1);

                Match match = new Match();
                match.setTournament(tournament);
                match.setMatchNumber(matchCounter++);
                match.setRound("Round " + roundNum);
                match.setPreviousMatchOne(prev1);
                match.setPreviousMatchTwo(prev2);
                match.setStatus(MatchStatus.SCHEDULED);
                match.setCreatedBy(userId);

                // Auto-advance logic if both previous matches are byes
                if (prev1.getWinner() != null && prev2.getWinner() == null && prev2.getStatus() == MatchStatus.COMPLETED) {
                    match.setParticipantOne(prev1.getWinner());
                } else if (prev1.getWinner() == null && prev1.getStatus() == MatchStatus.COMPLETED && prev2.getWinner() != null) {
                    match.setParticipantTwo(prev2.getWinner());
                } else if (prev1.getWinner() != null && prev2.getWinner() != null) {
                    match.setParticipantOne(prev1.getWinner());
                    match.setParticipantTwo(prev2.getWinner());
                }

                match = matchRepository.save(match);
                nextRoundMatches.add(match);
                
                // Link previous matches to this new match
                prev1.setNextMatch(match);
                prev2.setNextMatch(match);
                matchRepository.save(prev1);
                matchRepository.save(prev2);
            }
            currentRoundMatches = nextRoundMatches;
            roundNum++;
        }
        
        // Mark final match round as "Finals"
        if (!currentRoundMatches.isEmpty()) {
            Match finalMatch = currentRoundMatches.get(0);
            finalMatch.setRound("Finals");
            matchRepository.save(finalMatch);
        }

        return matchRepository.findByTournamentId(tournamentId);
    }
    
    public List<Match> getBracket(Integer tournamentId) {
        return matchRepository.findByTournamentId(tournamentId);
    }
}
