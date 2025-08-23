import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { KeywordRoot, KeywordRootState } from '../types/keywordRoot';
import { keywordRootManager } from '../lib/keywordRootManager';

type KeywordRootAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_KEYWORD_ROOTS'; payload: KeywordRoot[] }
  | { type: 'ADD_KEYWORD_ROOT'; payload: KeywordRoot }
  | { type: 'UPDATE_KEYWORD_ROOT'; payload: KeywordRoot }
  | { type: 'DELETE_KEYWORD_ROOT'; payload: string }
  | { type: 'SET_SELECTED'; payload: string | undefined }
  | { type: 'CLEAR_ERROR' };

const initialState: KeywordRootState = {
  keywordRoots: [],
  selectedKeywordRootId: undefined,
  isLoading: false,
  error: undefined,
};

function keywordRootReducer(state: KeywordRootState, action: KeywordRootAction): KeywordRootState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_KEYWORD_ROOTS':
      return { ...state, keywordRoots: action.payload, isLoading: false, error: undefined };
    case 'ADD_KEYWORD_ROOT':
      return { 
        ...state, 
        keywordRoots: [...state.keywordRoots, action.payload],
        isLoading: false,
        error: undefined 
      };
    case 'UPDATE_KEYWORD_ROOT':
      return {
        ...state,
        keywordRoots: state.keywordRoots.map(kr => 
          kr.id === action.payload.id ? action.payload : kr
        ),
        isLoading: false,
        error: undefined
      };
    case 'DELETE_KEYWORD_ROOT':
      return {
        ...state,
        keywordRoots: state.keywordRoots.filter(kr => kr.id !== action.payload),
        selectedKeywordRootId: state.selectedKeywordRootId === action.payload ? undefined : state.selectedKeywordRootId,
        isLoading: false,
        error: undefined
      };
    case 'SET_SELECTED':
      return { ...state, selectedKeywordRootId: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    default:
      return state;
  }
}

interface KeywordRootContextType {
  state: KeywordRootState;
  loadKeywordRoots: () => Promise<void>;
  addKeywordRoot: (keywordRoot: Omit<KeywordRoot, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateKeywordRoot: (id: string, updates: Partial<Omit<KeywordRoot, 'id' | 'createdAt'>>) => Promise<void>;
  deleteKeywordRoot: (id: string) => Promise<void>;
  selectKeywordRoot: (id: string | null) => Promise<void>;
  getSelectedKeywordRoot: () => KeywordRoot | undefined;
  openGoogleTrends: (id: string, options?: { geo?: string; timeframe?: string; category?: string }) => Promise<void>;
  exportKeywordRoots: () => Promise<string>;
  importKeywordRoots: (jsonData: string) => Promise<{ imported: number; errors: string[] }>;
  clearAllKeywordRoots: () => Promise<void>;
  clearError: () => void;
}

const KeywordRootContext = createContext<KeywordRootContextType | undefined>(undefined);

export function KeywordRootProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(keywordRootReducer, initialState);

  // Load keyword roots and selected ID on mount
  useEffect(() => {
    loadKeywordRoots();
  }, []);

  // Load selected keyword root ID
  useEffect(() => {
    const loadSelected = async () => {
      try {
        const selectedId = await keywordRootManager.getSelectedKeywordRootId();
        dispatch({ type: 'SET_SELECTED', payload: selectedId || undefined });
      } catch (error) {
        console.error('Failed to load selected keyword root ID:', error);
      }
    };
    
    loadSelected();
  }, []);

  const loadKeywordRoots = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const keywordRoots = await keywordRootManager.getKeywordRoots();
      dispatch({ type: 'SET_KEYWORD_ROOTS', payload: keywordRoots });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const addKeywordRoot = async (keywordRootData: Omit<KeywordRoot, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newKeywordRoot = await keywordRootManager.saveKeywordRoot(keywordRootData);
      dispatch({ type: 'ADD_KEYWORD_ROOT', payload: newKeywordRoot });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '添加关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateKeywordRoot = async (id: string, updates: Partial<Omit<KeywordRoot, 'id' | 'createdAt'>>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedKeywordRoot = await keywordRootManager.updateKeywordRoot(id, updates);
      dispatch({ type: 'UPDATE_KEYWORD_ROOT', payload: updatedKeywordRoot });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteKeywordRoot = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await keywordRootManager.deleteKeywordRoot(id);
      dispatch({ type: 'DELETE_KEYWORD_ROOT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const selectKeywordRoot = async (id: string | null) => {
    try {
      await keywordRootManager.setSelectedKeywordRootId(id);
      dispatch({ type: 'SET_SELECTED', payload: id || undefined });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '选择关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getSelectedKeywordRoot = (): KeywordRoot | undefined => {
    if (!state.selectedKeywordRootId) return undefined;
    return state.keywordRoots.find(kr => kr.id === state.selectedKeywordRootId);
  };

  const openGoogleTrends = async (id: string, options?: { geo?: string; timeframe?: string; category?: string }) => {
    try {
      await keywordRootManager.openGoogleTrends(id, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '打开Google Trends失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const exportKeywordRoots = async (): Promise<string> => {
    try {
      return await keywordRootManager.exportKeywordRoots();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导出关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const importKeywordRoots = async (jsonData: string): Promise<{ imported: number; errors: string[] }> => {
    try {
      const result = await keywordRootManager.importKeywordRoots(jsonData);
      // Reload keyword roots after import
      await loadKeywordRoots();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导入关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearAllKeywordRoots = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await keywordRootManager.clearAllKeywordRoots();
      dispatch({ type: 'SET_KEYWORD_ROOTS', payload: [] });
      dispatch({ type: 'SET_SELECTED', payload: undefined });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '清空关键词词根失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: KeywordRootContextType = {
    state,
    loadKeywordRoots,
    addKeywordRoot,
    updateKeywordRoot,
    deleteKeywordRoot,
    selectKeywordRoot,
    getSelectedKeywordRoot,
    openGoogleTrends,
    exportKeywordRoots,
    importKeywordRoots,
    clearAllKeywordRoots,
    clearError,
  };

  return (
    <KeywordRootContext.Provider value={contextValue}>
      {children}
    </KeywordRootContext.Provider>
  );
}

export function useKeywordRoots() {
  const context = useContext(KeywordRootContext);
  if (context === undefined) {
    throw new Error('useKeywordRoots must be used within a KeywordRootProvider');
  }
  return context;
}