// Internationalization system for ProductBaker

export type Language = 'en' | 'zh';

export interface Translations {
  // App general
  appName: string;
  appDescription: string;
  
  // Navigation
  addProduct: string;
  editProduct: string;
  deleteProduct: string;
  selectProduct: string;
  pleaseSelectProduct: string;
  
  // Product fields
  productName: string;
  productTitle: string;
  website: string;
  email: string;
  logoUrl: string;
  shortDescription: string;
  longDescription: string;
  screenshots: string;
  category: string;
  tags: string;
  
  // Actions
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  copy: string;
  copied: string;
  add: string;
  update: string;
  updateProduct: string;
  confirm: string;
  close: string;
  
  // Form validation
  required: string;
  nameRequired: string;
  titleRequired: string;
  urlRequired: string;
  urlInvalid: string;
  shortDescRequired: string;
  categoryRequired: string;
  enterProductName: string;
  enterProductTitle: string;
  enterWebsite: string;
  enterCategory: string;
  validUrlRequired: string;
  
  // Placeholders
  namePlaceholder: string;
  titlePlaceholder: string;
  enterProductNamePlaceholder: string;
  enterProductTitlePlaceholder: string;
  websitePlaceholder: string;
  emailPlaceholder: string;
  logoPlaceholder: string;
  categoryPlaceholder: string;
  shortDescPlaceholder: string;
  longDescPlaceholder: string;
  screenshotPlaceholder: string;
  tagPlaceholder: string;
  
  // Sections
  basicInfo: string;
  productDescription: string;
  productScreenshots: string;
  productTags: string;
  quickCopy: string;
  metadata: string;
  
  // Status messages
  loading: string;
  saving: string;
  deleting: string;
  noProducts: string;
  noProductsDesc: string;
  selectProductDesc: string;
  
  // Confirm dialogs
  confirmDelete: string;
  confirmDeleteDesc: string;
  
  // Copy actions
  copyName: string;
  copyUrl: string;
  copyShortDesc: string;
  copyLongDesc: string;
  copyFullInfo: string;
  
  // Time
  createdAt: string;
  updatedAt: string;
  
  // Errors
  failedToLoad: string;
  failedToSave: string;
  failedToDelete: string;
  failedToCopy: string;
  
  // Success messages
  addSuccess: string;
  updateSuccess: string;
  exportSuccess: string;
  importSuccess: string;
  
  // Export/Import messages
  noSitesToExport: string;
  noSubmissionsToExport: string;
  exportFailed: string;
  importFailed: string;
  invalidCSVFile: string;
  noValidDataFound: string;
  
  // Storage management messages
  storageQuotaWarning: string;
  storageWarningTitle: string;
  storageWarningMessage: string;
  uploadDisabled: string;
  useImageUrls: string;
  storageManagement: string;
  manageStorage: string;
  storageManagementDesc: string;
  storageUsage: string;
  totalUsage: string;
  dataBreakdown: string;
  storageMode: string;
  localStorage: string;
  switchToOnline: string;
  localStorageDescription: string;
  dataManagement: string;
  exportAllData: string;
  importAllData: string;
  clearAllData: string;
  clearAllDataWarning: string;
  refreshStorageInfo: string;
  highStorageUsage: string;
  highStorageWarning: string;
  needOnlineStorage: string;
  contactAuthor: string;
  onlineStorageNotSupported: string;
  confirmImportWarning: string;
  confirmClearAllData: string;
  confirmClearAllDataFinal: string;
  clearDataSuccess: string;
  clearDataFailed: string;
  failedToLoadStorage: string;
  products: string;
  
