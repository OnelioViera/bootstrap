/**
 * Global Components Loader
 * Loads header and footer components into any page
 */

// ============================================
// COMPONENT LOADER
// ============================================

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}: ${response.status}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
        return true;
    } catch (error) {
        console.error(`Error loading component: ${error.message}`);
        return false;
    }
}

// Load all global components
async function loadGlobalComponents() {
    // Get base path (for subdirectories)
    const basePath = getBasePath();
    
    // Load header
    await loadComponent('header-placeholder', `${basePath}components/header.html`);
    
    // Load footer
    await loadComponent('footer-placeholder', `${basePath}components/footer.html`);
    
    // Initialize components after loading
    initializeComponents();
}

// Get base path based on current page location
function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    
    // If we're in a subdirectory, add ../ for each level
    if (depth > 0 && !path.includes('index.html') && path.split('/').filter(Boolean).length > 1) {
        return '../'.repeat(depth);
    }
    return '';
}

// ============================================
// INITIALIZE COMPONENTS
// ============================================

function initializeComponents() {
    // Initialize Dark Mode Toggle
    initDarkMode();
    
    // Initialize Header Scroll Effect
    initHeaderScroll();
    
    // Initialize Mobile Navigation
    initMobileNav();
    
    // Initialize Smooth Scroll
    initSmoothScroll();
}

// ============================================
// DARK MODE TOGGLE
// ============================================

function initDarkMode() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const themeIconMobile = document.getElementById('themeIconMobile');
    
    // Check for saved theme preference, default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcons(savedTheme);
    
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    }
    
    function updateThemeIcons(theme) {
        const iconClass = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;
    }
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

function initHeaderScroll() {
    const header = document.getElementById('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// ============================================
// MOBILE NAVIGATION
// ============================================

function initMobileNav() {
    // Close offcanvas on link click
    document.querySelectorAll('#mobileNav a').forEach(link => {
        link.addEventListener('click', () => {
            const offcanvasElement = document.getElementById('mobileNav');
            if (offcanvasElement && typeof bootstrap !== 'undefined') {
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        });
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle same-page anchors
            if (href.startsWith('#') || (href.includes('#') && href.split('#')[0] === '' || href.split('#')[0] === window.location.pathname.split('/').pop())) {
                const targetId = href.includes('#') ? href.split('#')[1] : href.substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    e.preventDefault();
                    const header = document.getElementById('header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// SCROLL ANIMATIONS (Call separately in pages)
// ============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in, .animate-scale-in, .animate-slide-left, .animate-slide-right');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// AUTO-INITIALIZE ON DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadGlobalComponents();
    
    // Initialize scroll animations after a short delay
    // to ensure all content is loaded
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
});

