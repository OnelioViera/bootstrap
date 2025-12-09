# Lindsay Precast Custom CMS

## 🎯 Overview

A custom-built, lightweight Content Management System specifically designed for the Lindsay Precast website. Built from scratch to replace Sveltia/Decap CMS with a more tailored solution.

### Features

✅ **GitHub Integration** - Direct GitHub OAuth authentication and repository integration  
✅ **Modern UI** - Clean, responsive interface that works on all devices  
✅ **Content Management** - Edit all content sections with intuitive forms  
✅ **Developer Friendly** - Based on existing config.yml structure  

## 🚀 Quick Start

### Accessing the CMS

1. Navigate to: `https://your-domain.com/admin/`
2. Click **"Sign in with GitHub"**
3. Authorize the application
4. Start editing your content!

### File Structure

```
admin/
├── index.html          # Entry point (redirects to custom CMS)
├── custom-cms.html     # Main CMS interface
├── custom-cms.js       # CMS logic and GitHub API integration
├── custom-cms.css      # Styling
├── cms-config.js       # Configuration based on config.yml
├── config.yml          # Original config (reference)
└── README.md           # This file
```

---

## 📝 Managing Content

### Single-File Collections (Hero, Features, Stats, etc.)

1. Click the collection name in the sidebar
2. Edit the fields in the form
3. Click **"Save Changes"**
4. Changes commit directly to GitHub

### Folder-Based Collections (Testimonials)

1. Click the collection name to view all items
2. Click **"Create New"** to add an item
3. Click **"Edit"** to modify an existing item
4. Click trash icon to delete an item

---

## 🎨 Content Types

- **Text Fields**: Simple one-line text
- **Markdown Fields**: Multi-line with formatting support
- **Number Fields**: Numeric input with constraints
- **Boolean Fields**: Checkbox for true/false
- **Select Fields**: Dropdown with predefined options
- **Image Fields**: Enter image path, shows preview
- **List Fields**: Add/remove multiple items
- **Object Fields**: Group of related fields

---

## 🛠️ Customization

### Adding New Collections

Edit `admin/cms-config.js`:

```javascript
{
    name: 'my-collection',
    label: 'My Collection',
    files: [{
        name: 'content',
        label: 'Content',
        file: 'content/my-content.json',
        fields: [
            { label: 'Title', name: 'title', widget: 'string' }
        ]
    }]
}
```

### Styling Changes

Edit `admin/custom-cms.css`. Colors are defined as CSS variables:

```css
:root {
    --primary-color: #002D5C;
    --secondary-color: #0066CC;
}
```

---

## 🔧 Advanced Features

- **Preview Changes**: See how content looks before saving
- **Reset Changes**: Discard all unsaved edits
- **Unsaved Warning**: Alerts when leaving with unsaved changes
- **Mobile Responsive**: Works on phones, tablets, desktops

---

## 🔐 Security

- GitHub OAuth authentication
- Direct GitHub API (no third-party servers)
- Tokens stored securely in localStorage
- Requires write permissions to repository

---

## 🐛 Troubleshooting

### Can't Sign In

1. Verify GitHub OAuth app is configured
2. Check `GITHUB_CLIENT_SECRET` in Vercel environment variables
3. Ensure you have write access to the repository

### Changes Not Saving

1. Check browser console for errors
2. Verify repository write permissions
3. Try refreshing and signing in again

### Images Not Displaying

1. Verify image path (e.g., `/images/photo.jpg`)
2. Ensure image exists in repository
3. Check file is publicly accessible

---

## 🔄 Rolling Back to Sveltia CMS

If needed, edit `admin/index.html` and replace body content with:

```html
<body>
    <div id="nc-root"></div>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
</body>
```

---

## 📊 Comparison

| Feature | Custom CMS | Sveltia CMS |
|---------|------------|-------------|
| Bundle Size | ~30KB | ~500KB+ |
| Load Time | <1s | 2-3s |
| Customization | Full control | Limited |
| Dependencies | None | Many |

---

## 🎓 Technical Details

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

