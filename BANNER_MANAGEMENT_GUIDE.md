# Banner Management System - Implementation Guide

## 📋 Overview

This document outlines the complete implementation of a **Banner Management System** for admin users, allowing them to dynamically manage hero banners, secondary banners, and promotional content without code deployments.

---

## 🎯 Why This is Important

### Current Problem:
- ❌ Banner images hardcoded in components (`assets/image.png`)
- ❌ Requires code deployment to change marketing content
- ❌ No flexibility for seasonal campaigns or A/B testing
- ❌ Admins can't manage visual content independently

### Solution Benefits:
- ✅ Dynamic banner management through admin panel
- ✅ Upload/replace images instantly
- ✅ Schedule banners with start/end dates
- ✅ Multiple banner positions (hero, secondary, promotional)
- ✅ Enable/disable without deleting
- ✅ Display order control
- ✅ Link buttons to any page/product

---

## 🏗️ Architecture

### Frontend (Already Created)
- ✅ `BannerManagementComponent` - Full admin UI
- ✅ `BannerService` - API communication
- ✅ Banner model/interfaces

### Backend (You Need to Create)
```
📦 Backend Structure
├── models/Banner.java
├── repositories/BannerRepository.java
├── services/BannerService.java
├── controllers/BannerController.java
└── dto/BannerDTO.java
```

---

## 📊 Database Schema

```sql
CREATE TABLE banners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    image_url VARCHAR(1000) NOT NULL,
    position VARCHAR(50) NOT NULL, -- 'hero', 'secondary', 'promotional'
    link VARCHAR(500),
    button_text VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_position (position),
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
);
```

---

## 🔌 Backend API Endpoints to Create

### 1. Public Endpoints (No Auth Required)

#### Get Active Banners
```java
@GetMapping("/api/v1/banners/active")
public ResponseEntity<List<BannerDTO>> getActiveBanners() {
    // Return only isActive=true AND (startDate <= now <= endDate OR dates are null)
}
```

#### Get Banners by Position
```java
@GetMapping("/api/v1/banners/position/{position}")
public ResponseEntity<List<BannerDTO>> getBannersByPosition(@PathVariable String position) {
    // Return active banners for specific position (hero, secondary, promotional)
    // Ordered by displayOrder ASC
}
```

### 2. Admin Endpoints (Require ADMIN Role)

#### Get All Banners
```java
@GetMapping("/api/v1/banners")
public ResponseEntity<List<BannerDTO>> getAllBanners() {
    // Return all banners (active and inactive)
}
```

#### Create Banner
```java
@PostMapping("/api/v1/admin/banners")
public ResponseEntity<BannerDTO> createBanner(@Valid @RequestBody BannerDTO bannerDTO) {
    // Validate required fields: title, imageUrl, position
    // Default displayOrder to max + 1 if not provided
    // Return created banner with ID
}
```

#### Update Banner
```java
@PutMapping("/api/v1/admin/banners/{id}")
public ResponseEntity<BannerDTO> updateBanner(
    @PathVariable Long id,
    @Valid @RequestBody BannerDTO bannerDTO
) {
    // Update all fields
    // Validate banner exists
    // Return updated banner
}
```

#### Delete Banner
```java
@DeleteMapping("/api/v1/admin/banners/{id}")
public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
    // Hard delete (or implement soft delete with deletedAt)
    // Return 204 No Content
}
```

#### Toggle Banner Status
```java
@PatchMapping("/api/v1/admin/banners/{id}/toggle")
public ResponseEntity<BannerDTO> toggleBannerStatus(@PathVariable Long id) {
    // Toggle isActive field (true <-> false)
    // Return updated banner
}
```

#### Reorder Banners (Optional)
```java
@PostMapping("/api/v1/admin/banners/reorder")
public ResponseEntity<Void> reorderBanners(@RequestBody List<Long> bannerIds) {
    // Update displayOrder for each banner based on array position
    // bannerIds[0] gets displayOrder=0, bannerIds[1] gets displayOrder=1, etc.
}
```

