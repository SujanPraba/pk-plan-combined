import { JiraService } from '../services/jira.service';
export declare class JiraMCPService {
    private readonly jiraService;
    constructor(jiraService: JiraService);
    authenticate(uri: URL, { email, password }: {
        email: any;
        password: any;
    }): Promise<{
        uri: string;
        text: string;
    }>;
    syncProjects(uri: URL, { email, token }: {
        email: any;
        token: any;
    }): Promise<{
        uri: string;
        text: string;
    }>;
    syncSprints(uri: URL, { email, token, projectId }: {
        email: any;
        token: any;
        projectId: any;
    }): Promise<{
        uri: string;
        text: string;
    }>;
    syncStories(uri: URL, { email, token, sprintId }: {
        email: any;
        token: any;
        sprintId: any;
    }): Promise<{
        uri: string;
        text: string;
    }>;
    runFullSync({ email, token, projectId, sprintId }: {
        email: any;
        token: any;
        projectId: any;
        sprintId: any;
    }): Promise<{
        projects: {
            success: boolean;
            data?: import("../types/jira.types").JiraProject[];
            error?: string;
        };
        sprints: {
            success: boolean;
            data?: import("../types/jira.types").JiraSprint[];
            error?: string;
        };
        stories: {
            success: boolean;
            data?: import("../types/jira.types").JiraStory[];
            error?: string;
        };
        syncedAt: string;
    }>;
}
