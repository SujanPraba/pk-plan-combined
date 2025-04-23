import ParticipantsList from '@/components/ParticipantsList';
import StoryDetail from '@/components/StoryDetail';
import StoryList from '@/components/StoryList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import VotingCard from '@/components/VotingCard';
import { usePoker } from '@/contexts/PokerContext';
import { FibonacciValue, Story, TShirtValue } from '@/types';
import fileDownload from 'js-file-download';
import { Check, Clock, Copy, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Session = () => {
  const navigate = useNavigate();
  const { session, currentUser, socket, addStory } = usePoker();
  const [copied, setCopied] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState('voting');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);

  useEffect(() => {
    if (!session || !currentUser) {
      navigate('/');
    }
  }, [session, currentUser, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on('timer_update', (seconds: number) => {
      setTimeLeft(seconds);
      setTimerActive(seconds > 0);
    });

    return () => {
      socket.off('timer_update');
    };
  }, [socket]);

  const handleCopySessionId = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddStory = () => {
    if (!newStoryTitle || !session) return;

    addStory(newStoryTitle, newStoryDescription ,setIsAddStoryDialogOpen);
    setNewStoryTitle('');
    setNewStoryDescription('');
  };

  const startTimer = (seconds: number) => {
    if (!socket || !session) return;
    socket.emit('start_timer', { sessionId: session.id, seconds });
  };

  const isCurrentUserHost = currentUser?.isHost;
  const currentStory = session?.currentStoryId
    ? session.stories.find(story => story.id === session.currentStoryId)
    : null;

  const fibonacciValues: FibonacciValue[] = ['?', '0', '1', '2', '3', '5', '8', '13', '21', '34', '∞'];
  const tshirtValues: TShirtValue[] = ['?', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const votingValues = session?.votingSystem === 'fibonacci' ? fibonacciValues : tshirtValues;

  const handleExportSession = async () => {
    if (!session) return;
    try {
      const response = await fetch(`/api/sessions/export/${session.sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();

      const fileName = `${session.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      fileDownload(blob, fileName);
    } catch (error) {
      console.error('Failed to export session:', error);
    }
  };

  const handleLeaveSession = () => {
    // Clear session data from localStorage
    localStorage.removeItem('pokerSession');
    localStorage.removeItem('pokerUser');
    navigate('/');
  };

  if (!session || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-card rounded-lg p-4 shadow mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{session.name}</h1>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <span>Session ID: {session.id}</span>
                <button
                  onClick={handleCopySessionId}
                  className="ml-2 text-primary hover:text-primary/80 focus:outline-none"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {timerActive && currentStory && !currentStory.finalEstimate && (
                <div className="flex items-center">
                  <Clock className="mr-1" size={18} />
                  <span>{timeLeft}s</span>
                </div>
              )}

              {isCurrentUserHost && currentStory && !currentStory.finalEstimate && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => startTimer(30)}>30s</Button>
                  <Button variant="outline" size="sm" onClick={() => startTimer(60)}>1m</Button>
                  <Button variant="outline" size="sm" onClick={() => startTimer(120)}>2m</Button>

                </div>
              )}
               {isCurrentUserHost && (
                 <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleExportSession}
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export
                    </Button>
                  </div>
                  )}

              <Button variant="secondary" onClick={handleLeaveSession}>Leave Session</Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <div className="p-4">
                <h2 className="font-semibold mb-2">Participants</h2>
                <ParticipantsList participants={session.participants} currentUserId={currentUser.id} />
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Stories</h2>
                  {isCurrentUserHost && (
                    <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">+ Add</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Story</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                          <div>
                            <Label htmlFor="story-title">Title</Label>
                            <Input
                              id="story-title"
                              value={newStoryTitle}
                              onChange={(e) => setNewStoryTitle(e.target.value)}
                              placeholder="Enter story title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="story-description">Description (optional)</Label>
                            <Textarea
                              id="story-description"
                              value={newStoryDescription}
                              onChange={(e) => setNewStoryDescription(e.target.value)}
                              placeholder="Enter story description"
                            />
                          </div>
                          <Button className="w-full" onClick={handleAddStory}>Add Story</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <Separator className="my-2" />
                <StoryList
                  stories={session.stories}
                  currentStoryId={session.currentStoryId}
                  isHost={isCurrentUserHost}
                />
              </div>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="voting">Voting</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="voting">
                  {currentStory ? (
                    <div>
                      <StoryDetail
                        story={currentStory}
                        isHost={isCurrentUserHost}
                        isRevealDisabled={!session.isVotingComplete}
                        hasVotesRevealed={session.hasVotesRevealed}
                      />

                      <Separator className="my-4" />

                      <h3 className="font-medium mb-3">Your Vote</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {votingValues.map((value) => (
                          <VotingCard
                            key={value}
                            value={value}
                            disabled={!!session.hasVotesRevealed || !!currentStory.finalEstimate}
                            selected={currentStory.votes?.[currentUser.id] === value}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      {session.stories.length === 0 ? (
                        <p>No stories added yet. {isCurrentUserHost && 'Add a story to get started.'}</p>
                      ) : (
                        <p>{isCurrentUserHost
                          ? 'Select a story to begin voting.'
                          : 'Waiting for the moderator to select a story.'}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    {session.stories.filter(story => story.finalEstimate).map((story: Story) => (
                      <Card key={story.id} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{story.title}</h3>
                            {story.description && (
                              <p className="text-sm text-muted-foreground">{story.description}</p>
                            )}
                          </div>
                          <div className="bg-primary text-primary-foreground text-lg font-bold h-10 w-10 flex items-center justify-center rounded-md">
                            {story.finalEstimate}
                          </div>
                        </div>
                      </Card>
                    ))}

                    {session.stories.filter(story => story.finalEstimate).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No completed estimations yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
