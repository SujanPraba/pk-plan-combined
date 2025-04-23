import { useEffect } from 'react';
import { useJiraContext } from '../contexts/JiraContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';

interface JiraIntegrationProps {
  onImportStories: (stories: any[]) => void;
}

export function JiraIntegration({ onImportStories }: JiraIntegrationProps) {
  const {
    projects,
    boards,
    sprints,
    stories,
    selectedProject,
    selectedBoard,
    selectedSprint,
    loading,
    error,
    fetchProjects,
    selectProject,
    selectBoard,
    selectSprint,
    convertStoriesToAppFormat,
  } = useJiraContext();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      selectProject(project);
    }
  };

  const handleBoardChange = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      selectBoard(board);
    }
  };

  const handleSprintChange = (sprintId: string) => {
    const sprint = sprints.find(s => s.id.toString() === sprintId);
    if (sprint) {
      selectSprint(sprint);
    }
  };

  const handleImportStories = () => {
    const formattedStories = convertStoriesToAppFormat();
    onImportStories(formattedStories);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Jira Integration</CardTitle>
        <CardDescription>
          Import user stories from your Jira projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selection */}
        <div className="space-y-2">
          <label htmlFor="project" className="text-sm font-medium">
            Project
          </label>
          {loading.projects ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={handleProjectChange} disabled={projects.length === 0}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {error.projects && <p className="text-sm text-red-500">{error.projects}</p>}
        </div>

        {/* Board Selection */}
        {selectedProject && (
          <div className="space-y-2">
            <label htmlFor="board" className="text-sm font-medium">
              Board
            </label>
            {loading.boards ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={handleBoardChange} disabled={boards.length === 0}>
                <SelectTrigger id="board">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map(board => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error.boards && <p className="text-sm text-red-500">{error.boards}</p>}
          </div>
        )}

        {/* Sprint Selection */}
        {selectedBoard && (
          <div className="space-y-2">
            <label htmlFor="sprint" className="text-sm font-medium">
              Sprint
            </label>
            {loading.sprints ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={handleSprintChange} disabled={sprints.length === 0}>
                <SelectTrigger id="sprint">
                  <SelectValue placeholder="Select a sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id.toString()}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error.sprints && <p className="text-sm text-red-500">{error.sprints}</p>}
          </div>
        )}

        {/* Stories List */}
        {selectedSprint && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Available Stories</h3>
            {loading.stories ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="max-h-60 overflow-auto border rounded-md">
                {stories.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">No stories found in this sprint</p>
                ) : (
                  <ul className="divide-y">
                    {stories.map(story => (
                      <li key={story.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{story.fields.summary}</h4>
                            <p className="text-xs text-gray-500">{story.key}</p>
                          </div>
                          {story.fields.customfield_10004 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {story.fields.customfield_10004} pts
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {error.stories && <p className="text-sm text-red-500">{error.stories}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleImportStories}
          disabled={!selectedSprint || stories.length === 0 || loading.stories}
          className="ml-auto"
        >
          Import Stories
        </Button>
      </CardFooter>
    </Card>
  );
}