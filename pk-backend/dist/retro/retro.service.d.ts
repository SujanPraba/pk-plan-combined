import { Repository } from 'typeorm';
import { RetroSession } from './entities/retro-session.entity';
import { RetroUser } from './entities/retro-user.entity';
import { RetroItem } from './entities/retro-item.entity';
export interface RetroSessionWithRelations extends RetroSession {
    participants: RetroUser[];
    items: RetroItem[];
}
export declare class RetroService {
    private retroSessionRepository;
    private retroUserRepository;
    private retroItemRepository;
    private readonly logger;
    constructor(retroSessionRepository: Repository<RetroSession>, retroUserRepository: Repository<RetroUser>, retroItemRepository: Repository<RetroItem>);
    createSession(name: string, username: string): Promise<RetroSessionWithRelations>;
    joinSession(sessionId: string, username: string): Promise<{
        session: RetroSessionWithRelations;
        user: RetroUser;
    }>;
    findBySessionId(sessionId: string): Promise<RetroSessionWithRelations>;
    addItem(sessionId: string, userId: string, content: string, category: string): Promise<RetroSessionWithRelations>;
    voteForItem(sessionId: string, userId: string, itemId: string): Promise<RetroSessionWithRelations>;
    startVoting(sessionId: string): Promise<RetroSessionWithRelations>;
    revealVotes(sessionId: string): Promise<RetroSessionWithRelations>;
    finishRetro(sessionId: string): Promise<RetroSessionWithRelations>;
    removeParticipant(sessionId: string, userId: string): Promise<RetroSessionWithRelations | null>;
    addCategory(sessionId: string, categoryName: string): Promise<RetroSessionWithRelations>;
    removeCategory(sessionId: string, categoryName: string): Promise<RetroSessionWithRelations>;
    exportToCSV(sessionId: string): Promise<string>;
    private escapeCsvField;
}
