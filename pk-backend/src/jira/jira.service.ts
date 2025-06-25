import { BadRequestException, Injectable } from '@nestjs/common';
import JiraApi from 'jira-client';
import fetch from 'node-fetch';

interface JiraCredentials {
  host: string;
  username: string;
  apiToken: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  lead?: { displayName: string };
  avatarUrls?: { [key: string]: string };
}

interface JiraResponse<T> {
  values: T[];
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

@Injectable()
export class JiraService {
  private getJiraClient(credentials: JiraCredentials): JiraApi {
    return new JiraApi({
      protocol: 'https',
      host: credentials.host,
      username: credentials.username,
      password: credentials.apiToken,
      apiVersion: '3',
      strictSSL: true
    });
  }

  private getAuthHeaders(credentials: JiraCredentials) {
    const auth = Buffer.from(`${credentials.username}:${credentials.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    };
  }

  async getAllProjects(credentials: JiraCredentials): Promise<any[]> {
    try {
      const response = await fetch(`https://${credentials.host}/rest/api/3/project/search?maxResults=200`, {
        method: 'GET',
        headers: this.getAuthHeaders(credentials)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as JiraResponse<JiraProject>;
      return data.values.map(project => ({
        id: project.id,
        key: project.key,
        name: project.name,
        lead: project.lead ? project.lead.displayName : null,
        avatarUrl: project.avatarUrls ? project.avatarUrls['48x48'] : null
      }));
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch Jira projects');
    }
  }

  async getAllUsers(credentials: JiraCredentials): Promise<any[]> {
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
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch Jira users');
    }
  }

  async getAllStoriesForSprint(credentials: JiraCredentials, sprintId: string): Promise<any[]> {
    try {
      const jira = this.getJiraClient(credentials);
      const jql = `Sprint = ${sprintId} AND issuetype = Story`;
      const result = await jira.searchJira(jql, {
        maxResults: 1000,
        fields: ['summary', 'description', 'status', 'customfield_10004']
      });
      return result.issues;
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch stories from Jira');
    }
  }

  async getStoriesForEpic(credentials: JiraCredentials, epicKey: string): Promise<any[]> {
    try {
      const jira = this.getJiraClient(credentials);
      const jql = `"Epic Link" = "${epicKey}"`;
      const result = await jira.searchJira(jql);
      return result.issues;
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch epic stories');
    }
  }

  async getBoardsForProject(credentials: JiraCredentials, projectKeyOrId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://${credentials.host}/rest/agile/1.0/board?projectKeyOrId=${projectKeyOrId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(credentials)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as JiraResponse<any>;
      return data.values;
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch boards');
    }
  }

  async getSprints(credentials: JiraCredentials, boardId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://${credentials.host}/rest/agile/1.0/board/${boardId}/sprint`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(credentials)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as JiraResponse<any>;
      return data.values;
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch sprints');
    }
  }

  async getBacklogIssues(
    credentials: JiraCredentials, 
    projectKeyOrId: string,
    filter?: BacklogFilter
  ): Promise<any[]> {
    try {
      const jira = this.getJiraClient(credentials);
      
      // Build JQL query based on filters
      let jql = `project = "${projectKeyOrId}" AND sprint is EMPTY`;

      // Add type filter only if types array has values
      if (filter?.types?.length) {
        const quotedTypes = filter.types
          .map(type => type.trim())
          .filter(Boolean)
          .map(type => `"${type}"`);
        if (quotedTypes.length) {
          jql += ` AND issuetype in (${quotedTypes.join(',')})`;
        }
      }

      // Add priority filter only if priorities array has values
      if (filter?.priorities?.length) {
        const quotedPriorities = filter.priorities
          .map(priority => priority.trim())
          .filter(Boolean)
          .map(priority => `"${priority}"`);
        if (quotedPriorities.length) {
          jql += ` AND priority in (${quotedPriorities.join(',')})`;
        }
      }

      // Add status filter only if statuses array has values
      if (filter?.statuses?.length) {
        const quotedStatuses = filter.statuses
          .map(status => status.trim())
          .filter(Boolean)
          .map(status => `"${status}"`);
        if (quotedStatuses.length) {
          jql += ` AND status in (${quotedStatuses.join(',')})`;
        }
      }

      // Add label filter only if labels array has values
      if (filter?.labels?.length) {
        const quotedLabels = filter.labels
          .map(label => label.trim())
          .filter(Boolean)
          .map(label => `"${label}"`);
        if (quotedLabels.length) {
          jql += ` AND labels in (${quotedLabels.join(',')})`;
        }
      }

      // Add assignee filter only if assignee has a value
      if (filter?.assignee?.trim()) {
        jql += ` AND assignee = "${filter.assignee.trim()}"`;
      }

      // Add search term only if search has a value
      if (filter?.search?.trim()) {
        jql += ` AND (summary ~ "${filter.search.trim()}" OR description ~ "${filter.search.trim()}")`;
      }

      // Add ordering
      if (filter?.orderBy?.trim()) {
        jql += ` ORDER BY ${filter.orderBy.trim()} ${filter.orderDirection || 'ASC'}`;
      } else {
        jql += ' ORDER BY Rank ASC';
      }

      console.log('JQL Query:', jql); // For debugging

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
          'customfield_10004', // Story points
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
    } catch (error) {
      this.handleJiraError(error);
      throw new BadRequestException('Failed to fetch backlog issues');
    }
  }

  private handleJiraError(error) {
    if (error.statusCode === 429) {
      const retryAfter = error.headers ? error.headers['retry-after'] || 60 : 60;
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    console.error('Jira API error:', error.message);
  }
}