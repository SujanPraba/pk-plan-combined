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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RetroService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const retro_session_entity_1 = require("./entities/retro-session.entity");
const retro_user_entity_1 = require("./entities/retro-user.entity");
const retro_item_entity_1 = require("./entities/retro-item.entity");
const uuid_1 = require("uuid");
let RetroService = RetroService_1 = class RetroService {
    constructor(retroSessionRepository, retroUserRepository, retroItemRepository) {
        this.retroSessionRepository = retroSessionRepository;
        this.retroUserRepository = retroUserRepository;
        this.retroItemRepository = retroItemRepository;
        this.logger = new common_1.Logger(RetroService_1.name);
    }
    async createSession(name, username) {
        const sessionId = (0, uuid_1.v4)();
        const userId = (0, uuid_1.v4)();
        const session = await this.retroSessionRepository.save({
            sessionId,
            name,
            isVotingPhase: false,
            hasVotesRevealed: false,
            categories: ['went_well'],
        });
        await this.retroUserRepository.save({
            id: userId,
            sessionId,
            name: username,
            isHost: true,
            remainingVotes: 3,
        });
        return this.findBySessionId(sessionId);
    }
    async joinSession(sessionId, username) {
        const session = await this.findBySessionId(sessionId);
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${sessionId} not found`);
        }
        const userId = (0, uuid_1.v4)();
        const user = await this.retroUserRepository.save({
            id: userId,
            sessionId,
            name: username,
            isHost: false,
            remainingVotes: 3,
        });
        return {
            session: await this.findBySessionId(sessionId),
            user,
        };
    }
    async findBySessionId(sessionId) {
        const session = await this.retroSessionRepository.findOne({
            where: { sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${sessionId} not found`);
        }
        const participants = await this.retroUserRepository.find({
            where: { sessionId },
        });
        const items = await this.retroItemRepository.find({
            where: { sessionId },
        });
        return {
            ...session,
            participants,
            items,
        };
    }
    async addItem(sessionId, userId, content, category) {
        const session = await this.findBySessionId(sessionId);
        const user = await this.retroUserRepository.findOne({
            where: { id: userId, sessionId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User not found in session`);
        }
        if (!session.categories.includes(category)) {
            throw new Error(`Category ${category} does not exist in this session`);
        }
        await this.retroItemRepository.save({
            id: (0, uuid_1.v4)(),
            sessionId,
            content,
            category,
            userId,
            userName: user.name,
            votes: 0,
        });
        return this.findBySessionId(sessionId);
    }
    async voteForItem(sessionId, userId, itemId) {
        const session = await this.findBySessionId(sessionId);
        const user = await this.retroUserRepository.findOne({
            where: { id: userId, sessionId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User not found in session`);
        }
        if (user.remainingVotes <= 0) {
            throw new Error('No remaining votes');
        }
        const item = await this.retroItemRepository.findOne({
            where: { id: itemId, sessionId },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Item not found`);
        }
        await this.retroItemRepository.update(itemId, {
            votes: item.votes + 1,
        });
        await this.retroUserRepository.update(userId, {
            remainingVotes: user.remainingVotes - 1,
        });
        return this.findBySessionId(sessionId);
    }
    async startVoting(sessionId) {
        await this.retroSessionRepository.update(sessionId, {
            isVotingPhase: true,
        });
        return this.findBySessionId(sessionId);
    }
    async revealVotes(sessionId) {
        await this.retroSessionRepository.update(sessionId, {
            hasVotesRevealed: true,
        });
        return this.findBySessionId(sessionId);
    }
    async finishRetro(sessionId) {
        await this.retroSessionRepository.update(sessionId, {
            isVotingPhase: false,
            hasVotesRevealed: false,
        });
        await this.retroUserRepository.update({ sessionId }, { remainingVotes: 3 });
        return this.findBySessionId(sessionId);
    }
    async removeParticipant(sessionId, userId) {
        try {
            const user = await this.retroUserRepository.findOne({
                where: { id: userId, sessionId }
            });
            if (!user) {
                this.logger.warn(`User ${userId} not found in session ${sessionId}`);
                return this.findBySessionId(sessionId);
            }
            await this.retroUserRepository.delete({ id: userId, sessionId });
            const remainingParticipants = await this.retroUserRepository.find({ where: { sessionId } });
            if (remainingParticipants.length === 0) {
                await this.retroItemRepository.delete({ sessionId });
                await this.retroSessionRepository.delete({ sessionId });
                return null;
            }
            if (user.isHost && remainingParticipants.length > 0) {
                const newHost = remainingParticipants[0];
                await this.retroUserRepository.update({ id: newHost.id }, { isHost: true });
            }
            return this.findBySessionId(sessionId);
        }
        catch (error) {
            this.logger.error(`Error removing participant: ${error.message}`);
            throw error;
        }
    }
    async addCategory(sessionId, categoryName) {
        const session = await this.findBySessionId(sessionId);
        if (session.categories.includes(categoryName)) {
            throw new Error('Category already exists');
        }
        session.categories.push(categoryName);
        await this.retroSessionRepository.update(sessionId, {
            categories: session.categories,
        });
        return this.findBySessionId(sessionId);
    }
    async removeCategory(sessionId, categoryName) {
        const session = await this.findBySessionId(sessionId);
        if (!session.categories.includes(categoryName)) {
            throw new Error('Category does not exist');
        }
        if (session.categories.length === 1) {
            throw new Error('Cannot remove the last category');
        }
        session.categories = session.categories.filter(c => c !== categoryName);
        await this.retroSessionRepository.update(sessionId, {
            categories: session.categories,
        });
        await this.retroItemRepository.delete({
            sessionId,
            category: categoryName,
        });
        return this.findBySessionId(sessionId);
    }
    async exportToCSV(sessionId) {
        const session = await this.findBySessionId(sessionId);
        let csvContent = '\ufeff';
        csvContent += 'Project Details\n';
        csvContent += `Project Name,${session.name}\n`;
        csvContent += `Session ID,${session.sessionId}\n`;
        csvContent += `Created At,${session.createdAt.toISOString()}\n\n`;
        csvContent += 'Team Members\n';
        csvContent += 'Name,Role\n';
        session.participants.forEach(participant => {
            csvContent += `${this.escapeCsvField(participant.name)},${participant.isHost ? 'Host' : 'Member'}\n`;
        });
        csvContent += '\n';
        csvContent += 'Retro Items By Category\n';
        const itemsByCategory = session.categories.map(category => ({
            category,
            items: session.items.filter(item => item.category === category)
                .map(item => ({
                content: item.content,
                author: item.userName
            }))
        }));
        const maxItems = Math.max(...itemsByCategory.map(cat => cat.items.length));
        itemsByCategory.forEach(cat => {
            csvContent += `${cat.category} - Item,${cat.category} - Author,`;
        });
        csvContent += '\n';
        for (let i = 0; i < maxItems; i++) {
            itemsByCategory.forEach(cat => {
                const item = cat.items[i] || { content: '', author: '' };
                csvContent += `${this.escapeCsvField(item.content)},`;
                csvContent += `${this.escapeCsvField(item.author)},`;
            });
            csvContent += '\n';
        }
        csvContent += '\n';
        csvContent += 'Summary\n';
        const totalItems = session.items.length;
        csvContent += `Total Items,${totalItems}\n`;
        itemsByCategory.forEach(({ category, items }) => {
            csvContent += `${category} Items,${items.length}\n`;
        });
        return csvContent;
    }
    escapeCsvField(field) {
        if (!field)
            return '';
        const escaped = field.replace(/"/g, '""');
        return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
    }
};
exports.RetroService = RetroService;
exports.RetroService = RetroService = RetroService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(retro_session_entity_1.RetroSession)),
    __param(1, (0, typeorm_1.InjectRepository)(retro_user_entity_1.RetroUser)),
    __param(2, (0, typeorm_1.InjectRepository)(retro_item_entity_1.RetroItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RetroService);
//# sourceMappingURL=retro.service.js.map