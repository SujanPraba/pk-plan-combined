import { JiraService } from '../services/jira.service';
import { JiraAuthRequest, JiraAuthResponse, JiraProjectRequest, JiraProjectResponse, JiraSprintRequest, JiraSprintResponse, JiraStoryRequest, JiraStoryResponse, JiraImportRequest, JiraImportResponse } from '../types/jira.types';
export declare class JiraController {
    private readonly jiraService;
    constructor(jiraService: JiraService);
    login(authRequest: JiraAuthRequest): Promise<JiraAuthResponse>;
    private extractCredentials;
    getProjects(headers: Record<string, string>, request: JiraProjectRequest): Promise<JiraProjectResponse>;
    getSprints(headers: Record<string, string>, request: JiraSprintRequest): Promise<JiraSprintResponse>;
    getStories(headers: Record<string, string>, request: JiraStoryRequest): Promise<JiraStoryResponse>;
    importStories(headers: Record<string, string>, request: JiraImportRequest): Promise<JiraImportResponse>;
}
