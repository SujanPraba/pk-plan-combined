"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraService = void 0;
const common_1 = require("@nestjs/common");
const jira_client_1 = __importDefault(require("jira-client"));
const node_fetch_1 = __importDefault(require("node-fetch"));
let JiraService = class JiraService {
    getJiraClient(credentials) {
        return new jira_client_1.default({
            protocol: 'https',
            host: credentials.host,
            username: credentials.username,
            password: credentials.apiToken,
            apiVersion: '3',
            strictSSL: true
        });
    }
    getAuthHeaders(credentials) {
        const auth = Buffer.from(`${credentials.username}:${credentials.apiToken}`).toString('base64');
        return {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
        };
    }
    async getAllProjects(credentials) {
        try {
            const response = await (0, node_fetch_1.default)(`https://${credentials.host}/rest/api/3/project/search?maxResults=200`, {
                method: 'GET',
                headers: this.getAuthHeaders(credentials)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.values.map(project => ({
                id: project.id,
                key: project.key,
                name: project.name,
                lead: project.lead ? project.lead.displayName : null,
                avatarUrl: project.avatarUrls ? project.avatarUrls['48x48'] : null
            }));
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch Jira projects');
        }
    }
    async getAllUsers(credentials) {
        try {
            const jira = this.getJiraClient(credentials);
            const users = await jira.searchUsers({
                query: '+',
                maxResults: 1000
            });
            return users.map(user => ({
                id: user.accountId,
                name: user.displayName,
                email: user.emailAddress,
                avatarUrl: user.avatarUrls['48x48']
            }));
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch Jira users');
        }
    }
    async getAllStoriesForSprint(credentials, sprintId) {
        try {
            const jira = this.getJiraClient(credentials);
            const jql = `Sprint = ${sprintId} AND issuetype = Story`;
            const result = await jira.searchJira(jql, {
                maxResults: 1000,
                fields: ['summary', 'description', 'status', 'customfield_10004']
            });
            return result.issues;
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch stories from Jira');
        }
    }
    async getStoriesForEpic(credentials, epicKey) {
        try {
            const jira = this.getJiraClient(credentials);
            const jql = `"Epic Link" = "${epicKey}"`;
            const result = await jira.searchJira(jql);
            return result.issues;
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch epic stories');
        }
    }
    async getBoardsForProject(credentials, projectKeyOrId) {
        try {
            const response = await (0, node_fetch_1.default)(`https://${credentials.host}/rest/agile/1.0/board?projectKeyOrId=${projectKeyOrId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(credentials)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.values;
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch boards');
        }
    }
    async getSprints(credentials, boardId) {
        try {
            const response = await (0, node_fetch_1.default)(`https://${credentials.host}/rest/agile/1.0/board/${boardId}/sprint`, {
                method: 'GET',
                headers: this.getAuthHeaders(credentials)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.values;
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch sprints');
        }
    }
    async getBacklogIssues(credentials, projectKeyOrId, filter) {
        try {
            const jira = this.getJiraClient(credentials);
            let jql = `project = "${projectKeyOrId}" AND sprint is EMPTY`;
            if (filter?.types?.length) {
                const quotedTypes = filter.types
                    .map(type => type.trim())
                    .filter(Boolean)
                    .map(type => `"${type}"`);
                if (quotedTypes.length) {
                    jql += ` AND issuetype in (${quotedTypes.join(',')})`;
                }
            }
            if (filter?.priorities?.length) {
                const quotedPriorities = filter.priorities
                    .map(priority => priority.trim())
                    .filter(Boolean)
                    .map(priority => `"${priority}"`);
                if (quotedPriorities.length) {
                    jql += ` AND priority in (${quotedPriorities.join(',')})`;
                }
            }
            if (filter?.statuses?.length) {
                const quotedStatuses = filter.statuses
                    .map(status => status.trim())
                    .filter(Boolean)
                    .map(status => `"${status}"`);
                if (quotedStatuses.length) {
                    jql += ` AND status in (${quotedStatuses.join(',')})`;
                }
            }
            if (filter?.labels?.length) {
                const quotedLabels = filter.labels
                    .map(label => label.trim())
                    .filter(Boolean)
                    .map(label => `"${label}"`);
                if (quotedLabels.length) {
                    jql += ` AND labels in (${quotedLabels.join(',')})`;
                }
            }
            if (filter?.assignee?.trim()) {
                jql += ` AND assignee = "${filter.assignee.trim()}"`;
            }
            if (filter?.search?.trim()) {
                jql += ` AND (summary ~ "${filter.search.trim()}" OR description ~ "${filter.search.trim()}")`;
            }
            if (filter?.orderBy?.trim()) {
                jql += ` ORDER BY ${filter.orderBy.trim()} ${filter.orderDirection || 'ASC'}`;
            }
            else {
                jql += ' ORDER BY Rank ASC';
            }
            console.log('JQL Query:', jql);
            const result = await jira.searchJira(jql, {
                maxResults: 1000,
                fields: [
                    'summary',
                    'description',
                    'issuetype',
                    'priority',
                    'status',
                    'assignee',
                    'reporter',
                    'created',
                    'updated',
                    'customfield_10004',
                    'labels',
                    'rank'
                ]
            });
            return result.issues.map(issue => ({
                id: issue.id,
                key: issue.key,
                summary: issue.fields.summary,
                description: issue.fields.description,
                type: issue.fields.issuetype.name,
                priority: issue.fields.priority?.name,
                status: issue.fields.status.name,
                assignee: issue.fields.assignee ? {
                    id: issue.fields.assignee.accountId,
                    name: issue.fields.assignee.displayName,
                    email: issue.fields.assignee.emailAddress,
                    avatarUrl: issue.fields.assignee.avatarUrls['48x48']
                } : null,
                reporter: issue.fields.reporter ? {
                    id: issue.fields.reporter.accountId,
                    name: issue.fields.reporter.displayName,
                    email: issue.fields.reporter.emailAddress,
                    avatarUrl: issue.fields.reporter.avatarUrls['48x48']
                } : null,
                storyPoints: issue.fields.customfield_10004,
                labels: issue.fields.labels,
                created: issue.fields.created,
                updated: issue.fields.updated,
                rank: issue.fields.rank
            }));
        }
        catch (error) {
            this.handleJiraError(error);
            throw new common_1.BadRequestException('Failed to fetch backlog issues');
        }
    }
    handleJiraError(error) {
        if (error.statusCode === 429) {
            const retryAfter = error.headers ? error.headers['retry-after'] || 60 : 60;
            console.log(`Rate limited. Retry after ${retryAfter} seconds`);
        }
        console.error('Jira API error:', error.message);
    }
};
exports.JiraService = JiraService;
exports.JiraService = JiraService = __decorate([
    (0, common_1.Injectable)()
], JiraService);
//# sourceMappingURL=jira.service.js.map