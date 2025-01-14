// MarkdownBook Configuration
const MarkdownBookConfig = {
  // Branding
  logo: {
      path: 'logo.png',
      altText: 'Documentation Logo'
  },
  title: 'Talkomatic Documentation',
  
  // Search
  search: {
      placeholder: 'Search docs...',
      enabled: true
  },

  // Theme Settings
  theme: {
      // Default theme (light or dark)
      default: 'light',
      
      // Enable/disable theme toggle
      toggleEnabled: true
  },

  // Content Settings
  content: {
      // Path to your markdown file
      markdownPath: 'content/documentation.md',
      
      // Default page to show
      defaultPage: 'introduction'
  }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownBookConfig;
}