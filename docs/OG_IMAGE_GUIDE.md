# Open Graph Image Requirements

## Image Specifications

**Filename**: `og-bible-image.png`  
**Location**: `/public/og-bible-image.png`  
**Dimensions**: 1200 × 630 pixels  
**Format**: PNG or JPEG  
**File Size**: < 5MB (ideally < 500KB for fast loading)  
**Color Mode**: RGB

## Design Guidelines

### Content Suggestions

1. **Logo & Branding**

   - Include "SeekFirst Bible" logo or wordmark
   - Use consistent brand colors
   - Professional, clean design

2. **Visual Elements**

   - Open Bible imagery
   - Cross or Christian symbolism
   - Light, inviting color scheme
   - Readable on both light and dark backgrounds

3. **Text Overlay (Optional)**

   - "Read & Study Scripture Online"
   - "Free Bible Study Tools"
   - "Multiple Translations • Cross-References"
   - Use legible fonts (40pt+ for main text)

4. **Design Areas (Safe Zones)**
   - Keep important content centered
   - Avoid edges (50px margin minimum)
   - Some platforms crop to square (600×600)
   - Test at different aspect ratios

## Tools for Creation

### Online Designers

- **Canva**: Free templates, easy to use
  - Template: "Open Graph Image"
  - Preset dimensions available
- **Figma**: Professional design tool

  - Create 1200×630 frame
  - Export as PNG

- **Photopea**: Free Photoshop alternative
  - Create new 1200×630 document
  - Export as PNG

### AI Image Generators

- **DALL-E 3**: Create custom Bible imagery
- **Midjourney**: High-quality illustrations
- **Stable Diffusion**: Open-source option

**Example Prompt**:

```
"Professional website banner for a Bible study app,
open Bible with soft lighting, cross in background,
clean modern design, text reads 'SeekFirst Bible -
Study Scripture Online', 1200x630 pixels,
inspirational and welcoming"
```

## Quick Start Template

If you need a quick solution:

1. **Background**: Solid color (#2C3E50 or similar)
2. **Center Text**:
   ```
   SeekFirst Bible
   Read & Study Scripture Online
   ```
3. **Simple icon**: Open book or cross
4. **Export at 1200×630**

## Testing Your Image

After creating, test on:

- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

Check for:

- ✅ Image loads correctly
- ✅ Text is readable
- ✅ Dimensions are correct
- ✅ File size is reasonable
- ✅ Looks good in preview

## Example Images

Look at successful Bible apps for inspiration:

- YouVersion Bible App
- Blue Letter Bible
- Bible Gateway

## Current Status

⚠️ **TODO**: Create and add `og-bible-image.png` to `/public/` directory

Until the image is created, social platforms will either:

- Show no preview image
- Use a default icon
- Extract an image from the page content

The meta tags are already configured and waiting for the image!
