import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePoker } from '@/contexts/PokerContext';
import { useState } from 'react';

const Home = () => {
  const { createSession, joinSession, loading, error } = usePoker();
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [username, setUsername] = useState('');
  const [votingSystem, setVotingSystem] = useState<'fibonacci' | 'tshirt'>('fibonacci');

  const handleCreateSession = () => {
    if (!sessionName || !username) return;
    createSession(sessionName, votingSystem, username);
  };

  const handleJoinSession = () => {
    if (!sessionId || !username) return;
    joinSession(sessionId, username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Planning Poker</CardTitle>
          <CardDescription>Estimate user stories collaboratively</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Session</TabsTrigger>
              <TabsTrigger value="join">Join Session</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="Sprint Planning 1"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="create-username">Your Name</Label>
                  <Input
                    id="create-username"
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

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
                    placeholder="Enter session ID"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="join-username">Your Name</Label>
                  <Input
                    id="join-username"
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
            <div className="mt-4 text-sm text-destructive">{error}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
