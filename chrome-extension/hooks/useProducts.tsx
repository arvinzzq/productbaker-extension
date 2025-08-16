import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import type { Product, AppState, AppAction, CreateProductInput, UpdateProductInput } from '../types/product';
import { productManager } from '../lib/productManager';

const initialState: AppState = {
  products: [],
  selectedProductId: null,
  searchQuery: '',
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.updates, updatedAt: new Date() }
            : p
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        selectedProductId: state.selectedProductId === action.payload ? null : state.selectedProductId
      };
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProductId: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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

interface ProductContextType {
  state: AppState;
  loadProducts: () => Promise<void>;
  addProduct: (input: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, updates: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedProduct: (productId: string | null) => void;
  setSearchQuery: (query: string) => void;
  getSelectedProduct: () => Product | null;
  searchProducts: (query: string) => Product[];
  clearAllData: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadProducts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const products = await productManager.getProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      
      // Load selected product
      const selectedId = await productManager.getSelectedProduct();
      if (selectedId) {
        dispatch({ type: 'SET_SELECTED_PRODUCT', payload: selectedId.id });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load products' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addProduct = useCallback(async (input: CreateProductInput): Promise<Product> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const newProduct = await productManager.addProduct(input);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      return newProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: UpdateProductInput): Promise<Product> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const updatedProduct = await productManager.updateProduct(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
      return updatedProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      await productManager.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setSelectedProduct = useCallback(async (productId: string | null) => {
    try {
      await productManager.setSelectedProduct(productId);
      dispatch({ type: 'SET_SELECTED_PRODUCT', payload: productId });
    } catch (error) {
      console.error('Failed to set selected product:', error);
    }
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const getSelectedProduct = useCallback((): Product | null => {
    if (!state.selectedProductId) return null;
    return state.products.find(p => p.id === state.selectedProductId) || null;
  }, [state.selectedProductId, state.products]);

  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return state.products;
    
    const lowercaseQuery = query.toLowerCase();
    return state.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.shortDescription.toLowerCase().includes(lowercaseQuery) ||
      product.longDescription.toLowerCase().includes(lowercaseQuery) ||
      product.categories?.some(category => category.toLowerCase().includes(lowercaseQuery)) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [state.products]);

  const clearAllData = useCallback(() => {
    console.log('🧹 Clearing all product data from context');
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const contextValue: ProductContextType = useMemo(() => ({
    state,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    setSearchQuery,
    getSelectedProduct,
    searchProducts,
    clearAllData,
  }), [
    state,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    setSearchQuery,
    getSelectedProduct,
    searchProducts,
    clearAllData,
  ]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts(): ProductContextType {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}