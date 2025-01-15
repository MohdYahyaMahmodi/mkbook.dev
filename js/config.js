// MarkdownBook Configuration
const MarkdownBookConfig = {
  // Branding
  logo: {
      path: 'logo/logo.png',
      altText: 'Documentation Logo',
      useFavicon: true
  },
  title: {
      website: 'Website - Documentation', // Title that appears in browser tab
      navbar: 'MkBook.dev Start Guide' // Title that appears in the navbar
  },
  
  // Search
  search: {
      placeholder: 'Search docs...',
      enabled: false
  },

  // Theme Settings
  theme: {
      default: 'light',
      toggleEnabled: true
  },

  // Content Settings
  content: {
      basePath: '/book',
      tocPath: 'book/toc.md',
      defaultPage: 'welcome.md'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownBookConfig;
}