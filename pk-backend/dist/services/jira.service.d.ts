import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Story } from '../session/entities/story.entity';
import { Session } from '../session/entities/session.entity';
import { JiraProject, JiraSprint, JiraStory } from '../types/jira.types';
export declare class JiraService {
    private configService;
    private storyRepository;
    private sessionRepository;
    private readonly logger;
    constructor(configService: ConfigService, storyRepository: Repository<Story>, sessionRepository: Repository<Session>);
    login(email: string, password: string): Promise<{
        success: boolean;
        token?: string;
        error?: string;
    }>;
    private getAuthHeaders;
    private getBaseUrl;
    getProjectsForUser(email: string, token: string): Promise<{
        success: boolean;
        data?: JiraProject[];
        error?: string;
    }>;
    getSprintsForProject(email: string, token: string, projectId: string): Promise<{
        success: boolean;
        data?: JiraSprint[];
        error?: string;
    }>;
    getStoriesForSprint(email: string, token: string, sprintId: number): Promise<{
        success: boolean;
        data?: JiraStory[];
        error?: string;
    }>;
    importStories(sessionId: string, jiraStories: JiraStory[]): Promise<{
        success: boolean;
        data?: Story[];
        error?: string;
    }>;
}
