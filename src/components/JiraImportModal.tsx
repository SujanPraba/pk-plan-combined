import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { jiraApi } from '@/lib/api';

interface JiraInstance {
  id: string;
  name: string;
  url: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate: string;
  endDate: string;
}

interface JiraStory {
  id: string;
  summary: string;
  description?: string;
  storyPoints?: number;
  priority?: string;
  status: string;
}

interface JiraImportModalProps {
  open: boolean;
  onClose: () => void;
  onStoriesImported: (stories: JiraStory[]) => void;
}

export function JiraImportModal({ open, onClose, onStoriesImported }: JiraImportModalProps) {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<JiraInstance[]>([]);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [sprints, setSprints] = useState<JiraSprint[]>([]);
  const [stories, setStories] = useState<JiraStory[]>([]);

  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSprint, setSelectedSprint] = useState<string>('');

  useEffect(() => {
    if (open) {
      checkAuthStatus();
    }
  }, [open]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jiraToken' && e.newValue) {
        console.log('Token changed, checking auth status...');
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('jiraToken');
    console.log('Checking auth status, token:', token ? 'exists' : 'not found');
    const wasAuthenticated = isAuthenticated;
    setIsAuthenticated(!!token);
    if (token && (!wasAuthenticated || !instances.length)) {
      loadInstances();
    }
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      const { url } = await jiraApi.getAuthUrl();
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate Jira authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInstances = async () => {
    try {
      setLoading(true);
      console.log('Loading Jira instances...');
      const instances = await jiraApi.getInstances();
      console.log('Loaded instances:', instances);
      setInstances(instances);
    } catch (error) {
      console.error('Failed to load instances:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load Jira instances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (instanceId: string) => {
    try {
      setLoading(true);
      console.log('Loading projects for instance:', instanceId);
      setSelectedInstance(instanceId);
      const projects = await jiraApi.getProjects(instanceId);
      console.log('Loaded projects:', projects);
      setProjects(projects as any);
      setSelectedProject('');
      setSprints([]);
      setStories([]);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async (projectId: string) => {
    try {
      setLoading(true);
      console.log('Loading sprints for project:', projectId);
      setSelectedProject(projectId);
      const sprints = await jiraApi.getSprints(selectedInstance, projectId);
      console.log('Loaded sprints:', sprints);
      setSprints(sprints as any);
      setSelectedSprint('');
      setStories([]);
    } catch (error) {
      console.error('Failed to load sprints:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load sprints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async (sprintId: string) => {
    try {
      setLoading(true);
      console.log('Loading stories for sprint:', sprintId);
      setSelectedSprint(sprintId);
      const stories = await jiraApi.getStories(selectedInstance, sprintId);
      console.log('Loaded stories:', stories);
      setStories(stories as any);
    } catch (error) {
      console.error('Failed to load stories:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    onStoriesImported(stories);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Stories from Jira</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isAuthenticated ? (
            <div className="text-center">
              <p className="mb-4">Connect to your Jira account to import stories</p>
              <Button onClick={handleAuth} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Jira'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Jira Instance</label>
                <Select
                  value={selectedInstance}
                  onValueChange={loadProjects}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Jira instance" />
                  </SelectTrigger>
                  <SelectContent>
                    {instances.map((instance) => (
                      <SelectItem key={instance.id} value={instance.id}>
                        {instance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInstance && (
                <div>
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    value={selectedProject}
                    onValueChange={loadSprints}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProject && (
                <div>
                  <label className="text-sm font-medium">Sprint</label>
                  <Select
                    value={selectedSprint}
                    onValueChange={loadStories}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id.toString()}>
                          {sprint.name} ({sprint.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {stories.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Stories</label>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-2">
                      {stories.map((story) => (
                        <div
                          key={story.id}
                          className="flex items-center justify-between rounded-lg border p-2"
                        >
                          <div>
                            <p className="font-medium">{story.summary}</p>
                            <p className="text-sm text-muted-foreground">
                              {story.id} • {story.status}
                              {story.storyPoints && ` • ${story.storyPoints} points`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {stories.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={handleImport} disabled={loading}>
                    Import {stories.length} Stories
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}