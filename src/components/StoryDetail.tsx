import { Button } from "@/components/ui/button";
import { usePoker } from "@/contexts/PokerContext";
import { Story } from "@/types";
import { Clock } from "lucide-react";

interface StoryDetailProps {
  story: Story;
  isHost: boolean;
  isRevealDisabled?: boolean;
  hasVotesRevealed?: boolean;
  onStartTimer: (seconds: number) => void;
  timeLeft: number;
  timerActive: boolean;
}

const StoryDetail = ({ story, isHost, isRevealDisabled, hasVotesRevealed, onStartTimer, timeLeft, timerActive }: StoryDetailProps) => {
  const { revealVotes, finishVoting, nextStory } = usePoker();

  if (!story) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No story selected
      </div>
    );
  }

  const handleReveal = () => {
    if (isHost) {
      revealVotes();
    }
  };

  const handleFinishVoting = (finalEstimate: string | number) => {
    if (isHost) {
      finishVoting(finalEstimate);
      nextStory();
    }
  };

  const getAverageVote = () => {
    if (!story.votes) return null;

    const numericVotes: number[] = [];

    Object.values(story.votes).forEach(vote => {
      if (typeof vote === 'number') {
        numericVotes.push(vote);
      } else if (typeof vote === 'string' && !isNaN(Number(vote))) {
        numericVotes.push(Number(vote));
      }
    });

    if (numericVotes.length === 0) return null;

    const sum = numericVotes.reduce((total, vote) => total + vote, 0);
    return Math.round(sum / numericVotes.length * 10) / 10;
  };

  const getMostFrequentVote = () => {
    if (!story.votes) return null;

    const voteCounts: Record<string, number> = {};
    Object.values(story.votes).forEach(vote => {
      const voteKey = String(vote);
      voteCounts[voteKey] = (voteCounts[voteKey] || 0) + 1;
    });

    let maxVote = null;
    let maxCount = 0;

    Object.entries(voteCounts).forEach(([vote, count]) => {
      if (count > maxCount) {
        maxVote = vote;
        maxCount = count;
      }
    });

    return maxVote;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{story.title}</h2>
      {story.description && (
        <p className="text-muted-foreground mb-4">{story.description}</p>
      )}

      {hasVotesRevealed && story.votes && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Votes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
            {Object.entries(story.votes).map(([userId, vote]) => (
              <div
                key={userId}
                className="bg-muted p-2 rounded border text-center"
              >
                <div className="text-lg font-semibold">{vote}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {/* In a real app, you'd look up the username from the userId */}
                  User {userId.substring(0, 5)}
                </div>
              </div>
            ))}
          </div>

          {isHost && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Button onClick={() => handleFinishVoting(getMostFrequentVote() || '?')}>
                Accept Most Common ({getMostFrequentVote() || '?'})
              </Button>

              {getAverageVote() !== null && (
                <Button variant="outline" onClick={() => handleFinishVoting(getAverageVote() || '?')}>
                  Accept Average ({getAverageVote()})
                </Button>
              )}

              {Object.values(story.votes || {}).map(vote => (
                <Button
                  key={String(vote)}
                  variant="outline"
                  onClick={() => handleFinishVoting(vote)}
                >
                  Accept {vote}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {isHost && !hasVotesRevealed && (
        <div className="flex gap-2 mt-2">
          {timerActive ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{timeLeft}s</span>
            </div>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => onStartTimer(30)}>30s</Button>
              <Button size="sm" variant="outline" onClick={() => onStartTimer(60)}>1m</Button>
              <Button size="sm" variant="outline" onClick={() => onStartTimer(120)}>2m</Button>
            </>
          )}
          <Button onClick={handleReveal} disabled={isRevealDisabled}>
            Reveal Votes
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryDetail;
