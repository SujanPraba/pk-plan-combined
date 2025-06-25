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
const jira_service_1 = require("./jira.service");
let JiraController = class JiraController {
    constructor(jiraService) {
        this.jiraService = jiraService;
    }
    getCredentialsFromHeaders(headers) {
        const host = headers['jira-host'];
        const username = headers['jira-username'];
        const apiToken = headers['jira-api-token'];
        if (!host || !username || !apiToken) {
            throw new common_1.BadRequestException('Missing required Jira credentials in headers');
        }
        return { host, username, apiToken };
    }
    async getProjects(headers) {
        const credentials = this.getCredentialsFromHeaders(headers);
        return this.jiraService.getAllProjects(credentials);
    }
    async getUsers(headers) {
        const credentials = this.getCredentialsFromHeaders(headers);
        return this.jiraService.getAllUsers(credentials);
    }
    async getStories(headers, sprintId) {
        const credentials = this.getCredentialsFromHeaders(headers);
        return this.jiraService.getAllStoriesForSprint(credentials, sprintId);
    }
    async getEpicStories(headers, epicKey) {
        const credentials = this.getCredentialsFromHeaders(headers);
        return this.jiraService.getStoriesForEpic(credentials, epicKey);
    }
    async getBoards(headers, projectId) {
        const credentials = this.getCredentialsFromHeaders(headers);
        return this.jiraService.getBoardsForProject(credentials, projectId);
    }
    async getSprints(headers, boardId) {
        const credentials = this.getCredentialsFromHeaders(headers);
        return this.jiraService.getSprints(credentials, boardId);
    }
    async getBacklogIssues(headers, projectId, search, types, priorities, statuses, labels, assignee, orderBy, orderDirection) {
        const credentials = this.getCredentialsFromHeaders(headers);
        const filter = {
            search: search?.trim(),
            types: types?.trim() ? types.split(',').filter(Boolean) : undefined,
            priorities: priorities?.trim() ? priorities.split(',').filter(Boolean) : undefined,
            statuses: statuses?.trim() ? statuses.split(',').filter(Boolean) : undefined,
            labels: labels?.trim() ? labels.split(',').filter(Boolean) : undefined,
            assignee: assignee?.trim(),
            orderBy: orderBy?.trim(),
            orderDirection
        };
        return this.jiraService.getBacklogIssues(credentials, projectId, filter);
    }
};
exports.JiraController = JiraController;
__decorate([
    (0, common_1.Get)('projects'),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('stories'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Query)('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getStories", null);
__decorate([
    (0, common_1.Get)('epic-stories'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Query)('epicKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getEpicStories", null);
__decorate([
    (0, common_1.Get)('boards'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getBoards", null);
__decorate([
    (0, common_1.Get)('sprints'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Query)('boardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getSprints", null);
__decorate([
    (0, common_1.Get)('backlog'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('types')),
    __param(4, (0, common_1.Query)('priorities')),
    __param(5, (0, common_1.Query)('statuses')),
    __param(6, (0, common_1.Query)('labels')),
    __param(7, (0, common_1.Query)('assignee')),
    __param(8, (0, common_1.Query)('orderBy')),
    __param(9, (0, common_1.Query)('orderDirection')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], JiraController.prototype, "getBacklogIssues", null);
exports.JiraController = JiraController = __decorate([
    (0, common_1.Controller)('jira'),
    __metadata("design:paramtypes", [jira_service_1.JiraService])
], JiraController);
//# sourceMappingURL=jira.controller.js.map