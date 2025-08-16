export interface Product {
  id: string;
  name: string;
  title: string;
  url: string;
  email?: string;
  logo: string;
  shortDescription: string;
  longDescription: string;
  screenshots: string[];
  categories: string[];  // Changed from category to categories (array)
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  title: string;
  url: string;
  email?: string;
  logo: string;
  shortDescription: string;
  longDescription: string;
  screenshots: string[];
  categories: string[];  // Changed from category to categories (array)
  tags?: string[];
}

export interface UpdateProductInput {
  name?: string;
  title?: string;
  url?: string;
  email?: string;
  logo?: string;
  shortDescription?: string;
  longDescription?: string;
  screenshots?: string[];
  categories?: string[];  // Changed from category to categories (array)
  tags?: string[];
}

export interface AppState {
  products: Product[];
  selectedProductId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: UpdateProductInput } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_SELECTED_PRODUCT'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_DATA' };