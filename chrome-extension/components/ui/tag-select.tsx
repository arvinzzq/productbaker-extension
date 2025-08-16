import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { COMMON_TAGS, getTagLabel } from '../../lib/constants';
import { Plus, X, Search } from 'lucide-react';

interface TagSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;
  error?: string;
}

export function TagSelect({
  value = [],
  onChange,
  placeholder = '',
  label = 'Tags',
  maxTags = 10,
  error
}: TagSelectProps) {
  const { t, currentLanguage } = useI18n();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group tags by category for better organization
  const tagGroups = {
    'ai': COMMON_TAGS.filter(tag => 
      ['ai-powered', 'machine-learning', 'deep-learning', 'llm', 'gpt', 'chatgpt', 'claude', 'openai', 'computer-vision', 'nlp', 'text-to-speech', 'speech-to-text', 'image-generation', 'stable-diffusion', 'midjourney'].includes(tag.value)
    ),
    'platform': COMMON_TAGS.filter(tag => 
      ['web-app', 'mobile-app', 'desktop-app', 'browser-extension', 'chrome-extension', 'pwa', 'api', 'saas', 'cloud-native', 'microservices'].includes(tag.value)
    ),
    'tech': COMMON_TAGS.filter(tag => 
      ['no-code', 'low-code', 'open-source', 'react', 'vue', 'next-js', 'typescript', 'javascript', 'python', 'node-js'].includes(tag.value)
    ),
    'business': COMMON_TAGS.filter(tag => 
      ['freemium', 'free', 'subscription', 'pay-per-use', 'one-time', 'enterprise', 'b2b', 'b2c'].includes(tag.value)
    ),
    'features': COMMON_TAGS.filter(tag => 
      ['real-time', 'collaboration', 'automation', 'workflow', 'analytics', 'dashboard', 'integration', 'multi-language', 'dark-mode', 'responsive'].includes(tag.value)
    ),
    'users': COMMON_TAGS.filter(tag => 
      ['developers', 'designers', 'content-creators', 'marketers', 'entrepreneurs', 'students', 'freelancers', 'remote-teams'].includes(tag.value)
    ),
    'integrations': COMMON_TAGS.filter(tag => 
      ['notion', 'slack', 'discord', 'figma', 'github', 'google-workspace', 'microsoft-365', 'zapier', 'webhooks'].includes(tag.value)
    ),
    'trending': COMMON_TAGS.filter(tag => 
      ['blockchain', 'web3', 'nft', 'metaverse', 'ar-vr', 'iot', 'edge-computing'].includes(tag.value)
    )
  };

  const filteredTags = searchQuery 
    ? COMMON_TAGS.filter(tag => 
        tag.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.labelZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory === 'all' 
      ? COMMON_TAGS 
      : tagGroups[selectedCategory as keyof typeof tagGroups] || [];

  const handleTagToggle = (tagValue: string) => {
    if (value.includes(tagValue)) {
      onChange(value.filter(tag => tag !== tagValue));
    } else if (value.length < maxTags) {
      onChange([...value, tagValue]);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim() && !value.includes(customValue.trim()) && value.length < maxTags) {
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

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const canAddMore = value.length < maxTags;

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium">
        {label}
        <span className="text-muted-foreground ml-2">
          ({value.length}/{maxTags})
        </span>
      </label>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {getTagLabel(tag, currentLanguage)}
              <button
                type="button"
                onClick={() => removeTag(tag)}
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
                    placeholder="Search tags..."
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
                  placeholder={placeholder || t('tagPlaceholder')}
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

          {/* Category Filter */}
          {!showCustomInput && (
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs h-7"
              >
                All
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'ai' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('ai')}
                className="text-xs h-7"
              >
                AI
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'platform' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('platform')}
                className="text-xs h-7"
              >
                Platform
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'tech' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('tech')}
                className="text-xs h-7"
              >
                Tech
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'business' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('business')}
                className="text-xs h-7"
              >
                Business
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'features' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('features')}
                className="text-xs h-7"
              >
                Features
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'users' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('users')}
                className="text-xs h-7"
              >
                Users
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'integrations' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('integrations')}
                className="text-xs h-7"
              >
                Integrations
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'trending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('trending')}
                className="text-xs h-7"
              >
                Trending
              </Button>
            </div>
          )}

          {/* Tag Options */}
          {!showCustomInput && (
            <div className="max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => {
                  const isSelected = value.includes(tag.value);
                  return (
                    <Button
                      key={tag.value}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTagToggle(tag.value)}
                      className="text-xs h-8"
                      disabled={!isSelected && !canAddMore}
                    >
                      {currentLanguage === 'zh' ? tag.labelZh : tag.labelEn}
                    </Button>
                  );
                })}
              </div>
              
              {filteredTags.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tags found. Try a custom tag instead.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {!canAddMore && (
        <p className="text-sm text-muted-foreground">
          Maximum number of tags reached ({maxTags})
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}