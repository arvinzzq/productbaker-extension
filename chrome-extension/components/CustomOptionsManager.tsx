import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { customOptionsManager, type CustomOption, type CreateCustomOptionInput, type UpdateCustomOptionInput } from '../lib/customOptionsManager';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  FolderOpen,
  Save,
  X
} from 'lucide-react';

interface CustomOptionsManagerProps {
  onClose: () => void;
}

export function CustomOptionsManager({ onClose }: CustomOptionsManagerProps) {
  const { t, currentLanguage } = useI18n();
  const [selectedTab, setSelectedTab] = useState<'categories' | 'tags'>('categories');
  const [customCategories, setCustomCategories] = useState<CustomOption[]>([]);
  const [customTags, setCustomTags] = useState<CustomOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<CustomOption | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCustomOptionInput>({
    value: '',
    labelEn: '',
    labelZh: ''
  });

  useEffect(() => {
    loadCustomOptions();
  }, []);

  const loadCustomOptions = async () => {
    setIsLoading(true);
    try {
      const [categories, tags] = await Promise.all([
        customOptionsManager.getCustomCategories(),
        customOptionsManager.getCustomTags()
      ]);
      setCustomCategories(categories);
      setCustomTags(tags);
    } catch (error) {
      console.error('Failed to load custom options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.value.trim() || !formData.labelEn.trim() || !formData.labelZh.trim()) {
      return;
    }

    try {
      if (selectedTab === 'categories') {
        await customOptionsManager.addCustomCategory(formData);
      } else {
        await customOptionsManager.addCustomTag(formData);
      }
      
      await loadCustomOptions();
      setIsAddDialogOpen(false);
      setFormData({ value: '', labelEn: '', labelZh: '' });
    } catch (error) {
      console.error('Failed to add custom option:', error);
      alert(error instanceof Error ? error.message : 'Failed to add option');
    }
  };

  const handleEdit = async () => {
    if (!editingItem || !formData.value.trim() || !formData.labelEn.trim() || !formData.labelZh.trim()) {
      return;
    }

    try {
      const updates: UpdateCustomOptionInput = {
        value: formData.value,
        labelEn: formData.labelEn,
        labelZh: formData.labelZh
      };

      if (selectedTab === 'categories') {
        await customOptionsManager.updateCustomCategory(editingItem.id, updates);
      } else {
        await customOptionsManager.updateCustomTag(editingItem.id, updates);
      }
      
      await loadCustomOptions();
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData({ value: '', labelEn: '', labelZh: '' });
    } catch (error) {
      console.error('Failed to update custom option:', error);
      alert(error instanceof Error ? error.message : 'Failed to update option');
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;

    try {
      if (selectedTab === 'categories') {
        await customOptionsManager.deleteCustomCategory(editingItem.id);
      } else {
        await customOptionsManager.deleteCustomTag(editingItem.id);
      }
      
      await loadCustomOptions();
      setIsDeleteDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to delete custom option:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete option');
    }
  };

  const openEditDialog = (item: CustomOption) => {
    setEditingItem(item);
    setFormData({
      value: item.value,
      labelEn: item.labelEn,
      labelZh: item.labelZh
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: CustomOption) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const openAddDialog = () => {
    setFormData({ value: '', labelEn: '', labelZh: '' });
    setIsAddDialogOpen(true);
  };

  const currentItems = selectedTab === 'categories' ? customCategories : customTags;
  const itemLabel = selectedTab === 'categories' ? 'Category' : 'Tag';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Custom Options Manager</h1>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add {itemLabel}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          <Button
            variant={selectedTab === 'categories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('categories')}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Categories ({customCategories.length})
          </Button>
          <Button
            variant={selectedTab === 'tags' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('tags')}
          >
            <Tag className="h-4 w-4 mr-2" />
            Tags ({customTags.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : currentItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              {selectedTab === 'categories' ? <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /> : <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />}
              <p className="text-muted-foreground mb-4">
                No custom {selectedTab} yet
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First {itemLabel}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.value}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">EN:</span> {item.labelEn}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">中文:</span> {item.labelZh}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {item.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom {itemLabel}</DialogTitle>
            <DialogDescription>
              Create a new custom {itemLabel.toLowerCase()} with English and Chinese labels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Value (unique identifier)</label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., my-custom-category"
              />
            </div>
            <div>
              <label className="text-sm font-medium">English Label</label>
              <Input
                value={formData.labelEn}
                onChange={(e) => setFormData(prev => ({ ...prev, labelEn: e.target.value }))}
                placeholder="e.g., My Custom Category"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Chinese Label</label>
              <Input
                value={formData.labelZh}
                onChange={(e) => setFormData(prev => ({ ...prev, labelZh: e.target.value }))}
                placeholder="e.g., 我的自定义分类"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={!formData.value.trim() || !formData.labelEn.trim() || !formData.labelZh.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Add {itemLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom {itemLabel}</DialogTitle>
            <DialogDescription>
              Update the custom {itemLabel.toLowerCase()} information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Value (unique identifier)</label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., my-custom-category"
              />
            </div>
            <div>
              <label className="text-sm font-medium">English Label</label>
              <Input
                value={formData.labelEn}
                onChange={(e) => setFormData(prev => ({ ...prev, labelEn: e.target.value }))}
                placeholder="e.g., My Custom Category"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Chinese Label</label>
              <Input
                value={formData.labelZh}
                onChange={(e) => setFormData(prev => ({ ...prev, labelZh: e.target.value }))}
                placeholder="e.g., 我的自定义分类"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={!formData.value.trim() || !formData.labelEn.trim() || !formData.labelZh.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Update {itemLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom {itemLabel}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{editingItem?.labelEn}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {itemLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}