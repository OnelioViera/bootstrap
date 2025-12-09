/**
 * Lindsay Precast Custom CMS
 * GitHub-based Content Management System
 */

class LindsayCMS {
    constructor() {
        this.config = window.CMS_CONFIG || {};
        this.token = null;
        this.user = null;
        this.repo = 'OnelioViera/bootstrap';
        this.branch = 'main';
        this.baseUrl = 'https://api.github.com';
        this.currentCollection = null;
        this.currentFile = null;
        this.currentData = null;
        this.originalData = null;
        this.hasChanges = false;
        
        this.init();
    }

    init() {
        // Check for existing auth
        this.checkAuth();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Handle OAuth callback
        this.handleOAuthCallback();
    }

    setupEventListeners() {
        // Login
        document.getElementById('github-login-btn')?.addEventListener('click', () => this.login());
        
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
        
        // View site
        document.getElementById('view-site-btn')?.addEventListener('click', () => {
            window.open('/', '_blank');
        });
        
        // Save button
        document.getElementById('save-btn')?.addEventListener('click', () => this.saveChanges());
        
        // Reset button
        document.getElementById('reset-btn')?.addEventListener('click', () => this.resetChanges());
        
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => this.showWelcome());
        
        // Preview button
        document.getElementById('preview-btn')?.addEventListener('click', () => this.showPreview());
        
        // Close preview
        document.getElementById('close-preview-btn')?.addEventListener('click', () => this.closePreview());
        
