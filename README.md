# ProductBaker Chrome Extension

🚀 A powerful Chrome extension designed for product managers and marketers to efficiently manage product information and streamline backlink submission processes.

## ✨ Key Features

### 🎯 Product Management
- **Complete Product Information Management**: Support for name, title, URL, email, logo, description, screenshots, categories, tags, etc.
- **Multi-Category Support**: Each product can have up to 3 categories
- **Tag System**: Flexible tag management with custom tag support
- **Rich Media Support**: Multiple product screenshots with comprehensive image management

### 📁 Advanced Storage System
- **IndexedDB Storage**: Uses modern browser IndexedDB technology for large-capacity data storage
- **Local Image Upload**: Convert images to Base64 format for local storage without external image hosting
- **Image Download Functionality**: One-click download of uploaded logos and screenshots
- **Data Security**: All data stored locally in browser for privacy and security

### 🖼️ Image Management Features
- **Three Upload Methods**:
  - 📎 **Local Upload**: Direct image file upload with automatic Base64 conversion
  - 🔗 **URL Link**: Input image URLs
  - 🚀 **API Upload**: Configure image upload API (optional)
- **Smart Download**: Support for downloading both Base64 and URL images
- **Preview Functionality**: Real-time image preview with file size information
- **Batch Management**: Multiple image upload and management for product screenshots

### 🔄 Backlink Management System
- **Backlink Site Management**: Maintain information for commonly used backlink submission websites
- **Submission Status Tracking**: Record submission status for each product on various sites
- **Category Matching**: Intelligently recommend suitable backlink sites based on product categories

### 📋 Efficient Copy Features
- **One-Click Copy**: Quickly copy various product field information
- **Formatted Copy**: Support multiple copy formats for different website requirements
- **Batch Operations**: Support batch copying and processing

### 🌐 Internationalization Support
- **Multi-Language Interface**: Support for Chinese and English
- **Language Switching**: Switch interface language anytime in settings
- **Localized Content**: Categories and tags support multi-language display

### 🎨 Elegant User Interface
- **Modern Design**: Beautiful interface based on Radix UI and Tailwind CSS
- **Green Theme**: Professional forest green color scheme
- **Responsive Layout**: Perfect adaptation to different sidebar sizes
- **Interactive Feedback**: Rich animation effects and toast notifications

## 🛠️ Technology Stack

### Core Technologies
- **Framework**: Plasmo v0.90.5 (Chrome extension development framework)
- **Frontend**: React 18 + TypeScript
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Storage**: IndexedDB (via Chrome Storage API)
- **Icons**: Lucide React
- **Internationalization**: Custom i18n system

### Data Storage
- **Efficient Storage**: Uses IndexedDB technology for large-capacity data support
- **Image Processing**: Base64 encoding storage with local image management
- **Data Structure**: Structured management of products, backlinks, and submission records

## 📦 Installation & Usage

### Development Environment Setup

1. **Clone the project**:
```bash
git clone https://github.com/your-username/productbaker.git
cd productbaker/chrome-extension
```

2. **Install dependencies**:
```bash
npm install
```

3. **Development mode**:
```bash
npm run dev
```

4. **Production build**:
```bash
npm run build
```

5. **Package for distribution**:
```bash
npm run package
```

### Chrome Extension Installation

