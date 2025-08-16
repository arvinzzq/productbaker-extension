import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { COMMON_CATEGORIES, getCategoryLabel } from '../../lib/constants';
import { customOptionsManager, type CustomOption } from '../../lib/customOptionsManager';
import { Plus, X, Settings, Search } from 'lucide-react';

interface MultiCategorySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  maxCategories?: number;
  error?: string;
  onManageCustom?: () => void;
}

export function MultiCategorySelect({
  value = [],
  onChange,
  placeholder = '',
  label = 'Categories',
  maxCategories = 5,
  error,
  onManageCustom
}: MultiCategorySelectProps) {
  const { t, currentLanguage } = useI18n();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customCategories, setCustomCategories] = useState<CustomOption[]>([]);
  const [allCategories, setAllCategories] = useState<Array<{ value: string; labelEn: string; labelZh: string; isCustom?: boolean }>>([]);

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const custom = await customOptionsManager.getCustomCategories();
      setCustomCategories(custom);
      setAllCategories([...COMMON_CATEGORIES, ...custom]);
    } catch (error) {
      console.error('Failed to load custom categories:', error);
      setAllCategories(COMMON_CATEGORIES);
    }
  };

  const filteredCategories = searchQuery 
    ? allCategories.filter(category => 
        category.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.labelZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCategories;

  const handleCategoryToggle = (categoryValue: string) => {
    if (value.includes(categoryValue)) {
      onChange(value.filter(cat => cat !== categoryValue));
    } else if (value.length < maxCategories) {
      onChange([...value, categoryValue]);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim() && !value.includes(customValue.trim()) && value.length < maxCategories) {
      onChange([...value, customValue.trim()]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    onChange(value.filter(cat => cat !== categoryToRemove));
  };

  const getCurrentCategoryLabel = (value: string) => {
    const category = allCategories.find(cat => cat.value === value);
    if (category) {
      return currentLanguage === 'zh' ? category.labelZh : category.labelEn;
    }
    return getCategoryLabel(value, currentLanguage);
  };

  const isCustomCategory = (categoryValue: string) => {
    return !COMMON_CATEGORIES.find(cat => cat.value === categoryValue);
  };

  const canAddMore = value.length < maxCategories;

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          <span className="text-muted-foreground ml-2">
            ({value.length}/{maxCategories})
          </span>
        </label>
        {onManageCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onManageCustom}
            className="h-6 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Manage
          </Button>
        )}
      </div>

      {/* Selected Categories */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {getCurrentCategoryLabel(category)}
              {isCustomCategory(category) && (
                <span className="text-xs opacity-60">•Custom</span>
              )}
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {canAddMore && (
        <>
          {/* Search and Custom Input */}
          <div className="space-y-2">
            {!showCustomInput && (
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {showCustomInput && (
              <div className="flex space-x-2">
                <Input
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={handleCustomKeyPress}
                  placeholder={placeholder || 'Enter custom category'}
                  className={error ? 'border-destructive' : ''}
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleCustomSubmit}
                  size="sm"
                  disabled={!customValue.trim() || value.includes(customValue.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomValue('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Category Options */}
          {!showCustomInput && (
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-3">
                {/* Preset Categories */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Preset Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredCategories
                      .filter(cat => !cat.isCustom)
                      .map((category) => {
                        const isSelected = value.includes(category.value);
                        return (
                          <Button
                            key={category.value}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleCategoryToggle(category.value)}
                            className="text-xs h-8"
                            disabled={!isSelected && !canAddMore}
                          >
                            {currentLanguage === 'zh' ? category.labelZh : category.labelEn}
                          </Button>
                        );
                      })}
                  </div>
                </div>

                {/* Custom Categories */}
                {customCategories.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Custom Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredCategories
                        .filter(cat => cat.isCustom)
                        .map((category) => {
                          const isSelected = value.includes(category.value);
                          return (
                            <Button
                              key={category.value}
                              type="button"
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleCategoryToggle(category.value)}
                              className="text-xs h-8 border-dashed"
                              disabled={!isSelected && !canAddMore}
                            >
                              {currentLanguage === 'zh' ? category.labelZh : category.labelEn}
                            </Button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
              
              {filteredCategories.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No categories found. Try a custom category instead.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {!canAddMore && (
        <p className="text-sm text-muted-foreground">
          Maximum number of categories reached ({maxCategories})
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}