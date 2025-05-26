import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRetro } from '@/contexts/RetroContext';
import { Copy, Download, Plus, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import fileDownload from 'js-file-download';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

const RetroSession = () => {
  const navigate = useNavigate();
  const { session, currentUser, socket, addItem, voteForItem, startVoting, revealVotes, finishRetro, leaveSession } = useRetro();
  const [copied, setCopied] = useState(false);
  const [newItemContent, setNewItemContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('went_well');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  useEffect(() => {
    if (!session || !currentUser) {
      navigate('/');
    }
  }, [session, currentUser, navigate]);

  const handleCopySessionId = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddItem = () => {
    if (!newItemContent) return;
    addItem(newItemContent, selectedCategory);
    setNewItemContent('');
    setIsAddItemDialogOpen(false);
    toast.success('Item added successfully');
  };

  const handleAddCategory = () => {
    if (!socket || !session || !newCategoryName.trim()) return;
    socket.emit('add_retro_category', {
      sessionId: session.sessionId,
      categoryName: newCategoryName.trim(),
    });
    setNewCategoryName('');
    setIsAddCategoryDialogOpen(false);
    toast.success('Category added successfully');
  };

  const handleRemoveCategory = (categoryName: string) => {
    if (!socket || !session) return;
    socket.emit('remove_retro_category', {
      sessionId: session.sessionId,
      categoryName,
    });
    toast.success('Category removed successfully');
  };

  const handleExportRetro = async () => {
    if (!session) return;
    try {
      const response = await fetch(`/api/retro/export/${session.sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const fileName = `${session.name.toLowerCase().replace(/\s+/g, '-')}-retro-${new Date().toISOString().split('T')[0]}.csv`;
      fileDownload(blob, fileName);
    } catch (error) {
      console.error('Failed to export retro:', error);
      toast.error('Failed to export retro');
    }
  };

  const handleLeaveSession = () => {
    leaveSession();
    navigate('/');
  };

  if (!session || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  // Generate a color for a category
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-green-100 border-green-200',
      'bg-amber-100 border-amber-200',
      'bg-blue-100 border-blue-200',
      'bg-purple-100 border-purple-200',
      'bg-pink-100 border-pink-200',
      'bg-indigo-100 border-indigo-200',
    ];
    return colors[index % colors.length];
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-card rounded-lg p-4 shadow mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{session.name}</h1>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <span>Session ID: {session.sessionId}</span>
                <button
                  onClick={handleCopySessionId}
                  className="ml-2 text-primary hover:text-primary/80 focus:outline-none"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Participants:</span>
                <div className="flex -space-x-2">
                  <TooltipProvider>
                    {session.participants.map((participant) => (
                      <Tooltip key={participant.id}>
                        <TooltipTrigger>
                          <Avatar className={cn(
                            "border-2 border-background",
                            participant.isHost && "border-primary"
                          )}>
                            <AvatarFallback className={cn(
                              "bg-secondary",
                              participant.isHost && "bg-primary text-primary-foreground"
                            )}>
                              {getInitials(participant.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          {participant.name} {participant.isHost && "(Host)"}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {currentUser.isHost && (
                <>
                  <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Plus size={16} />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name..."
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <Button
                          className="w-full"
                          onClick={handleAddCategory}
                          disabled={!newCategoryName.trim()}
                        >
                          Add Category
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={handleExportRetro}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={handleLeaveSession}>Leave Session</Button>
            </div>
          </div>
        </header>

        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-full" style={{ width: 'max-content' }}>
              {session.categories.map((category, index) => (
                <Card
                  key={category}
                  className={cn(
                    "w-[350px] p-4 border-2 shadow-lg transition-all",
                    getCategoryColor(index)
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <span>{category}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCategory(category)}>
                            + Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Item to {category}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-2">
                            <Textarea
                              value={newItemContent}
                              onChange={(e) => setNewItemContent(e.target.value)}
                              placeholder="Enter your thoughts..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddItem();
                                }
                              }}
                            />
                            <Button
                              className="w-full"
                              onClick={handleAddItem}
                              disabled={!newItemContent.trim()}
                            >
                              Add Item
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {currentUser.isHost && session.categories.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCategory(category)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {session.items
                        .filter(item => item.category === category)
                        .map(item => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <p className="text-sm mb-3">{item.content}</p>
                            <div className="flex items-center">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(item.userName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {item.userName}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Scroll indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default RetroSession;