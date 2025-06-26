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
  const navigate = useNavigate();

  // Save session and user data to localStorage whenever they change
  useEffect(() => {
    if (session) {
      console.log('Saving session to localStorage:', JSON.stringify(session, null, 2));
      localStorage.setItem('pokerSession', JSON.stringify(session));
    } else {
      console.log('Clearing session from localStorage');
      localStorage.removeItem('pokerSession');
    }
  }, [session]);

  useEffect(() => {
    if (currentUser) {
      console.log('Saving user to localStorage:', JSON.stringify(currentUser, null, 2));
      localStorage.setItem('pokerUser', JSON.stringify(currentUser));
    } else {
      console.log('Clearing user from localStorage');
      localStorage.removeItem('pokerUser');
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('Connecting to socket server...');
    let isComponentMounted = true;

    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    const setupSocketListeners = (socketInstance: Socket) => {
      socketInstance.on('session_created', (newSession: PokerSession) => {
        if (!isComponentMounted) return;
        console.log('Session created event received:', JSON.stringify(newSession, null, 2));
        // Clear any existing session data first
        localStorage.removeItem('pokerSession');
        localStorage.removeItem('pokerUser');
        setSession(newSession);
        const host = newSession.participants.find(p => p.isHost);
        console.log('Setting current user as host:', JSON.stringify(host, null, 2));
        setCurrentUser(host);
        setLoading(false);
      });

      socketInstance.on('session_joined', (data: { session: PokerSession; user: User }) => {
        if (!isComponentMounted) return;
        console.log('Session joined event received:', JSON.stringify(data, null, 2));
        // Clear any existing session data first
        localStorage.removeItem('pokerSession');
        localStorage.removeItem('pokerUser');
        setSession(data.session);
        setCurrentUser(data.user);
        setLoading(false);
      });

      socketInstance.on('session_updated', (updatedSession: PokerSession) => {
        if (!isComponentMounted) return;
        // Only update if this update is for our current session
        if (session && session.id !== updatedSession.id) {
          console.log('Ignoring update for different session', {
            currentSessionId: session.id,
            updatedSessionId: updatedSession.id
          });
          return;
        }
        console.log('Session updated event received:', JSON.stringify(updatedSession, null, 2));
        setSession(updatedSession);
        if (currentUser) {
          const updatedUser = updatedSession.participants.find(p => p.id === currentUser.id);
          if (updatedUser) {
            console.log('Updating current user:', JSON.stringify(updatedUser, null, 2));
            setCurrentUser(updatedUser);
          }
        }
      });

      socketInstance.on('session_left', () => {
        if (!isComponentMounted) return;
        console.log('Session left event received');
        // Clear all session data
        setSession(null);
        setCurrentUser(null);
        localStorage.removeItem('pokerSession');
        localStorage.removeItem('pokerUser');
        navigate('/');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, reconnect manually
          socketInstance.connect();
        }
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setError('Failed to connect to the server. Please check if the server is running.');
        setLoading(false);
      });
    };

    // Set up initial socket listeners
    setupSocketListeners(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      if (session) {
        console.log('Rejoining session:', session.id);
        socketInstance.emit('rejoin_session', {
          sessionId: session.id,
          userId: currentUser?.id
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection...');
      isComponentMounted = false;
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, []); // Remove dependencies to prevent reconnection

  const createSession = (name: string, votingSystem: 'fibonacci' | 'tshirt', username: string) => {
    if (!socket) return;
    // Clear existing session data from localStorage
    localStorage.removeItem('pokerSession');
    localStorage.removeItem('pokerUser');
    setSession(null);
    setCurrentUser(null);
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
    // Clear all session data first
    localStorage.removeItem('pokerSession');
    localStorage.removeItem('pokerUser');
    setSession(null);
    setCurrentUser(null);
    // Emit leave session event to server
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
