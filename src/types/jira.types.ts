// Authentication Types
export interface JiraAuthRequest {
  email: string;
  password: string;
}

export interface JiraAuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// Project Types
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  entityId: string;
  uuid: string;
}

// Sprint Types
export interface JiraSprint {
  id: number;
  self: string;
  state: 'future' | 'active' | 'closed';
  name: string;
  startDate?: string;
  endDate?: string;
  originBoardId: number;
  goal: string;
}

// Story/Issue Types
export interface JiraStoryFields {
  summary: string;
  description?: string;
  issuetype: {
    id: string;
    name: string;
    iconUrl: string;
  };
  priority?: {
    id: string;
    name: string;
    iconUrl: string;
  };
  status: {
    id: string;
    name: string;
    statusCategory: {
      id: number;
      key: string;
      name: string;
    };
  };
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
    avatarUrls: {
      '48x48': string;
      '24x24': string;
      '16x16': string;
      '32x32': string;
    };
  };
  storyPoints?: number;
  labels: string[];
}

export interface JiraStory {
  id: string;
  key: string;
  self: string;
  fields: JiraStoryFields;
}

// Board Types
export interface JiraBoard {
  id: number;
  self: string;
  name: string;
  type: 'scrum' | 'kanban';
  location: {
    projectId: number;
    displayName: string;
    projectName: string;
    projectKey: string;
    projectTypeKey: string;
    avatarURI: string;
    name: string;
  };
}

// User Types
export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  active: boolean;
  timeZone: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
}

// API Request Types
export interface JiraProjectRequest {
  email: string;
}

export interface JiraSprintRequest {
  email: string;
  projectId: string;
}

export interface JiraStoryRequest {
  email: string;
  sprintId: string;
}

export interface JiraImportRequest {
  sessionId: string;
  stories: JiraStory[];
}

// API Response Types
export interface JiraApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JiraProjectResponse extends JiraApiResponse<JiraProject[]> {}
export interface JiraSprintResponse extends JiraApiResponse<JiraSprint[]> {}
export interface JiraStoryResponse extends JiraApiResponse<JiraStory[]> {}
export interface JiraImportResponse extends JiraApiResponse<JiraStory[]> {}

// Error Types
export interface JiraError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
} 