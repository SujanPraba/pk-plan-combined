import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { JiraImportModal } from './JiraImportModal';

export const Session: React.FC = () => {
  const [isJiraImportModalOpen, setIsJiraImportModalOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);

  const handleJiraStoriesImported = (stories: any[]) => {
    // Transform Jira stories to the format expected by the session
    const transformedStories = stories.map(story => ({
      id: story.key,
      title: story.summary,
      description: story.description,
      type: story.type,
      status: 'Not Started',
      votes: []
    }));

    // Add stories to the session
    setStories(prev => [...prev, ...transformedStories]);
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-6 flex gap-3">
        <Button onClick={() => {/* Handle add story */}}>
          <Plus className="mr-2 h-4 w-4" />
          Add Story
        </Button>
        <Button variant="outline" onClick={() => setIsJiraImportModalOpen(true)}>
          <Download className="mr-2 h-4 w-4" />
          Import from Jira
        </Button>
      </div>

      {/* Stories list component will go here */}

      <JiraImportModal
  open={isJiraImportModalOpen}
  onClose={() => setIsJiraImportModalOpen(false)}
  onStoriesImported={(stories) => {
    // Handle imported stories
    handleJiraStoriesImported(stories);
    setIsJiraImportModalOpen(false);
  }}
/>
    </div>
  );
};