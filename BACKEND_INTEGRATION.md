# Backend Integration Guide - Product Multi-View Images

## Quick Start

The frontend is ready for the following backend endpoints:

## 1. Image Upload Endpoint

### Endpoint
```
POST /api/v1/products/upload-image
```

### Request
```
Content-Type: multipart/form-data

Body:
- image: File (binary - JPEG, PNG, WebP, GIF, max 5MB)
- view: string (one of: front, back, side, detail, lifestyle)
```

### Response (Success - 200)
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "publicId": "lincee/product-123/front",
  "view": "front"
}
```

### Response (Error)
```json
{
  "error": "File size exceeds 5MB limit",
  "status": 400
}
```

## 2. Updated Product Create/Update Endpoints

The existing product endpoints now accept additional fields:

### POST /api/v1/products
### PUT /api/v1/products/:id

### Request Body (now accepts)
```json
{
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description",
  "category": "Category",
  "imageUrls": [
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ],
  "productImages": [
    {
      "view": "front",
      "url": "https://res.cloudinary.com/...",
      "altText": "Front view",
      "isPrimary": true
    },
    {
      "view": "back",
      "url": "https://res.cloudinary.com/...",
      "altText": "Back view",
      "isPrimary": false
    }
  ]
}
```

## 3. Implementation Checklist

- [ ] Create `/api/v1/products/upload-image` POST endpoint
- [ ] Setup Cloudinary SDK in backend
- [ ] Configure Cloudinary credentials (API key, secret)
- [ ] Create folder structure: `lincee/products/`
- [ ] Add file upload handling (multipart/form-data)
- [ ] Add file validation (size, type)
- [ ] Upload file to Cloudinary
- [ ] Extract and return Cloudinary URL
- [ ] Update Product model/schema to include `productImages` array
- [ ] Update Product endpoints to accept `productImages` in request body
- [ ] Store `productImages` metadata in database
- [ ] Update GET `/api/v1/products/:id` to return `productImages` array

## 4. Cloudinary Setup Example

### Java/Spring Boot Example
```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("view") String view) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("File is required"));
            }
            
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("File size exceeds 5MB limit"));
            }
            
            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "lincee/products",
                    "public_id", "product-" + view,
                    "resource_type", "auto"
                )
            );
            
            return ResponseEntity.ok(new UploadResponse(
                (String) uploadResult.get("secure_url"),
                (String) uploadResult.get("public_id"),
                view
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Upload failed: " + e.getMessage()));
        }
    }
}

class UploadResponse {
    public String url;
    public String publicId;
    public String view;
    
    public UploadResponse(String url, String publicId, String view) {
        this.url = url;
        this.publicId = publicId;
        this.view = view;
    }
}
```

### Python/Django Example
```python
from cloudinary.uploader import upload
from cloudinary.utils import cloudinary_url

@api_view(['POST'])
def upload_image(request):
    image_file = request.FILES.get('image')
    view = request.POST.get('view')
    
    if not image_file:
        return Response(
            {'error': 'Image file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate file size
    if image_file.size > 5 * 1024 * 1024:
        return Response(
            {'error': 'File size exceeds 5MB limit'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Upload to Cloudinary
        result = upload(
            image_file,
            folder='lincee/products',
            public_id=f'product-{view}',
            resource_type='auto'
        )
        
        return Response({
            'url': result['secure_url'],
            'publicId': result['public_id'],
            'view': view
        })
    except Exception as e:
        return Response(
            {'error': f'Upload failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

## 5. Database Schema Update

### Product Table - Add column(s)
```sql
ALTER TABLE products ADD COLUMN product_images JSON NULL;
```

### Product Images JSON Structure
```json
[
  {
    "view": "front",
    "url": "https://res.cloudinary.com/...",
    "altText": "Front view",
    "isPrimary": true
  },
  {
    "view": "back",
    "url": "https://res.cloudinary.com/...",
    "altText": "Back view",
    "isPrimary": false
  }
]
```

## 6. Validation Rules

### View Types (Whitelist)
- front
- back
- side
- detail
- lifestyle

### File Validation
- **Max Size**: 5MB (5242880 bytes)
- **Allowed Types**: image/jpeg, image/png, image/webp, image/gif
- **Allowed Extensions**: .jpg, .jpeg, .png, .webp, .gif

### Cloudinary URL Format
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
```

## 7. Error Handling

### Common Errors
```json
{
  "400": "File size exceeds 5MB limit",
  "400": "Invalid file format. Allowed: JPEG, PNG, WebP, GIF",
  "400": "Invalid view type. Allowed: front, back, side, detail, lifestyle",
  "401": "Unauthorized - Authentication required",
  "500": "Cloudinary upload failed",
  "500": "Internal server error"
}
```

## 8. Security Considerations

1. **File Upload Security**:
   - Validate file type (whitelist only images)
   - Validate file size (enforce 5MB limit)
   - Scan for malware if possible
   - Don't trust file extension (check MIME type)

2. **Cloudinary Security**:
   - Use secure API credentials (environment variables)
   - Never expose API secret in client-side code
   - Use signed URLs if needed
   - Implement rate limiting on upload endpoint

3. **Access Control**:
   - Only admins can upload product images
   - Verify user role before accepting uploads
   - Log all uploads for audit trail

## 9. Testing Endpoints

### Using cURL
```bash
# Upload image
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "view=front" \
  https://your-api.com/api/v1/products/upload-image

# Create product with images
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product",
    "price": 99.99,
    "description": "...",
    "productImages": [
      {"view": "front", "url": "...", "isPrimary": true}
    ]
  }' \
  https://your-api.com/api/v1/products
```

### Using Postman
1. Create POST request to `/api/v1/products/upload-image`
2. Set Headers: `Authorization: Bearer YOUR_TOKEN`
3. Set Body: form-data
4. Add fields:
   - `image` (type: File) - select image file
   - `view` (type: Text) - enter "front"
5. Send request

## 10. Response Format Examples

### Successful Upload
```json
{
  "url": "https://res.cloudinary.com/lincee/image/upload/v1708087234/lincee/products/product-front_a3b4c5.jpg",
  "publicId": "lincee/products/product-front",
  "view": "front"
}
```

### Get Product with Images
```json
{
  "id": 1,
  "name": "Cotton T-Shirt",
  "price": 29.99,
  "description": "...",
  "category": "Apparel",
  "images": ["https://..."],
  "productImages": [
    {
      "view": "front",
      "url": "https://res.cloudinary.com/...",
      "altText": "Front view",
      "isPrimary": true
    },
    {
      "view": "back",
      "url": "https://res.cloudinary.com/...",
      "altText": "Back view",
      "isPrimary": false
    }
  ]
}
```

## 11. Performance Optimization

1. **Image Optimization on Cloudinary**:
   - Use transformations for different sizes
   - Enable automatic format detection
   - Compress images automatically
   - Use responsive images with srcset

2. **Frontend Caching**:
   - Browser caches Cloudinary URLs
   - CDN serves images from nearest edge

3. **Database**:
   - Index product.productImages for queries
   - Consider separate table if many images per product

## 12. Monitoring

Track uploads:
- Log all upload requests
- Monitor Cloudinary usage/quotas
- Track upload success/failure rates
- Monitor error types

---

**Frontend is ready!** Implement these endpoints and the multi-view product system will be fully functional.
