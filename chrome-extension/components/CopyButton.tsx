import React from 'react';
import { useCopy } from '../hooks/useCopy';
import { useI18n } from '../hooks/useI18n';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  showText?: boolean;
}

export function CopyButton({ 
  text, 
  className, 
  variant = 'outline', 
  size = 'sm',
  children,
  showText = false
}: CopyButtonProps) {
  const { copy, copied, error } = useCopy();
  const { t } = useI18n();

  const handleCopy = async () => {
    await copy(text);
  };

  const Icon = copied ? Check : Copy;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 gap-2",
        copied && variant === 'outline' && "text-green-600 border-green-600",
        copied && variant === 'default' && "bg-green-600 hover:bg-green-700 text-white border-green-600",
        className
      )}
      onClick={handleCopy}
      disabled={!text}
      title={error || (copied ? t('copied') + '!' : t('copy'))}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {showText && (
        <span className="text-xs">
          {copied ? t('copied') : t('copy')}
        </span>
      )}
      {children && (
        <span className="text-xs truncate">
          {children}
        </span>
      )}
    </Button>
  );
}