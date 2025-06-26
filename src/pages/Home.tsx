import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePoker } from '@/contexts/PokerContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRetro } from '@/contexts/RetroContext';
import { toast } from 'sonner';
import bgImage from '@/assets/newWhiteBG.avif';

const Home = () => {
  const { createSession: createPokerSession, joinSession: joinPokerSession, loading: pokerLoading, error: pokerError } = usePoker();
  const { createSession: createRetroSession, joinSession: joinRetroSession, loading: retroLoading, error: retroError } = useRetro();

  const [sessionType, setSessionType] = useState<'poker' | 'retro'>('poker');
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [username, setUsername] = useState('');
  const [votingSystem, setVotingSystem] = useState<'fibonacci' | 'tshirt'>('fibonacci');

  const handleCreateSession = async () => {
    if (!sessionName || !username) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (sessionType === 'poker') {
      createPokerSession(sessionName, votingSystem, username);
    } else {
      createRetroSession(sessionName, username);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId || !username) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (sessionType === 'poker') {
      joinPokerSession(sessionId, username);
    } else {
      joinRetroSession(sessionId, username);
    }
  };

  const loading = sessionType === 'poker' ? pokerLoading : retroLoading;
  const error = sessionType === 'poker' ? pokerError : retroError;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle>Planning Tool</CardTitle>
              <CardDescription>Create or join a planning session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <RadioGroup
                  value={sessionType}
                  onValueChange={(value) => setSessionType(value as 'poker' | 'retro')}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poker" id="session-type-poker" />
                    <Label htmlFor="session-type-poker" className="cursor-pointer">Planning Poker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retro" id="session-type-retro" />
                    <Label htmlFor="session-type-retro" className="cursor-pointer">Retrospective</Label>
                  </div>
                </RadioGroup>
              </div>

              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="join">Join</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="session-name">Session Name</Label>
                      <Input
                        id="session-name"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="Enter session name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username">Your Name</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    {sessionType === 'poker' && (
                      <div>
                        <Label>Voting System</Label>
                        <RadioGroup
                          value={votingSystem}
                          onValueChange={(value) => setVotingSystem(value as 'fibonacci' | 'tshirt')}
                          className="grid grid-cols-2 gap-4 pt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fibonacci" id="fibonacci" />
                            <Label htmlFor="fibonacci" className="cursor-pointer">Fibonacci</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tshirt" id="tshirt" />
                            <Label htmlFor="tshirt" className="cursor-pointer">T-Shirt Sizes</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <Button
                      onClick={handleCreateSession}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Session'}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="join">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="session-id">Session ID</Label>
                      <Input
                        id="session-id"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        placeholder="Enter session ID"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username-join">Your Name</Label>
                      <Input
                        id="username-join"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    <Button
                      onClick={handleJoinSession}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Joining...' : 'Join Session'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
