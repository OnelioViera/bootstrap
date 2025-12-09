# Bootstrap Website - Lindsay Precast

This repository contains the Lindsay Precast website with a custom CMS.

## Recent Updates

- Custom CMS added (December 8, 2025)
- Replaces Sveltia/Decap CMS with lightweight custom solution
- OAuth authentication via GitHub

## Repository Structure

```
/admin          - Custom CMS files
/api            - Vercel serverless functions (OAuth)
/content        - JSON content files
/images         - Images
/videos         - Video files
/css            - Stylesheets
/js             - JavaScript files
index.html      - Main website
```

## Deployment

This site is deployed on Vercel and automatically rebuilds on push to main branch.

**Live Site**: https://bootstrap-gules-eta.vercel.app
**CMS**: https://bootstrap-gules-eta.vercel.app/admin/

## Environment Variables Required

- `GITHUB_CLIENT_SECRET` - For OAuth authentication

## Last Deploy

- Branch: main
- Commit: b7041dc
- Date: December 8, 2025
