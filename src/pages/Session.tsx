import { JiraImportModal } from '@/components/JiraImportModal';
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
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface JiraStory {
  id: string;
  key: string;
  title: string;
  description: string;
  fields: {
    summary: string;
    description?: string;
  };
}

const Session = () => {
  const navigate = useNavigate();
  const { session, currentUser, socket, addStory, leaveSession } = usePoker();
  const [copied, setCopied] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState('voting');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  const [isJiraImportModalOpen, setIsJiraImportModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const state = searchParams.get('state');
  const code = searchParams.get('code');

  useEffect(() => {
    // Only handle Jira callback if both state and code are present and we don't have them in localStorage
    if (state && code && (!localStorage.getItem('state') || !localStorage.getItem('code'))) {
      localStorage.setItem('state', state);
      localStorage.setItem('code', code);
    }
  }, []); // Empty dependency array to run only once when component mounts

  useEffect(() => {
    if (!session || !currentUser) {
      navigate('/');
    }
  }, [session, currentUser, navigate]);

  useEffect(() => {
    if (!socket) {
      return;
    }

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
    const shortSessionId = session.id.substring(0, 6).toUpperCase();
    navigator.clipboard.writeText(shortSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddStory = () => {
    if (!newStoryTitle || !session) return;

    addStory(newStoryTitle, newStoryDescription, setIsAddStoryDialogOpen);
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
    localStorage.removeItem('pokerSession');
    localStorage.removeItem('pokerUser');
    leaveSession();
    navigate('/');
  };

  if (!session || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{session.name}</h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Session ID:</span>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">{session.sessionId}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopySessionId}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportSession}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleLeaveSession}>
                Leave Session
              </Button>
              <Button onClick={() => setIsJiraImportModalOpen(true)}>
                Import from Jira
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <ParticipantsList
              participants={session.participants}
              currentUserId={currentUser.id}
            />
          </div>

          <div className="lg:col-span-6">
            <Card className="mb-8">
              <div className="p-6">
                <StoryDetail
                  story={currentStory}
                  isHost={isCurrentUserHost}
                  onStartTimer={startTimer}
                  timeLeft={timeLeft}
                  timerActive={timerActive}
                />
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Stories</h2>
                <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Story</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Story</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newStoryTitle}
                          onChange={(e) => setNewStoryTitle(e.target.value)}
                          placeholder="Enter story title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newStoryDescription}
                          onChange={(e) => setNewStoryDescription(e.target.value)}
                          placeholder="Enter story description"
                        />
                      </div>
                      <Button onClick={handleAddStory} className="w-full">
                        Add Story
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

            </div>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Voting</h3>
                <div className="grid grid-cols-3 gap-2">
                  {votingValues.map((value) => (
                    <VotingCard key={value} value={value} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <JiraImportModal
            open={isJiraImportModalOpen}
            onClose={() => setIsJiraImportModalOpen(false)}
            onStoriesImported={(stories: any) => {
              stories.forEach(story => addStory(story.fields.summary, story.fields.description || ''));
              setIsJiraImportModalOpen(false);
            }}
          />
        </div>


      </div>
    </div>
  );
};

export default Session;
