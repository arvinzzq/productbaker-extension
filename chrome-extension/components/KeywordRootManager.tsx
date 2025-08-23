import React, { useState } from 'react';
import { useKeywordRoots } from '../hooks/useKeywordRoots';
import { useI18n } from '../hooks/useI18n';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Download, 
  Upload, 
  ArrowLeft,
  TrendingUp,
  Globe,
  Calendar,
  Tag
} from 'lucide-react';

interface KeywordRootManagerProps {
  onClose: () => void;
}

interface KeywordRootFormData {
  name: string;
  keywords: string[];
  description?: string;
}

const initialFormData: KeywordRootFormData = {
  name: '',
  keywords: [],
  description: ''
};

export function KeywordRootManager({ onClose }: KeywordRootManagerProps) {
  const { t } = useI18n();
  const {
    state,
    addKeywordRoot,
    updateKeywordRoot,
    deleteKeywordRoot,
    selectKeywordRoot,
    getSelectedKeywordRoot,
    openGoogleTrends,
    exportKeywordRoots,
    importKeywordRoots,
    clearAllKeywordRoots
  } = useKeywordRoots();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KeywordRootFormData>(initialFormData);
  const [keywordInput, setKeywordInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [trendsOptions, setTrendsOptions] = useState({
    geo: '',
    timeframe: 'today 12-m',
    category: ''
  });
  const [showTrendsDialog, setShowTrendsDialog] = useState<string | null>(null);

  const { keywordRoots, isLoading, error } = state;
  const selectedKeywordRoot = getSelectedKeywordRoot();

  // Filter keyword roots based on search
  const filteredKeywordRoots = keywordRoots.filter(kr =>
    kr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kr.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    if (formData.keywords.length === 0) {
      return;
    }

    try {
      if (editingId) {
        await updateKeywordRoot(editingId, {
          name: formData.name.trim(),
          keywords: formData.keywords.filter(k => k.trim()),
          description: formData.description?.trim()
        });
      } else {
        await addKeywordRoot({
          name: formData.name.trim(),
          keywords: formData.keywords.filter(k => k.trim()),
          description: formData.description?.trim()
        });
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('保存关键词词根失败:', error);
    }
  };

  const handleEdit = (keywordRoot: any) => {
    setFormData({
      name: keywordRoot.name,
      keywords: [...keywordRoot.keywords],
      description: keywordRoot.description || ''
    });
    setEditingId(keywordRoot.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个关键词词根吗？')) {
      try {
        await deleteKeywordRoot(id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
    setKeywordInput('');
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const handleOpenGoogleTrends = async (id: string) => {
    try {
      await openGoogleTrends(id, {
        geo: trendsOptions.geo || undefined,
        timeframe: trendsOptions.timeframe,
        category: trendsOptions.category || undefined
      });
      setShowTrendsDialog(null);
    } catch (error) {
      console.error('打开Google Trends失败:', error);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportKeywordRoots();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keyword-roots-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result as string;
          const result = await importKeywordRoots(data);
          alert(`导入完成！成功: ${result.imported} 个，错误: ${result.errors.length} 个`);
          if (result.errors.length > 0) {
            console.log('导入错误:', result.errors);
          }
        } catch (error) {
          console.error('导入失败:', error);
          alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  if (showForm) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {editingId ? t('editKeywordRoot') : t('addKeywordRoot')}
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('keywordRootName')} <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('enterProductNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('keywords')} <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder={t('enterProductNamePlaceholder')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              {formData.keywords.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">{t('atLeastOneKeyword')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('keywordRootDescription')} ({t('optional')})
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('longDescPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !formData.name.trim() || formData.keywords.length === 0}
              >
                {isLoading ? t('saving') : (editingId ? t('update') : t('add'))}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">{t('keywordRootManagement')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="import-file"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('importAllData')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('exportAllData')}
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addKeywordRoot')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchKeywordRoots')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4">
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">{t('loading')}</span>
          </div>
        ) : filteredKeywordRoots.length === 0 ? (
          <div className="p-4 flex flex-col items-center justify-center min-h-[200px] text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No matching keyword roots found' : t('noKeywordRoots')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Try using different search terms' : t('noKeywordRootsDesc')}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('addKeywordRoot')}
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredKeywordRoots.map((keywordRoot) => (
              <Card key={keywordRoot.id} className={selectedKeywordRoot?.id === keywordRoot.id ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-2">{keywordRoot.name}</CardTitle>
                      {keywordRoot.description && (
                        <p className="text-sm text-muted-foreground mb-2">{keywordRoot.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {keywordRoot.keywords.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {keywordRoot.keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{keywordRoot.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {keywordRoot.keywords.length} {t('keywords')} • 
                        {t('createdAt')} {new Date(keywordRoot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Dialog
                        open={showTrendsDialog === keywordRoot.id}
                        onOpenChange={(open) => setShowTrendsDialog(open ? keywordRoot.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Trends
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{t('trendsSettings')}</DialogTitle>
                            <DialogDescription>
                              Configure Google Trends parameters for keyword analysis
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">{t('geography')}</label>
                              <Input
                                value={trendsOptions.geo}
                                onChange={(e) => setTrendsOptions(prev => ({ ...prev, geo: e.target.value }))}
                                placeholder={t('globalLocation')}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">{t('timeRange')}</label>
                              <select
                                value={trendsOptions.timeframe}
                                onChange={(e) => setTrendsOptions(prev => ({ ...prev, timeframe: e.target.value }))}
                                className="w-full p-2 border rounded"
                              >
                                <option value="now 7-d">{t('past7Days')}</option>
                                <option value="now 1-d">{t('past1Day')}</option>
                                <option value="today 1-m">{t('past1Month')}</option>
                                <option value="today 3-m">{t('past3Months')}</option>
                                <option value="today 12-m">{t('past12Months')}</option>
                                <option value="today 5-y">{t('past5Years')}</option>
                                <option value="all">{t('allTime')}</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">{t('categoryId')} ({t('optional')})</label>
                              <Input
                                value={trendsOptions.category}
                                onChange={(e) => setTrendsOptions(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="5 (Computers & Electronics)"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleOpenGoogleTrends(keywordRoot.id)}
                                className="flex-1"
                              >
                                {t('openGoogleTrends')}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowTrendsDialog(null)}
                              >
                                {t('cancel')}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('trendsNote')}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(keywordRoot)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(keywordRoot.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}