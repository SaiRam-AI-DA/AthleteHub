import React from 'react';
import { Card } from './ui/card';

export function BracketViewer({ matches }) {
  if (!matches || matches.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No bracket generated yet.</div>;
  }

  // Group matches by round
  const rounds = {};
  matches.forEach(match => {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
  });

  // Sort rounds based on match logic (e.g., Round 1, Round 2, ..., Finals)
  const roundNames = Object.keys(rounds).sort((a, b) => {
    if (a === 'Finals') return 1;
    if (b === 'Finals') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex flex-row min-w-max gap-8 px-4 py-8">
        {roundNames.map((roundName, index) => (
          <div key={roundName} className="flex flex-col flex-1 min-w-[250px] space-y-8">
            <h3 className="text-center font-bold mb-4 text-primary bg-muted p-2 rounded-lg">{roundName}</h3>
            
            <div className="flex flex-col justify-around flex-grow gap-8 relative">
              {rounds[roundName].map((match) => (
                <div key={match.id} className="relative flex flex-col justify-center my-auto w-full">
                  <Card className={`p-0 overflow-hidden shadow-md border ${match.status === 'Completed' ? 'border-primary/50' : 'border-border'} hover:border-primary transition-all`}>
                    <div className="flex flex-col text-sm">
                      <div className={`px-4 py-3 flex justify-between items-center border-b ${match.winnerId === match.participantOneId ? 'bg-primary/10 font-bold' : ''}`}>
                        <span className="truncate">{match.participantOneName || '(TBD)'}</span>
                      </div>
                      <div className={`px-4 py-3 flex justify-between items-center ${match.winnerId === match.participantTwoId ? 'bg-primary/10 font-bold' : ''}`}>
                        <span className="truncate">{match.participantTwoName || '(TBD)'}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
