import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, getAllLanguages } = useI18n();
  const languages = getAllLanguages();
  
  return (
    <div className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[120px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="text-sm">{lang.nativeName}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}