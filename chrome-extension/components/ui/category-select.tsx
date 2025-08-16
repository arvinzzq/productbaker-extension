import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { COMMON_CATEGORIES, getCategoryLabel } from '../../lib/constants';
import { customOptionsManager, type CustomOption } from '../../lib/customOptionsManager';
import { Plus, X, Settings } from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  onManageCustom?: () => void;
}

export function CategorySelect({
  value,
  onChange,
  placeholder = '',
  label = 'Category',
  required = false,
  error,
  onManageCustom
}: CategorySelectProps) {
  const { t, currentLanguage } = useI18n();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
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

  const isCustomCategory = value && !COMMON_CATEGORIES.find(cat => cat.value === value);

  const handlePresetSelect = (categoryValue: string) => {
    onChange(categoryValue);
    setShowCustomInput(false);
    setCustomValue('');
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
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

  const clearCategory = () => {
    onChange('');
    setShowCustomInput(false);
    setCustomValue('');
  };

  const getCurrentCategoryLabel = (value: string) => {
    const category = allCategories.find(cat => cat.value === value);
    if (category) {
      return currentLanguage === 'zh' ? category.labelZh : category.labelEn;
    }
    return getCategoryLabel(value, currentLanguage);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
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

      {/* Current Selection */}
      {value && (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {getCurrentCategoryLabel(value)}
            </Badge>
            {isCustomCategory && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCategory}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Custom Input */}
      {showCustomInput && (
        <div className="flex space-x-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleCustomKeyPress}
            placeholder={placeholder || t('categoryPlaceholder')}
            className={error ? 'border-destructive' : ''}
            autoFocus
          />
          <Button
            type="button"
            onClick={handleCustomSubmit}
            size="sm"
            disabled={!customValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Preset Categories */}
      {!value && !showCustomInput && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {COMMON_CATEGORIES.slice(0, 12).map((category) => (
              <Button
                key={category.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(category.value)}
                className="text-xs h-8"
              >
                {currentLanguage === 'zh' ? category.labelZh : category.labelEn}
              </Button>
            ))}
          </div>
          
          {COMMON_CATEGORIES.length > 12 && (
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Show more preset categories...
              </summary>
              <div className="flex flex-wrap gap-2 pt-2">
                {COMMON_CATEGORIES.slice(12).map((category) => (
                  <Button
                    key={category.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(category.value)}
                    className="text-xs h-8"
                  >
                    {currentLanguage === 'zh' ? category.labelZh : category.labelEn}
                  </Button>
                ))}
              </div>
            </details>
          )}

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Custom categories ({customCategories.length})...
              </summary>
              <div className="flex flex-wrap gap-2 pt-2">
                {customCategories.map((category) => (
                  <Button
                    key={category.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(category.value)}
                    className="text-xs h-8 border-dashed"
                  >
                    {currentLanguage === 'zh' ? category.labelZh : category.labelEn}
                  </Button>
                ))}
              </div>
            </details>
          )}

          {/* Custom Input Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="w-full text-muted-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick custom category...
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}