import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Plus, 
  ArrowLeft,
  TrendingUp,
  ExternalLink,
  X,
  Upload,
  Trash2
} from 'lucide-react';

interface KeywordTrendsProps {
  onClose: () => void;
}

interface KeywordGroup {
  id: string;
  name: string;
  keywords: string[];
}

export function KeywordTrends({ onClose }: KeywordTrendsProps) {
  const { t } = useI18n();
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<KeywordGroup | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const handleAddKeyword = () => {
    if (!currentGroup) return;
    
    const keyword = keywordInput.trim();
    if (keyword && !currentGroup.keywords.includes(keyword)) {
      // Check if adding this keyword would exceed 5 keywords limit
      if (currentGroup.keywords.length >= 5) {
        alert('Each group can have a maximum of 5 keywords for Google Trends comparison.');
        return;
      }
      
      setCurrentGroup(prev => prev ? { ...prev, keywords: [...prev.keywords, keyword] } : null);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    if (!currentGroup) return;
    
    setCurrentGroup(prev => prev ? {
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    } : null);
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput.trim().split('\n').map(line => line.trim()).filter(line => line);
    const keywords: string[] = [];

    lines.forEach(line => {
      // Split by comma, semicolon, or multiple spaces
      const lineKeywords = line.split(/[,;]\s*|\s{2,}/)
        .map(k => k.trim())
        .filter(k => k);
      keywords.push(...lineKeywords);
    });

    // Remove duplicates
    const uniqueKeywords = [...new Set(keywords)];

    if (uniqueKeywords.length > 0) {
      // Auto-split into groups of 5 keywords each
      const newGroups: KeywordGroup[] = [];
      const baseGroupName = groupName.trim() || 'Keywords';
      
      for (let i = 0; i < uniqueKeywords.length; i += 5) {
        const keywordChunk = uniqueKeywords.slice(i, i + 5);
        const groupNumber = Math.floor(i / 5) + 1;
        const totalGroups = Math.ceil(uniqueKeywords.length / 5);
        
        const groupName = totalGroups > 1 
          ? `${baseGroupName} Group ${groupNumber}` 
          : baseGroupName;

        newGroups.push({
          id: generateId(),
          name: groupName,
          keywords: keywordChunk
        });
      }

      setKeywordGroups(prev => [...prev, ...newGroups]);
      setBulkInput('');
      setGroupName('');
      setShowBulkImport(false);
    }
  };

  const handleCreateNewGroup = () => {
    const newGroup: KeywordGroup = {
      id: generateId(),
      name: `Keywords ${keywordGroups.length + 1}`,
      keywords: []
    };
    
    setKeywordGroups(prev => [...prev, newGroup]);
    setCurrentGroup(newGroup);
  };

  const handleSelectGroup = (group: KeywordGroup) => {
    setCurrentGroup(group);
  };

  const handleUpdateGroupName = (groupId: string, newName: string) => {
    setKeywordGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    ));
    
    if (currentGroup && currentGroup.id === groupId) {
      setCurrentGroup(prev => prev ? { ...prev, name: newName } : null);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setKeywordGroups(prev => prev.filter(group => group.id !== groupId));
    if (currentGroup && currentGroup.id === groupId) {
      setCurrentGroup(null);
    }
  };

  const handleOpenGoogleTrends = (group: KeywordGroup) => {
    if (group.keywords.length === 0) return;

    // Since groups are already limited to 5 keywords max, open directly
    const baseUrl = 'https://trends.google.com/trends/explore';
    const params = new URLSearchParams();
    params.append('q', group.keywords.join(','));
    const url = `${baseUrl}?${params.toString()}`;

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url, active: false });
    } else {
      window.open(url, '_blank');
    }
  };

  const saveCurrentGroup = () => {
    if (!currentGroup) return;
    
    setKeywordGroups(prev => prev.map(group => 
      group.id === currentGroup.id ? currentGroup : group
    ));
  };

  // Auto-save current group when it changes
  React.useEffect(() => {
    if (currentGroup) {
      saveCurrentGroup();
    }
  }, [currentGroup]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  if (showBulkImport) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowBulkImport(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Bulk Import Keywords</h1>
            </div>
          </div>
        </div>

        {/* Bulk Import Form */}
        <div className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Add Keywords</CardTitle>
              <p className="text-sm text-muted-foreground">
                Copy and paste multiple keywords. They will be automatically grouped into sets of 5 for optimal Google Trends comparison.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Name (Optional)
                </label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Keywords Content
                </label>
                <Textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste your keywords, for example:
Translator,Generator,Example,Convert,Online
Downloader,Maker,Creator,Editor,Processor
Designer,Compiler,Analyzer,Evaluator,Sender

Keywords will be automatically grouped into sets of 5 for Google Trends analysis."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkImport}
                  disabled={!bulkInput.trim()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Keywords
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkInput('');
                    setGroupName('');
                  }}
                >
                  Clear
                </Button>
              </div>

              {/* Example */}
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-xs font-medium mb-2">Example formats:</p>
                <p className="text-xs text-gray-600 font-mono">
                  Translator,Generator,Example<br/>
                  AI Translator; AI Generator; AI Example<br/>
                  Downloader<br/>
                  Maker Creator Editor
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Keyword Trends Analysis</h1>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowBulkImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create New Group */}
        {keywordGroups.length === 0 || !currentGroup ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Start Creating Keyword Groups</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each group can hold up to 5 keywords for Google Trends comparison
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleCreateNewGroup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                  <Button variant="outline" onClick={() => setShowBulkImport(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Group List */}
        {keywordGroups.map((group) => (
          <Card key={group.id} className={currentGroup?.id === group.id ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={group.name}
                    onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                    className="font-medium border-none p-0 h-auto focus:ring-0 focus:border-none"
                  />
                  <Badge variant="outline">
                    {group.keywords.length} keywords
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleOpenGoogleTrends(group)}
                    disabled={group.keywords.length === 0}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Analyze
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {group.keywords.length === 5 && (
                <p className="text-xs text-green-600">
                  ✓ Ready for Google Trends analysis
                </p>
              )}
            </CardHeader>
            {group.keywords.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {group.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Current Group Editor */}
        {currentGroup && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-base">Edit Group: {currentGroup.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Keyword */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Keyword
                </label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter keyword..."
                    onKeyPress={handleKeyPress}
                  />
                  <Button 
                    onClick={handleAddKeyword}
                    disabled={!keywordInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Keywords List */}
              {currentGroup.keywords.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Keywords List ({currentGroup.keywords.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentGroup.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add New Group Button */}
        {keywordGroups.length > 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button variant="outline" onClick={handleCreateNewGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}