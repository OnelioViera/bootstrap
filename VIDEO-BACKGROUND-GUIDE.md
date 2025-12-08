# Video Background Feature Guide

## Overview
The hero section now supports video backgrounds that can be fully managed through the CMS (Decap/Sveltia CMS).

## How to Use

### 1. Access the CMS
- Navigate to `/admin` on your site
- Log in with your GitHub account
- Go to **Hero Section** → **Hero Content**

### 2. Configure Video Background

#### Option 1: Static Image (Default)
- Set **Background Type** to "Static Image"
- Upload your **Hero Image**
- Choose your **Image Display** option (cover, contain, etc.)

#### Option 2: Video Background
- Set **Background Type** to "Video Background"
- Enter your **Background Video URL** (e.g., `/videos/hero-background.mp4`)
- Upload a **Video Poster Image** (shown on mobile/before video loads)
- Configure **Video Settings**:
  - **Autoplay**: Start playing automatically (recommended: ON)
  - **Loop**: Repeat video continuously (recommended: ON)
  - **Muted**: Play without sound (recommended: ON - required for autoplay)
  - **Overlay Opacity**: Control darkness (0 = transparent, 1 = opaque, recommended: 0.5)

### 3. Video File Requirements

**Recommended Format:**
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 (Full HD) or higher
- Frame rate: 30fps
- File size: Under 10MB for best performance
- Duration: 10-30 seconds (will loop)

**Optimization Tips:**
- Use a tool like [HandBrake](https://handbrake.fr/) to compress videos
- Keep bitrate around 2-5 Mbps
- Remove audio track if not needed

### 4. Where to Store Videos

Upload your video files to the `/videos` folder in your repository, or use any public URL.

**Example structure:**
```
/videos/
  ├── hero-background.mp4
  └── hero-poster.jpg
```

### 5. Example Configuration

```json
{
  "backgroundType": "video",
  "videoUrl": "/videos/hero-background.mp4",
  "videoPoster": "/images/hero-poster.jpg",
  "videoSettings": {
    "autoplay": true,
    "loop": true,
    "muted": true,
    "overlayOpacity": 0.6
  }
}
```

## Features

✅ **Fully CMS-Managed** - All settings controlled through admin panel
✅ **Mobile Optimized** - Shows static poster image on mobile devices
✅ **Performance** - Video only loads on desktop
✅ **Customizable Overlay** - Adjust darkness to ensure text readability
✅ **Play/Pause Control** - Floating button appears on desktop (bottom-right)
✅ **Backwards Compatible** - Can switch back to static images anytime

## Troubleshooting

### Video not playing
- Ensure `autoplay` is enabled
- Ensure `muted` is enabled (browsers require muted for autoplay)
- Check video file is accessible at the URL
- Check browser console for errors

### Video too dark/light
- Adjust **Overlay Opacity** in Video Settings
- Try values between 0.3-0.7 for best results

### Performance issues
- Compress your video file (aim for under 10MB)
- Reduce resolution if needed
- Consider using image background for slower connections

## Best Practices

1. **Always provide a poster image** - Ensures good experience on mobile
2. **Keep videos short** - 10-30 seconds works best for loops
3. **Test on mobile** - Verify poster image looks good
4. **Use muted videos** - Required for autoplay to work
5. **Optimize file size** - Faster loading = better user experience
6. **Match brand colors** - Video should complement your content

## Technical Notes

- Video backgrounds use HTML5 `<video>` element
- CSS uses `object-fit: cover` for proper scaling
- Video controls are accessible with ARIA labels
- Automatically hides video on screens ≤768px wide
- Uses lazy loading and preload="auto" for optimization
