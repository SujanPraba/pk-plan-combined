
import { usePoker } from "@/contexts/PokerContext";
import { cn } from "@/lib/utils";
import { Story } from "@/types";

interface StoryListProps {
  stories: Story[];
  currentStoryId?: string;
  isHost: boolean;
}

const StoryList = ({ stories, currentStoryId, isHost }: StoryListProps) => {
  const { startVoting } = usePoker();

  const handleSelectStory = (storyId: string) => {
    if (!isHost) return;
    startVoting(storyId);
  };

  if (stories.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No stories yet</div>;
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {stories.map((story) => {
        const isActive = story.id === currentStoryId;
        const isEstimated = !!story.finalEstimate;

        return (
          <div
            key={story.id}
            className={cn(
              "p-2 rounded-md border text-sm cursor-pointer transition-colors",
              isActive ? "border-primary bg-primary/10" : "border-border",
              isEstimated && "bg-muted",
              !isHost && "cursor-default"
            )}
            onClick={() => handleSelectStory(story.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 truncate">
                <p className="font-medium truncate">{story.title}</p>
              </div>

              {isEstimated && (
                <div className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-bold ml-2">
                  {story.finalEstimate}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StoryList;
