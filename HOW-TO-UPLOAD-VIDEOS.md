# How to Upload MP4 Videos

Since the CMS doesn't support direct MP4 uploads, here's the workaround:

## Method 1: Upload via GitHub (Recommended)

1. Go to your GitHub repository: https://github.com/OnelioViera/bootstrap
2. Navigate to the `videos` folder (or create it if it doesn't exist)
3. Click **"Add file"** → **"Upload files"**
4. Drag and drop your MP4 video file
5. Add a commit message (e.g., "Add hero background video")
6. Click **"Commit changes"**
7. Note the file path (e.g., `/videos/hero-background.mp4`)

## Method 2: Use VS Code (If you have repo cloned locally)

1. Place your MP4 file in the `c:\Users\OViera\OneDrive - Lindsay Precast\Desktop\ONELIO\bootstrap\videos\` folder
2. Commit and push to GitHub

## Then Update CMS:

1. Go to `/admin` on your website
2. Navigate to **Hero Section** → **Hero Content**
3. Set **Background Type** to "Video Background"
4. In **Background Video URL** field, enter: `/videos/your-video-name.mp4`
5. Upload a **Video Poster Image** (this works normally in CMS)
6. Configure video settings
7. Save and publish

## File Requirements:

- Format: MP4 (H.264)
- Size: Under 10MB recommended
- Resolution: 1920x1080 or similar
- Keep filename simple (no spaces): `hero-background.mp4`

## Example Configuration:

```
Background Type: video
Background Video URL: /videos/hero-background.mp4
Video Poster Image: [upload via CMS - this works!]
Autoplay: ON
Loop: ON
Muted: ON
Overlay Opacity: 0.5
```

The CMS can't upload videos directly, but it CAN configure them once they're on GitHub!
