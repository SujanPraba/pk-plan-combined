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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraMCPService = void 0;
const common_1 = require("@nestjs/common");
const mcp_nest_1 = require("@rekog/mcp-nest");
const zod_1 = require("zod");
const jira_service_1 = require("../services/jira.service");
let JiraMCPService = class JiraMCPService {
    constructor(jiraService) {
        this.jiraService = jiraService;
    }
    async authenticate(uri, { email, password }) {
        const result = await this.jiraService.login(email, password);
        return {
            uri: uri.href,
            text: JSON.stringify(result)
        };
    }
    async syncProjects(uri, { email, token }) {
        const projects = await this.jiraService.getProjectsForUser(email, token);
        return {
            uri: uri.href,
            text: JSON.stringify(projects)
        };
    }
    async syncSprints(uri, { email, token, projectId }) {
        const sprints = await this.jiraService.getSprintsForProject(email, token, projectId);
        return {
            uri: uri.href,
            text: JSON.stringify(sprints)
        };
    }
    async syncStories(uri, { email, token, sprintId }) {
        const stories = await this.jiraService.getStoriesForSprint(email, token, sprintId);
        return {
            uri: uri.href,
            text: JSON.stringify(stories)
        };
    }
    async runFullSync({ email, token, projectId, sprintId }) {
        const [projects, sprints, stories] = await Promise.all([
            this.jiraService.getProjectsForUser(email, token),
            this.jiraService.getSprintsForProject(email, token, projectId),
            this.jiraService.getStoriesForSprint(email, token, sprintId)
        ]);
        return {
            projects,
            sprints,
            stories,
            syncedAt: new Date().toISOString()
        };
    }
};
exports.JiraMCPService = JiraMCPService;
__decorate([
    (0, mcp_nest_1.Resource)({
        name: 'jira.auth',
        description: 'Authenticate with Jira',
        uri: 'mcp://jira/auth/{email}/{password}',
        mimeType: 'application/json'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [URL, Object]),
    __metadata("design:returntype", Promise)
], JiraMCPService.prototype, "authenticate", null);
__decorate([
    (0, mcp_nest_1.Resource)({
        name: 'jira.projects',
        description: 'Sync Jira projects',
        uri: 'mcp://jira/projects/{email}/{token}',
        mimeType: 'application/json'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [URL, Object]),
    __metadata("design:returntype", Promise)
], JiraMCPService.prototype, "syncProjects", null);
__decorate([
    (0, mcp_nest_1.Resource)({
        name: 'jira.sprints',
        description: 'Sync Jira sprints for a project',
        uri: 'mcp://jira/sprints/{email}/{token}/{projectId}',
        mimeType: 'application/json'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [URL, Object]),
    __metadata("design:returntype", Promise)
], JiraMCPService.prototype, "syncSprints", null);
__decorate([
    (0, mcp_nest_1.Resource)({
        name: 'jira.stories',
        description: 'Sync Jira stories for a sprint',
        uri: 'mcp://jira/stories/{email}/{token}/{sprintId}',
        mimeType: 'application/json'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [URL, Object]),
    __metadata("design:returntype", Promise)
], JiraMCPService.prototype, "syncStories", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'jira.fullSync',
        description: 'Trigger full Jira data sync',
        parameters: zod_1.z.object({
            email: zod_1.z.string().email(),
            token: zod_1.z.string(),
            projectId: zod_1.z.string(),
            sprintId: zod_1.z.number()
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JiraMCPService.prototype, "runFullSync", null);
exports.JiraMCPService = JiraMCPService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jira_service_1.JiraService])
], JiraMCPService);
//# sourceMappingURL=jira-mcp.service.js.map