  // Image upload configuration messages
  uploadNotConfigured: string;
  uploadNotConfiguredTitle: string;
  uploadNotConfiguredMessage: string;
  uploadConfiguredTitle: string;
  uploadConfiguredMessage: string;
  uploadEndpoint: string;
  configureUpload: string;
  configureUploadToEnable: string;
  uploading: string;
  clickToUpload: string;
  maxSizeInfo: string;
  maxFilesInfo: string;
  tooManyFiles: string;
  uploadFailed: string;
  imageUploadSettings: string;
  uploadConfigInfo: string;
  uploadConfigInfoDesc: string;
  uploadConfiguration: string;
  enabled: string;
  disabled: string;
  enableImageUpload: string;
  enableUploadDesc: string;
  presetConfigurations: string;
  selectPreset: string;
  presetDesc: string;
  apiConfiguration: string;
  apiUrl: string;
  httpMethod: string;
  fieldName: string;
  fieldNameDesc: string;
  responseUrlPath: string;
  responseUrlPathDesc: string;
  httpHeaders: string;
  addHeader: string;
  headerName: string;
  headerValue: string;
  headersDesc: string;
  advancedSettings: string;
  maxFileSize: string;
  timeout: string;
  seconds: string;
  allowedTypes: string;
  allowedTypesDesc: string;
  testConfiguration: string;
  testing: string;
  testConnection: string;
  saveConfiguration: string;
  reset: string;
  needHelp: string;
  helpImgur: string;
  helpCloudinary: string;
  helpCustom: string;
  failedToLoadConfig: string;
  configSaved: string;
  failedToSaveConfig: string;
  confirmResetConfig: string;
  configureImageUpload: string;
  configureImageUploadDesc: string;
  configure: string;
  
  // Backlinks
  backlinks: string;
  backlinkSites: string;
  addBacklinkSite: string;
  editBacklinkSite: string;
  deleteBacklinkSite: string;
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  siteCategory: string;
  submissionInstructions: string;
  backlinkSubmissions: string;
  submissionStatus: string;
  pending: string;
  submitted: string;
  approved: string;
  rejected: string;
  removed: string;
  submittedAt: string;
  approvedAt: string;
  rejectedAt: string;
  removedAt: string;
  responseUrl: string;
  notes: string;
  addCurrentPage: string;
  collectCurrentPage: string;
  markAsSubmitted: string;
  markAsApproved: string;
  markAsRejected: string;
  submissionUrl: string;
  backlinkStats: string;
  totalSites: string;
  totalSubmissions: string;
  pendingSubmissions: string;
  approvedSubmissions: string;
  rejectedSubmissions: string;
  approvalRate: string;
  
  // Keyword Roots
  keywordRoots: string;
  keywordRootManagement: string;
  addKeywordRoot: string;
  editKeywordRoot: string;
  deleteKeywordRoot: string;
  keywordRootName: string;
  keywords: string;
  addKeyword: string;
  removeKeyword: string;
  googleTrends: string;
  openGoogleTrends: string;
  trendsSettings: string;
  geography: string;
  timeRange: string;
  categoryId: string;
  globalLocation: string;
  past7Days: string;
  past1Day: string;
  past1Month: string;
  past3Months: string;
  past12Months: string;
  past5Years: string;
  allTime: string;
  trendsNote: string;
  noKeywordRoots: string;
  noKeywordRootsDesc: string;
  searchKeywordRoots: string;
  atLeastOneKeyword: string;
  keywordRootDescription: string;
  optional: string;

  // Other
  screenshot: string;
  moreScreenshots: string;
  backlink: string;
  efficiency: string;
}

