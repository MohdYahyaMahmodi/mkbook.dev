// MarkdownBook Main JavaScript

class MarkdownBook {
  constructor(config) {
      this.config = config;
      this.init();
  }

  init() {
      // Initialize branding
      this.initializeBranding();
      
      // Initialize theme
      this.initializeTheme();
      
      // Initialize search
      if (this.config.search.enabled) {
          this.initializeSearch();
      }
  }

  initializeBranding() {
      // Set logo
      const logoElement = document.getElementById('brand-logo');
      logoElement.src = this.config.logo.path;
      logoElement.alt = this.config.logo.altText;

      // Set title
      document.getElementById('brand-title').textContent = this.config.title;
  }

  initializeTheme() {
      const themeToggle = document.querySelector('.theme-toggle');
      const themeIcon = themeToggle.querySelector('i');

      // Load saved theme or default
      const savedTheme = localStorage.getItem('theme') || this.config.theme.default;
      if (savedTheme === 'dark') {
          document.body.classList.add('dark-theme');
          themeIcon.className = 'fa-solid fa-moon';
      }

      // Theme toggle functionality
      themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-theme');
          const isDark = document.body.classList.contains('dark-theme');
          themeIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
  }

  initializeSearch() {
      const searchInput = document.querySelector('.search-input');
      searchInput.placeholder = this.config.search.placeholder;
      
      // Add search functionality here
      searchInput.addEventListener('input', (e) => {
          const searchTerm = e.target.value;
          // Implement search logic
      });
  }
}

// Initialize MarkdownBook with configuration
document.addEventListener('DOMContentLoaded', () => {
  new MarkdownBook(MarkdownBookConfig);
});