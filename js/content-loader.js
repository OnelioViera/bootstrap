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

    // Handle background (image or video)
    const heroSection = document.querySelector('.hero-section');
    
    console.log('Background Type:', content.backgroundType);
    console.log('Video URL:', content.videoUrl);
    console.log('Hero Section found:', !!heroSection);
    
    if (content.backgroundType === 'video' && content.videoUrl) {
        console.log('Creating video background...');
        
        // Hide the default image
        const heroImageWrapper = document.querySelector('.hero-image-wrapper');
        if (heroImageWrapper) {
            heroImageWrapper.style.display = 'none';
        }
        
        // Create video background
        const videoContainer = document.createElement('div');
        videoContainer.className = 'hero-video-background';
        
        // Create video element
        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'auto');
        
        // Apply settings from CMS
        const settings = content.videoSettings || {};
        if (settings.autoplay !== false) video.setAttribute('autoplay', '');
        if (settings.loop !== false) video.setAttribute('loop', '');
        if (settings.muted !== false) video.setAttribute('muted', '');
        
        // Set playback speed
        if (settings.playbackSpeed) {
            video.playbackRate = parseFloat(settings.playbackSpeed);
            video.addEventListener('loadedmetadata', () => {
                video.playbackRate = parseFloat(settings.playbackSpeed);
            });
        }
        
        // Set poster image for mobile/fallback
        if (content.videoPoster) {
            video.setAttribute('poster', content.videoPoster);
            videoContainer.style.backgroundImage = `url(${content.videoPoster})`;
        }
        
        // Add video source
        const source = document.createElement('source');
        source.src = content.videoUrl;
        source.type = 'video/mp4';
        video.appendChild(source);
        
        videoContainer.appendChild(video);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'hero-video-overlay';
        
        // Set overlay type
        const overlayType = settings.overlayType || 'gradient';
        overlay.setAttribute('data-overlay-type', overlayType);
        
        // Set overlay opacity
        if (settings.overlayOpacity !== undefined) {
            overlay.style.setProperty('--overlay-opacity', settings.overlayOpacity);
        }
        
        videoContainer.appendChild(overlay);
        
        // Insert at beginning of hero section
        if (heroSection) {
            heroSection.insertBefore(videoContainer, heroSection.firstChild);
            heroSection.style.position = 'relative';
            console.log('Video container added to DOM');
            console.log('Video element:', video);
            console.log('Video source:', video.querySelector('source').src);
        }
        
        // Log video loading events
        video.addEventListener('loadstart', () => console.log('Video loading started'));
        video.addEventListener('canplay', () => console.log('Video can play'));
        video.addEventListener('playing', () => console.log('Video is playing'));
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            console.error('Video error details:', video.error);
        });
        
        // Add video controls (play/pause button)
        addVideoControls(video);
        
    } else if (content.heroImage) {
        // Use image background (existing functionality)
        const heroImg = document.querySelector('.hero-section .hero-image');
        if (heroImg) {
            heroImg.src = content.heroImage;
            
            // Apply image fit style
            if (content.imageFit) {
                heroImg.style.objectFit = content.imageFit;
            } else {
                heroImg.style.objectFit = 'cover'; // Default
            }
        }
    }

    // Show hero content (fade in)
    const heroContent = document.querySelector('.hero-section .hero-content');
    if (heroContent) {
        heroContent.classList.add('loaded');
    }
}

// ============================================
// VIDEO CONTROLS
// ============================================

function addVideoControls(video) {
    if (!video) return;
    
    // Create control button
    const controlBtn = document.createElement('button');
    controlBtn.className = 'video-control-btn';
    controlBtn.id = 'videoToggle';
    controlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    controlBtn.setAttribute('aria-label', 'Toggle video playback');
    
    // Add to page
    document.body.appendChild(controlBtn);
    
    // Show button only if video is playing
    video.addEventListener('playing', () => {
        controlBtn.style.display = 'flex';
    });
    
    // Handle click
    controlBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            controlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
            controlBtn.setAttribute('aria-label', 'Pause video');
        } else {
            video.pause();
            controlBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            controlBtn.setAttribute('aria-label', 'Play video');
        }
    });
    
    // Hide button on mobile
    const checkMobile = () => {
        if (window.innerWidth <= 768) {
            controlBtn.style.display = 'none';
        } else if (!video.paused) {
            controlBtn.style.display = 'flex';
        }
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile();
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
    if (!content) {
        console.warn('Projects section content not found');
        return;
    }

    const section = document.querySelector('.projects-section');
    if (!section) {
        console.warn('Projects section element not found');
        return;
    }

    // Update section title
    const title = section.querySelector('.heading-lg');
    if (title && content.title) {
        title.textContent = content.title;
        console.log('Projects title updated:', content.title);
    }

    // Update section description
    const textCenter = section.querySelector('.text-center');
    const desc = textCenter ? textCenter.querySelector('p.fs-5') : null;
    if (desc && content.description) {
        desc.textContent = content.description;
        console.log('Projects description updated');
    }

    // Load project cards from the same content file
    if (content.cards && content.cards.length > 0) {
        loadProjectCardsFromContent(content.cards);
    }
}

// ============================================
// LOAD PROJECT CARDS FROM CONTENT
// ============================================

function loadProjectCardsFromContent(cards) {
    const projectsContainer = document.querySelector('.projects-section .row.g-4');
    if (!projectsContainer) {
        console.warn('Projects container not found');
        return;
    }

    // Clear existing cards
    projectsContainer.innerHTML = '';

    // Render each project card
    cards.forEach((project, index) => {
        const card = createProjectCard(project, index);
        projectsContainer.appendChild(card);
    });

    console.log(`Loaded ${cards.length} project cards`);
}

function createProjectCard(project, index) {
    const col = document.createElement('div');
    col.className = `col-md-6 animate-on-scroll${index > 0 ? ' delay-' + index : ''}`;

    // Determine badge style based on status
    let badgeClass = 'badge-secondary';
    if (project.status === 'Completed') badgeClass = 'badge-accent-bg';
    else if (project.status === 'In Progress') badgeClass = 'badge-secondary';
    else if (project.status === 'Planned') badgeClass = 'badge-primary-bg';

    // Create tags HTML
    const tagsHtml = project.tags ? project.tags.map(t => 
        `<span class="badge-outline badge-primary small">${t.tag}</span>`
    ).join('') : '';

    // Apply image fit style
    const imageFit = project.imageFit || 'cover';
    
    col.innerHTML = `
        <div class="project-card h-100">
            <div class="img-wrapper">
                <img 
                    src="${project.image}" 
                    alt="${project.title}"
                    style="object-fit: ${imageFit};"
                >
            </div>
            <div class="p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h3 class="fs-5 fw-bold mb-1">${project.title}</h3>
                        <p class="text-muted-custom small mb-0">${project.subtitle}</p>
                    </div>
                    <span class="badge ${badgeClass}">${project.status}</span>
                </div>
                <p class="text-muted-custom mb-4">
                    ${project.description}
                </p>
                <div class="d-flex flex-wrap gap-2">
                    ${tagsHtml}
                </div>
            </div>
        </div>
    `;

    return col;
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

