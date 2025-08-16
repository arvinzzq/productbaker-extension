import { useReducer, useEffect } from 'react';
import { backlinkManager } from '../lib/backlinkManager';
import type { 
  BacklinkAppState, 
  BacklinkAction, 
  CreateBacklinkSiteInput, 
  UpdateBacklinkSiteInput,
  CreateBacklinkSubmissionInput,
  UpdateBacklinkSubmissionInput,
  BacklinkStats
} from '../types/backlink';

const initialState: BacklinkAppState = {
  sites: [],
  submissions: [],
  selectedSiteId: null,
  searchQuery: '',
  isLoading: false,
  error: null
};

function backlinkReducer(state: BacklinkAppState, action: BacklinkAction): BacklinkAppState {
  switch (action.type) {
    case 'SET_SITES':
      return { ...state, sites: action.payload, isLoading: false };
    case 'ADD_SITE':
      return { ...state, sites: [...state.sites, action.payload] };
    case 'UPDATE_SITE':
      return {
        ...state,
        sites: state.sites.map(site =>
          site.id === action.payload.id 
            ? { ...site, ...action.payload.updates, updatedAt: new Date() }
            : site
        )
      };
    case 'DELETE_SITE':
      return {
        ...state,
        sites: state.sites.filter(site => site.id !== action.payload),
        submissions: state.submissions.filter(sub => sub.siteId !== action.payload),
        selectedSiteId: state.selectedSiteId === action.payload ? null : state.selectedSiteId
      };
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.payload };
    case 'ADD_SUBMISSION':
      return { ...state, submissions: [...state.submissions, action.payload] };
    case 'UPDATE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map(sub =>
          sub.id === action.payload.id 
            ? { ...sub, ...action.payload.updates, updatedAt: new Date() }
            : sub
        )
      };
    case 'DELETE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.filter(sub => sub.id !== action.payload)
      };
    case 'SET_SELECTED_SITE':
      return { ...state, selectedSiteId: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        isLoading: false,
        error: null
      };
    default:
      return state;
  }
}

export function useBacklinks() {
  const [state, dispatch] = useReducer(backlinkReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadBacklinks();
  }, []);

  const loadBacklinks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [sites, submissions] = await Promise.all([
        backlinkManager.getSites(),
        backlinkManager.getSubmissions()
      ]);
      dispatch({ type: 'SET_SITES', payload: sites });
      dispatch({ type: 'SET_SUBMISSIONS', payload: submissions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load backlinks' });
    }
  };

  const addSite = async (input: CreateBacklinkSiteInput) => {
    try {
      const site = await backlinkManager.addSite(input);
      dispatch({ type: 'ADD_SITE', payload: site });
      return site;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add site' });
      throw error;
    }
  };

  const updateSite = async (id: string, updates: UpdateBacklinkSiteInput) => {
    try {
      const site = await backlinkManager.updateSite(id, updates);
      dispatch({ type: 'UPDATE_SITE', payload: { id, updates } });
      return site;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update site' });
      throw error;
    }
  };

  const deleteSite = async (id: string) => {
    try {
      await backlinkManager.deleteSite(id);
      dispatch({ type: 'DELETE_SITE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete site' });
      throw error;
    }
  };

  const addSubmission = async (input: CreateBacklinkSubmissionInput) => {
    try {
      const submission = await backlinkManager.addSubmission(input);
      dispatch({ type: 'ADD_SUBMISSION', payload: submission });
      return submission;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add submission' });
      throw error;
    }
  };

  const updateSubmission = async (id: string, updates: UpdateBacklinkSubmissionInput) => {
    try {
      const submission = await backlinkManager.updateSubmission(id, updates);
      dispatch({ type: 'UPDATE_SUBMISSION', payload: { id, updates } });
      return submission;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update submission' });
      throw error;
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      await backlinkManager.deleteSubmission(id);
      dispatch({ type: 'DELETE_SUBMISSION', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete submission' });
      throw error;
    }
  };

  const addCurrentPage = async (productId: string) => {
    try {
      const result = await backlinkManager.addCurrentPage(productId);
      dispatch({ type: 'ADD_SITE', payload: result.site });
      dispatch({ type: 'ADD_SUBMISSION', payload: result.submission });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add current page' });
      throw error;
    }
  };

  const getStats = async (): Promise<BacklinkStats> => {
    try {
      return await backlinkManager.getStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to get stats' });
      throw error;
    }
  };

  const checkSubmissionStatus = async (url: string, productId: string) => {
    try {
      return await backlinkManager.checkSubmissionStatus(url, productId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to check submission status' });
      return null;
    }
  };

  const clearAllData = () => {
    console.log('🧹 Clearing all backlink data from context');
    dispatch({ type: 'CLEAR_ALL_DATA' });
  };

  return {
    state,
    actions: {
      loadBacklinks,
      addSite,
      updateSite,
      deleteSite,
      addSubmission,
      updateSubmission,
      deleteSubmission,
      addCurrentPage,
      getStats,
      checkSubmissionStatus,
      clearAllData,
      setSelectedSite: (id: string | null) => dispatch({ type: 'SET_SELECTED_SITE', payload: id }),
      setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
      clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
    }
  };
}