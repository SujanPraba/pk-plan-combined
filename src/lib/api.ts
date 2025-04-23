import { JiraBoard, JiraIssue, JiraProject, JiraSprint, JiraUser } from '../types/jira';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const jiraApi = {
  // Projects
  getProjects: async (): Promise<JiraProject[]> => {
    const response = await fetch(`${API_URL}/jira/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira projects');
    }
    return response.json();
  },

  // Boards
  getBoardsForProject: async (projectId: string): Promise<JiraBoard[]> => {
    const response = await fetch(`${API_URL}/jira/boards?projectId=${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira boards');
    }
    return response.json();
  },

  // Sprints
  getSprints: async (boardId: string): Promise<JiraSprint[]> => {
    const response = await fetch(`${API_URL}/jira/sprints?boardId=${boardId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira sprints');
    }
    return response.json();
  },

  // Stories
  getStoriesForSprint: async (sprintId: string): Promise<JiraIssue[]> => {
    const response = await fetch(`${API_URL}/jira/stories?sprintId=${sprintId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira stories');
    }
    return response.json();
  },

  // Epic Stories
  getStoriesForEpic: async (epicKey: string): Promise<JiraIssue[]> => {
    const response = await fetch(`${API_URL}/jira/epic-stories?epicKey=${epicKey}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira epic stories');
    }
    return response.json();
  },

  // Users
  getUsers: async (): Promise<JiraUser[]> => {
    const response = await fetch(`${API_URL}/jira/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira users');
    }
    return response.json();
  }
};