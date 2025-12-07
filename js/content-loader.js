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

    // Update title
    const title = document.querySelector('.hero-section .heading-xl');
    if (title) {
        // Split title for styling - first part normal, rest with gradient
        const words = content.title.split(' ');
        if (words.length > 2) {
            const firstPart = words.slice(0, 2).join(' ');
            const secondPart = words.slice(2).join(' ');
            title.innerHTML = `${firstPart}:<br><span class="text-gradient">${secondPart}</span>`;
        } else {
            title.textContent = content.title;
        }
    }

    // Update subtitle
    const subtitle = document.querySelector('.hero-section .fs-5.text-muted-custom');
    if (subtitle) subtitle.textContent = content.subtitle;

    // Update buttons
    const primaryBtn = document.querySelector('.hero-section .btn-primary-gradient');
    if (primaryBtn) {
        const icon = primaryBtn.querySelector('i');
        primaryBtn.innerHTML = content.primaryButton;
        if (icon) primaryBtn.prepend(icon);
        primaryBtn.innerHTML += ' <i class="bi bi-arrow-right"></i>';
    }

    const secondaryBtn = document.querySelector('.hero-section .btn-secondary-outline');
    if (secondaryBtn) {
        secondaryBtn.innerHTML = `<i class="bi bi-play-circle me-2"></i>${content.secondaryButton}`;
    }

    // Update hero image
    const heroImg = document.querySelector('.hero-section .hero-image');
    if (heroImg && content.heroImage) {
        heroImg.src = content.heroImage;
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
            const label = statItems[index].querySelector('p');
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

    // Update section badge
    const badge = document.querySelector('#about .badge-secondary');
    if (badge) badge.textContent = content.badge;

    // Update section title
    const title = document.querySelector('#about .heading-lg');
    if (title) title.textContent = content.title;

    // Update section description
    const desc = document.querySelector('#about > .container > .row > .col-lg-6:first-child > p');
    if (desc) desc.textContent = content.description;

    // Update feature cards
    if (content.cards) {
        const cards = document.querySelectorAll('#about .custom-card');
        content.cards.forEach((card, index) => {
            if (cards[index]) {
                const icon = cards[index].querySelector('i');
                const cardTitle = cards[index].querySelector('h5');
                const cardDesc = cards[index].querySelector('p');
                
                if (icon) icon.className = `bi ${card.icon} fs-4`;
                if (cardTitle) cardTitle.textContent = card.title;
                if (cardDesc) cardDesc.textContent = card.description;
            }
        });
    }
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

