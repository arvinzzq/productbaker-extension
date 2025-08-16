import React, { useState, useEffect } from 'react';
import { useBacklinks } from '../hooks/useBacklinks';
import { useProducts } from '../hooks/useProducts';
import { useI18n } from '../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Globe, 
  Link2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  BarChart3,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Tag,
  MoreVertical,
  Settings,
  Download,
  Upload,
  FileDown,
  FileUp
} from 'lucide-react';
import type { BacklinkSubmission, BacklinkStats } from '../types/backlink';

interface BacklinkManagerProps {
  onClose: () => void;
}

export function BacklinkManager({ onClose }: BacklinkManagerProps) {
  const { state: backlinkState, actions: backlinkActions } = useBacklinks();
  const { state: productState } = useProducts();
  const { t } = useI18n();
  const [selectedTab, setSelectedTab] = useState<'sites' | 'submissions' | 'stats'>('sites');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [stats, setStats] = useState<BacklinkStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [componentError, setComponentError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [backlinkState.submissions]);

  const loadStats = async () => {
    try {
      const statsData = await backlinkActions.getStats();
      setStats(statsData);
      setComponentError(null);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setComponentError('Failed to load backlink statistics');
    }
  };

  const handleAddCurrentPage = async () => {
    if (!selectedProductId) {
      alert(t('pleaseSelectProduct'));
      return;
    }

    try {
      await backlinkActions.addCurrentPage(selectedProductId);
      setSelectedTab('submissions');
    } catch (error) {
      console.error('Failed to add current page:', error);
      alert(error instanceof Error ? error.message : 'Failed to add current page');
    }
  };

  const handleUpdateSubmissionStatus = async (
    id: string, 
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'removed'
  ) => {
    try {
      const updates: any = { status };
      const now = new Date();
      
      // Always update lastStatusChange
      updates.lastStatusChange = now;
      
      switch (status) {
        case 'submitted':
          updates.submittedAt = now;
          break;
        case 'approved':
          updates.approvedAt = now;
          updates.reviewedAt = now;
          break;
        case 'rejected':
          updates.rejectedAt = now;
          updates.reviewedAt = now;
          break;
        case 'removed':
          updates.removedAt = now;
          break;
      }

      await backlinkActions.updateSubmission(id, updates);
    } catch (error) {
      console.error('Failed to update submission status:', error);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    const site = getSiteById(siteId);
    if (!site) return;
    
    if (confirm(t('confirmDelete') + `: ${site.name}?`)) {
      try {
        await backlinkActions.deleteSite(siteId);
      } catch (error) {
        console.error('Failed to delete site:', error);
        alert('Failed to delete site');
      }
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (confirm(t('confirmDelete') + '?')) {
      try {
        await backlinkActions.deleteSubmission(submissionId);
      } catch (error) {
        console.error('Failed to delete submission:', error);
        alert('Failed to delete submission');
      }
    }
  };

  const handleExportSitesCSV = async () => {
    try {
      const sites = backlinkState.sites || [];
      if (sites.length === 0) {
        alert(t('noSitesToExport') || 'No backlink sites to export');
        return;
      }

      // Create CSV header
      const csvHeader = 'Site Name,URL,Category,Description,Submission Instructions,Created Date\n';
      
      // Create CSV rows
      const csvRows = sites.map(site => {
        const categories = Array.isArray(site.categories) ? site.categories.join(';') : '';
        const description = (site.description || '').replace(/"/g, '""');
        const instructions = (site.submissionInstructions || '').replace(/"/g, '""');
        const createdDate = new Date(site.createdAt).toISOString().split('T')[0];
        
        return `"${site.name || ''}","${site.url || ''}","${categories}","${description}","${instructions}","${createdDate}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backlink-sites-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(t('exportSuccess') || 'Sites exported successfully!');
    } catch (error) {
      console.error('Failed to export sites:', error);
      alert(t('exportFailed') || 'Failed to export sites');
    }
  };

  const handleExportSubmissionsCSV = async () => {
    try {
      const submissions = backlinkState.submissions || [];
      if (submissions.length === 0) {
        alert(t('noSubmissionsToExport') || 'No submissions to export');
        return;
      }

      // Create CSV header
      const csvHeader = 'Site Name,Site URL,Product Name,Status,Submission URL,Submitted Date,Notes,Created Date\n';
      
      // Create CSV rows
      const csvRows = submissions.map(submission => {
        const site = getSiteById(submission.siteId);
        const product = getProductById(submission.productId);
        const siteName = site?.name || '';
        const siteUrl = site?.url || '';
        const productName = product?.name || '';
        const submittedDate = submission.submittedAt ? new Date(submission.submittedAt).toISOString().split('T')[0] : '';
        const notes = (submission.notes || '').replace(/"/g, '""');
        const createdDate = new Date(submission.createdAt).toISOString().split('T')[0];
        
        return `"${siteName}","${siteUrl}","${productName}","${submission.status}","${submission.submissionUrl || ''}","${submittedDate}","${notes}","${createdDate}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backlink-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(t('exportSuccess') || 'Submissions exported successfully!');
    } catch (error) {
      console.error('Failed to export submissions:', error);
      alert(t('exportFailed') || 'Failed to export submissions');
    }
  };

  const handleExportAllJSON = async () => {
    try {
      const exportData = {
        sites: backlinkState.sites || [],
        submissions: backlinkState.submissions || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backlink-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(t('exportSuccess') || 'Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert(t('exportFailed') || 'Failed to export data');
    }
  };

  const handleImportSitesCSV = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          alert(t('invalidCSVFile') || 'Invalid CSV file');
          return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const importedSites = [];
        let processedCount = 0;

        for (const line of dataLines) {
          try {
            // Simple CSV parsing - handles quoted fields
            const fields = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"' && (i === 0 || line[i-1] === ',')) {
                inQuotes = true;
              } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
                inQuotes = false;
              } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            fields.push(current.trim());

            // Remove quotes from fields
            const cleanFields = fields.map(field => field.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));
            
            const [name, url, category, description, instructions] = cleanFields;
            
            if (name && url) {
              const categories = category ? category.split(';').filter(c => c.trim()) : [];
              
              await backlinkActions.addSite({
                name: name.trim(),
                url: url.trim(),
                categories,
                description: description?.trim() || '',
                submissionInstructions: instructions?.trim() || ''
              });
              
              importedSites.push(name);
              processedCount++;
            }
          } catch (lineError) {
            console.error('Error processing line:', line, lineError);
          }
        }

        if (processedCount > 0) {
          alert(t('importSuccess', { count: processedCount.toString() }) || `Successfully imported ${processedCount} sites!`);
        } else {
          alert(t('noValidDataFound') || 'No valid site data found in CSV file');
        }
      } catch (error) {
        console.error('Failed to import sites:', error);
        alert(t('importFailed') || 'Failed to import sites from CSV');
      }
    };
    input.click();
  };

  const getStatusBadge = (submission: BacklinkSubmission) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, text: t('pending') },
      submitted: { variant: 'default' as const, icon: Link2, text: t('submitted') },
      approved: { variant: 'default' as const, icon: CheckCircle, text: t('approved') },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: t('rejected') },
      removed: { variant: 'destructive' as const, icon: Trash2, text: t('removed') }
    };

    const config = statusConfig[submission.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getSiteById = (siteId: string) => {
    if (!backlinkState.sites || !Array.isArray(backlinkState.sites)) {
      return undefined;
    }
    return backlinkState.sites.find(site => site.id === siteId);
  };

  const getProductById = (productId: string) => {
    if (!productState.products || !Array.isArray(productState.products)) {
      return undefined;
    }
    return productState.products.find(product => product.id === productId);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };


  const getFilteredSites = () => {
    if (!backlinkState.sites || !Array.isArray(backlinkState.sites)) {
      return [];
    }
    
    let filtered = backlinkState.sites;
    
    if (searchQuery) {
      filtered = filtered.filter(site => 
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(site => 
        site.categories && Array.isArray(site.categories) && site.categories.includes(categoryFilter)
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const getFilteredSubmissions = () => {
    if (!backlinkState.submissions || !Array.isArray(backlinkState.submissions)) {
      return [];
    }
    
    let filtered = backlinkState.submissions;
    
    if (searchQuery) {
      filtered = filtered.filter(submission => {
        const site = getSiteById(submission.siteId);
        const product = getProductById(submission.productId);
        return (
          site?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.submissionUrl?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const getAllCategories = () => {
    const categories = new Set<string>();
    if (backlinkState.sites && Array.isArray(backlinkState.sites)) {
      backlinkState.sites.forEach(site => {
        if (site.categories && Array.isArray(site.categories)) {
          site.categories.forEach(category => categories.add(category));
        }
      });
    }
    return Array.from(categories).sort();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h1 className="text-base sm:text-lg font-semibold truncate">{t('backlinks')}</h1>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-24 sm:w-32 md:w-48">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                {productState.products && Array.isArray(productState.products) ? 
                  productState.products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  )) : null
                }
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddCurrentPage} 
              disabled={!selectedProductId}
              size="sm"
              className="hidden sm:flex text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Collect
            </Button>
            <Button 
              onClick={handleAddCurrentPage} 
              disabled={!selectedProductId}
              size="sm"
              className="sm:hidden"
            >
              <Plus className="h-3 w-3" />
            </Button>
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hidden md:flex text-xs"
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportSitesCSV}>
                  <FileDown className="h-3 w-3 mr-2" />
                  Export Sites (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSubmissionsCSV}>
                  <FileDown className="h-3 w-3 mr-2" />
                  Export Submissions (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAllJSON}>
                  <FileDown className="h-3 w-3 mr-2" />
                  Export All (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hidden md:flex text-xs"
                >
                  <FileUp className="h-3 w-3 mr-1" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleImportSitesCSV}>
                  <FileUp className="h-3 w-3 mr-2" />
                  Import Sites (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Export/Import */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="md:hidden"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportSitesCSV}>
                  <FileDown className="h-3 w-3 mr-2" />
                  Export Sites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSubmissionsCSV}>
                  <FileDown className="h-3 w-3 mr-2" />
                  Export Submissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAllJSON}>
                  <FileDown className="h-3 w-3 mr-2" />
                  Export All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportSitesCSV}>
                  <FileUp className="h-3 w-3 mr-2" />
                  Import Sites
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          <Button
            variant={selectedTab === 'sites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('sites')}
            className="flex-shrink-0 text-xs sm:text-sm"
          >
            <Globe className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('backlinkSites')}</span>
            <span className="sm:hidden">Sites</span>
          </Button>
          <Button
            variant={selectedTab === 'submissions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('submissions')}
            className="flex-shrink-0 text-xs sm:text-sm"
          >
            <Link2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('backlinkSubmissions')}</span>
            <span className="sm:hidden">Submissions</span>
          </Button>
          <Button
            variant={selectedTab === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('stats')}
            className="flex-shrink-0 text-xs sm:text-sm"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('backlinkStats')}</span>
            <span className="sm:hidden">Stats</span>
          </Button>
        </div>

        {/* Filters */}
        {(selectedTab === 'sites' || selectedTab === 'submissions') && (
          <div className="space-y-2 mt-3 sm:mt-4">
            {/* Search bar - full width on mobile */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-7 sm:pl-8 text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            
            {/* Filter dropdowns */}
            <div className="flex flex-wrap gap-1">
              {selectedTab === 'submissions' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {selectedTab === 'sites' && getAllCategories().length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getAllCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Select value={sortBy} onValueChange={setSortBy as (value: string) => void}>
                <SelectTrigger className="w-20 sm:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  {selectedTab === 'submissions' && (
                    <SelectItem value="status">Status</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {componentError && (
          <Card className="border-destructive mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{componentError}</p>
            </CardContent>
          </Card>
        )}
        
        {backlinkState.error && (
          <Card className="border-destructive mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{backlinkState.error}</p>
            </CardContent>
          </Card>
        )}
        
        {selectedTab === 'sites' && (
          <div className="space-y-4">
            {getFilteredSites().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {backlinkState.sites.length === 0 ? 'No backlink sites yet' : 'No sites match your filters'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredSites().map(site => (
                <Card key={site.id}>
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base truncate">{site.name}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center mt-1">
                          <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{site.url}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          Added: {formatDate(site.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(site.url, '_blank')}
                          className="h-6 w-6 sm:h-8 sm:w-8"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSite(site.id)}
                          className="h-6 w-6 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="space-y-2">
                      {site.description && (
                        <p className="text-xs sm:text-sm">{site.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {site.categories && Array.isArray(site.categories) ? 
                          site.categories.map(category => (
                            <Badge key={category} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {category}
                            </Badge>
                          )) : null
                        }
                        {site.tags && Array.isArray(site.tags) ? 
                          site.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          )) : null
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {selectedTab === 'submissions' && (
          <div className="space-y-4">
            {getFilteredSubmissions().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {backlinkState.submissions.length === 0 ? 'No submissions yet' : 'No submissions match your filters'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredSubmissions().map(submission => {
                const site = getSiteById(submission.siteId);
                const product = getProductById(submission.productId);
                
                return (
                  <Card key={submission.id}>
                    <CardHeader className="p-3 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm sm:text-base truncate">
                            {site?.name || 'Unknown Site'}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            Created: {formatDate(submission.createdAt)}
                          </p>
                        </div>
                        <div className="ml-2">
                          {getStatusBadge(submission)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('submissionUrl')}</p>
                          <p className="text-xs sm:text-sm break-all">{submission.submissionUrl}</p>
                        </div>
                        
                        {/* Date Information */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {submission.submittedAt && (
                            <div>
                              <span className="text-muted-foreground">Submitted:</span>
                              <br />
                              <span>{formatDate(submission.submittedAt)}</span>
                            </div>
                          )}
                          {submission.reviewedAt && (
                            <div>
                              <span className="text-muted-foreground">Reviewed:</span>
                              <br />
                              <span>{formatDate(submission.reviewedAt)}</span>
                            </div>
                          )}
                          {submission.approvedAt && (
                            <div>
                              <span className="text-muted-foreground">Approved:</span>
                              <br />
                              <span>{formatDate(submission.approvedAt)}</span>
                            </div>
                          )}
                          {submission.rejectedAt && (
                            <div>
                              <span className="text-muted-foreground">Rejected:</span>
                              <br />
                              <span>{formatDate(submission.rejectedAt)}</span>
                            </div>
                          )}
                          {submission.lastStatusChange && (
                            <div>
                              <span className="text-muted-foreground">Last Change:</span>
                              <br />
                              <span>{formatDate(submission.lastStatusChange)}</span>
                            </div>
                          )}
                        </div>
                        
                        {submission.notes && (
                          <div>
                            <p className="text-xs text-muted-foreground">Notes:</p>
                            <p className="text-sm">{submission.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubmissionStatus(submission.id, 'submitted')}
                            disabled={submission.status !== 'pending'}
                            className="text-xs sm:text-sm"
                          >
                            <span className="hidden sm:inline">{t('markAsSubmitted')}</span>
                            <span className="sm:hidden">Submitted</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubmissionStatus(submission.id, 'approved')}
                            disabled={submission.status !== 'submitted'}
                            className="text-xs sm:text-sm"
                          >
                            <span className="hidden sm:inline">{t('markAsApproved')}</span>
                            <span className="sm:hidden">Approved</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubmissionStatus(submission.id, 'rejected')}
                            disabled={submission.status !== 'submitted'}
                            className="text-xs sm:text-sm"
                          >
                            <span className="hidden sm:inline">{t('markAsRejected')}</span>
                            <span className="sm:hidden">Rejected</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="text-destructive hover:text-destructive text-xs sm:text-sm"
                          >
                            <Trash2 className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {selectedTab === 'stats' && stats && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">{stats.totalSites}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('totalSites')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">{stats.totalSubmissions}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('totalSubmissions')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">{stats.approvedSubmissions}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('approvedSubmissions')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('approvalRate')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}