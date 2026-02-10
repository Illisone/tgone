/**
 * STRATUM — Telegram Mini App
 * Digital Studio for Bots, Mini Apps & Web Development
 * Liquid Glass Design Edition
 */

const app = {
    currentSection: 'home',
    history: [],
    selectedService: null,
    
    /**
     * Initialize the app
     */
    init() {
        this.setupTelegramWebApp();
        this.setupEventListeners();
        this.animateNumbers();
    },
    
    /**
     * Setup Telegram WebApp integration
     */
    setupTelegramWebApp() {
        if (!window.Telegram?.WebApp) {
            console.log('Telegram WebApp not available');
            return;
        }
        
        const tg = Telegram.WebApp;
        
        // Initialize
        tg.ready();
        tg.enableClosingConfirmation();
        
        // Set colors - dark liquid glass theme
        tg.setHeaderColor('#0a0a0f');
        tg.setBackgroundColor('#0a0a0f');
        
        // Expand to full height
        tg.expand();
        
        // Handle theme changes
        tg.onEvent('themeChanged', () => {
            // Theme is handled by CSS variables
        });
        
        // Handle viewport changes
        tg.onEvent('viewportChanged', () => {
            if (tg.isExpanded) {
                document.body.style.paddingBottom = '0px';
            }
        });
    },
    
    /**
     * Haptic feedback helper
     */
    haptic(style = 'light') {
        if (window.Telegram?.WebApp?.HapticFeedback) {
            try {
                Telegram.WebApp.HapticFeedback.impactOccurred(style);
            } catch (e) {
                // Ignore errors
            }
        }
    },
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle browser back button
        window.addEventListener('popstate', () => {
            if (this.history.length > 0) {
                this.goBack();
            }
        });
        
        // Handle keyboard visibility for mobile
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const tabBar = document.getElementById('tabBar');
                if (window.visualViewport.height < window.innerHeight * 0.8) {
                    tabBar.style.transform = 'translateX(-50%) translateY(200%)';
                } else {
                    tabBar.style.transform = 'translateX(-50%) translateY(0)';
                }
            });
        }
    },
    
    /**
     * Switch tab from bottom navigation
     */
    switchTab(sectionId) {
        this.haptic('light');
        
        // Update tab UI
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        const clickedTab = event.currentTarget;
        clickedTab.classList.add('active');
        clickedTab.setAttribute('aria-selected', 'true');
        
        // Show section without adding to history (tab switching is flat navigation)
        this.showSection(sectionId, false);
    },
    
    /**
     * Main navigation method
     */
    showSection(sectionId, addToHistory = true) {
        // Validate section exists
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.error(`Section ${sectionId} not found`);
            return;
        }
        
        // Add to history if needed
        if (addToHistory && this.currentSection !== sectionId) {
            this.history.push(this.currentSection);
        }
        
        // Hide all sections with performance optimization
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (section.classList.contains('active')) {
                section.classList.remove('active');
                section.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Show target section
        targetSection.classList.add('active');
        targetSection.setAttribute('aria-hidden', 'false');
        
        // Update navigation
        this.updateNavigation(sectionId);
        
        // Update tab bar if it's a tab section
        this.updateTabBar(sectionId);
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update state
        this.currentSection = sectionId;
        
        // Expand WebApp
        if (window.Telegram?.WebApp) {
            Telegram.WebApp.expand();
        }
        
        // Trigger haptic for navigation
        if (addToHistory) {
            this.haptic('soft');
        }
    },
    
    /**
     * Navigate back in history
     */
    goBack() {
        this.haptic('light');
        
        if (this.history.length === 0) {
            // If no history, go to home
            this.showSection('home', false);
            return;
        }
        
        const previousSection = this.history.pop();
        this.showSection(previousSection, false);
    },
    
    /**
     * Update top navigation visibility and title
     */
    updateNavigation(sectionId) {
        const nav = document.getElementById('nav');
        const navTitle = document.getElementById('nav-title');
        
        if (sectionId === 'home') {
            nav.classList.remove('visible');
            nav.setAttribute('aria-hidden', 'true');
        } else {
            nav.classList.add('visible');
            nav.setAttribute('aria-hidden', 'false');
            navTitle.textContent = this.getSectionTitle(sectionId);
        }
    },
    
    /**
     * Get human-readable section title for navbar
     */
    getSectionTitle(sectionId) {
        const titles = {
            'home': 'STRATUM',
            'portfolio': 'Наши работы',
            'calc': 'Калькулятор',
            'order': 'Оформить заказ',
            'success': 'Готово'
        };
        return titles[sectionId] || 'STRATUM';
    },
    
    /**
     * Update bottom tab bar active state
     */
    updateTabBar(sectionId) {
        const tabMap = {
            'home': 0,
            'portfolio': 1,
            'calc': 2,
            'order': 3
        };
        
        const tabIndex = tabMap[sectionId];
        if (tabIndex === undefined) return;
        
        document.querySelectorAll('.tab-item').forEach((tab, index) => {
            const isActive = index === tabIndex;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    },
    
    /**
     * Animate numbers in statistics block
     */
    animateNumbers() {
        const numbers = document.querySelectorAll('.proof-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseInt(target.getAttribute('data-target'));
                    this.countUp(target, finalValue);
                    observer.unobserve(target);
                }
            });
        }, observerOptions);
        
        numbers.forEach(num => observer.observe(num));
    },
    
    /**
     * Count up animation for numbers
     */
    countUp(element, target) {
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quart
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
            }
        };
        
        requestAnimationFrame(updateCount);
    },
    
    /**
     * Handle service selection in calculator
     */
    selectService(id, price, name) {
        this.haptic('medium');
        
        // Store selection
        this.selectedService = { id, price, name };
        
        // Update UI to show selection
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        if (event.currentTarget) {
            event.currentTarget.classList.add('selected');
        }
        
        // Small delay for visual feedback
        setTimeout(() => {
            // Update order form with selected service
            const orderService = document.getElementById('order-service');
            const orderPrice = document.getElementById('order-price');
            
            if (orderService) orderService.textContent = name;
            if (orderPrice) orderPrice.textContent = `${price.toLocaleString('ru-RU')} ₽`;
            
            // Navigate to order form
            this.showSection('order');
            
            // Focus on textarea after navigation
            setTimeout(() => {
                const textarea = document.querySelector('#order textarea');
                if (textarea) textarea.focus();
            }, 350);
        }, 200);
    },
    
    /**
     * Handle order form submission
     */
    submitOrder(event) {
        event.preventDefault();
        this.haptic('success');
        
        const form = event.target;
        const textarea = form.querySelector('textarea');
        const contactInput = form.querySelector('input[type="text"]');
        
        // Validation
        if (!textarea.value.trim() || textarea.value.length < 20) {
            this.showNotification('Опишите задачу подробнее (минимум 20 символов)');
            textarea.focus();
            return;
        }
        
        if (!contactInput.value.trim()) {
            this.showNotification('Укажите контакт для связи');
            contactInput.focus();
            return;
        }
        
        // Simulate API call
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        
        setTimeout(() => {
            // Success - navigate to success section
            this.showSection('success');
            
            // Reset form
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Clear selection
            this.selectedService = null;
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Send data to Telegram if available
            if (window.Telegram?.WebApp) {
                const data = {
                    service: this.selectedService,
                    description: textarea.value,
                    contact: contactInput.value,
                    timestamp: new Date().toISOString()
                };
                
                Telegram.WebApp.sendData(JSON.stringify(data));
            }
        }, 1500);
    },
    
    /**
     * Toggle about/developer card visibility
     */
    toggleAbout() {
        this.haptic('light');
        
        const aboutCard = document.getElementById('about-card');
        const chevron = document.getElementById('about-chevron');
        
        if (!aboutCard || !chevron) return;
        
        const isVisible = aboutCard.style.display !== 'none';
        
        if (isVisible) {
            aboutCard.style.display = 'none';
            chevron.style.transform = 'rotate(0deg)';
        } else {
            aboutCard.style.display = 'block';
            chevron.style.transform = 'rotate(180deg)';
            
            // Smooth scroll to about card if needed
            setTimeout(() => {
                aboutCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    },
    
    /**
     * Show feature detail (placeholder for future expansion)
     */
    showFeatureDetail(feature) {
        this.haptic('medium');
        // Future implementation for detailed feature views
        console.log('Feature detail:', feature);
    },
    
    /**
     * Show notification toast
     */
    showNotification(message) {
        // Remove existing notifications
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        // Styles
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 69, 58, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
            max-width: 90%;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Expose app to global scope for inline event handlers
window.app = app;