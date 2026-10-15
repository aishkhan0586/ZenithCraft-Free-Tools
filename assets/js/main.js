/**
 * ZenithCraft - Global Core Application Scripts
 * Author: ZenithCraft Team
 * Description: Theme switcher, mobile navigation, toast alerts, and universal helpers
 */

(function () {
  'use strict';

  // --- Theme Manager (Light / Dark) ---
  const ThemeManager = {
    STORAGE_KEY: 'zenithcraft_theme',

    init() {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      this.bindToggleEvents();
    },

    toggle() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
      window.ZenithCraft.showToast(
        isDark ? 'Dark Mode Enabled 🌙' : 'Light Mode Enabled ☀️',
        'info'
      );
    },

    bindToggleEvents() {
      const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
      toggleButtons.forEach((btn) => {
        btn.addEventListener('click', () => this.toggle());
      });
    }
  };

  // --- Mobile Navigation Drawer ---
  const MobileNav = {
    init() {
      const menuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      const closeBtn = document.getElementById('mobile-menu-close');

      if (!menuBtn || !mobileMenu) return;

      const openMenu = () => {
        mobileMenu.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      };

      const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      };

      menuBtn.addEventListener('click', openMenu);
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);

      // Close when clicking backdrop
      mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) closeMenu();
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
          closeMenu();
        }
      });
    }
  };

  // --- Toast Notification System ---
  const ToastSystem = {
    container: null,

    init() {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
      this.container = container;
    },

    show(message, type = 'success', duration = 3000) {
      this.init();

      const toast = document.createElement('div');
      toast.className = 'toast';

      let icon = '✨';
      if (type === 'success') icon = '✅';
      if (type === 'error') icon = '⚠️';
      if (type === 'info') icon = 'ℹ️';

      toast.innerHTML = `
        <span style="font-size: 1.15rem;">${icon}</span>
        <span style="flex: 1;">${message}</span>
      `;

      this.container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // --- Global ZenithCraft Object ---
  window.ZenithCraft = {
    showToast: (msg, type, dur) => ToastSystem.show(msg, type, dur),
    
    // Copy text to clipboard with notification
    copyToClipboard(text, customMessage = 'Copied to clipboard!') {
      if (!text) {
        this.showToast('Nothing to copy!', 'error');
        return;
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast(customMessage, 'success');
        }).catch(() => {
          this.fallbackCopy(text, customMessage);
        });
      } else {
        this.fallbackCopy(text, customMessage);
      }
    },

    fallbackCopy(text, customMessage) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        this.showToast(customMessage, 'success');
      } catch (err) {
        this.showToast('Unable to copy text.', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  // --- Initialize when DOM is ready ---
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    MobileNav.init();

    // Newsletter quick hook
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          window.ZenithCraft.showToast('Thank you for subscribing to ZenithCraft updates! 🎉', 'success');
          input.value = '';
        }
      });
    });

    // Mark current active nav link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('text-indigo-600', 'dark:text-indigo-400', 'font-bold');
      }
    });
  });
})();
