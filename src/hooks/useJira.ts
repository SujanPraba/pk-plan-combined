import { useCallback, useState } from 'react';
import { jiraApi } from '../lib/api';
import { JiraBoard, JiraIssue, JiraProject, JiraSprint, JiraUser } from '../types/jira';

interface JiraState {
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
}

export function useJira() {
  const [state, setState] = useState<JiraState>({
    projects: [],
    boards: [],
    sprints: [],
    stories: [],
    users: [],
    selectedProject: null,
    selectedBoard: null,
    selectedSprint: null,
    loading: {
      projects: false,
      boards: false,
      sprints: false,
      stories: false,
      users: false,
    },
    error: {
      projects: null,
      boards: null,
      sprints: null,
      stories: null,
      users: null,
    },
  });

  // Fetch projects
  const fetchProjects = useCallback(async (email: string) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, projects: true },
      error: { ...prev.error, projects: null }
    }));

    try {
      const projects = await jiraApi.getProjects(email);
      setState(prev => ({
        ...prev,
        projects,
        loading: { ...prev.loading, projects: false }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, projects: false },
        error: { ...prev.error, projects: (error as Error).message }
      }));
    }
  }, []);

  // Select project and fetch boards
  const selectProject = useCallback(async (project: JiraProject) => {
    setState(prev => ({
      ...prev,
      selectedProject: project,
      boards: [],
      sprints: [],
      stories: [],
      selectedBoard: null,
      selectedSprint: null,
      loading: { ...prev.loading, boards: true },
      error: { ...prev.error, boards: null }
    }));

    try {
      const boards = await jiraApi.getBoardsForProject(project.id);
      setState(prev => ({
        ...prev,
        boards,
        loading: { ...prev.loading, boards: false }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, boards: false },
        error: { ...prev.error, boards: (error as Error).message }
      }));
    }
  }, []);

  // Select board and fetch sprints
  const selectBoard = useCallback(async (board: JiraBoard) => {
    setState(prev => ({
      ...prev,
      selectedBoard: board,
      sprints: [],
      stories: [],
      selectedSprint: null,
      loading: { ...prev.loading, sprints: true },
      error: { ...prev.error, sprints: null }
    }));

    try {
      const sprints = await jiraApi.getSprints(board.id);
      setState(prev => ({
        ...prev,
        sprints,
        loading: { ...prev.loading, sprints: false }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, sprints: false },
        error: { ...prev.error, sprints: (error as Error).message }
      }));
    }
  }, []);

  // Select sprint and fetch stories
  const selectSprint = useCallback(async (sprint: JiraSprint) => {
    setState(prev => ({
      ...prev,
      selectedSprint: sprint,
      stories: [],
      loading: { ...prev.loading, stories: true },
      error: { ...prev.error, stories: null }
    }));

    try {
      const stories = await jiraApi.getStoriesForSprint(sprint.id.toString());
      setState(prev => ({
        ...prev,
        stories,
        loading: { ...prev.loading, stories: false }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, stories: false },
        error: { ...prev.error, stories: (error as Error).message }
      }));
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, users: true },
      error: { ...prev.error, users: null }
    }));

    try {
      const users = await jiraApi.getUsers();
      setState(prev => ({
        ...prev,
        users,
        loading: { ...prev.loading, users: false }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, users: false },
        error: { ...prev.error, users: (error as Error).message }
      }));
    }
  }, []);

  // Convert Jira stories to app stories
  const convertStoriesToAppFormat = useCallback(() => {
    return state.stories.map(story => ({
      id: story.id,
      title: story.fields.summary,
      description: story.fields.description || undefined,
      jiraKey: story.key,
      storyPoints: story.fields.customfield_10004,
    }));
  }, [state.stories]);

  return {
    ...state,
    fetchProjects,
    selectProject,
    selectBoard,
    selectSprint,
    fetchUsers,
    convertStoriesToAppFormat,
  };
}