document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('website-form');
    const websiteInput = document.getElementById('website-url');
    const submitButton = form.querySelector('button[type="submit"]');
    const statusMessage = document.getElementById('status-message');
    const websitesList = document.getElementById('websites-list');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    
    let websiteToDelete = null;

    // Load initial data
    loadDashboardData();

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const websiteUrl = websiteInput.value.trim();

        if (!websiteUrl) {
            showMessage('Please enter a website URL.', 'error');
            return;
        }

        if (!isValidUrl(websiteUrl)) {
            showMessage('Please enter a valid URL (include http:// or https://).', 'error');
            return;
        }

        crawlWebsite(websiteUrl);
    });

    // Crawl website function
    async function crawlWebsite(websiteUrl) {
        setLoadingState(true);
        showMessage('🚀 Starting website crawl...', 'loading');

        // Get crawling options
        const maxPages = parseInt(document.getElementById('max-pages').value) || 10;
        const maxDepth = parseInt(document.getElementById('max-depth').value) || 3;
        const includeExternalLinks = document.getElementById('include-external').checked;
        const timeout = parseInt(document.getElementById('timeout').value) || 15;

        try {
            const response = await fetch('/api/crawl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    url: websiteUrl,
                    maxPages: maxPages,
                    maxDepth: maxDepth,
                    includeExternalLinks: includeExternalLinks,
                    timeout: timeout * 1000 // Convert to milliseconds
                })
            });

            const data = await response.json();

            if (data.success) {
                let message = `✅ Website crawled successfully! Found ${data.pagesCount} pages`;
                if (data.stats) {
                    message += ` with ${data.stats.totalWords} total words`;
                    if (data.stats.domainsFound > 1) {
                        message += ` across ${data.stats.domainsFound} domains`;
                    }
                }
                message += '.';
                
                showMessage(message, 'success');
                websiteInput.value = '';
                await loadDashboardData(); // Reload all data
                
                // Scroll to websites section
                document.querySelector('.websites-section').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            } else {
                showMessage('❌ Error: ' + (data.message || 'Failed to crawl website'), 'error');
            }
        } catch (error) {
            console.error('Crawl error:', error);
            showMessage('❌ Network error: ' + error.message, 'error');
        } finally {
            setLoadingState(false);
        }
    }

    // Load dashboard data
    async function loadDashboardData() {
        try {
            await Promise.all([
                loadWebsites(),
                updateStats()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Load and display websites
    async function loadWebsites() {
        try {
            const response = await fetch('/api/websites');
            if (!response.ok) throw new Error('Failed to fetch websites');
            
            const websites = await response.json();
            displayWebsites(websites);
            return websites;
        } catch (error) {
            console.error('Error loading websites:', error);
            websitesList.innerHTML = '<div class="error">❌ Failed to load websites</div>';
            return [];
        }
    }

    // Update dashboard stats
    async function updateStats() {
        try {
            const websites = await fetch('/api/websites').then(r => r.json()).catch(() => []);
            const totalPages = websites.reduce((sum, site) => sum + (site.pages?.length || 0), 0);
            
            // Update stat cards
            document.getElementById('stat-websites').textContent = websites.length;
            document.getElementById('stat-pages').textContent = totalPages;
            
            // Animate numbers
            animateNumbers();
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Animate number counters
    function animateNumbers() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent) || 0;
            const increment = target / 20;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 50);
        });
    }

    // Display websites in the UI
    function displayWebsites(websites) {
        if (websites.length === 0) {
            websitesList.innerHTML = `
                <div class="no-websites">
                    No websites crawled yet.<br>
                    Use the form above to crawl your first website.
                </div>
            `;
            return;
        }

        // Generate websites HTML with enhanced design
        const websitesHtml = websites.map(website => {
            const metadata = website.metadata || {};
            const crawlOptions = metadata.crawlOptions || {};
            
            return `
            <div class="website-card" data-website-id="${website._id}">
                <div class="website-header">
                    <div class="website-info">
                        <h3>${escapeHtml(website.title || 'Untitled Website')}</h3>
                        <a href="${website.url}" target="_blank" class="website-url" rel="noopener">
                            ${website.url}
                        </a>
                        <div class="website-meta">
                            <span class="pages">${website.pages?.length || 0} pages</span>
                            ${metadata.totalWords ? `<span class="words">${metadata.totalWords} words</span>` : ''}
                            ${metadata.domains ? `<span class="domains">${metadata.domains.length} domains</span>` : ''}
                            <span class="date">Crawled: ${formatDate(website.createdAt)}</span>
                            <span class="updated">Updated: ${formatDate(website.updatedAt)}</span>
                        </div>
                        ${website.description ? `<div class="website-description">${escapeHtml(website.description)}</div>` : ''}
                        
                        ${metadata.totalPages ? `
                        <div class="crawl-stats">
                            <h5>Crawl Statistics</h5>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value">${metadata.totalPages}</span>
                                    <span class="stat-name">Pages</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${metadata.avgWordsPerPage || 0}</span>
                                    <span class="stat-name">Avg Words</span>
                                </div>
                                ${metadata.domains ? `
                                <div class="stat-item">
                                    <span class="stat-value">${metadata.domains.length}</span>
                                    <span class="stat-name">Domains</span>
                                </div>
                                ` : ''}
                                ${crawlOptions.includeExternalLinks ? `
                                <div class="stat-item">
                                    <span class="stat-value">✓</span>
                                    <span class="stat-name">External</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="website-actions">
                        <button class="btn btn-danger" onclick="confirmDelete('${website._id}', '${escapeHtml(website.title || website.url)}')">
                            <span>🗑️</span>
                            Delete
                        </button>
                    </div>
                </div>
                <div class="pages-section">
                    <button class="pages-toggle" onclick="togglePages('${website._id}')">
                        <span>Show Pages (${website.pages?.length || 0})</span>
                    </button>
                    <div id="pages-${website._id}" class="pages-list">
                        ${(website.pages || []).map(page => `
                            <div class="page-item">
                                <div class="page-title">${escapeHtml(page.title || 'Untitled Page')}</div>
                                <div class="page-url">${escapeHtml(page.path || page.url || '')}</div>
                                ${page.wordCount ? `<div class="page-meta">Words: ${page.wordCount}</div>` : ''}
                                <div class="page-content">${escapeHtml((page.content || '').substring(0, 120))}${(page.content || '').length > 120 ? '...' : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        }).join('');

        websitesList.innerHTML = websitesHtml;
    }

    // Toggle pages visibility
    window.togglePages = function(websiteId) {
        const pagesList = document.getElementById(`pages-${websiteId}`);
        const button = pagesList.previousElementSibling;
        const isShowing = pagesList.classList.contains('show');
        
        if (isShowing) {
            pagesList.classList.remove('show');
            button.innerHTML = button.innerHTML.replace('Hide', 'Show');
        } else {
            pagesList.classList.add('show');
            button.innerHTML = button.innerHTML.replace('Show', 'Hide');
        }
    };

    // Confirm delete website
    window.confirmDelete = function(websiteId, websiteTitle) {
        websiteToDelete = websiteId;
        deleteModal.querySelector('p').innerHTML = `
            Are you sure you want to delete <strong>"${websiteTitle}"</strong> and all its crawled data?<br>
            <em>This action cannot be undone.</em>
        `;
        deleteModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    // Handle delete confirmation
    confirmDeleteBtn.addEventListener('click', async function() {
        if (!websiteToDelete) return;

        try {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<span>⏳</span> Deleting...';

            const response = await fetch(`/api/websites/${websiteToDelete}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                showMessage('✅ Website deleted successfully!', 'success');
                await loadDashboardData(); // Reload all data
                
                // Remove the card with animation
                const card = document.querySelector(`[data-website-id="${websiteToDelete}"]`);
                if (card) {
                    card.style.transform = 'scale(0.8)';
                    card.style.opacity = '0';
                    setTimeout(() => card.remove(), 300);
                }
            } else {
                showMessage('❌ Error: ' + (data.message || 'Failed to delete website'), 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showMessage('❌ Network error: ' + error.message, 'error');
        } finally {
            closeModal();
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = '<span>🗑️</span> Delete';
        }
    });

    // Handle delete cancellation
    cancelDeleteBtn.addEventListener('click', closeModal);

    // Close modal function
    function closeModal() {
        deleteModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        websiteToDelete = null;
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            closeModal();
        }
    });

    // Global functions for quick actions
    window.refreshData = async function() {
        showMessage('🔄 Refreshing data...', 'loading');
        await loadDashboardData();
        showMessage('✅ Data refreshed successfully!', 'success');
    };

    window.exportData = async function() {
        try {
            const websites = await fetch('/api/websites').then(r => r.json());
            const dataStr = JSON.stringify(websites, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            showMessage('✅ Data exported successfully!', 'success');
        } catch (error) {
            showMessage('❌ Export failed: ' + error.message, 'error');
        }
    };

    // Show/hide advanced options
    window.showAdvancedOptions = function() {
        const advancedOptions = document.getElementById('advanced-options');
        const isVisible = advancedOptions.style.display !== 'none';
        
        if (isVisible) {
            advancedOptions.style.display = 'none';
        } else {
            advancedOptions.style.display = 'block';
        }
    };

    // Utility functions
    function setLoadingState(isLoading) {
        submitButton.disabled = isLoading;
        if (isLoading) {
            submitButton.innerHTML = '<span>⏳</span> Crawling...';
        } else {
            submitButton.innerHTML = '<span>🚀</span> Crawl Website';
        }
    }

    function showMessage(message, type) {
        statusMessage.innerHTML = message;
        statusMessage.className = `status-message ${type}`;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.innerHTML = '';
                statusMessage.className = '';
            }, 5000);
        }
    }

    function isValidUrl(string) {
        // Allow URLs without protocol for flexible input
        if (!string || string.trim() === '') return false;
        
        const url = string.trim();
        
        // Allow simple domain formats
        if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(url)) {
            return true;
        }
        
        // Allow www. prefixed domains
        if (/^www\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(url)) {
            return true;
        }
        
        // Allow full URLs
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Escape key to close modal
        if (event.key === 'Escape' && deleteModal.style.display === 'block') {
            closeModal();
        }
        
        // Ctrl/Cmd + R to refresh data
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            refreshData();
        }
    });

    // Auto-refresh data every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
});