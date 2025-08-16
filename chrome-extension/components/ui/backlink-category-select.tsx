import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { BACKLINK_CATEGORIES, getBacklinkCategoryLabel } from '../../lib/constants';
import { Plus, X } from 'lucide-react';

interface BacklinkCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export function BacklinkCategorySelect({
  value,
  onChange,
  placeholder = '',
  label = 'Category',
  required = false,
  error
}: BacklinkCategorySelectProps) {
  const { t, currentLanguage } = useI18n();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isCustomCategory = value && !BACKLINK_CATEGORIES.find(cat => cat.value === value);

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

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Current Selection */}
      {value && (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <Badge variant="outline" className="text-sm">
            {getBacklinkCategoryLabel(value, currentLanguage)}
          </Badge>
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
            placeholder={placeholder}
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
            {BACKLINK_CATEGORIES.map((category) => (
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

          {/* Custom Input Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="w-full text-muted-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Custom category...
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