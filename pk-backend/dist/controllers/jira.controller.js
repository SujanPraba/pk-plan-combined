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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraController = void 0;
const common_1 = require("@nestjs/common");
const jira_service_1 = require("../services/jira.service");
let JiraController = class JiraController {
    constructor(jiraService) {
        this.jiraService = jiraService;
    }
    async login(authRequest) {
        return this.jiraService.login(authRequest.email, authRequest.password);
    }
    extractCredentials(headers) {
        const email = headers['x-jira-email'];
        const token = headers['x-jira-token'];
        if (!email || !token) {
            throw new common_1.UnauthorizedException('Missing Jira credentials');
        }
        return { email, token };
    }
    async getProjects(headers, request) {
        const credentials = this.extractCredentials(headers);
        const response = await this.jiraService.getProjectsForUser(credentials.email, credentials.token);
        return { success: response.success, data: response.data || [], error: response.error };
    }
    async getSprints(headers, request) {
        const credentials = this.extractCredentials(headers);
        const response = await this.jiraService.getSprintsForProject(credentials.email, credentials.token, request.projectId);
        return { success: response.success, data: response.data || [], error: response.error };
    }
    async getStories(headers, request) {
        const credentials = this.extractCredentials(headers);
        const response = await this.jiraService.getStoriesForSprint(credentials.email, credentials.token, Number(request.sprintId));
        return { success: response.success, data: response.data || [], error: response.error };
    }
    async importStories(headers, request) {
        this.extractCredentials(headers);
        const response = await this.jiraService.importStories(request.sessionId, request.stories);
        if (!response.success || !response.data) {
            return { success: false, data: [], error: response.error };
        }
        const jiraStories = response.data.map(story => ({
            id: story.id,
            key: story.id,
            self: '',
            fields: {
                summary: story.title,
                description: story.description,
                issuetype: { id: '1', name: 'Story', iconUrl: '' },
                status: { id: '1', name: story.status, statusCategory: { id: 1, key: 'new', name: 'New' } },
                labels: []
            }
        }));
        return { success: true, data: jiraStories };
    }
};
exports.JiraController = JiraController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('projects'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Post)('sprints'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getSprints", null);
__decorate([
    (0, common_1.Post)('stories'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getStories", null);
__decorate([
    (0, common_1.Post)('stories/import'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "importStories", null);
exports.JiraController = JiraController = __decorate([
    (0, common_1.Controller)('api/jira'),
    __metadata("design:paramtypes", [jira_service_1.JiraService])
], JiraController);
//# sourceMappingURL=jira.controller.js.map