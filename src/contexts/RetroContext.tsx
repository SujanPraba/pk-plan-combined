import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

export interface RetroItem {
  id: string;
  content: string;
  category: string;
  votes: number;
  userId: string;
  userName: string;
}

export interface RetroSession {
  sessionId: string;
  id: string;
  name: string;
  participants: RetroUser[];
  items: RetroItem[];
  categories: string[];
  isVotingPhase: boolean;
  hasVotesRevealed: boolean;
  createdAt: Date;
}

export interface RetroUser {
  id: string;
  name: string;
  isHost: boolean;
  remainingVotes: number;
}

interface RetroContextType {
  session: RetroSession | null;
  currentUser: RetroUser | null;
  loading: boolean;
  error: string | null;
  createSession: (name: string, username: string) => void;
  joinSession: (sessionId: string, username: string) => void;
  addItem: (content: string, category: string) => void;
  voteForItem: (itemId: string) => void;
  startVoting: () => void;
  revealVotes: () => void;
  finishRetro: () => void;
  leaveSession: () => void;
  socket: Socket | null;
}

const RetroContext = createContext<RetroContextType | undefined>(undefined);

export const useRetro = () => {
  const context = useContext(RetroContext);
  if (!context) {
    throw new Error('useRetro must be used within a RetroProvider');
  }
  return context;
};

interface RetroProviderProps {
  children: ReactNode;
}

// Add NavigationHandler component at the top level
const NavigationHandler = ({ session }: { session: RetroSession | null }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/retro');
    }
  }, [session, navigate]);

  return null;
};

export const RetroProvider = ({ children }: RetroProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<RetroSession | null>(() => {
    const savedSession = localStorage.getItem('retroSession');
    return savedSession ? JSON.parse(savedSession) : null;
  });
  const [currentUser, setCurrentUser] = useState<RetroUser | null>(() => {
    const savedUser = localStorage.getItem('retroUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      localStorage.setItem('retroSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('retroSession');
    }
  }, [session]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('retroUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('retroUser');
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('Connecting to socket server...');
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
    });

    const setupSocketListeners = (socketInstance: Socket) => {
      socketInstance.on('retro_session_created', (newSession: RetroSession) => {
        setSession(newSession);
        setCurrentUser(newSession.participants.find(p => p.isHost));
        setLoading(false);
      });

      socketInstance.on('retro_session_joined', (data: { session: RetroSession; user: RetroUser }) => {
        setSession(data.session);
        setCurrentUser(data.user);
        setLoading(false);
      });

      socketInstance.on('retro_session_updated', (updatedSession: RetroSession) => {
        setSession(updatedSession);
        // Update current user's data from the updated session
        if (currentUser) {
          const updatedUser = updatedSession.participants.find(p => p.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
      });

      socketInstance.on('session_left', () => {
        // Clear all session data
        setSession(null);
        setCurrentUser(null);
        localStorage.removeItem('retroSession');
        localStorage.removeItem('retroUser');
        navigate('/');
      });

      socketInstance.on('error', (error: string) => {
        setError(error);
        setLoading(false);
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected with ID:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    };

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      setupSocketListeners(socketInstance);
      
      if (session) {
        socketInstance.emit('rejoin_retro_session', {
          sessionId: session.sessionId,
          userId: currentUser?.id
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      console.log('Disconnecting socket...');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, []);

  const createSession = (name: string, username: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit('create_retro_session', { name, username });
  };

  const joinSession = (sessionId: string, username: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit('join_retro_session', { sessionId, username });
  };

  const addItem = (content: string, category: string) => {
    if (!socket || !session || !currentUser) {
      console.error('Cannot add item - missing required data:', { socket: !!socket, session: !!session, currentUser: !!currentUser });
      return;
    }
    console.log('Adding item:', { content, category, sessionId: session.sessionId, userId: currentUser.id });
    socket.emit('add_retro_item', {
      sessionId: session.sessionId,
      userId: currentUser.id,
      content,
      category
    });
  };

  const voteForItem = (itemId: string) => {
    if (!socket || !session || !currentUser) return;
    socket.emit('vote_retro_item', {
      sessionId: session.id,
      itemId,
      userId: currentUser.id
    });
  };

  const startVoting = () => {
    if (!socket || !session) return;
    socket.emit('start_retro_voting', { sessionId: session.id });
  };

  const revealVotes = () => {
    if (!socket || !session) return;
    socket.emit('reveal_retro_votes', { sessionId: session.id });
  };

  const finishRetro = () => {
    if (!socket || !session) return;
    socket.emit('finish_retro', { sessionId: session.id });
  };

  const leaveSession = () => {
    if (!socket || !session || !currentUser) return;
    socket.emit('leave_retro_session', {
      sessionId: session.sessionId,
      userId: currentUser.id
    });
  };

  return (
    <RetroContext.Provider
      value={{
        session,
        currentUser,
        loading,
        error,
        createSession,
        joinSession,
        addItem,
        voteForItem,
        startVoting,
        revealVotes,
        finishRetro,
        leaveSession,
        socket,
      }}
    >
      <NavigationHandler session={session} />
      {children}
    </RetroContext.Provider>
  );
};