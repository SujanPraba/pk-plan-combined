import { JiraService } from './jira.service';
export declare class JiraController {
    private readonly jiraService;
    constructor(jiraService: JiraService);
    private getCredentialsFromHeaders;
    getProjects(headers: Record<string, string>): Promise<any[]>;
    getUsers(headers: Record<string, string>): Promise<any[]>;
    getStories(headers: Record<string, string>, sprintId: string): Promise<any[]>;
    getEpicStories(headers: Record<string, string>, epicKey: string): Promise<any[]>;
    getBoards(headers: Record<string, string>, projectId: string): Promise<any[]>;
    getSprints(headers: Record<string, string>, boardId: string): Promise<any[]>;
    getBacklogIssues(headers: Record<string, string>, projectId: string, search?: string, types?: string, priorities?: string, statuses?: string, labels?: string, assignee?: string, orderBy?: string, orderDirection?: 'ASC' | 'DESC'): Promise<any[]>;
}
