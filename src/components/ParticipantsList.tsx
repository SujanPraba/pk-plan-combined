import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePoker } from "@/contexts/PokerContext";
import { User } from "@/types";
import { Check, Clock } from "lucide-react";

interface ParticipantsListProps {
  participants: User[];
  currentUserId: string;
}

const ParticipantsList = ({ participants, currentUserId }: ParticipantsListProps) => {
  const { session } = usePoker();
  const currentStory = session?.currentStoryId
    ? session.stories.find(story => story.id === session.currentStoryId)
    : null;

  // Filter participants to only show those in the current session
  const activeParticipants = participants.filter(participant =>
    session && participant.sessionId === session.id
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const shouldShowVotingStatus = currentStory && !currentStory.finalEstimate;

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {activeParticipants.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-2 rounded-md border border-border"
        >
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {user.name}
                {user.id === currentUserId && <span className="text-xs ml-1">(You)</span>}
              </p>
              {user.isHost && <span className="text-xs text-muted-foreground">Host</span>}
            </div>
          </div>
          {shouldShowVotingStatus && (
            <div>
              {user.hasVoted ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <Clock size={18} className="text-amber-500" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ParticipantsList;
