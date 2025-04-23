import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JiraIntegration } from '../components/JiraIntegration';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { JiraProvider } from '../contexts/JiraContext';

interface ImportedStory {
  id: string;
  title: string;
  description?: string;
  jiraKey: string;
  storyPoints?: number;
}

export function JiraStoryPicker() {
  const navigate = useNavigate();
  const [selectedStories, setSelectedStories] = useState<ImportedStory[]>([]);

  const handleImportStories = (stories: ImportedStory[]) => {
    setSelectedStories(stories);
  };

  const handleCreateSession = () => {
    // Convert Jira stories to the format expected by the session creation
    const formattedStories = selectedStories.map(story => ({
      title: story.title,
      description: story.description || '',
      jiraKey: story.jiraKey,
      initialEstimate: story.storyPoints
    }));

    // Store in localStorage or state management to be used in session creation
    localStorage.setItem('importedStories', JSON.stringify(formattedStories));

    // Navigate to session creation page
    navigate('/create-session');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Stories from Jira</h1>
          <p className="text-gray-500 mt-2">
            Connect to your Jira account to import user stories for your planning poker session
          </p>
        </div>

        <JiraProvider>
          <JiraIntegration onImportStories={handleImportStories} />
        </JiraProvider>

        {selectedStories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Stories</CardTitle>
              <CardDescription>
                {selectedStories.length} {selectedStories.length === 1 ? 'story' : 'stories'} selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {selectedStories.map(story => (
                  <li key={story.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{story.title}</h4>
                        <p className="text-xs text-gray-500">{story.jiraKey}</p>
                      </div>
                      {story.storyPoints !== undefined && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {story.storyPoints} pts
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>
                Continue to Session Creation
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}