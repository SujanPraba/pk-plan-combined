import { FibonacciValue, PokerSession, TShirtValue, User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface PokerContextType {
  session: PokerSession | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  createSession: (name: string, votingSystem: 'fibonacci' | 'tshirt', username: string) => void;
  joinSession: (sessionId: string, username: string) => void;
  addStory: (title: string, description?: string, setIsAddStoryDialogOpen?: (open: boolean) => void) => void;
  startVoting: (storyId: string) => void;
  submitVote: (vote: FibonacciValue | TShirtValue) => void;
  revealVotes: () => void;
  finishVoting: (finalEstimate: string | number) => void;
  nextStory: () => void;
  leaveSession: () => void;
  socket: Socket | null;
}

const PokerContext = createContext<PokerContextType | undefined>(undefined);

export const usePoker = () => {
  const context = useContext(PokerContext);
  if (!context) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
};

// Navigation handler component that has access to Router context
const NavigationHandler = ({ session }: { session: PokerSession | null }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/session');
    }
  }, [session, navigate]);

  return null;
};

interface PokerProviderProps {
  children: ReactNode;
}

export const PokerProvider = ({ children }: PokerProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<PokerSession | null>(() => {
    const savedSession = localStorage.getItem('pokerSession');
    return savedSession ? JSON.parse(savedSession) : null;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('pokerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save session and user data to localStorage whenever they change
  useEffect(() => {
    if (session) {
      localStorage.setItem('pokerSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('pokerSession');
    }
  }, [session]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pokerUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pokerUser');
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('Connecting to socket server...');
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
    });

    // Set up socket event listeners
    const setupSocketListeners = (socket: Socket) => {
      socket.on('session_created', (data: PokerSession) => {
        console.log('Session created:', data);
        const transformedSession = {
          ...data,
          id: data.sessionId,
        };
        setSession(transformedSession);
        if (data.participants && data.participants.length > 0) {
          const host = data.participants.find(p => p.isHost);
          if (host) {
            setCurrentUser(host);
          }
        }
        setLoading(false);
      });

      socket.on('session_joined', (data: { session: PokerSession; user: User }) => {
        console.log('Session joined:', data);
        const transformedSession = {
          ...data.session,
          id: data.session.sessionId,
        };
        setSession(transformedSession);
        setCurrentUser(data.user);
        setLoading(false);
      });

      socket.on('session_updated', (data: PokerSession) => {
        console.log('Session updated:', data);
        const transformedSession = {
          ...data,
          id: data.sessionId,
        };
        setSession(transformedSession);
      });

      socket.on('session_left', () => {
        console.log('Left session');
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
      });

      socket.on('error', (message: string) => {
        console.error('Socket error:', message);
        setError(message);
        setLoading(false);
      });
    };

    // Set up initial socket listeners
    setupSocketListeners(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      // Re-setup listeners on reconnection
      setupSocketListeners(socketInstance);
      
      // Rejoin session room if we have an active session
      if (session) {
        socketInstance.emit('rejoin_session', {
          sessionId: session.sessionId,
          userId: currentUser?.id
        });
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to the server. Please try again later.');
    });

    setSocket(socketInstance);

    return () => {
      console.log('Disconnecting socket...');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, [session?.sessionId, currentUser?.id]); // Add dependencies to re-establish connection when needed

  const createSession = (name: string, votingSystem: 'fibonacci' | 'tshirt', username: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit('create_session', { name, votingSystem, username });
  };

  const joinSession = (sessionId: string, username: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit('join_session', { sessionId, username });
  };

  const addStory = (title: string, description?: string, setIsAddStoryDialogOpen?: (open: boolean) => void) => {
    if (!socket || !session) return;
    socket.emit('add_story', { sessionId: session.id, title, description });
    if (setIsAddStoryDialogOpen) {
      setIsAddStoryDialogOpen(false);
    }
  };

  const startVoting = (storyId: string) => {
    if (!socket || !session) return;
    socket.emit('start_voting', { sessionId: session.id, storyId });
  };

  const submitVote = (vote: FibonacciValue | TShirtValue) => {
    if (!socket || !session || !currentUser) return;
    socket.emit('submit_vote', {
      sessionId: session.id,
      storyId: session.currentStoryId,
      userId: currentUser.id,
      vote
    });
  };

  const revealVotes = () => {
    if (!socket || !session) return;
    socket.emit('reveal_votes', { sessionId: session.id });
  };

  const finishVoting = (finalEstimate: string | number) => {
    if (!socket || !session) return;
    socket.emit('finish_voting', {
      sessionId: session.id,
      storyId: session.currentStoryId,
      finalEstimate
    });
  };

  const nextStory = () => {
    if (!socket || !session) return;
    socket.emit('next_story', { sessionId: session.id });
  };

  const leaveSession = () => {
    if (!socket || !session || !currentUser) return;
    socket.emit('leave_session', {
      sessionId: session.id,
      userId: currentUser.id
    });
  };

  return (
    <PokerContext.Provider
      value={{
        session,
        currentUser,
        loading,
        error,
        createSession,
        joinSession,
        addStory,
        startVoting,
        submitVote,
        revealVotes,
        finishVoting,
        nextStory,
        leaveSession,
        socket,
      }}
    >
      <NavigationHandler session={session} />
      {children}
    </PokerContext.Provider>
  );
};
