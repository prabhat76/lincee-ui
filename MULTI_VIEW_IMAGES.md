# Product Multi-View Image System

## Overview
The product multi-view image system allows admins to upload multiple images of products with different views (front, back, side, detail, lifestyle). These images are automatically converted and stored on Cloudinary via the backend.

## Features

### 1. Multiple Product Views
Products can now have images for multiple views:
- **Front** - Front view of the product
- **Back** - Back view of the product
- **Side** - Side view of the product
- **Detail** - Close-up detail view
- **Lifestyle** - Product in use/lifestyle context

### 2. Image Upload Interface
Located in the Admin Console (`/admin`):
- Click "Show Image Upload" to open the upload panel
- Select a view type (front, back, side, detail, lifestyle)
- Choose an image file (JPEG, PNG, WebP, GIF)
- Image preview appears before upload
- Click "Upload" to upload to server
- Images are automatically converted to Cloudinary URLs by backend
- Mark any image as "Primary" for featured display

### 3. Image Validation
- **File Types**: JPEG, PNG, WebP, GIF
- **Max File Size**: 5MB per image
- **Dimensions**: Recommended 1200x1200px or higher for quality
- All validation happens client-side before upload

### 4. Product Detail View
Enhanced product detail page (`/product-detail/:id`) displays:
- Primary image as main display
- Thumbnail gallery showing all available views
- Quick switching between different product angles
- View labels and primary badge indicators

## Backend Integration

### Upload Endpoint
```
POST /api/v1/products/upload-image
Content-Type: multipart/form-data

Body:
- image: File (binary)
- view: string (front|back|side|detail|lifestyle)
```

### Response
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "lincee/product-123-front",
  "view": "front"
}
```

### Cloudinary Configuration
The backend automatically:
1. Receives uploaded image
2. Uploads to Cloudinary with organization-specific folder structure
3. Returns CDN URL for image storage
4. Stores URL in database with view metadata

### Product API Update
Create/Update products now accept:
```json
{
  "name": "Product Name",
  "price": 99.99,
  "description": "...",
  "category": "...",
  "imageUrls": ["url1", "url2", ...],
  "productImages": [
    {
      "view": "front",
      "url": "https://...",
      "isPrimary": true
    },
    {
      "view": "back",
      "url": "https://...",
      "isPrimary": false
    }
  ]
}
```

## Usage Guide

### For Admins

1. **Navigate to Admin Console**
   - Go to `/admin` (requires admin role)

2. **Add Product**
   - Fill in product name, price, description, category
   - Click "Show Image Upload"

3. **Upload Images**
   - Select view type from dropdown
   - Click "Choose Image" and select file
   - Preview appears automatically
   - Click "Upload" button
   - Image appears in gallery
   - Repeat for other views

4. **Set Primary Image**
   - Click "Set as Primary" on desired image
   - This image will display first in product details

5. **Save Product**
   - Fill in all product details
   - Images will be included in request
   - Click "Save Product"

### For Customers

1. **View Product Details**
   - Navigate to product page
   - Primary image displays in main area

2. **Explore Different Views**
   - Thumbnails show available product angles
   - Click any thumbnail to switch view
   - View label indicates current angle

3. **Compare Angles**
   - Quickly switch between front, back, side
   - Understand product details from multiple angles

## Services

### ImageUploadService (`src/app/services/image-upload.service.ts`)
- `uploadProductImages()` - Upload multiple images at once
- `uploadSingleImage()` - Upload single image with view type
- `validateImage()` - Validate file before upload
- `createPreviewUrl()` - Create preview URL from File object
- `revokePreviewUrl()` - Free up memory from preview URL
- `getAvailableViews()` - Get list of available view types
- `deleteImage()` - Delete image from Cloudinary

### ProductService Updates
- `ProductImage` interface - Metadata for single product image
- `Product` interface updated with `productImages: ProductImage[]`
- Support for storing images with view information and primary flag

## Components

### ProductImageUploadComponent
Located: `src/app/components/product-image-upload/product-image-upload.component.ts`

Features:
- View type selector dropdown
- File input with drag-drop support
- Image preview before upload
- Upload progress indicator
- Gallery of uploaded images
- Thumbnail management (delete, set primary)
- Image summary display

### ProductDetailComponent
Located: `src/app/components/pages/product-detail/product-detail.component.ts`

Features:
- Main image display
- Thumbnail gallery
- View switching
- Image metadata display
- Primary image indicator

## Technical Details

### File Structure
```
src/app/
├── services/
│   ├── image-upload.service.ts       (New - Image upload operations)
│   ├── product.service.ts            (Updated - ProductImage interface)
│   └── ...
├── components/
│   ├── product-image-upload/
│   │   └── product-image-upload.component.ts (New - Upload UI)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── admin.component.ts    (Updated - Import upload component)
│   │   │   ├── admin.component.html  (Updated - Add upload UI)
│   │   │   └── admin.component.scss  (Updated - Styling)
│   │   └── product-detail/
│   │       └── product-detail.component.ts (New - Multi-view display)
│   └── ...
```

### Styling
- Upload component has self-contained styles
- Gallery grid: auto-fill with 180px minimum columns
- Image cards: 1:1 aspect ratio with overlay on hover
- View badges: Indigo background with uppercase text
- Primary badge: Amber background with star icon

### State Management
Uses Angular signals for reactive UI:
```typescript
// In ProductImageUploadComponent
uploadedImages = signal<ProductImage[]>([]);
previewUrl = signal<string | null>(null);
uploadProgress = signal(0);
uploadingView = signal<string | null>(null);

