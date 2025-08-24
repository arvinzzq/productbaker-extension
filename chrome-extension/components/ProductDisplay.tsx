import React, { useState } from 'react';
import type { Product } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { useI18n } from '../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CopyButton } from './CopyButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Edit, Globe, Mail, Tag, Calendar, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { getCategoryLabel, getTagLabel } from '../lib/constants';
import { cn } from '../lib/utils';

interface ProductDisplayProps {
  product: Product;
  onEdit: () => void;
}

export function ProductDisplay({ product, onEdit }: ProductDisplayProps) {
  const { deleteProduct } = useProducts();
  const { t, formatDate, currentLanguage } = useI18n();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      const isBase64 = imageUrl.startsWith('data:');
      
      if (isBase64) {
        // For base64 images, use the data URL directly
        link.href = imageUrl;
        link.download = `${fileName}_${Date.now()}.png`;
      } else {
        // For URL images, fetch and download
        fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
          });
        return;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const FieldRow = ({ 
    label, 
    value, 
    icon: Icon,
    copyValue,
    multiline = false 
  }: {
    label: string;
    value: string;
    icon?: React.ComponentType<any>;
    copyValue?: string;
    multiline?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{label}</span>
        </div>
        <CopyButton 
          text={copyValue || value} 
          size="icon" 
          variant="ghost"
          className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
        />
      </div>
      <div className={cn(
        "text-xs sm:text-sm bg-muted/50 rounded-md p-2 sm:p-3 professional-border",
        multiline && "min-h-[60px] sm:min-h-[80px]"
      )}>
        {multiline ? (
          <div className="whitespace-pre-wrap break-words">{value}</div>
        ) : (
          <div className="break-all" title={value}>{value}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
      {/* Header with Logo and Actions */}
      <Card className="card-floating">
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 min-w-0">
              {product.logo && (
                <div className="relative group">
                  <img 
                    src={product.logo} 
                    alt={product.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadImage(product.logo, `${product.name}_logo`)}
                    className="absolute inset-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                    title="Download logo"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </Button>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg truncate">{product.name}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.title}</p>
              </div>
            </div>
            <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
              <Button onClick={onEdit} size="sm" variant="floating" className="text-xs sm:text-sm">
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('edit')}</span>
              </Button>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm card-elevated">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('delete')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('confirmDelete')}</DialogTitle>
                    <DialogDescription>
                      {t('confirmDeleteDesc', { name: product.name })}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      disabled={isDeleting}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('deleting')}
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('confirm')} {t('delete')}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Product Fields */}
      <Card className="card-floating">
        <CardContent className="p-4 space-y-4">
          <FieldRow 
            label={t('website')} 
            value={product.url}
            icon={Globe}
          />

          {product.email && (
            <FieldRow 
              label={t('email')} 
              value={product.email}
              icon={Mail}
            />
          )}
          
          <FieldRow 
            label={t('shortDescription')} 
            value={product.shortDescription}
          />
          
          <FieldRow 
            label={t('longDescription')} 
            value={product.longDescription}
            multiline
          />
          
          {product.categories && product.categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">{t('category')}</span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {product.categories.map(category => (
                  <Badge key={category} variant="outline" className="text-xs card-elevated">
                    {getCategoryLabel(category, currentLanguage)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{t('tags')}</span>
                <CopyButton 
                  text={product.tags.join(', ')} 
                  size="icon" 
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {product.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                  >
                    {getTagLabel(tag, currentLanguage)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.screenshots && product.screenshots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('screenshots')} ({product.screenshots.length})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                {product.screenshots.slice(0, 4).map((screenshot, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={screenshot} 
                      alt={`${product.name} ${t('screenshot')} ${index + 1}`}
                      className="w-full h-16 sm:h-20 object-cover rounded-md professional-border cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105"
                      onClick={() => window.open(screenshot, '_blank')}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(screenshot, `${product.name}_screenshot_${index + 1}`);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 p-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center"
                      title="Download screenshot"
                    >
                      <Download className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
              {product.screenshots.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  {product.screenshots.length - 4} {t('moreScreenshots')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="card-floating">
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{t('createdAt')} {formatDate(product.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{t('updatedAt')} {formatDate(product.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Copy Actions */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">{t('quickCopy')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
            <CopyButton 
              text={product.name}
              variant="outline"
              size="sm"
              className="justify-start text-xs sm:text-sm"
            >
              <span className="truncate">{t('copyName')}</span>
            </CopyButton>
            <CopyButton 
              text={product.url}
              variant="outline"
              size="sm"
              className="justify-start text-xs sm:text-sm"
            >
              <span className="truncate">{t('copyUrl')}</span>
            </CopyButton>
            <CopyButton 
              text={product.shortDescription}
              variant="outline"
              size="sm"
              className="justify-start text-xs sm:text-sm"
            >
              <span className="truncate">{t('copyShortDesc')}</span>
            </CopyButton>
            <CopyButton 
              text={product.longDescription}
              variant="outline"
              size="sm"
              className="justify-start text-xs sm:text-sm"
            >
              <span className="truncate">{t('copyLongDesc')}</span>
            </CopyButton>
          </div>
          
          <CopyButton 
            text={`${product.name} - ${product.shortDescription}\n${product.url}`}
            variant="default"
            size="sm"
            className="w-full justify-center text-xs sm:text-sm"
          >
            {t('copyFullInfo')}
          </CopyButton>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// Helper function for className utility
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}