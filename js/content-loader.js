/**
 * Content Loader - Loads CMS content from JSON files
 * This connects Decap/Sveltia CMS to the frontend
 */

// ============================================
// CONTENT LOADER
// ============================================

async function loadContent(path) {
    try {
        const response = await fetch(path + '?t=' + Date.now()); // Cache bust
        if (!response.ok) {
            console.warn(`Content file not found: ${path}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn(`Error loading content: ${path}`, error);
        return null;
    }
}

// ============================================
// HERO SECTION
// ============================================

async function loadHeroContent() {
    const content = await loadContent('/content/hero.json');
    if (!content) return;

    // Update badge
    const badge = document.querySelector('.hero-section .badge-outline');
    if (badge) badge.innerHTML = `<i class="bi bi-award me-2"></i>${content.badge}`;

    // Update title - check if it has a colon to split into h1 and h3
    const mainTitle = document.querySelector('.hero-section h1');
    const subHeading = document.querySelector('.hero-section .hero-subheading');
    
    if (content.title && content.title.includes(':')) {
        const parts = content.title.split(':');
        if (mainTitle) mainTitle.textContent = parts[0] + ':';
        if (subHeading) {
            subHeading.textContent = parts.slice(1).join(':').trim();
            subHeading.style.display = '';
        }
    } else if (content.title) {
        if (mainTitle) mainTitle.textContent = content.title;
        if (subHeading) subHeading.style.display = 'none';
    }

    // Update description
    const description = document.querySelector('.hero-section .hero-description');
    if (description) description.textContent = content.subtitle;

    // Update buttons dynamically
    const buttonContainer = document.querySelector('.hero-section .hero-buttons');
    if (buttonContainer && content.buttons && content.buttons.length > 0) {
        buttonContainer.innerHTML = ''; // Clear existing buttons
        
        content.buttons.forEach(button => {
            const btnElement = document.createElement('a');
            btnElement.href = button.url || '#';
            
            // Set button style class
            switch (button.style) {
                case 'primary':
                    btnElement.className = 'btn btn-primary-gradient btn-lg';
                    break;
                case 'secondary':
                    btnElement.className = 'btn btn-secondary-outline btn-lg';
                    break;
                case 'accent':
                    btnElement.className = 'btn btn-accent-gradient btn-lg';
                    break;
                default:
                    btnElement.className = 'btn btn-primary-gradient btn-lg';
            }
            
            // Add icon if specified
            if (button.icon) {
                btnElement.innerHTML = `${button.text} <i class="bi ${button.icon} ms-2"></i>`;
            } else {
                btnElement.textContent = button.text;
            }
            
            buttonContainer.appendChild(btnElement);
        });
    }

    // Update hero image
    const heroImg = document.querySelector('.hero-section .hero-image');
    if (heroImg && content.heroImage) {
        heroImg.src = content.heroImage;
    }

    // Show hero content (fade in)
    const heroContent = document.querySelector('.hero-section .hero-content');
    if (heroContent) {
        heroContent.classList.add('loaded');
    }
}

// ============================================
// SETTINGS (Contact info, etc.)
// ============================================

async function loadSettingsContent() {
    const content = await loadContent('/content/settings.json');
    if (!content) return;

    // Update contact info in footer/contact section
    const phoneElements = document.querySelectorAll('[data-content="phone"]');
    phoneElements.forEach(el => el.textContent = content.phone);

    const emailElements = document.querySelectorAll('[data-content="email"]');
    emailElements.forEach(el => el.textContent = content.email);

    const addressElements = document.querySelectorAll('[data-content="address"]');
    addressElements.forEach(el => el.textContent = content.address);

    const hoursElements = document.querySelectorAll('[data-content="hours"]');
    hoursElements.forEach(el => el.textContent = content.hours);
}

// ============================================
// STATS SECTION
// ============================================

async function loadStatsContent() {
    const content = await loadContent('/content/stats.json');
    if (!content || !content.items) return;

    const statItems = document.querySelectorAll('.stats-section .stat-item');
    content.items.forEach((stat, index) => {
        if (statItems[index]) {
            const number = statItems[index].querySelector('.stat-number');
            const label = statItems[index].querySelector('.text-muted-custom');
            if (number) number.textContent = stat.number;
            if (label) label.textContent = stat.label;
        }
    });
}

// ============================================
// FEATURES SECTION
// ============================================

async function loadFeaturesContent() {
    const content = await loadContent('/content/features.json');
    if (!content) return;

    const section = document.querySelector('#about');
    if (!section) return;

    // Update section badge
    const badge = section.querySelector('.badge-outline');
    if (badge && content.badge) {
        badge.innerHTML = `<i class="bi bi-star-fill"></i> ${content.badge}`;
    }

    // Update section title
    const title = section.querySelector('.heading-lg');
    if (title) title.textContent = content.title;

    // Update section description
    const desc = section.querySelector('.text-center .fs-5');
    if (desc) desc.textContent = content.description;

    // Update feature cards
    if (content.cards) {
        const cards = section.querySelectorAll('.custom-card');
        content.cards.forEach((card, index) => {
            if (cards[index]) {
                const icon = cards[index].querySelector('i');
                const cardTitle = cards[index].querySelector('h3');
                const cardDesc = cards[index].querySelector('p');
                
                if (icon && card.icon) icon.className = `bi ${card.icon} fs-3`;
                if (cardTitle) cardTitle.textContent = card.title;
                if (cardDesc) cardDesc.textContent = card.description;
            }
        });
    }
}

// ============================================
// PROJECTS SECTION
// ============================================

async function loadProjectsContent() {
    const content = await loadContent('/content/projects-section.json');
    if (!content) return;

    const section = document.querySelector('.projects-section');
    if (!section) return;

    // Update section title
    const title = section.querySelector('.heading-lg');
    if (title) title.textContent = content.title;

    // Update section description
    const desc = section.querySelector('.text-center .fs-5');
    if (desc) desc.textContent = content.description;
}

// ============================================
// CTA SECTION
// ============================================

async function loadCtaContent() {
    const content = await loadContent('/content/cta.json');
    if (!content) return;

    const section = document.querySelector('.cta-section');
    if (!section) return;

    const title = section.querySelector('h2');
    if (title) title.textContent = content.title;

    const desc = section.querySelector('p');
    if (desc) desc.textContent = content.description;

    const primaryBtn = section.querySelector('.btn-secondary-custom');
    if (primaryBtn) primaryBtn.textContent = content.primaryButton;

    const secondaryBtn = section.querySelector('.btn-outline-light-custom');
    if (secondaryBtn) {
        secondaryBtn.innerHTML = `${content.secondaryButton} <i class="bi bi-download ms-2"></i>`;
    }
}

// ============================================
// LOAD ALL CONTENT
// ============================================

async function loadAllContent() {
    // Load all content sections in parallel
    await Promise.all([
        loadHeroContent(),
        loadSettingsContent(),
        loadStatsContent(),
        loadFeaturesContent(),
        loadProjectsContent(),
        loadCtaContent()
    ]);
    
    console.log('CMS content loaded successfully');
}

// ============================================
// AUTO-INITIALIZE
// ============================================

// Load content when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllContent);
} else {
    loadAllContent();
}

