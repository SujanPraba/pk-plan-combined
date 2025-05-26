"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RetroGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetroGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const retro_service_1 = require("./retro.service");
let RetroGateway = RetroGateway_1 = class RetroGateway {
    constructor(retroService) {
        this.retroService = retroService;
        this.logger = new common_1.Logger(RetroGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleCreateSession(client, payload) {
        try {
            const session = await this.retroService.createSession(payload.name, payload.username);
            client.join(session.sessionId);
            client.emit('retro_session_created', session);
        }
        catch (error) {
            this.logger.error(`Error creating retro session: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleJoinSession(client, payload) {
        try {
            const { session, user } = await this.retroService.joinSession(payload.sessionId, payload.username);
            client.join(session.sessionId);
            client.emit('retro_session_joined', { session, user });
            this.server.to(session.sessionId).emit('retro_session_updated', session);
        }
        catch (error) {
            this.logger.error(`Error joining retro session: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleRejoinSession(client, payload) {
        try {
            const session = await this.retroService.findBySessionId(payload.sessionId);
            client.join(session.sessionId);
            this.server.to(session.sessionId).emit('retro_session_updated', session);
        }
        catch (error) {
            this.logger.error(`Error rejoining retro session: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleAddItem(client, payload) {
        try {
            const updatedSession = await this.retroService.addItem(payload.sessionId, payload.userId, payload.content, payload.category);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error adding retro item: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleVoteItem(client, payload) {
        try {
            const updatedSession = await this.retroService.voteForItem(payload.sessionId, payload.userId, payload.itemId);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error voting for retro item: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleStartVoting(client, payload) {
        try {
            const updatedSession = await this.retroService.startVoting(payload.sessionId);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error starting retro voting: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleRevealVotes(client, payload) {
        try {
            const updatedSession = await this.retroService.revealVotes(payload.sessionId);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error revealing retro votes: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleFinishRetro(client, payload) {
        try {
            const updatedSession = await this.retroService.finishRetro(payload.sessionId);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error finishing retro: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleLeaveSession(client, payload) {
        try {
            this.logger.log(`User ${payload.userId} leaving session ${payload.sessionId}`);
            const updatedSession = await this.retroService.removeParticipant(payload.sessionId, payload.userId);
            client.leave(payload.sessionId);
            client.emit('session_left');
            if (updatedSession) {
                this.logger.log(`Notifying remaining participants about user leaving`);
                this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
            }
            else {
                this.logger.log(`Session ${payload.sessionId} was deleted (no participants remaining)`);
            }
        }
        catch (error) {
            this.logger.error(`Error leaving retro session: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleAddCategory(client, payload) {
        try {
            const updatedSession = await this.retroService.addCategory(payload.sessionId, payload.categoryName);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error adding retro category: ${error.message}`);
            client.emit('error', error.message);
        }
    }
    async handleRemoveCategory(client, payload) {
        try {
            const updatedSession = await this.retroService.removeCategory(payload.sessionId, payload.categoryName);
            this.server.to(payload.sessionId).emit('retro_session_updated', updatedSession);
        }
        catch (error) {
            this.logger.error(`Error removing retro category: ${error.message}`);
            client.emit('error', error.message);
        }
    }
};
exports.RetroGateway = RetroGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RetroGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('create_retro_session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleCreateSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_retro_session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleJoinSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('rejoin_retro_session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleRejoinSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add_retro_item'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleAddItem", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote_retro_item'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleVoteItem", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_retro_voting'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleStartVoting", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reveal_retro_votes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleRevealVotes", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('finish_retro'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleFinishRetro", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_retro_session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleLeaveSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add_retro_category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleAddCategory", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove_retro_category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RetroGateway.prototype, "handleRemoveCategory", null);
exports.RetroGateway = RetroGateway = RetroGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [retro_service_1.RetroService])
], RetroGateway);
//# sourceMappingURL=retro.gateway.js.map