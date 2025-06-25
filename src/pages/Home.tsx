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

const Home = () => {
  const { createSession: createPokerSession, joinSession: joinPokerSession, loading: pokerLoading, error: pokerError } = usePoker();
  const { createSession: createRetroSession, joinSession: joinRetroSession, loading: retroLoading, error: retroError } = useRetro();

  const [sessionType, setSessionType] = useState<'poker' | 'retro'>('poker');
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [username, setUsername] = useState('');
  const [votingSystem, setVotingSystem] = useState<'fibonacci' | 'tshirt'>('fibonacci');

  const handleCreateSession = () => {
    if (!sessionName || !username) return;
    if (sessionType === 'poker') {
      createPokerSession(sessionName, votingSystem, username);
    } else {
      createRetroSession(sessionName, username);
    }
  };

  const handleJoinSession = () => {
    if (!sessionId || !username) return;
    if (sessionType === 'poker') {
      joinPokerSession(sessionId, username);
    } else {
      joinRetroSession(sessionId, username);
    }
  };

  const loading = sessionType === 'poker' ? pokerLoading : retroLoading;
  const error = sessionType === 'poker' ? pokerError : retroError;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Session Type Selection */}
        <div className="flex justify-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSessionType('poker')}
            className={`cursor-pointer rounded-xl p-6 ${
              sessionType === 'poker' ? 'bg-primary text-primary-foreground' : 'bg-card'
            }`}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Planning Poker</h3>
              <p className="text-sm opacity-80">Estimate user stories collaboratively</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSessionType('retro')}
            className={`cursor-pointer rounded-xl p-6 ${
              sessionType === 'retro' ? 'bg-primary text-primary-foreground' : 'bg-card'
            }`}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Retrospective</h3>
              <p className="text-sm opacity-80">Reflect on your team's progress</p>
            </div>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{sessionType === 'poker' ? 'Planning Poker' : 'Retrospective'}</CardTitle>
            <CardDescription>
              {sessionType === 'poker'
                ? 'Create or join a planning poker session to estimate user stories with your team.'
                : 'Create or join a retrospective session to reflect on what went well and what needs improvement.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">Create Session</TabsTrigger>
                <TabsTrigger value="join">Join Session</TabsTrigger>
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
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handleCreateSession}
                  disabled={loading || !sessionName || !username}
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </Button>
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
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handleJoinSession}
                  disabled={loading || !sessionId || !username}
                >
                  {loading ? 'Joining...' : 'Join Session'}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
