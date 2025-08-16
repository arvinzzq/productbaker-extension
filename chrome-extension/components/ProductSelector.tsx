import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useI18n } from '../hooks/useI18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ProductSelector() {
  const { state, setSelectedProduct } = useProducts();
  const { t } = useI18n();
  const { products, selectedProductId } = state;

  const handleValueChange = (value: string) => {
    setSelectedProduct(value === 'none' ? null : value);
  };

  return (
    <Select 
      value={selectedProductId || 'none'} 
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('selectProduct') + '...'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">{t('pleaseSelectProduct')}</span>
        </SelectItem>
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            <div className="flex items-center space-x-2">
              {product.logo && (
                <img 
                  src={product.logo} 
                  alt={product.name}
                  className="w-4 h-4 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="truncate">{product.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}