---

## 🎨 Banner Model (Java Example)

```java
@Entity
@Table(name = "banners")
public class Banner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;
    
    @Column(length = 500)
    private String subtitle;
    
    @NotBlank(message = "Image URL is required")
    @Column(nullable = false, length = 1000)
    private String imageUrl;
    
    @NotBlank(message = "Position is required")
    @Column(nullable = false, length = 50)
    private String position; // ENUM: hero, secondary, promotional
    
    @Column(length = 500)
    private String link;
    
    @Column(length = 100)
    private String buttonText;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false)
    private Integer displayOrder = 0;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date endDate;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Getters and setters
}
```

---

## 🔒 Security Considerations

1. **Admin Only Writes**
   - All POST/PUT/DELETE/PATCH operations require `ROLE_ADMIN`
   - Implement `@PreAuthorize("hasRole('ADMIN')")` on admin endpoints

2. **Image Upload Security**
   - Reuse existing `/api/v1/images/upload` endpoint with folder="banners"
   - Validate file types (only images)
   - Limit file size (max 5MB recommended)
   - Store on Cloudinary with proper transformations

3. **URL Validation**
   - Sanitize `link` field to prevent XSS
   - Validate URLs start with `/` or `https://`

4. **Input Validation**
   - Validate `position` is one of: hero, secondary, promotional
   - Ensure `displayOrder` >= 0
   - Validate date ranges (endDate >= startDate)

---

## 🚀 Frontend Integration Steps

### 1. Add Banner Management to Admin Panel

Update `admin.component.html`:
```html
<!-- Add new tab/section -->
<div class="admin-section">
  <h2>Banner Management</h2>
  <app-banner-management></app-banner-management>
</div>
```

Update `admin.component.ts` imports:
```typescript
import { BannerManagementComponent } from '../banner-management/banner-management.component';

@Component({
  imports: [
    // ... existing imports
    BannerManagementComponent
  ]
})
```

### 2. Update Existing Banner Components to Use API

#### Update `banner.component.ts`:
```typescript
import { BannerService, Banner } from '../../services/banner.service';

export class BannerComponent implements OnInit {
  private bannerService = inject(BannerService);
  banner = signal<Banner | null>(null);

  ngOnInit() {
    this.bannerService.getBannersByPosition('hero').subscribe({
      next: (banners) => {
        if (banners.length > 0) {
          this.banner.set(banners[0]); // Get first active hero banner
        }
      }
    });
  }
}
```

#### Update `banner.component.html`:
```html
<section class="banner" @fadeIn *ngIf="banner()">
  <img [src]="banner()!.imageUrl" [alt]="banner()!.title" class="banner-image" loading="lazy">
  <div class="banner-content" @slideInUp>
    <span class="banner-kicker">{{ banner()!.title }}</span>
    <h1 class="banner-title" *ngIf="banner()!.subtitle">{{ banner()!.subtitle }}</h1>
    <div class="banner-actions" *ngIf="banner()!.buttonText && banner()!.link">
      <a [routerLink]="banner()!.link" class="btn btn-primary">{{ banner()!.buttonText }}</a>
    </div>
  </div>
</section>
```

### 3. Similar Updates for Secondary Banner
Same pattern - fetch from API using position="secondary"

---

## 📝 Testing Checklist

### Backend Testing
- [ ] Create banner with all fields
- [ ] Create banner with only required fields
- [ ] Update banner
- [ ] Delete banner
- [ ] Toggle banner status (active/inactive)
- [ ] Get active banners only
- [ ] Get banners by position
- [ ] Verify date filtering (startDate/endDate)
- [ ] Verify display order sorting
- [ ] Test admin authentication/authorization
- [ ] Test image upload to `/images/upload` with folder="banners"

