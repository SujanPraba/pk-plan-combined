// Jira Integration Types

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  lead: string | null;
  avatarUrl: string | null;
}

export interface JiraBoard {
  id: string;
  name: string;
  type: string;
  location: {
    projectId: string;
    projectKey: string;
    projectName: string;
  };
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string | null;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    customfield_10004?: number; // Story points field (may vary in different Jira instances)
  };
}

export interface JiraUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}