1. After completing the project build, open Chrome browser
2. Visit `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the project's `build/chrome-mv3-prod` folder
6. Extension installed successfully, ProductBaker icon will appear in the toolbar

## 🚀 User Guide

### 1. Product Management

#### Adding New Products
1. Click the ➕ **Add Product** button in the sidebar
2. Fill in basic information:
   - **Product Name** *(required)*
   - **Product Title** *(required)*
   - **Official URL** *(required)*
   - **Contact Email** *(optional)*
3. Upload Logo:
   - Choose **Local Upload** to upload image files directly
   - Or choose **URL** to input image links
4. Set categories and tags:
   - Select up to 3 product categories
   - Add relevant tags for easy management
5. Fill in product descriptions:
   - **Short Description** *(required)*: Concise product introduction
   - **Long Description** *(optional)*: Detailed product explanation
6. Upload product screenshots:
   - Support uploading multiple screenshots
   - Each image can be downloaded individually
7. Click **Add Product** to save

#### Editing Product Information
1. Select the product to edit in the product selector
2. Click the ✏️ **Edit** button on the product details page
3. Modify any field information
4. Click **Update Product** to save changes
5. System will show toast notification confirming successful update

#### Deleting Products
1. Click the 🗑️ **Delete** button on the product details page
2. Confirm deletion in the confirmation dialog
3. Product and related data will be permanently deleted

### 2. Image Management Features

#### Image Upload
- **Local Upload**:
  - Click upload area to select local image files
  - Support common image formats (PNG, JPG, GIF, etc.)
  - Automatically convert to Base64 format for storage
  - Display file size information

- **URL Upload**:
  - Input image URL in URL mode
  - Support any accessible image links
  - Real-time image preview

#### Image Download
- **Single Image Download**: Hover over any image preview and click the 📥 download button
- **Batch Management**: In multi-image lists, each image can be downloaded independently
- **Auto Naming**: Downloaded files are automatically named with product name and type

### 3. Backlink Management

#### Backlink Site Management
1. Select **Backlink Management** in the sidebar
2. Add commonly used backlink submission websites:
   - Website name and URL
   - Applicable product categories
   - Submission instructions and requirements
3. Manage existing backlink site information

#### Submission Status Tracking
1. After selecting a product, view submission status for various backlink sites
2. Mark submission status: pending, submitted, approved, rejected, etc.
3. Record submission URLs and notes

### 4. Data Copy Features

#### Single Field Copy
- On the product details page, each field has a 📋 copy button
- Click to copy that field's content to clipboard
- System displays copy success notification

#### Batch Copy
- Use quick copy buttons at the bottom
- Support copying complete product information
- Customizable copy format and content

### 5. Settings Configuration

#### Language Settings
1. Select interface language in settings page
2. Support switching between Chinese and English
3. Language settings take effect immediately

#### Image Upload Configuration
1. Configure external image upload API
2. Set upload server and authentication information
3. After successful configuration, API upload mode can be used

## 📊 Data Structure

### Product Interface
```typescript
interface Product {
  id: string;                    // Unique identifier
  name: string;                  // Product name
  title: string;                 // Product title  
  url: string;                   // Official website
  email?: string;                // Contact email
  logo: string;                  // Logo (URL or Base64)
  shortDescription: string;      // Short description
  longDescription: string;       // Long description
  screenshots: string[];         // Screenshots array
  categories: string[];          // Categories array (max 3)
  tags?: string[];              // Tags array
  createdAt: Date;              // Creation time
  updatedAt: Date;              // Update time
}
```

### BacklinkSite Interface
```typescript
interface BacklinkSite {
  id: string;                    // Unique identifier
  name: string;                  // Site name
  url: string;                   // Site URL
  categories: string[];          // Applicable categories
  submissionInstructions?: string; // Submission instructions
  createdAt: Date;              // Creation time
  updatedAt: Date;              // Update time
}
```

## 🏗️ Project Structure

```
chrome-extension/
├── components/                 # React components
│   ├── ui/                    # Basic UI components
│   │   ├── image-upload.tsx   # Single image upload component
│   │   ├── multi-image-upload.tsx # Multi-image upload component
│   │   ├── toast.tsx          # Toast notification component
│   │   └── ...               # Other UI components
│   ├── SidePanelContent.tsx   # Sidebar main content
│   ├── ProductForm.tsx        # Product form component
│   ├── ProductDisplay.tsx     # Product details display
│   ├── BacklinkManager.tsx    # Backlink management component
│   └── SettingsManager.tsx    # Settings management component
├── hooks/                     # Custom Hooks
│   ├── useProducts.tsx        # Product state management
│   ├── useBacklinks.tsx       # Backlink state management
│   ├── useI18n.tsx           # Internationalization Hook
│   └── useCopy.tsx           # Copy functionality Hook
├── lib/                       # Utility library
│   ├── productManager.ts      # Product CRUD operations
│   ├── backlinkManager.ts     # Backlink management operations
│   ├── storage.ts            # IndexedDB storage wrapper
│   ├── i18n.ts               # Internationalization configuration
│   └── utils.ts              # Utility functions
├── types/                     # TypeScript type definitions
│   ├── product.ts            # Product-related types
│   └── backlink.ts           # Backlink-related types
├── sidepanel.tsx             # Sidebar entry page
├── background.ts             # Extension background script
└── package.json              # Project configuration
```

## 🎯 Core Advantages

### 1. Advanced Storage Technology
- Uses IndexedDB to break through traditional localStorage limitations
- Support for large-capacity data and image storage
- Data persistence, retained after browser restart

### 2. Comprehensive Image Management
- Local image upload without external service dependencies
- Smart Base64 encoding storage
- One-click download for easy data export

### 3. Efficient Workflow
- Sidebar design that doesn't interfere with normal browsing
- Quick copy functionality to improve submission efficiency
- Backlink management system for standardized submission process

### 4. Modern Development Architecture
- TypeScript provides type safety
- React component-based development
- Responsive design adapts to various screen sizes

## 🔧 Development Notes

### Adding New Features
1. Create component files in appropriate directories
2. Update TypeScript type definitions
3. Integrate new features in main components
4. Add internationalization text support

### Custom Styling
- Modify CSS variables in `globals.css`
- Currently uses professional green theme colors
- Supports Tailwind CSS utility class customization

### Data Backup & Migration
```typescript
// Export all data
const backup = await productManager.exportAllData();

// Import data (supports merge mode)
await productManager.importData(backup, { merge: true });
```

## ⚠️ Usage Limitations

1. **Browser Compatibility**: Requires Chrome 88+ version
2. **Storage Capacity**: Although using IndexedDB, still subject to browser storage quota limits
3. **Image Size**: Recommend single images not exceed 5MB for performance
4. **Network Dependency**: URL image downloads require internet connection

## 🗺️ Roadmap

### Completed Features ✅
- [x] Complete product management system
- [x] IndexedDB local storage
- [x] Image upload and download functionality
- [x] Backlink management system
- [x] Internationalization support
- [x] Toast notification system
- [x] Responsive design

### Planned Features 🔮
- [ ] Cloud data synchronization
- [ ] Custom copy templates
- [ ] Advanced search and filtering
- [ ] Batch operation functionality
- [ ] Theme switching support
- [ ] Keyboard shortcuts
- [ ] Data statistics and analytics
- [ ] Chrome Web Store publishing

## 🛟 Support

### Common Issue Resolution
1. **Extension won't load**: Check if Chrome version is 88+
2. **Images won't display**: Confirm image URLs are accessible or re-upload
3. **Data loss**: Check browser storage permission settings
4. **Performance issues**: Clean up large image files, use compressed images

### Bug Reports
If you encounter issues, please check browser console error messages and ensure:
- Extension permissions are properly granted
- Browser version meets requirements
- Local storage space is sufficient

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

💡 **ProductBaker Chrome Extension** - Making product promotion more efficient!