const enTranslations: Translations = {
  // App general
  appName: 'ProductBaker',
  appDescription: 'Product Information Manager',
  
  // Navigation
  addProduct: 'Add Product',
  editProduct: 'Edit Product',
  deleteProduct: 'Delete Product',
  selectProduct: 'Select Product',
  pleaseSelectProduct: 'Please select a product',
  
  // Product fields
  productName: 'Product Name',
  productTitle: 'Product Title',
  website: 'Website',
  email: 'Email',
  logoUrl: 'Logo URL',
  shortDescription: 'Short Description',
  longDescription: 'Long Description',
  screenshots: 'Screenshots',
  category: 'Category',
  tags: 'Tags',
  
  // Actions
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  copy: 'Copy',
  copied: 'Copied',
  add: 'Add',
  update: 'Update',
  updateProduct: 'Update Product',
  confirm: 'Confirm',
  close: 'Close',
  
  // Form validation
  required: 'Please enter',
  nameRequired: 'Please enter product name',
  titleRequired: 'Please enter product title',
  urlRequired: 'Please enter website URL',
  urlInvalid: 'Please enter a valid URL (starting with http:// or https://)',
  shortDescRequired: 'Please enter short description',
  categoryRequired: 'Please enter product category',
  enterProductName: 'Please enter product name',
  enterProductTitle: 'Please enter product title',
  enterWebsite: 'Please enter website URL',
  enterCategory: 'Please enter product category',
  validUrlRequired: 'Please enter a valid URL (starting with http:// or https://)',
  
  // Placeholders
  namePlaceholder: 'Enter product name',
  titlePlaceholder: 'Enter product title',
  enterProductNamePlaceholder: 'Enter product name',
  enterProductTitlePlaceholder: 'Enter product title',
  websitePlaceholder: 'https://example.com',
  emailPlaceholder: 'contact@example.com',
  logoPlaceholder: 'https://example.com/logo.png',
  categoryPlaceholder: 'e.g. SaaS, Tool, Social, etc.',
  shortDescPlaceholder: 'Brief introduction of product features (50-100 words recommended)',
  longDescPlaceholder: 'Detailed description of product features, advantages and use cases (200-500 words recommended)',
  screenshotPlaceholder: 'Enter screenshot URL',
  tagPlaceholder: 'Enter tag',
  
  // Sections
  basicInfo: 'Basic Information',
  productDescription: 'Product Description',
  productScreenshots: 'Product Screenshots',
  productTags: 'Tags',
  quickCopy: 'Quick Copy',
  metadata: 'Metadata',
  
  // Status messages
  loading: 'Loading...',
  saving: 'Saving...',
  deleting: 'Deleting...',
  noProducts: 'No Products',
  noProductsDesc: 'Start by adding your first product information',
  selectProductDesc: 'Select a product from the dropdown above to view details',
  
  // Confirm dialogs
  confirmDelete: 'Confirm Delete',
  confirmDeleteDesc: 'Are you sure you want to delete product "{name}"? This action cannot be undone.',
  
  // Copy actions
  copyName: 'Name',
  copyUrl: 'URL',
  copyShortDesc: 'Short Description',
  copyLongDesc: 'Long Description',
  copyFullInfo: 'Complete Info',
  
  // Time
  createdAt: 'Created',
  updatedAt: 'Updated',
  
  // Errors
  failedToLoad: 'Failed to load products',
  failedToSave: 'Failed to save product',
  failedToDelete: 'Failed to delete product',
  failedToCopy: 'Failed to copy to clipboard',
  
  // Success messages
  addSuccess: 'Product added successfully!',
  updateSuccess: 'Product updated successfully!',
  exportSuccess: 'Export completed successfully!',
  importSuccess: 'Successfully imported {count} items!',
  
  // Export/Import messages
  noSitesToExport: 'No backlink sites to export',
  noSubmissionsToExport: 'No submissions to export',
  exportFailed: 'Failed to export data',
  importFailed: 'Failed to import data',
  invalidCSVFile: 'Invalid CSV file format',
  noValidDataFound: 'No valid data found in file',
  
  // Storage management messages
  storageQuotaWarning: 'File uploads are disabled due to local storage limitations. Please use image URLs instead. If you need to store images locally, consider using the data export/import feature or contact the author for online storage options.',
  storageWarningTitle: 'Storage Limitation',
  storageWarningMessage: 'File uploads are disabled to prevent storage quota issues. Please use image URLs instead or contact the author for online storage options.',
  uploadDisabled: 'Upload Disabled',
  useImageUrls: 'Please use image URLs to avoid storage limitations',
  storageManagement: 'Storage Management',
  manageStorage: 'Manage Storage & Backups',
  storageManagementDesc: 'View storage usage, manage data backups, and configure storage options.',
  storageUsage: 'Storage Usage',
  totalUsage: 'Total Usage',
  dataBreakdown: 'Data Breakdown',
  storageMode: 'Storage Mode',
  localStorage: 'Local Storage',
  switchToOnline: 'Switch to Online',
  localStorageDescription: 'Data is stored locally in your browser. Limited to ~10MB total storage.',
  dataManagement: 'Data Management',
  exportAllData: 'Export All Data',
  importAllData: 'Import All Data',
  clearAllData: 'Clear All Data',
  clearAllDataWarning: 'This action cannot be undone. Export your data first!',
  refreshStorageInfo: 'Refresh Storage Info',
  highStorageUsage: 'High Storage Usage',
  highStorageWarning: 'Consider exporting data and clearing unused items to free up space.',
  needOnlineStorage: 'Need online storage?',
  contactAuthor: 'Contact the author',
  onlineStorageNotSupported: 'Online storage is not yet supported. If you need this feature, please contact the author at: productbaker@example.com',
  confirmImportWarning: 'This will replace ALL existing data. Are you sure you want to continue?',
  confirmClearAllData: 'This will delete ALL data permanently. Are you sure?',
  confirmClearAllDataFinal: 'Last chance: This action cannot be undone. Proceed?',
  clearDataSuccess: 'All data cleared successfully',
  clearDataFailed: 'Failed to clear data',
  failedToLoadStorage: 'Failed to load storage information',
  products: 'Products',
  
  // Image upload configuration messages
  uploadNotConfigured: 'Image upload is not configured. Please configure an upload API endpoint in settings, or use image URLs to avoid consuming local storage space.',
  uploadNotConfiguredTitle: 'Upload Not Configured',
  uploadNotConfiguredMessage: 'Configure an image upload API to enable file uploads. This avoids storing large image files in local storage which consumes significant space.',
  uploadConfiguredTitle: 'Upload Configured',
  uploadConfiguredMessage: 'Images will be uploaded to your configured API endpoint. This saves local storage space.',
  uploadEndpoint: 'Endpoint',
  configureUpload: 'Configure Upload',
  configureUploadToEnable: 'Configure upload API to enable file uploads',
  uploading: 'Uploading...',
  clickToUpload: 'Click to upload or drag and drop',
  maxSizeInfo: 'Max size',
  maxFilesInfo: 'Max {max} more files',
  tooManyFiles: 'You can only upload {max} more images',
  uploadFailed: 'Upload failed',
  imageUploadSettings: 'Image Upload Settings',
  uploadConfigInfo: 'Why Configure Image Upload?',
  uploadConfigInfoDesc: 'Storing images as base64 in local storage consumes significant space (a 1MB image becomes ~1.37MB). Configure an image upload API to save space and avoid storage quota issues.',
  uploadConfiguration: 'Upload Configuration',
  enabled: 'Enabled',
  disabled: 'Disabled',
  enableImageUpload: 'Enable image upload via API',
  enableUploadDesc: 'When disabled, only image URLs will be accepted to avoid consuming local storage space.',
  presetConfigurations: 'Preset Configurations',
  selectPreset: 'Select a preset configuration...',
  presetDesc: 'Quick setup for popular image hosting services. You may need to modify API keys and endpoints.',
  apiConfiguration: 'API Configuration',
  apiUrl: 'API URL',
  httpMethod: 'HTTP Method',
  fieldName: 'Field Name',
  fieldNameDesc: 'Form field name for the image file',
  responseUrlPath: 'Response URL Path',
  responseUrlPathDesc: 'JSON path to extract image URL (e.g., "data.url")',
  httpHeaders: 'HTTP Headers',
  addHeader: 'Add Header',
  headerName: 'Header name',
  headerValue: 'Header value',
  headersDesc: 'Add authentication headers or other required headers for your API.',
  advancedSettings: 'Advanced Settings',
  maxFileSize: 'Max File Size',
  timeout: 'Timeout',
  seconds: 'seconds',
  allowedTypes: 'Allowed File Types',
  allowedTypesDesc: 'Currently supports: JPEG, PNG, GIF, WebP',
  testConfiguration: 'Test Configuration',
  testing: 'Testing...',
  testConnection: 'Test Connection',
  saveConfiguration: 'Save Configuration',
  reset: 'Reset',
  needHelp: 'Need Help?',
  helpImgur: 'For Imgur: Get a Client ID from https://api.imgur.com/oauth2/addclient',
  helpCloudinary: 'For Cloudinary: Create an unsigned upload preset in your dashboard',
  helpCustom: 'For custom APIs: Ensure CORS is enabled and the response includes the image URL',
  failedToLoadConfig: 'Failed to load configuration',
  configSaved: 'Configuration saved successfully!',
  failedToSaveConfig: 'Failed to save configuration',
  confirmResetConfig: 'Reset to default configuration?',
  configureImageUpload: 'Configure Image Upload API',
  configureImageUploadDesc: 'Set up an API endpoint for uploading images to avoid consuming local storage space.',
  configure: 'Configure',
  
  // Backlinks
  backlinks: 'Backlinks',
  backlinkSites: 'Backlink Sites',
  addBacklinkSite: 'Add Backlink Site',
  editBacklinkSite: 'Edit Backlink Site',
  deleteBacklinkSite: 'Delete Backlink Site',
  siteName: 'Site Name',
  siteUrl: 'Site URL',
  siteDescription: 'Site Description',
  siteCategory: 'Site Category',
  submissionInstructions: 'Submission Instructions',
  backlinkSubmissions: 'Backlink Submissions',
  submissionStatus: 'Submission Status',
  pending: 'Pending',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  removed: 'Removed',
  submittedAt: 'Submitted At',
  approvedAt: 'Approved At',
  rejectedAt: 'Rejected At',
  removedAt: 'Removed At',
  responseUrl: 'Response URL',
  notes: 'Notes',
  addCurrentPage: 'Add Current Page',
  collectCurrentPage: 'Collect Current Page',
  markAsSubmitted: 'Mark as Submitted',
  markAsApproved: 'Mark as Approved',
  markAsRejected: 'Mark as Rejected',
  submissionUrl: 'Submission URL',
  backlinkStats: 'Backlink Statistics',
  totalSites: 'Total Sites',
  totalSubmissions: 'Total Submissions',
  pendingSubmissions: 'Pending Submissions',
  approvedSubmissions: 'Approved Submissions',
  rejectedSubmissions: 'Rejected Submissions',
  approvalRate: 'Approval Rate',
  
  // Keyword Roots
  keywordRoots: 'Keyword Roots',
  keywordRootManagement: 'Keyword Root Management',
  addKeywordRoot: 'Add Keyword Root',
  editKeywordRoot: 'Edit Keyword Root',
  deleteKeywordRoot: 'Delete Keyword Root',
  keywordRootName: 'Keyword Root Name',
  keywords: 'Keywords',
  addKeyword: 'Add Keyword',
  removeKeyword: 'Remove Keyword',
  googleTrends: 'Google Trends',
  openGoogleTrends: 'Open Google Trends',
  trendsSettings: 'Google Trends Settings',
  geography: 'Geography',
  timeRange: 'Time Range',
  categoryId: 'Category ID',
  globalLocation: 'Global or enter location code like US, CN',
  past7Days: 'Past 7 Days',
  past1Day: 'Past 1 Day',
  past1Month: 'Past 1 Month',
  past3Months: 'Past 3 Months',
  past12Months: 'Past 12 Months',
  past5Years: 'Past 5 Years',
  allTime: 'All Time',
  trendsNote: 'Note: Google Trends compares up to 5 keywords per page. Multiple tabs will open if your root contains more than 5 keywords.',
  noKeywordRoots: 'No Keyword Roots',
  noKeywordRootsDesc: 'Create your first keyword root to start analyzing trends with Google Trends',
  searchKeywordRoots: 'Search keyword roots...',
  atLeastOneKeyword: 'Add at least one keyword',
  keywordRootDescription: 'Description',
  optional: 'Optional',

  // Other
  screenshot: 'Screenshot',
  moreScreenshots: 'more screenshots...',
  backlink: 'backlink',
  efficiency: 'efficiency',
};