### Frontend Testing
- [ ] Admin can access banner management
- [ ] Upload banner image
- [ ] Create new banner with all fields
- [ ] Edit existing banner
- [ ] Toggle banner active status
- [ ] Delete banner with confirmation
- [ ] View banner preview in management UI
- [ ] Hero banner displays on homepage
- [ ] Secondary banner displays on homepage
- [ ] Banners respect start/end dates
- [ ] Inactive banners don't show on site
- [ ] Button links work correctly

---

## 🎯 Implementation Priority

### Phase 1: Core Functionality (DO THIS FIRST)
1. ✅ Create backend database table
2. ✅ Create backend model and repository
3. ✅ Implement GET /banners/active
4. ✅ Implement GET /banners/position/{position}
5. ✅ Implement POST /admin/banners
6. ✅ Implement PUT /admin/banners/{id}
7. ✅ Implement DELETE /admin/banners/{id}
8. ✅ Test all endpoints with Postman

### Phase 2: Frontend Integration
1. ✅ Add banner management to admin panel (already created)
2. ✅ Update banner components to fetch from API
3. ✅ Test full flow: create → publish → view on site

### Phase 3: Advanced Features (OPTIONAL)
1. Reorder banners with drag-and-drop
2. Banner analytics (views, clicks)
3. A/B testing capabilities
4. Duplicate banner feature
5. Banner templates/presets

---

## 💡 Usage Examples

### Admin Creates Hero Banner
```javascript
POST /api/v1/admin/banners
{
  "title": "Summer Sale 2026",
  "subtitle": "Up to 50% Off",
  "imageUrl": "https://cloudinary.../summer-banner.jpg",
  "position": "hero",
  "buttonText": "Shop Now",
  "link": "/products?sale=true",
  "isActive": true,
  "displayOrder": 0,
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-08-31T23:59:59Z"
}
```

### Website Fetches Active Hero Banner
```javascript
GET /api/v1/banners/position/hero
// Returns only active hero banners where current date is within start/end range
// Sorted by displayOrder ASC
```

---

## 🐛 Common Issues & Solutions

### Issue: Banner not showing on website
**Solutions:**
- ✅ Check `isActive = true`
- ✅ Verify current date is within startDate/endDate (or dates are null)
- ✅ Check position matches component query
- ✅ Verify imageUrl is accessible
- ✅ Check browser console for errors

### Issue: Image upload fails
**Solutions:**
- ✅ Verify `/api/v1/images/upload` endpoint works
- ✅ Check file size < 5MB
- ✅ Verify file type is image/*
- ✅ Check authentication token

### Issue: Admin can't access management
**Solutions:**
- ✅ Verify user has ADMIN role
- ✅ Check authentication token
- ✅ Verify route protection in `app.routes.ts`

---

## 📦 Files Created (Frontend)

1. ✅ `/src/app/components/banner-management/banner-management.component.ts`
   - Full admin UI with upload, edit, delete, toggle
   - 700+ lines of complete implementation

2. ✅ `/src/app/services/banner.service.ts`
   - All API methods for banner management
   - Proper logging and error handling

3. ✅ `/docs/BANNER_MANAGEMENT_GUIDE.md` (this file)

---

## 🎬 Next Steps

1. **Create Backend APIs** (highest priority)
   - Follow the endpoint specifications above
   - Test with Postman/Insomnia
   - Ensure proper authentication

2. **Integrate with Admin Panel**
   - Add banner management component to admin layout
   - Test image upload functionality

3. **Update Banner Components**
   - Replace hardcoded images with API calls
   - Test on homepage

4. **Deploy & Test**
   - Deploy backend changes
   - Test full workflow in production
   - Create initial banners for launch

---

## 📚 Related Documentation

- Image Upload API: `POST /api/v1/images/upload`
- Admin Panel Architecture: `/docs/MODULAR_ADMIN_ARCHITECTURE.md`
- API Integration Guide: `/docs/API_INTEGRATION_GUIDE.md`

---

**Status:** ✅ Frontend Complete | ⏳ Backend Pending

**Estimated Backend Development Time:** 4-6 hours

**Priority:** HIGH (Marketing flexibility is crucial for e-commerce)
