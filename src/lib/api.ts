import {
  JiraAuthRequest,
  JiraAuthResponse,
  JiraProject,
  JiraSprint,
  JiraStory,
  JiraProjectRequest,
  JiraSprintRequest,
  JiraStoryRequest,
  JiraImportRequest,
  JiraProjectResponse,
  JiraSprintResponse,
  JiraStoryResponse,
  JiraImportResponse,
  JiraBoard,
  JiraUser,
} from '../types/jira.types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jiraToken');
  console.log('Getting auth headers, token:', token ? 'exists' : 'not found');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const jiraApi = {
  // Login
  login: async (email: string, password: string): Promise<JiraAuthResponse> => {
    const request: JiraAuthRequest = { email, password };
    const response = await fetch(`${API_URL}/api/jira/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to authenticate' };
    }

    const data: JiraAuthResponse = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('jiraEmail', email);
      localStorage.setItem('jiraToken', data.token);
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials' };
  },

  // Email Validation
  validateEmail: async (email: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/api/jira/validate-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.isValid;
  },

  // Projects
  getProjects: async (cloudId: string): Promise<JiraProjectResponse> => {
    console.log('Getting projects for cloud ID:', cloudId);
    const headers = getAuthHeaders();
    console.log('Using headers:', headers);
    const response = await axios.get(`${API_URL}/api/jira/projects`, {
      params: { cloudId },
      headers: headers,
    });
    console.log('Projects response:', response.data);
    return response.data;
  },

  // Boards
  getBoardsForProject: async (projectId: string): Promise<JiraBoard[]> => {
    const response = await axios.get(`${API_URL}/api/jira/boards`, {
      params: { projectId },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Sprints
  getSprints: async (cloudId: string, projectId: string): Promise<JiraSprintResponse> => {
    const response = await axios.get(`${API_URL}/api/jira/sprints`, {
      params: { cloudId, projectId },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Stories
  getStories: async (cloudId: string, sprintId: string): Promise<JiraStoryResponse> => {
    const response = await axios.get(`${API_URL}/api/jira/stories`, {
      params: { cloudId, sprintId },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Epic Stories
  getStoriesForEpic: async (epicKey: string): Promise<JiraStory[]> => {
    const response = await axios.get(`${API_URL}/api/jira/epic-stories`, {
      params: { epicKey },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Stories Import
  importStories: async (sessionId: string, stories: JiraStory[]): Promise<JiraImportResponse> => {
    const request: JiraImportRequest = { sessionId, stories };
    const response = await fetch(`${API_URL}/api/jira/stories/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to import stories' };
    }

    const data = await response.json();
    return { success: true, data };
  },

  // Users
  getUsers: async (): Promise<JiraUser[]> => {
    const response = await axios.get(`${API_URL}/api/jira/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getAuthUrl: async () => {
    const response = await axios.get(`${API_URL}/api/jira/auth/url`);
    return response.data;
  },

  handleCallback: async (code: string) => {
    console.log('Handling callback with code:', code);
    const response = await axios.post(`${API_URL}/api/jira/auth/callback`, { code });
    console.log('Callback response:', response.data);
    return response.data;
  },

  getInstances: async () => {
    console.log('Getting Jira instances...');
    const headers = getAuthHeaders();
    console.log('Using headers:', headers);
    const response = await axios.get(`${API_URL}/api/jira/instances`, {
      headers: headers,
    });
    console.log('Instances response:', response.data);
    return response.data;
  },
};