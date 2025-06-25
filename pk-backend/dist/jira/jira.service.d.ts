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
<<<<<<< HEAD
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
=======
    private readonly configService;
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectUri;
    constructor(configService: ConfigService);
    getAuthUrl(): {
        url: string;
        state: string;
    };
    exchangeCodeForToken(code: string): Promise<{
        access_token: any;
        refresh_token: any;
        expires_in: any;
    }>;
    getAccessibleResources(accessToken: string): Promise<any>;
    getProjects(cloudId: string, accessToken: string): Promise<any>;
    getSprints(projectId: string, cloudId: string, accessToken: string): Promise<{
        id: any;
        name: any;
        state: any;
        startDate: any;
        endDate: any;
        boardId: any;
    }[]>;
    getStoriesFromSprint(sprintId: string, cloudId: string, accessToken: string): Promise<any>;
>>>>>>> eab6665975a1c83a54b7300a44f3ea72f0f4a69d
}
export {};
