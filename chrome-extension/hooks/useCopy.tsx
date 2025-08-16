import { useState, useCallback } from 'react';

interface UseCopyReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}

export function useCopy(timeout: number = 2000): UseCopyReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!text) {
      setError('No text to copy');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (err) {
      setError('Failed to copy to clipboard');
      console.error('Copy failed:', err);
      return false;
    }
  }, [timeout]);

  return { copy, copied, error };
}