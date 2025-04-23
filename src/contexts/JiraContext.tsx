import { createContext, ReactNode, useContext } from 'react';
import { useJira } from '../hooks/useJira';
import { JiraBoard, JiraIssue, JiraProject, JiraSprint, JiraUser } from '../types/jira';

interface JiraContextType {
  projects: JiraProject[];
  boards: JiraBoard[];
  sprints: JiraSprint[];
  stories: JiraIssue[];
  users: JiraUser[];
  selectedProject: JiraProject | null;
  selectedBoard: JiraBoard | null;
  selectedSprint: JiraSprint | null;
  loading: {
    projects: boolean;
    boards: boolean;
    sprints: boolean;
    stories: boolean;
    users: boolean;
  };
  error: {
    projects: string | null;
    boards: string | null;
    sprints: string | null;
    stories: string | null;
    users: string | null;
  };
  fetchProjects: () => Promise<void>;
  selectProject: (project: JiraProject) => Promise<void>;
  selectBoard: (board: JiraBoard) => Promise<void>;
  selectSprint: (sprint: JiraSprint) => Promise<void>;
  fetchUsers: () => Promise<void>;
  convertStoriesToAppFormat: () => any[];
}

const JiraContext = createContext<JiraContextType | undefined>(undefined);

export function JiraProvider({ children }: { children: ReactNode }) {
  const jiraState = useJira();

  return (
    <JiraContext.Provider value={jiraState}>
      {children}
    </JiraContext.Provider>
  );
}

export function useJiraContext() {
  const context = useContext(JiraContext);
  if (context === undefined) {
    throw new Error('useJiraContext must be used within a JiraProvider');
  }
  return context;
}