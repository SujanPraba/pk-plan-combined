import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RetroService } from './retro.service';
export declare class RetroGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly retroService;
    server: Server;
    private readonly logger;
    constructor(retroService: RetroService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleCreateSession(client: Socket, payload: {
        name: string;
        username: string;
    }): Promise<void>;
    handleJoinSession(client: Socket, payload: {
        sessionId: string;
        username: string;
    }): Promise<void>;
    handleRejoinSession(client: Socket, payload: {
        sessionId: string;
        userId: string;
    }): Promise<void>;
    handleAddItem(client: Socket, payload: {
        sessionId: string;
        userId: string;
        content: string;
        category: string;
    }): Promise<void>;
    handleVoteItem(client: Socket, payload: {
        sessionId: string;
        userId: string;
        itemId: string;
    }): Promise<void>;
    handleStartVoting(client: Socket, payload: {
        sessionId: string;
    }): Promise<void>;
    handleRevealVotes(client: Socket, payload: {
        sessionId: string;
    }): Promise<void>;
    handleFinishRetro(client: Socket, payload: {
        sessionId: string;
    }): Promise<void>;
    handleLeaveSession(client: Socket, payload: {
        sessionId: string;
        userId: string;
    }): Promise<void>;
    handleAddCategory(client: Socket, payload: {
        sessionId: string;
        categoryName: string;
    }): Promise<void>;
    handleRemoveCategory(client: Socket, payload: {
        sessionId: string;
        categoryName: string;
    }): Promise<void>;
}
