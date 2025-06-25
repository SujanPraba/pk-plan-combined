import { JiraService } from './jira.service';
export declare class JiraController {
    private readonly jiraService;
    constructor(jiraService: JiraService);
<<<<<<< HEAD
    private getCredentialsFromHeaders;
    getProjects(headers: Record<string, string>): Promise<any[]>;
    getUsers(headers: Record<string, string>): Promise<any[]>;
    getStories(headers: Record<string, string>, sprintId: string): Promise<any[]>;
    getEpicStories(headers: Record<string, string>, epicKey: string): Promise<any[]>;
    getBoards(headers: Record<string, string>, projectId: string): Promise<any[]>;
    getSprints(headers: Record<string, string>, boardId: string): Promise<any[]>;
    getBacklogIssues(headers: Record<string, string>, projectId: string, search?: string, types?: string, priorities?: string, statuses?: string, labels?: string, assignee?: string, orderBy?: string, orderDirection?: 'ASC' | 'DESC'): Promise<any[]>;
=======
    getAuthUrl(): Promise<{
        url: string;
        state: string;
    }>;
    handleCallback(body: {
        code: string;
    }): Promise<{
        access_token: any;
        refresh_token: any;
        expires_in: any;
    }>;
    getInstances(req: any): Promise<any>;
    getProjects(cloudId: string, req: any): Promise<any>;
    getSprints(projectId: string, cloudId: string, req: any): Promise<{
        id: any;
        name: any;
        state: any;
        startDate: any;
        endDate: any;
        boardId: any;
    }[]>;
    getStories(sprintId: string, cloudId: string, req: any): Promise<any>;
>>>>>>> eab6665975a1c83a54b7300a44f3ea72f0f4a69d
}
