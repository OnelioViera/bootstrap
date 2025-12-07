# Decap CMS for Lindsay Precast

## 🚀 Quick Start

### Local Testing (No Authentication Required)

1. Install the Decap CMS local server:
   ```bash
   npx decap-server
   ```

2. Open your site locally (use Live Server or similar)

3. Navigate to `http://localhost:5500/admin/` (or your port)

4. Edit content through the visual interface!

---

## 🌐 Production Setup (Vercel + GitHub)

For production, you need to set up authentication. Choose one:

### Option A: Netlify Identity (Easiest)

1. Deploy to Netlify instead of Vercel
2. Enable Netlify Identity in your site settings
3. Add yourself as a user

### Option B: GitHub OAuth (Works with Vercel)

1. Create a GitHub OAuth App:
   - Go to GitHub → Settings → Developer settings → OAuth Apps → New
   - Authorization callback URL: `https://api.netlify.com/auth/done`

2. Create a free Netlify site just for authentication:
   - Create new site on Netlify
   - Enable Identity
   - Go to Settings → Identity → External Providers → GitHub
   - Add your OAuth App Client ID and Secret

3. Update `admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: OnelioViera/bootstrap
     branch: main
   ```

---

## 📁 File Structure

```
admin/
├── index.html      ← Admin interface
├── config.yml      ← CMS configuration
└── README.md       ← This file

content/
├── settings.json   ← Site settings
├── hero.json       ← Hero section content
├── stats.json      ← Statistics
├── features.json   ← Features/Partner section
├── capabilities.json ← Capabilities section
├── cta.json        ← Call to action
├── projects/       ← Project entries
│   ├── north-georgia-solar-farm.json
│   └── tennessee-valley-project.json
└── testimonials/   ← Testimonial entries
    └── james-chen.json
```

---

## 🔄 How to Roll Back

If you want to remove the CMS, simply delete these folders:

```bash
# Delete CMS folders
rm -rf admin/
rm -rf content/
```

Your original `index.html` is **unchanged** and will continue to work.

---

## 📝 Connecting Content to Your Site

To make the CMS content appear on your site, you'll need to add JavaScript that:

1. Fetches the JSON files from `/content/`
2. Updates the DOM with the content

Example (add to `js/components.js`):

```javascript
// Load hero content
async function loadHeroContent() {
    const response = await fetch('/content/hero.json');
    const data = await response.json();
    
    document.querySelector('.heading-xl').textContent = data.title;
    document.querySelector('.hero-section .fs-5').textContent = data.subtitle;
}

loadHeroContent();
```

---

## 📚 Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Configuration Options](https://decapcms.org/docs/configuration-options/)
- [Widget Reference](https://decapcms.org/docs/widgets/)

