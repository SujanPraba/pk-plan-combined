import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jiraApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function JiraCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        console.error('Jira auth error:', error);
        toast({
          title: "Authentication Failed",
          description: error,
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        toast({
          title: "Authentication Failed",
          description: "No authorization code received",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        console.log('Exchanging code for token...');
        const response = await jiraApi.handleCallback(code);
        console.log('Token exchange successful:', response);
        
        // Store token and dispatch storage event
        localStorage.setItem('jiraToken', response.access_token);
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'jiraToken',
          newValue: response.access_token
        }));
        
        toast({
          title: "Success",
          description: "Successfully connected to Jira",
        });
        // Navigate back to the page where import was initiated
        navigate(-2);
      } catch (error) {
        console.error('Failed to complete authentication:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to complete Jira authentication",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Jira...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
} 