        // Detect form changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('#editor-form')) {
                this.markAsChanged();
            }
        });
        
        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    // ==================== Authentication ====================
    
    checkAuth() {
        // Check localStorage for token
        const savedAuth = localStorage.getItem('lindsay-cms-auth');
        if (savedAuth) {
            try {
                const auth = JSON.parse(savedAuth);
                this.token = auth.token;
                this.verifyToken();
            } catch (e) {
                console.error('Invalid auth data:', e);
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    async verifyToken() {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                this.user = await response.json();
                this.hideLoading();
                this.showCMS();
            } else {
                const errorText = await response.text();
                console.error('Token verification failed:', response.status, errorText);
                throw new Error(`Invalid token: ${response.status}`);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.hideLoading();
            
            // Show error to user
            const loginError = document.getElementById('login-error');
            if (loginError) {
                loginError.textContent = `Authentication failed: ${error.message}. Please try again.`;
            }
            
            this.logout();
        }
    }

    login() {
        // Check if we're on localhost or local network
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('192.168.');
        
        if (isLocal) {
            // Show error for local development
            const loginError = document.getElementById('login-error');
            if (loginError) {
                loginError.innerHTML = `
                    <strong>⚠️ Cannot use OAuth locally</strong><br>
                    The CMS requires deployment to work with GitHub OAuth.<br><br>
                    <strong>Options:</strong><br>
                    1. Deploy to Vercel and access via your deployed URL<br>
                    2. Use a GitHub Personal Access Token for local testing (see console)
                `;
            }
            
            console.log(`
═══════════════════════════════════════════════════════════
  LOCAL DEVELOPMENT DETECTED
═══════════════════════════════════════════════════════════

The OAuth flow requires a deployed environment to work.

OPTION 1: Deploy to Vercel (Recommended)
  1. Push your code to GitHub
  2. Deploy to Vercel
  3. Access CMS via: https://your-site.vercel.app/admin/

OPTION 2: Use Personal Access Token (Testing Only)
  1. Go to: https://github.com/settings/tokens
  2. Generate new token (classic) with 'repo' scope
  3. Run in console:
     localStorage.setItem('lindsay-cms-auth', JSON.stringify({token: 'YOUR_TOKEN_HERE'}))
     location.reload()

⚠️  Never commit your personal access token!
═══════════════════════════════════════════════════════════
            `);
            return;
        }
        
        // Redirect to GitHub OAuth via our API endpoint
        const authUrl = `${window.location.origin}/api/auth`;
        
        // Test if the API endpoint exists
        fetch(authUrl, { method: 'HEAD', redirect: 'manual' })
            .catch(() => {
                // API endpoint doesn't exist or isn't accessible
                const loginError = document.getElementById('login-error');
                if (loginError) {
                    loginError.innerHTML = `
                        <strong>⚠️ OAuth API not found</strong><br>
                        Make sure your site is properly deployed to Vercel with the /api/ folder.
                    `;
                }
                console.error('OAuth API endpoint not found. Check that /api/auth.js and /api/callback.js are deployed.');
                return;
            });
        
        // Open popup for OAuth
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
            authUrl, 
            'GitHub OAuth', 
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
        );
        
        if (!popup) {
            // Popup blocked - fallback to redirect
            this.showToast('Please allow popups for this site, or we will redirect you...', 'warning');
            setTimeout(() => {
                window.location.href = authUrl;
            }, 2000);
            return;
        }
        
        // Listen for message from popup (callback page will send this)
        const messageHandler = (event) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) {
                return;
            }
            
            if (event.data && typeof event.data === 'string' && event.data.includes('authorization:github:success')) {
                try {
                    const data = JSON.parse(event.data.split('authorization:github:success:')[1]);
                    this.token = data.token;
                    localStorage.setItem('lindsay-cms-auth', JSON.stringify({ token: this.token }));
                    this.verifyToken();
                    if (popup && !popup.closed) popup.close();
                    
                    // Remove event listener
                    window.removeEventListener('message', messageHandler);
                } catch (e) {
                    console.error('Error parsing auth message:', e);
                    this.showToast('Authentication failed. Please try again.', 'error');
                }
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Check if popup was closed without completing auth
        const popupCheckInterval = setInterval(() => {
            if (popup.closed) {
                clearInterval(popupCheckInterval);
                window.removeEventListener('message', messageHandler);
                if (!this.token) {
                    console.log('Authentication popup closed without completing');
                }
            }
        }, 500);
    }

    handleOAuthCallback() {
        // Check if we're returning from OAuth (in case of redirect flow)
        const urlParams = new URLSearchParams(window.location.search);
        
        // The callback page stores token in localStorage, so check for that
        const savedAuth = localStorage.getItem('lindsay-cms-auth');
        if (savedAuth) {
            try {
                const auth = JSON.parse(savedAuth);
                if (auth.token && !this.token) {
                    this.token = auth.token;
                    this.verifyToken();
                }
            } catch (e) {
                console.error('Error parsing saved auth:', e);
            }
        }
        
        // If coming back from redirect with success parameter
        if (urlParams.get('auth') === 'success') {
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            this.showToast('Successfully authenticated!', 'success');
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('lindsay-cms-auth');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('cms-interface').classList.add('hidden');
    }

    showCMS() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('cms-interface').classList.remove('hidden');
        
        // Update user info
        if (this.user) {
            document.getElementById('user-avatar').src = this.user.avatar_url;
            document.getElementById('user-name').textContent = this.user.name || this.user.login;
        }
        
        // Load collections
        this.loadCollections();
    }

    // ==================== Collections ====================
    
    loadCollections() {
        const nav = document.getElementById('content-nav');
        nav.innerHTML = '';
        
        if (!this.config.collections) {
            nav.innerHTML = '<p class="text-muted">No collections configured</p>';
            return;
        }
        
        this.config.collections.forEach(collection => {
            const item = document.createElement('button');
            item.className = 'sidebar-nav-item';
            item.innerHTML = `
                <i class="bi bi-${this.getCollectionIcon(collection)}"></i>
                <span>${collection.label}</span>
            `;
            item.addEventListener('click', () => this.loadCollection(collection));
            nav.appendChild(item);
        });
    }

    getCollectionIcon(collection) {
        const icons = {
            'settings': 'gear',
            'hero': 'image',
            'stats': 'bar-chart',
            'features': 'grid',
            'projects': 'folder',
            'capabilities': 'tools',
            'testimonials': 'chat-quote',
            'cta': 'megaphone'
        };
        return icons[collection.name] || 'file-earmark-text';
    }

    async loadCollection(collection) {
        this.currentCollection = collection;
        
        if (collection.folder) {
            // Folder-based collection (e.g., testimonials)
            await this.loadFolderCollection(collection);
        } else if (collection.files) {
            // File-based collection (e.g., settings, hero)
            if (collection.files.length === 1) {
                await this.loadFileCollection(collection, collection.files[0]);
            } else {
                // Multiple files - show list
                await this.showFilesList(collection);
            }
        }
    }

    async showFilesList(collection) {
        // Hide other screens
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('collection-editor').classList.add('hidden');
        document.getElementById('collection-list').classList.remove('hidden');
        
        const listTitle = document.getElementById('list-title');
        const itemsList = document.getElementById('items-list');
        
        listTitle.textContent = collection.label;
        itemsList.innerHTML = '';
        
        collection.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="list-item-content">
                    <h4>${file.label}</h4>
                    <p>${file.file}</p>
                </div>
                <button class="btn btn-secondary">
                    <i class="bi bi-pencil"></i>
                    Edit
                </button>
            `;
            item.querySelector('button').addEventListener('click', () => {
                this.loadFileCollection(collection, file);
            });
            itemsList.appendChild(item);
        });
    }

    async loadFileCollection(collection, fileConfig) {
        this.showLoading();
        
        try {
            // Fetch file from GitHub
            const content = await this.fetchFileContent(fileConfig.file);
            this.currentFile = fileConfig.file;
            this.currentData = JSON.parse(content);
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
            
            // Show editor
            this.showEditor(fileConfig.label, fileConfig.fields);
            
        } catch (error) {
            console.error('Error loading file:', error);
            this.showToast('Error loading file: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadFolderCollection(collection) {
        this.showLoading();
        
        try {
            // Fetch folder contents from GitHub
            const files = await this.fetchFolderContents(collection.folder);
            
            // Hide other screens
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('collection-editor').classList.add('hidden');
            document.getElementById('collection-list').classList.remove('hidden');
            
            const listTitle = document.getElementById('list-title');
            const itemsList = document.getElementById('items-list');
            const createBtn = document.getElementById('create-item-btn');
            
            listTitle.textContent = collection.label;
            itemsList.innerHTML = '';
            
            // Show/hide create button based on collection config
            if (collection.create !== false) {
                createBtn.classList.remove('hidden');
                createBtn.onclick = () => this.createNewItem(collection);
            } else {
                createBtn.classList.add('hidden');
            }
            
            // List items
            for (const file of files) {
                const content = await this.fetchFileContent(`${collection.folder}/${file.name}`);
                const data = JSON.parse(content);
                
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <div class="list-item-content">
                        <h4>${data[collection.fields[0].name] || file.name}</h4>
                        <p>${file.name}</p>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-secondary edit-btn">
                            <i class="bi bi-pencil"></i>
                            Edit
                        </button>
                        <button class="btn btn-danger delete-btn">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
                
                item.querySelector('.edit-btn').addEventListener('click', () => {
                    this.editFolderItem(collection, `${collection.folder}/${file.name}`, data);
                });
                
                item.querySelector('.delete-btn').addEventListener('click', () => {
                    this.deleteItem(collection, `${collection.folder}/${file.name}`, file.name);
                });
                
                itemsList.appendChild(item);
            }
            
            if (files.length === 0) {
                itemsList.innerHTML = '<p class="text-muted text-center">No items yet. Click "Create New" to add one.</p>';
            }
            
        } catch (error) {
            console.error('Error loading collection:', error);
            this.showToast('Error loading collection: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    createNewItem(collection) {
        this.currentFile = null;
        this.currentData = {};
        this.originalData = {};
        
        // Initialize with default values
        collection.fields.forEach(field => {
            if (field.default !== undefined) {
                this.currentData[field.name] = field.default;
            }
        });
        
        this.showEditor(`New ${collection.label_singular || 'Item'}`, collection.fields, true);
    }

    async editFolderItem(collection, filepath, data) {
        this.currentFile = filepath;
        this.currentData = data;
        this.originalData = JSON.parse(JSON.stringify(data));
        
        this.showEditor('Edit ' + (collection.label_singular || 'Item'), collection.fields);
    }

    async deleteItem(collection, filepath, filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }
        
        this.showLoading();
        
        try {
            await this.deleteFile(filepath);
            this.showToast('Item deleted successfully', 'success');
            this.loadCollection(collection);
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showToast('Error deleting item: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // ==================== Editor ====================
    
    showEditor(title, fields, isNew = false) {
        // Hide other screens
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('collection-list').classList.add('hidden');
        document.getElementById('collection-editor').classList.remove('hidden');
        
        // Update title
        document.getElementById('editor-title').textContent = title;
        
        // Generate form
        this.generateForm(fields);
        
        // Reset status
        this.hasChanges = false;
        this.updateStatus();
    }

    showWelcome() {
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('collection-list').classList.add('hidden');
        document.getElementById('collection-editor').classList.add('hidden');
        
        // Reset state
        this.currentCollection = null;
        this.currentFile = null;
        this.currentData = null;
        this.originalData = null;
        this.hasChanges = false;
    }

    generateForm(fields) {
        const form = document.getElementById('editor-form');
        form.innerHTML = '';
        
        fields.forEach(field => {
            const fieldEl = this.createFieldElement(field);
            form.appendChild(fieldEl);
        });
    }

    createFieldElement(field) {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        if (field.required !== false) {
            label.innerHTML += ' <span class="required">*</span>';
        }
        fieldWrapper.appendChild(label);
        
        if (field.hint) {
            const hint = document.createElement('small');
            hint.className = 'form-hint';
            hint.textContent = field.hint;
            fieldWrapper.appendChild(hint);
        }
        
        let input;
        const value = this.currentData[field.name];
        
        switch (field.widget) {
            case 'string':
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.value = value || '';
                input.dataset.fieldName = field.name;
                break;
                
            case 'text':
            case 'markdown':
                input = document.createElement('textarea');
                input.className = 'form-control';
                input.rows = field.widget === 'markdown' ? 10 : 5;
                input.value = value || '';
                input.dataset.fieldName = field.name;
                if (field.widget === 'markdown') {
                    input.placeholder = 'Supports Markdown formatting';
                }
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.className = 'form-control';
                input.value = value !== undefined ? value : '';
                input.dataset.fieldName = field.name;
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
                if (field.step !== undefined) input.step = field.step;
                break;
                
            case 'boolean':
                input = document.createElement('div');
                input.className = 'form-check-wrapper';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check';
                checkbox.checked = value || false;
                checkbox.dataset.fieldName = field.name;
                input.appendChild(checkbox);
                break;
                
            case 'select':
                input = document.createElement('select');
                input.className = 'form-control';
                input.dataset.fieldName = field.name;
                field.options.forEach(option => {
                    const opt = document.createElement('option');
                    if (typeof option === 'object') {
                        opt.value = option.value;
                        opt.textContent = option.label;
                    } else {
                        opt.value = option;
                        opt.textContent = option;
                    }
                    if (value === opt.value) {
                        opt.selected = true;
                    }
                    input.appendChild(opt);
                });
                break;
                
            case 'image':
                input = document.createElement('div');
                input.className = 'image-upload-wrapper';
                input.innerHTML = `
                    <input type="text" class="form-control" value="${value || ''}" data-field-name="${field.name}" placeholder="Image path (e.g., /images/photo.jpg)">
                    <div class="image-preview ${value ? '' : 'hidden'}">
                        <img src="${value || ''}" alt="Preview">
                    </div>
                    <small class="form-hint">Enter image path or upload via GitHub</small>
                `;
                // Update preview on input change
                const imgInput = input.querySelector('input');
                const preview = input.querySelector('.image-preview');
                const previewImg = preview.querySelector('img');
                imgInput.addEventListener('input', (e) => {
                    const path = e.target.value;
                    if (path) {
                        previewImg.src = path;
                        preview.classList.remove('hidden');
                    } else {
                        preview.classList.add('hidden');
                    }
                });
                break;
                
            case 'list':
                input = this.createListWidget(field, value);
                break;
                
            case 'object':
                input = this.createObjectWidget(field, value);
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.value = value || '';
                input.dataset.fieldName = field.name;
        }
        
        fieldWrapper.appendChild(input);
        return fieldWrapper;
    }

    createListWidget(field, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'list-widget';
        wrapper.dataset.fieldName = field.name;
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'list-items';
        
        const items = value || [];
        items.forEach((item, index) => {
            const itemEl = this.createListItem(field, item, index);
            itemsContainer.appendChild(itemEl);
        });
        
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-secondary btn-sm';
        addBtn.innerHTML = '<i class="bi bi-plus"></i> Add Item';
        addBtn.addEventListener('click', () => {
            const newItem = {};
            if (field.fields) {
                field.fields.forEach(f => {
                    newItem[f.name] = f.default || '';
                });
            }
            const itemEl = this.createListItem(field, newItem, itemsContainer.children.length);
            itemsContainer.appendChild(itemEl);
            this.markAsChanged();
        });
        
        wrapper.appendChild(itemsContainer);
        wrapper.appendChild(addBtn);
        
        return wrapper;
    }

    createListItem(field, item, index) {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item-editor';
        
        const header = document.createElement('div');
        header.className = 'list-item-header';
        header.innerHTML = `
            <span class="list-item-index">#${index + 1}</span>
            <button type="button" class="btn btn-text btn-sm delete-list-item">
                <i class="bi bi-trash"></i>
            </button>
        `;
        
        header.querySelector('.delete-list-item').addEventListener('click', () => {
            itemEl.remove();
            this.markAsChanged();
        });
        
        itemEl.appendChild(header);
        
        if (field.fields) {
            field.fields.forEach(subField => {
                const subFieldEl = this.createFieldElement({
                    ...subField,
                    name: `${field.name}[${index}].${subField.name}`
                });
                itemEl.appendChild(subFieldEl);
            });
        } else {
            // Simple list (just strings)
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.value = typeof item === 'string' ? item : (item.tag || '');
            input.dataset.fieldName = `${field.name}[${index}]`;
            itemEl.appendChild(input);
        }
        
        return itemEl;
    }

    createObjectWidget(field, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'object-widget';
        wrapper.dataset.fieldName = field.name;
        
        if (field.collapsed) {
            wrapper.classList.add('collapsed');
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'btn btn-text btn-sm toggle-object';
            toggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i> ' + field.label;
            toggleBtn.addEventListener('click', () => {
                wrapper.classList.toggle('collapsed');
                toggleBtn.querySelector('i').classList.toggle('bi-chevron-down');
                toggleBtn.querySelector('i').classList.toggle('bi-chevron-up');
            });
            wrapper.appendChild(toggleBtn);
        }
        
        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'object-fields';
        
        if (field.fields) {
            field.fields.forEach(subField => {
                const subValue = value ? value[subField.name] : undefined;
                const subFieldEl = this.createFieldElement({
                    ...subField,
                    name: `${field.name}.${subField.name}`
                });
                fieldsContainer.appendChild(subFieldEl);
            });
        }
        
        wrapper.appendChild(fieldsContainer);
        return wrapper;
    }

    // ==================== Data Management ====================
    
    getFormData() {
        const form = document.getElementById('editor-form');
        const data = {};
        
        // Get all form inputs
        const inputs = form.querySelectorAll('[data-field-name]');
        inputs.forEach(input => {
            const fieldName = input.dataset.fieldName;
            let value;
            
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number') {
                value = input.value ? parseFloat(input.value) : undefined;
            } else {
                value = input.value;
            }
            
            // Handle nested fields (e.g., "videoSettings.autoplay" or "buttons[0].text")
            if (fieldName.includes('.') || fieldName.includes('[')) {
                this.setNestedValue(data, fieldName, value);
            } else {
                data[fieldName] = value;
            }
        });
        
        // Handle list widgets
        const listWidgets = form.querySelectorAll('.list-widget');
        listWidgets.forEach(widget => {
            const fieldName = widget.dataset.fieldName;
            const items = [];
            const listItems = widget.querySelectorAll('.list-item-editor');
            
            listItems.forEach((itemEl, index) => {
                const itemInputs = itemEl.querySelectorAll('[data-field-name]');
                if (itemInputs.length === 1 && !itemInputs[0].dataset.fieldName.includes('.')) {
                    // Simple list
                    items.push(itemInputs[0].value);
                } else {
                    // Complex list with objects
                    const itemData = {};
                    itemInputs.forEach(input => {
                        const name = input.dataset.fieldName.split('.').pop();
                        itemData[name] = input.type === 'checkbox' ? input.checked : input.value;
                    });
                    items.push(itemData);
                }
            });
            
            data[fieldName] = items;
        });
        
        // Handle object widgets
        const objectWidgets = form.querySelectorAll('.object-widget');
        objectWidgets.forEach(widget => {
            const fieldName = widget.dataset.fieldName;
            const objectData = {};
            const objectInputs = widget.querySelectorAll('[data-field-name]');
            
            objectInputs.forEach(input => {
                const name = input.dataset.fieldName.split('.').pop();
                objectData[name] = input.type === 'checkbox' ? input.checked : input.value;
            });
            
            data[fieldName] = objectData;
        });
        
        return data;
    }

    setNestedValue(obj, path, value) {
        const parts = path.split(/\.|\[|\]/).filter(p => p);
        let current = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            const nextPart = parts[i + 1];
            
            if (!isNaN(nextPart)) {
                if (!current[part]) current[part] = [];
            } else {
                if (!current[part]) current[part] = {};
            }
            
            current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
    }

    markAsChanged() {
        this.hasChanges = true;
        this.updateStatus();
    }

    updateStatus() {
        const saveBtn = document.getElementById('save-btn');
        const statusIndicator = document.getElementById('editor-status');
        
        if (this.hasChanges) {
            saveBtn.disabled = false;
            statusIndicator.innerHTML = '<i class="bi bi-circle-fill text-warning"></i><span>Unsaved changes</span>';
        } else {
            saveBtn.disabled = true;
            statusIndicator.innerHTML = '<i class="bi bi-circle-fill text-success"></i><span>All changes saved</span>';
        }
    }

    async saveChanges() {
        this.showLoading();
        
        try {
            // Get form data
            const newData = this.getFormData();
            
            // Determine file path
            let filepath = this.currentFile;
            
            if (!filepath) {
                // New item in folder collection - generate filename
                const slug = this.generateSlug(newData);
                filepath = `${this.currentCollection.folder}/${slug}.json`;
            }
            
            // Save to GitHub
            const content = JSON.stringify(newData, null, 2);
            await this.saveFile(filepath, content);
            
            // Update state
            this.currentData = newData;
            this.originalData = JSON.parse(JSON.stringify(newData));
            this.hasChanges = false;
            this.updateStatus();
            
            // Update last saved time
            document.getElementById('last-saved').innerHTML = `
                <i class="bi bi-clock"></i>
                <span>Saved ${new Date().toLocaleTimeString()}</span>
            `;
            
            this.showToast('Changes saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving:', error);
            this.showToast('Error saving changes: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    resetChanges() {
        if (!confirm('Are you sure you want to discard all changes?')) {
            return;
        }
        
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        this.hasChanges = false;
        
        // Reload editor
        if (this.currentCollection) {
            const fields = this.currentCollection.fields || 
                          (this.currentCollection.files ? this.currentCollection.files[0].fields : []);
            this.showEditor(document.getElementById('editor-title').textContent, fields);
        }
        
        this.showToast('Changes discarded', 'info');
    }

    generateSlug(data) {
        // Try to generate a slug from the first string field
        const firstValue = Object.values(data).find(v => typeof v === 'string');
        if (firstValue) {
            return firstValue
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
        return `item-${Date.now()}`;
    }

    // ==================== GitHub API ====================
    
    async fetchFileContent(filepath) {
        const response = await fetch(
            `${this.baseUrl}/repos/${this.repo}/contents/${filepath}?ref=${this.branch}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filepath}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return atob(data.content);
    }

    async fetchFolderContents(folder) {
        const response = await fetch(
            `${this.baseUrl}/repos/${this.repo}/contents/${folder}?ref=${this.branch}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch folder ${folder}: ${response.statusText}`);
        }
        
        const files = await response.json();
        return files.filter(f => f.type === 'file' && f.name.endsWith('.json'));
    }

    async saveFile(filepath, content) {
        // First, get the current file SHA if it exists
        let sha;
        try {
            const existingFile = await fetch(
                `${this.baseUrl}/repos/${this.repo}/contents/${filepath}?ref=${this.branch}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            if (existingFile.ok) {
                const data = await existingFile.json();
                sha = data.sha;
            }
        } catch (e) {
            // File doesn't exist, that's ok
        }
        
        // Save the file
        const response = await fetch(
            `${this.baseUrl}/repos/${this.repo}/contents/${filepath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update ${filepath} via Lindsay CMS`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    branch: this.branch,
                    ...(sha && { sha })
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save file');
        }
        
        return await response.json();
    }

    async deleteFile(filepath) {
        // Get file SHA
        const existingFile = await fetch(
            `${this.baseUrl}/repos/${this.repo}/contents/${filepath}?ref=${this.branch}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!existingFile.ok) {
            throw new Error('File not found');
        }
        
        const data = await existingFile.json();
        
        // Delete the file
        const response = await fetch(
            `${this.baseUrl}/repos/${this.repo}/contents/${filepath}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete ${filepath} via Lindsay CMS`,
                    sha: data.sha,
                    branch: this.branch
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete file');
        }
    }

    // ==================== UI Helpers ====================
    
    showPreview() {
        const modal = document.getElementById('preview-modal');
        const iframe = document.getElementById('preview-iframe');
        
        modal.classList.remove('hidden');
        iframe.src = '/';
    }

    closePreview() {
        const modal = document.getElementById('preview-modal');
        const iframe = document.getElementById('preview-iframe');
        
        modal.classList.add('hidden');
        iframe.src = 'about:blank';
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="bi bi-${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize CMS when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cms = new LindsayCMS();
});
