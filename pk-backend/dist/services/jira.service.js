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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var JiraService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const story_entity_1 = require("../session/entities/story.entity");
const session_entity_1 = require("../session/entities/session.entity");
const axios_1 = __importDefault(require("axios"));
let JiraService = JiraService_1 = class JiraService {
    constructor(configService, storyRepository, sessionRepository) {
        this.configService = configService;
        this.storyRepository = storyRepository;
        this.sessionRepository = sessionRepository;
        this.logger = new common_1.Logger(JiraService_1.name);
    }
    async login(email, password) {
        try {
            const domain = email.split('@')[1];
            const jiraUrl = `https://${domain.split('.')[0]}.atlassian.net`;
            const credentials = Buffer.from(`${email}:${password}`).toString('base64');
            const response = await axios_1.default.get(`${jiraUrl}/rest/api/2/myself`, {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Accept': 'application/json',
                    'X-Atlassian-Token': 'no-check'
                },
                validateStatus: (status) => status < 500
            });
            if (response.status === 401 || response.status === 403) {
                return {
                    success: false,
                    error: 'Invalid credentials. Please note that Jira Cloud requires an API token for authentication. You can generate one at https://id.atlassian.com/manage-profile/security/api-tokens'
                };
            }
            if (!response.data || !response.data.emailAddress) {
                return { success: false, error: 'Invalid response from Jira' };
            }
            const tokenData = {
                credentials: credentials,
                baseUrl: jiraUrl,
                email: email
            };
            return {
                success: true,
                token: Buffer.from(JSON.stringify(tokenData)).toString('base64')
            };
        }
        catch (error) {
            this.logger.error('Failed to authenticate with Jira:', error.response?.data || error.message);
            if (error.response?.status === 401 || error.response?.status === 403) {
                return {
                    success: false,
                    error: 'Authentication failed. Jira Cloud requires an API token for authentication. Generate one at https://id.atlassian.com/manage-profile/security/api-tokens'
                };
            }
            return {
                success: false,
                error: 'Failed to connect to Jira. Please check your email domain is correct.'
            };
        }
    }
    getAuthHeaders(token) {
        try {
            const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
            return {
                'Authorization': `Basic ${tokenData.credentials}`,
                'Accept': 'application/json',
                'X-Atlassian-Token': 'no-check',
                'Content-Type': 'application/json'
            };
        }
        catch (error) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    getBaseUrl(token) {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
        return tokenData.baseUrl;
    }
    async getProjectsForUser(email, token) {
        try {
            const baseUrl = this.getBaseUrl(token);
            const response = await axios_1.default.get(`${baseUrl}/rest/api/2/project`, {
                headers: this.getAuthHeaders(token)
            });
            return { success: true, data: response.data };
        }
        catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch Jira projects';
            this.logger.error(`Projects error: ${message}`, error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                return { success: false, error: 'Authentication failed. Please check your credentials or generate a new API token.' };
            }
            return { success: false, error: message };
        }
    }
    async getSprintsForProject(email, token, projectId) {
        try {
            const baseUrl = this.getBaseUrl(token);
            const boardsResponse = await axios_1.default.get(`${baseUrl}/rest/agile/1.0/board?projectKeyOrId=${projectId}`, {
                headers: this.getAuthHeaders(token)
            });
            const boards = boardsResponse.data.values;
            if (!boards.length) {
                return { success: true, data: [] };
            }
            const boardId = boards[0].id;
            const sprintsResponse = await axios_1.default.get(`${baseUrl}/rest/agile/1.0/board/${boardId}/sprint`, {
                headers: this.getAuthHeaders(token)
            });
            return { success: true, data: sprintsResponse.data.values };
        }
        catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch Jira sprints';
            this.logger.error(`Sprints error: ${message}`, error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                return { success: false, error: 'Authentication failed. Please check your credentials or generate a new API token.' };
            }
            return { success: false, error: message };
        }
    }
    async getStoriesForSprint(email, token, sprintId) {
        try {
            const baseUrl = this.getBaseUrl(token);
            const response = await axios_1.default.get(`${baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue`, {
                headers: this.getAuthHeaders(token),
                params: {
                    fields: 'summary,description,issuetype,status,customfield_10004'
                }
            });
            return { success: true, data: response.data.issues };
        }
        catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch Jira stories';
            this.logger.error(`Stories error: ${message}`, error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                return { success: false, error: 'Authentication failed. Please check your credentials or generate a new API token.' };
            }
            return { success: false, error: message };
        }
    }
    async importStories(sessionId, jiraStories) {
        try {
            const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
            if (!session) {
                return { success: false, error: 'Session not found' };
            }
            const stories = jiraStories.map(jiraStory => {
                const story = new story_entity_1.Story();
                story.title = jiraStory.fields.summary;
                story.description = jiraStory.fields.description || '';
                story.session = session;
                story.status = jiraStory.fields.status?.name || 'Not Started';
                story.votes = {};
                return story;
            });
            const savedStories = await this.storyRepository.save(stories);
            return { success: true, data: savedStories };
        }
        catch (error) {
            this.logger.error('Failed to import stories:', error);
            return { success: false, error: 'Failed to import stories' };
        }
    }
};
exports.JiraService = JiraService;
exports.JiraService = JiraService = JiraService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(story_entity_1.Story)),
    __param(2, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], JiraService);
//# sourceMappingURL=jira.service.js.map