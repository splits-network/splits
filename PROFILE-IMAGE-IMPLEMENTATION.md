# Profile Image Upload Implementation

## Overview

Complete profile image upload system allowing users to upload, display, and manage profile images with high performance caching strategy.

## Architecture

### Backend Services

1. **Document Service V2** (`/services/document-service/`)
    - `POST /v2/documents/profile-image` - Upload profile image with validation
    - Supabase Storage integration with `profile-images` bucket
    - File validation: JPEG, PNG, WebP up to 5MB
    - Automatic public URL generation

2. **Identity Service V2** (`/services/identity-service/`)
    - `PATCH /v2/users/profile-image` - Update user profile with image URL
    - Automatic Clerk synchronization for image updates
    - Redis caching for profile data (15-minute TTL)

3. **API Gateway** (`/services/api-gateway/`)
    - Route proxying: `/api/v2/documents/*` → Document Service
    - Route proxying: `/api/v2/users/*` → Identity Service
    - Bearer token authentication

### Database Schema

```sql
-- Migration: 20260201000001_add_profile_image_support.sql
ALTER TABLE identity.users ADD COLUMN profile_image_url TEXT;
ALTER TABLE identity.users ADD COLUMN profile_image_path TEXT;

-- Supabase Storage bucket with RLS policies
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
```

### Frontend Components

1. **UserAvatar** (`/apps/portal/src/components/common/UserAvatar.tsx`)
    - Reusable avatar display component
    - Responsive sizing: sm (32px), md (48px), lg (64px), xl (96px)
    - Fallback to FontAwesome user icon
    - Prioritizes `profile_image_url` over Clerk's `imageUrl`
    - Next.js Image optimization for Supabase CDN

2. **ProfileImageUpload** (`/apps/portal/src/components/profile/ProfileImageUpload.tsx`)
    - File upload with validation and progress feedback
    - Drag-and-drop interface with file picker fallback
    - Real-time preview and error handling
    - Automatic profile update after successful upload

3. **Integration** (`/apps/portal/src/app/portal/profile/components/user-profile-settings.tsx`)
    - Integrated into existing profile settings page
    - Context refresh after image update for nav consistency
    - Centered layout with form integration

## Performance Strategy

### Caching Architecture

1. **Supabase Storage CDN**: Global edge caching for image delivery
2. **Redis Profile Cache**: 15-minute TTL for user profile data to reduce database queries
3. **Next.js Image Optimization**: Automatic WebP conversion and responsive sizing
4. **Prioritized Loading**: Local profile_image_url preferred over Clerk API calls

### Load Performance

- **Avatar Display**: 0ms database query (Redis cache hit)
- **Image Delivery**: ~50ms (Supabase CDN global edge)
- **Profile Load**: Single cached query vs multiple Clerk API calls

## Usage Examples

### Display User Avatar

```tsx
import UserAvatar from "@/components/common/UserAvatar";

// In any component
<UserAvatar
    user={{
        name: "John Doe",
        profile_image_url: "https://...",
        imageUrl: "fallback-clerk-url", // optional fallback
    }}
    size="md" // sm | md | lg | xl
    className="ring ring-primary" // optional styling
/>;
```

### Upload Profile Image

```tsx
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";

// In profile/settings pages
<ProfileImageUpload
    currentImageUrl={user.profile_image_url}
    onImageUpdate={(newUrl) => {
        // Update local state
        setUser((prev) => ({ ...prev, profile_image_url: newUrl }));

        // Refresh context if needed
        refreshUserContext();
    }}
/>;
```

## API Endpoints

### Upload Profile Image

```http
POST /api/v2/documents/profile-image
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image-file>
```

Response:

```json
{
    "data": {
        "id": "uuid",
        "filename": "avatar.jpg",
        "file_path": "profile-images/user-id/filename.jpg",
        "public_url": "https://supabase-url/storage/v1/object/public/...",
        "entity_type": "profile_image",
        "metadata": {
            "size": 102400,
            "mime_type": "image/jpeg"
        }
    }
}
```

### Update User Profile Image

```http
PATCH /api/v2/users/profile-image
Content-Type: application/json
Authorization: Bearer <token>

{
  "profile_image_url": "https://...",
  "profile_image_path": "profile-images/user-id/filename.jpg"
}
```

## Security

1. **File Validation**: Server-side MIME type and size validation
2. **RLS Policies**: Supabase Row Level Security for bucket access
3. **Authorization**: Bearer token required for all operations
4. **User Scoping**: Users can only upload/update their own profile images

## Error Handling

1. **File Validation Errors**: Client-side alerts for invalid files
2. **Upload Failures**: Network error handling with user feedback
3. **Fallback Display**: Graceful degradation to default user icon
4. **Clerk Sync Failures**: Non-blocking - local update succeeds independently

## Testing

### Manual Testing

1. Navigate to `/portal/profile`
2. Click "Change Photo" button
3. Upload valid image file (JPEG, PNG, WebP < 5MB)
4. Verify image appears immediately
5. Check avatar appears in navigation
6. Verify Clerk dashboard shows updated image

### Performance Testing

- Monitor Redis cache hit rates
- Verify CDN edge caching working
- Test image load times across devices
- Validate responsive image sizing

## Deployment Notes

1. Ensure Supabase Storage is enabled
2. Run database migration: `20260201000001_add_profile_image_support.sql`
3. Verify Redis is available for caching
4. Test image uploads in staging environment
5. Monitor storage usage and implement cleanup if needed

---

**Implementation Status**: ✅ Complete
**Last Updated**: February 1, 2026
**Services**: Document, Identity, API Gateway, Portal Frontend