// In ProductDetailComponent
selectedImageView = signal<string | null>(null);
selectedImage = signal<string>('');
```

## Browser Compatibility
- Modern browsers supporting:
  - File API
  - FileReader API
  - CSS Grid
  - JavaScript Promise
  - Blob URLs

## Performance Considerations
- Images validated client-side before upload
- Preview URLs revoked to free memory
- Cloudinary URLs cached by browser
- Lazy loading of thumbnails in gallery
- Image optimization on backend (Cloudinary)

## Security
- File type validation (whitelist: JPEG, PNG, WebP, GIF)
- File size limit enforced (5MB)
- Backend should verify view types
- Backend should validate file before uploading to Cloudinary
- Images served from CDN (Cloudinary)

## Future Enhancements
1. Drag-and-drop file upload
2. Batch upload multiple images
3. Image cropping before upload
4. Zoom feature for product details
5. 360° product viewer
6. Video product demonstrations
7. User-uploaded product images/reviews

## Troubleshooting

### Image upload fails
- Check file is within 5MB limit
- Verify file format (JPEG, PNG, WebP, GIF)
- Check backend `/api/v1/products/upload-image` endpoint exists
- Verify Cloudinary credentials configured on backend

### Images not displaying
- Check Cloudinary URLs are accessible
- Verify product has `productImages` array populated
- Check image view type is correct

### Cannot select view type
- Select view type before choosing file
- Ensure backend has available views configured

## API Reference

### POST /api/v1/products (Updated)
Create product with multiple images:
```javascript
{
  "name": "Product Name",
  "price": 99.99,
  "description": "Description",
  "category": "Category",
  "imageUrls": ["url1", "url2"],
  "productImages": [
    { "view": "front", "url": "...", "isPrimary": true },
    { "view": "back", "url": "...", "isPrimary": false }
  ]
}
```

### PUT /api/v1/products/:id (Updated)
Update product images (same structure as POST)

### POST /api/v1/products/upload-image
Upload single image with view:
```
Content-Type: multipart/form-data
- image: File
- view: "front"|"back"|"side"|"detail"|"lifestyle"

Response:
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "...",
  "view": "front"
}
```

### DELETE /api/v1/products/delete-image/:publicId
Delete image from Cloudinary:
```
Response:
{ "success": true, "message": "Image deleted" }
```