const zhTranslations: Translations = {
  // App general
  appName: 'ProductBaker',
  appDescription: '产品信息管理',
  
  // Navigation
  addProduct: '添加产品',
  editProduct: '编辑产品',
  deleteProduct: '删除产品',
  selectProduct: '选择产品',
  pleaseSelectProduct: '请选择产品',
  
  // Product fields
  productName: '产品名称',
  productTitle: '产品标题',
  website: '网址',
  email: '邮箱',
  logoUrl: 'Logo URL',
  shortDescription: '短描述',
  longDescription: '长描述',
  screenshots: '截图',
  category: '分类',
  tags: '标签',
  
  // Actions
  save: '保存',
  cancel: '取消',
  edit: '编辑',
  delete: '删除',
  copy: '复制',
  copied: '已复制',
  add: '添加',
  update: '更新',
  updateProduct: '更新产品',
  confirm: '确认',
  close: '关闭',
  
  // Form validation
  required: '请输入',
  nameRequired: '请输入产品名称',
  titleRequired: '请输入产品标题',
  urlRequired: '请输入产品网址',
  urlInvalid: '请输入有效的网址（以http://或https://开头）',
  shortDescRequired: '请输入短描述',
  categoryRequired: '请输入产品分类',
  enterProductName: '请输入产品名称',
  enterProductTitle: '请输入产品标题',
  enterWebsite: '请输入产品网址',
  enterCategory: '请输入产品分类',
  validUrlRequired: '请输入有效的网址（以http://或https://开头）',
  
  // Placeholders
  namePlaceholder: '输入产品名称',
  titlePlaceholder: '输入产品标题',
  enterProductNamePlaceholder: '输入产品名称',
  enterProductTitlePlaceholder: '输入产品标题',
  websitePlaceholder: 'https://example.com',
  emailPlaceholder: 'contact@example.com',
  logoPlaceholder: 'https://example.com/logo.png',
  categoryPlaceholder: '如：SaaS、工具、社交等',
  shortDescPlaceholder: '简短介绍产品功能和特点（建议50-100字）',
  longDescPlaceholder: '详细介绍产品功能、优势和使用场景（建议200-500字）',
  screenshotPlaceholder: '输入截图URL',
  tagPlaceholder: '输入标签',
  
  // Sections
  basicInfo: '基础信息',
  productDescription: '产品描述',
  productScreenshots: '产品截图',
  productTags: '标签',
  quickCopy: '快速复制',
  metadata: '元数据',
  
  // Status messages
  loading: '加载中...',
  saving: '保存中...',
  deleting: '删除中...',
  noProducts: '暂无产品',
  noProductsDesc: '开始添加您的第一个产品信息',
  selectProductDesc: '从上方下拉菜单中选择一个产品来查看详情',
  
  // Confirm dialogs
  confirmDelete: '确认删除',
  confirmDeleteDesc: '您确定要删除产品 "{name}" 吗？此操作无法撤销。',
  
  // Copy actions
  copyName: '名称',
  copyUrl: '网址',
  copyShortDesc: '短描述',
  copyLongDesc: '长描述',
  copyFullInfo: '完整信息',
  
  // Time
  createdAt: '创建于',
  updatedAt: '更新于',
  
  // Errors
  failedToLoad: '加载产品失败',
  failedToSave: '保存产品失败',
  failedToDelete: '删除产品失败',
  failedToCopy: '复制到剪贴板失败',
  
  // Success messages
  addSuccess: '产品添加成功！',
  updateSuccess: '产品更新成功！',
  exportSuccess: '导出成功！',
  importSuccess: '成功导入 {count} 项数据！',
  
  // Export/Import messages
  noSitesToExport: '没有外链网站可导出',
  noSubmissionsToExport: '没有提交记录可导出',
  exportFailed: '导出失败',
  importFailed: '导入失败',
  invalidCSVFile: '无效的CSV文件格式',
  noValidDataFound: '文件中未找到有效数据',
  
  // Storage management messages
  storageQuotaWarning: '由于本地存储空间限制，文件上传功能已禁用。请使用图片链接地址。如需本地存储图片，请使用数据导出/导入功能，或联系作者获取在线存储选项。',
  storageWarningTitle: '存储空间限制',
  storageWarningMessage: '为防止存储配额问题，文件上传功能已禁用。请使用图片链接地址，或联系作者获取在线存储选项。',
  uploadDisabled: '上传已禁用',
  useImageUrls: '请使用图片链接地址以避免存储限制',
  storageManagement: '存储管理',
  manageStorage: '管理存储和备份',
  storageManagementDesc: '查看存储使用情况，管理数据备份和配置存储选项。',
  storageUsage: '存储使用情况',
  totalUsage: '总使用量',
  dataBreakdown: '数据明细',
  storageMode: '存储模式',
  localStorage: '本地存储',
  switchToOnline: '切换到在线存储',
  localStorageDescription: '数据存储在您的浏览器本地。总存储空间限制约10MB。',
  dataManagement: '数据管理',
  exportAllData: '导出所有数据',
  importAllData: '导入所有数据',
  clearAllData: '清除所有数据',
  clearAllDataWarning: '此操作无法撤销。请先导出您的数据！',
  refreshStorageInfo: '刷新存储信息',
  highStorageUsage: '存储使用量较高',
  highStorageWarning: '建议导出数据并清理不需要的项目以释放空间。',
  needOnlineStorage: '需要在线存储？',
  contactAuthor: '联系作者',
  onlineStorageNotSupported: '暂不支持在线存储。如果您需要此功能，请联系作者：productbaker@example.com',
  confirmImportWarning: '这将替换所有现有数据。您确定要继续吗？',
  confirmClearAllData: '这将永久删除所有数据。您确定吗？',
  confirmClearAllDataFinal: '最后确认：此操作无法撤销。继续？',
  clearDataSuccess: '所有数据已成功清除',
  clearDataFailed: '清除数据失败',
  failedToLoadStorage: '加载存储信息失败',
  products: '产品',
  
  // Image upload configuration messages
  uploadNotConfigured: '图片上传未配置。请在设置中配置上传API接口，或使用图片链接地址以避免消耗本地存储空间。',
  uploadNotConfiguredTitle: '上传未配置',
  uploadNotConfiguredMessage: '配置图片上传API以启用文件上传功能。这可以避免在本地存储中保存大图片文件，节省存储空间。',
  uploadConfiguredTitle: '上传已配置',
  uploadConfiguredMessage: '图片将上传到您配置的API接口。这可以节省本地存储空间。',
  uploadEndpoint: '接口地址',
  configureUpload: '配置上传',
  configureUploadToEnable: '配置上传API以启用文件上传',
  uploading: '上传中...',
  clickToUpload: '点击上传或拖放文件',
  maxSizeInfo: '最大大小',
  maxFilesInfo: '最多还可上传 {max} 个文件',
  tooManyFiles: '最多还可上传 {max} 张图片',
  uploadFailed: '上传失败',
  imageUploadSettings: '图片上传设置',
  uploadConfigInfo: '为什么需要配置图片上传？',
  uploadConfigInfoDesc: '在本地存储中保存base64图片会消耗大量空间（1MB图片约变成1.37MB）。配置图片上传API可以节省空间，避免存储配额问题。',
  uploadConfiguration: '上传配置',
  enabled: '已启用',
  disabled: '已禁用',
  enableImageUpload: '启用API图片上传',
  enableUploadDesc: '禁用时，只接受图片链接地址以避免消耗本地存储空间。',
  presetConfigurations: '预设配置',
  selectPreset: '选择预设配置...',
  presetDesc: '流行图片托管服务的快速设置。您可能需要修改API密钥和接口地址。',
  apiConfiguration: 'API配置',
  apiUrl: 'API地址',
  httpMethod: 'HTTP方法',
  fieldName: '字段名称',
  fieldNameDesc: '图片文件的表单字段名',
  responseUrlPath: '响应URL路径',
  responseUrlPathDesc: '从响应中提取图片URL的JSON路径（如："data.url"）',
  httpHeaders: 'HTTP头部',
  addHeader: '添加头部',
  headerName: '头部名称',
  headerValue: '头部值',
  headersDesc: '为您的API添加认证头部或其他必需头部。',
  advancedSettings: '高级设置',
  maxFileSize: '最大文件大小',
  timeout: '超时时间',
  seconds: '秒',
  allowedTypes: '允许的文件类型',
  allowedTypesDesc: '目前支持：JPEG、PNG、GIF、WebP',
  testConfiguration: '测试配置',
  testing: '测试中...',
  testConnection: '测试连接',
  saveConfiguration: '保存配置',
  reset: '重置',
  needHelp: '需要帮助？',
  helpImgur: 'Imgur：从 https://api.imgur.com/oauth2/addclient 获取客户端ID',
  helpCloudinary: 'Cloudinary：在控制面板中创建无签名上传预设',
  helpCustom: '自定义API：确保启用CORS且响应包含图片URL',
  failedToLoadConfig: '加载配置失败',
  configSaved: '配置保存成功！',
  failedToSaveConfig: '保存配置失败',
  confirmResetConfig: '重置为默认配置？',
  configureImageUpload: '配置图片上传API',
  configureImageUploadDesc: '设置图片上传API接口以避免消耗本地存储空间。',
  configure: '配置',
  
  // Backlinks
  backlinks: '外链管理',
  backlinkSites: '外链网站',
  addBacklinkSite: '添加外链网站',
  editBacklinkSite: '编辑外链网站',
  deleteBacklinkSite: '删除外链网站',
  siteName: '网站名称',
  siteUrl: '网站地址',
  siteDescription: '网站描述',
  siteCategory: '网站类别',
  submissionInstructions: '提交说明',
  backlinkSubmissions: '外链提交',
  submissionStatus: '提交状态',
  pending: '待提交',
  submitted: '已提交',
  approved: '已通过',
  rejected: '已拒绝',
  removed: '已删除',
  submittedAt: '提交时间',
  approvedAt: '通过时间',
  rejectedAt: '拒绝时间',
  removedAt: '删除时间',
  responseUrl: '响应链接',
  notes: '备注',
  addCurrentPage: '添加当前页面',
  collectCurrentPage: '收藏当前页面',
  markAsSubmitted: '标记为已提交',
  markAsApproved: '标记为已通过',
  markAsRejected: '标记为已拒绝',
  submissionUrl: '提交链接',
  backlinkStats: '外链统计',
  totalSites: '总网站数',
  totalSubmissions: '总提交数',
  pendingSubmissions: '待提交数',
  approvedSubmissions: '已通过数',
  rejectedSubmissions: '已拒绝数',
  approvalRate: '通过率',
  
  // Keyword Roots
  keywordRoots: '关键词词根',
  keywordRootManagement: '关键词词根管理',
  addKeywordRoot: '添加关键词词根',
  editKeywordRoot: '编辑关键词词根',
  deleteKeywordRoot: '删除关键词词根',
  keywordRootName: '词根名称',
  keywords: '关键词',
  addKeyword: '添加关键词',
  removeKeyword: '移除关键词',
  googleTrends: 'Google Trends',
  openGoogleTrends: '打开 Google Trends',
  trendsSettings: 'Google Trends 设置',
  geography: '地理位置',
  timeRange: '时间范围',
  categoryId: '类别ID',
  globalLocation: '全球或输入地区代码如 US, CN',
  past7Days: '过去7天',
  past1Day: '过去1天',
  past1Month: '过去1个月',
  past3Months: '过去3个月',
  past12Months: '过去12个月',
  past5Years: '过去5年',
  allTime: '所有时间',
  trendsNote: '注意：Google Trends 每页最多对比5个关键词。如果词根包含超过5个关键词，将打开多个标签页。',
  noKeywordRoots: '还没有关键词词根',
  noKeywordRootsDesc: '创建您的第一个关键词词根来开始使用Google Trends分析',
  searchKeywordRoots: '搜索关键词词根...',
  atLeastOneKeyword: '至少添加一个关键词',
  keywordRootDescription: '描述',
  optional: '可选',

  // Other
  screenshot: '截图',
  moreScreenshots: '张截图...',
  backlink: '外链',
  efficiency: '效率',
};

const translations: Record<Language, Translations> = {
  en: enTranslations,
  zh: zhTranslations,
};

export class I18n {
  private static instance: I18n;
  private currentLanguage: Language = 'en'; // Default to English
  
  private constructor() {
    this.loadLanguage();
  }
  
  public static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }
  
  private loadLanguage(): void {
    try {
      const saved = localStorage.getItem('productbaker_language');
      if (saved && (saved === 'en' || saved === 'zh')) {
        this.currentLanguage = saved as Language;
      }
    } catch (error) {
      console.error('Failed to load language setting:', error);
    }
  }
  
  public setLanguage(language: Language): void {
    this.currentLanguage = language;
    try {
      localStorage.setItem('productbaker_language', language);
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  }
  
  public getLanguage(): Language {
    return this.currentLanguage;
  }
  
  public t(key: keyof Translations, params?: Record<string, string>): string {
    let text = translations[this.currentLanguage][key] || translations.en[key] || key;
    
    // Replace parameters in text
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  }
  
  public getAllLanguages(): Array<{ code: Language; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
    ];
  }
  
  public formatDate(date: Date): string {
    const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Export singleton instance
export const i18n = I18n.getInstance();