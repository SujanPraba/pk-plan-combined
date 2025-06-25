import { Controller, Get, Query, Headers, BadRequestException } from '@nestjs/common';
import { JiraService } from './jira.service';

interface JiraCredentials {
  host: string;
  username: string;
  apiToken: string;
}

interface BacklogFilter {
  search?: string;        // Search in summary and description
  types?: string[];       // Filter by issue types (Story, Bug, Task, etc.)
  priorities?: string[];  // Filter by priority levels
  statuses?: string[];    // Filter by status
  labels?: string[];      // Filter by labels
  assignee?: string;      // Filter by assignee
  orderBy?: string;       // Order by field (created, updated, priority, etc.)
  orderDirection?: 'ASC' | 'DESC'; // Order direction
}

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  private getCredentialsFromHeaders(headers: Record<string, string>): JiraCredentials {
    const host = headers['jira-host'];
    const username = headers['jira-username'];
    const apiToken = headers['jira-api-token'];

    if (!host || !username || !apiToken) {
      throw new BadRequestException('Missing required Jira credentials in headers');
    }

    return { host, username, apiToken };
  }

  @Get('projects')
  async getProjects(@Headers() headers: Record<string, string>) {
    const credentials = this.getCredentialsFromHeaders(headers);
    return this.jiraService.getAllProjects(credentials);
  }

  @Get('users')
  async getUsers(@Headers() headers: Record<string, string>) {
    const credentials = this.getCredentialsFromHeaders(headers);
    return this.jiraService.getAllUsers(credentials);
  }

  @Get('stories')
  async getStories(
    @Headers() headers: Record<string, string>,
    @Query('sprintId') sprintId: string
  ) {
    const credentials = this.getCredentialsFromHeaders(headers);
    return this.jiraService.getAllStoriesForSprint(credentials, sprintId);
  }

  @Get('epic-stories')
  async getEpicStories(
    @Headers() headers: Record<string, string>,
    @Query('epicKey') epicKey: string
  ) {
    const credentials = this.getCredentialsFromHeaders(headers);
    return this.jiraService.getStoriesForEpic(credentials, epicKey);
  }

  @Get('boards')
  async getBoards(
    @Headers() headers: Record<string, string>,
    @Query('projectId') projectId: string
  ) {
    const credentials = this.getCredentialsFromHeaders(headers);
    return this.jiraService.getBoardsForProject(credentials, projectId);
  }

  @Get('sprints')
  async getSprints(
    @Headers() headers: Record<string, string>,
    @Query('boardId') boardId: string
  ) {
    const credentials = this.getCredentialsFromHeaders(headers);
    return this.jiraService.getSprints(credentials, boardId);
  }

  @Get('backlog')
  async getBacklogIssues(
    @Headers() headers: Record<string, string>,
    @Query('projectId') projectId: string,
    @Query('search') search?: string,
    @Query('types') types?: string,
    @Query('priorities') priorities?: string,
    @Query('statuses') statuses?: string,
    @Query('labels') labels?: string,
    @Query('assignee') assignee?: string,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'ASC' | 'DESC'
  ) {
    const credentials = this.getCredentialsFromHeaders(headers);
    
    const filter: BacklogFilter = {
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
}