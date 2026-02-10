/**
 * STRATUM V3 — Soft UI Edition
 * Telegram Mini App с системой FAQ, тултипами и магнитными кнопками
 */

const app = {
    currentSection: 'home',
    history: [],
    selectedService: null,
    faqOpen: false,
    conversionCardOpen: null,
    
    // Глоссарий IT-терминов
    glossary: {
        'API': 'Application Programming Interface — набор правил, позволяющий разным программам обмениваться данными между собой',
        'CRM': 'Customer Relationship Management — система для управления взаимоотношениями с клиентами и автоматизации продаж',
        'ERP': 'Enterprise Resource Planning — система планирования ресурсов предприятия (бухгалтерия, склад, персонал)',
        'FSM': 'Finite State Machine — конечный автомат, помогает боту помнить, на каком шаге диалога находится пользователь',
        'MVP': 'Minimum Viable Product — минимально жизнеспособный продукт с базовыми функциями для быстрого запуска',
        'Mini Apps': 'Мини-приложения прямо внутри Telegram, работают без установки как обычные сайты',
        'USDT': 'Криптовалютный стейблкоин, привязанный к доллару США (1 USDT ≈ 1 USD), удобен для международных переводов'
    },

    /**
     * Initialize the app
     */
    init() {
        this.setupTelegramWebApp();
        this.setupEventListeners();
        this.setupTooltips();
        this.setupMagneticButtons();
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
        
        // Set colors - Soft UI light theme
        tg.setHeaderColor('#F5F5F7');
        tg.setBackgroundColor('#F5F5F7');
        
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
     * Haptic feedback helper с усиленными вибрациями
     */
    haptic(style = 'light') {
        if (window.Telegram?.WebApp?.HapticFeedback) {
            try {
                // Усиленная обратная связь для Soft UI
                const feedback = Telegram.WebApp.HapticFeedback;
                
                switch(style) {
                    case 'light':
                        feedback.impactOccurred('light');
                        break;
                    case 'medium':
                        feedback.impactOccurred('medium');
                        break;
                    case 'heavy':
                        feedback.impactOccurred('heavy');
                        break;
                    case 'success':
                        feedback.notificationOccurred('success');
                        break;
                    case 'error':
                        feedback.notificationOccurred('error');
                        break;
                    case 'warning':
                        feedback.notificationOccurred('warning');
                        break;
                    default:
                        feedback.impactOccurred(style);
                }
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

        // Закрытие тултипа по клику вне его
        document.getElementById('tooltipContainer').addEventListener('click', (e) => {
            if (e.target.id === 'tooltipContainer') {
                this.hideTooltip();
            }
        });
    },

    /**
     * Setup tooltip system для IT-терминов
     */
    setupTooltips() {
        document.querySelectorAll('.term-highlight').forEach(term => {
            term.addEventListener('click', (e) => {
                e.stopPropagation();
                const termText = term.getAttribute('data-term');
                const definition = term.getAttribute('data-def') || this.glossary[termText] || 'Определение скоро появится...';
                this.showTooltip(termText, definition);
            });
        });
    },

    /**
     * Show tooltip
     */
    showTooltip(term, definition) {
        this.haptic('light');
        
        const container = document.getElementById('tooltipContainer');
        document.getElementById('tooltipTerm').textContent = term;
        document.getElementById('tooltipDefinition').textContent = definition;
        
        container.classList.add('visible');
    },

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const container = document.getElementById('tooltipContainer');
        container.classList.remove('visible');
    },

    /**
     * Setup magnetic buttons effect
     */
    setupMagneticButtons() {
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        if (isTouchDevice) return; // Отключаем на тач-устройствах

        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Магнитный эффект - кнопка слегка притягивается к курсору
                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = 20;
                
                if (distance < maxDistance) {
                    const strength = (maxDistance - distance) / maxDistance;
                    btn.style.transform = `translate(${x * strength * 0.3}px, ${y * strength * 0.3}px)`;
                }
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    },

    /**
     * Toggle FAQ accordion с эффектом стопки листов
     */
    toggleFaq(button) {
        this.haptic('medium');
        
        const faqItem = button.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        const isOpen = faqItem.classList.contains('open');
        
        // Закрываем все остальные FAQ для эффекта "стопки"
        document.querySelectorAll('.faq-item.open').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('open');
                item.querySelector('.faq-answer').style.maxHeight = null;
            }
        });
        
        if (isOpen) {
            faqItem.classList.remove('open');
            answer.style.maxHeight = null;
        } else {
            faqItem.classList.add('open');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            
            // Эффект "разъезжания" соседних элементов
            const siblings = Array.from(faqItem.parentElement.children);
            const index = siblings.indexOf(faqItem);
            
            siblings.forEach((sibling, i) => {
                if (i !== index) {
                    sibling.style.transform = i < index ? 'translateY(-2px)' : 'translateY(2px)';
                    setTimeout(() => {
                        sibling.style.transform = '';
                    }, 300);
                }
            });
        }
    },

    /**
     * Toggle conversion card (раскрывающиеся карточки услуг)
     */
    toggleConversionCard(header) {
        this.haptic('medium');
        
        const card = header.parentElement;
        const body = card.querySelector('.conversion-body');
        const isOpen = card.classList.contains('open');
        
        // Закрываем предыдущую открытую карточку
        if (this.conversionCardOpen && this.conversionCardOpen !== card) {
            this.conversionCardOpen.classList.remove('open');
            this.conversionCardOpen.querySelector('.conversion-body').style.maxHeight = null;
        }
        
        if (isOpen) {
            card.classList.remove('open');
            body.style.maxHeight = null;
            this.conversionCardOpen = null;
        } else {
            card.classList.add('open');
            body.style.maxHeight = body.scrollHeight + 'px';
            this.conversionCardOpen = card;
            
            // Scroll to card if needed
            setTimeout(() => {
                const rect = card.getBoundingClientRect();
                if (rect.bottom > window.innerHeight - 100) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
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
        
        // Show section without adding to history
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
        
        // Hide all sections
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
        this.haptic('success');
        
        // Store selection
        this.selectedService = { id, price, name };
        
        // Update UI to show selection
        document.querySelectorAll('.conversion-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        if (event.currentTarget) {
            const card = event.currentTarget.closest('.conversion-card');
            if (card) card.classList.add('selected');
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
            this.haptic('error');
            return;
        }
        
        if (!contactInput.value.trim()) {
            this.showNotification('Укажите контакт для связи');
            contactInput.focus();
            this.haptic('error');
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
            document.querySelectorAll('.conversion-card').forEach(card => {
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
        
        // Styles - Soft UI version
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 59, 48, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            animation: slideDown 0.3s ease;
            max-width: 90%;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
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