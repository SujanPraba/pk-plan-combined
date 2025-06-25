interface JiraCredentials {
    host: string;
    username: string;
    apiToken: string;
}
interface BacklogFilter {
    search?: string;
    types?: string[];
    priorities?: string[];
    statuses?: string[];
    labels?: string[];
    assignee?: string;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
}
export declare class JiraService {
    private getJiraClient;
    private getAuthHeaders;
    getAllProjects(credentials: JiraCredentials): Promise<any[]>;
    getAllUsers(credentials: JiraCredentials): Promise<any[]>;
    getAllStoriesForSprint(credentials: JiraCredentials, sprintId: string): Promise<any[]>;
    getStoriesForEpic(credentials: JiraCredentials, epicKey: string): Promise<any[]>;
    getBoardsForProject(credentials: JiraCredentials, projectKeyOrId: string): Promise<any[]>;
    getSprints(credentials: JiraCredentials, boardId: string): Promise<any[]>;
    getBacklogIssues(credentials: JiraCredentials, projectKeyOrId: string, filter?: BacklogFilter): Promise<any[]>;
    private handleJiraError;
}
export {};
