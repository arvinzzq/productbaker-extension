import React, { useState, useEffect, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useI18n } from '../hooks/useI18n';
import type { CreateProductInput, UpdateProductInput } from '../types/product';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ImageUpload } from './ui/image-upload';
import { MultiImageUpload } from './ui/multi-image-upload';
import { MultiCategorySelect } from './ui/multi-category-select';
import { TagSelect } from './ui/tag-select';
import { ImageUploadSettings } from './ImageUploadSettings';
import { useToast } from './ui/toast';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';

// Move FormField outside to prevent re-creation on each render
interface FormFieldProps {
  label: string;
  field: keyof CreateProductInput;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  value: string;
  onChange: (field: keyof CreateProductInput, value: string) => void;
  error?: string;
}

function FormField({ 
  label, 
  field, 
  type = 'text', 
  required = false,
  multiline = false,
  placeholder = '',
  value,
  onChange,
  error
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={error ? 'border-destructive' : ''}
          rows={4}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={error ? 'border-destructive' : ''}
        />
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

interface ProductFormProps {
  productId?: string | null;
  onClose: () => void;
  onSave: () => void;
  onManageCustomOptions?: () => void;
}

export function ProductForm({ productId, onClose, onSave, onManageCustomOptions }: ProductFormProps) {
  const { state, addProduct, updateProduct } = useProducts();
  const { t } = useI18n();
  const { products, isLoading } = state;

  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    title: '',
    url: '',
    email: '',
    logo: '',
    shortDescription: '',
    longDescription: '',
    screenshots: [],
    categories: [],
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showImageUploadSettings, setShowImageUploadSettings] = useState(false);
  const { showToast, toastElement } = useToast();

  const isEditing = Boolean(productId);
  const existingProduct = isEditing 
    ? products.find(p => p.id === productId)
    : null;

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        title: existingProduct.title,
        url: existingProduct.url,
        email: existingProduct.email || '',
        logo: existingProduct.logo,
        shortDescription: existingProduct.shortDescription,
        longDescription: existingProduct.longDescription,
        screenshots: existingProduct.screenshots,
        categories: existingProduct.categories || [],
        tags: existingProduct.tags || []
      });
    }
  }, [existingProduct]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }

    if (!formData.title.trim()) {
      newErrors.title = t('titleRequired');
    }

    if (!formData.url.trim()) {
      newErrors.url = t('urlRequired');
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = t('urlInvalid');
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = t('shortDescRequired');
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = t('categoryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (isEditing && productId) {
        const updates: UpdateProductInput = { ...formData };
        await updateProduct(productId, updates);
        showToast(t('updateSuccess'), 'success');
      } else {
        await addProduct(formData);
        showToast(t('addSuccess'), 'success');
      }
      // Delay closing to allow toast to show
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = useCallback((field: keyof CreateProductInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);




  // Handle image upload settings view
  if (showImageUploadSettings) {
    return (
      <>
        {toastElement}
        <ImageUploadSettings onClose={() => setShowImageUploadSettings(false)} />
      </>
    );
  }

  return (
    <>
      {toastElement}
      <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isEditing ? t('editProduct') : t('addProduct')}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label={t('productName')}
                field="name"
                required
                placeholder={t('namePlaceholder')}
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />
              <FormField
                label={t('productTitle')}
                field="title"
                required
                placeholder={t('titlePlaceholder')}
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
              />
              <FormField
                label={t('website')}
                field="url"
                type="url"
                required
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleInputChange}
                error={errors.url}
              />
              <FormField
                label={t('email')}
                field="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />
              <ImageUpload
                label={t('logoUrl')}
                value={formData.logo}
                onChange={(value) => handleInputChange('logo', value)}
                placeholder="https://example.com/logo.png"
                error={errors.logo}
                onConfigureUpload={() => setShowImageUploadSettings(true)}
              />
              <MultiCategorySelect
                label={t('category')}
                value={formData.categories}
                onChange={(value) => setFormData(prev => ({ ...prev, categories: value }))}
                placeholder={t('categoryPlaceholder')}
                maxCategories={3}
                error={errors.categories}
                onManageCustom={onManageCustomOptions}
              />
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('productDescription')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label={t('shortDescription')}
                field="shortDescription"
                required
                multiline
                placeholder={t('shortDescPlaceholder')}
                value={formData.shortDescription}
                onChange={handleInputChange}
                error={errors.shortDescription}
              />
              <FormField
                label={t('longDescription')}
                field="longDescription"
                multiline
                placeholder={t('longDescPlaceholder')}
                value={formData.longDescription}
                onChange={handleInputChange}
                error={errors.longDescription}
              />
            </CardContent>
          </Card>

          {/* Screenshots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('screenshots')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUpload
                label={t('screenshots')}
                value={formData.screenshots}
                onChange={(value) => setFormData(prev => ({ ...prev, screenshots: value }))}
                placeholder={t('screenshotPlaceholder')}
                maxImages={10}
                onConfigureUpload={() => setShowImageUploadSettings(true)}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('tags')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TagSelect
                label={t('tags')}
                value={formData.tags || []}
                onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
                placeholder={t('tagPlaceholder')}
                maxTags={10}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? t('updateProduct') : t('addProduct')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
}