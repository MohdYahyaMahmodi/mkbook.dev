/* main.js */
// MarkdownBook Main JavaScript

/* Ensure that Prism.js and other dependencies are loaded before this script */

class MarkdownBook {
  constructor(config) {
    this.config = config;
    this.currentPage = null;
    this.pages = new Map(); // Cache for loaded pages
    // this.searchIndex = []; // Array to hold searchable content
    // this.fuse = null; // Fuse.js instance
    this.init();
  }

  initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');

        const body = document.body;
        const isOpen = sidebar.classList.contains('active');

        if (isOpen) {
          body.classList.add('no-scroll');
          menuToggle.querySelector('i').className = 'fa-solid fa-xmark';
        } else {
          body.classList.remove('no-scroll');
          menuToggle.querySelector('i').className = 'fa-solid fa-bars';
        }
      });

      // Close sidebar if user clicks outside
      document.addEventListener('click', (e) => {
        if (
          sidebar.classList.contains('active') &&
          !sidebar.contains(e.target) &&
          !menuToggle.contains(e.target)
        ) {
          sidebar.classList.remove('active');
          menuToggle.querySelector('i').className = 'fa-solid fa-bars';
          document.body.classList.remove('no-scroll');
        }
      });
    }
  }

  init() {
    console.log('[MarkdownBook] Initializing...');
    this.initializeBranding();
    this.initializeTheme();
    this.initializeMobileMenu();
    this.loadTableOfContents();

    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();

    // if (this.config.search.enabled) {
    //   this.initializeSearch();
    // }
    // Search functionality is in development. The search initialization
    // is currently commented out and will be enabled once the feature is ready.
  }

  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'welcome';
    const pagePath = `${hash}.md`;
    this.loadPage(pagePath);
  }

  initializeBranding() {
    const logoElement = document.getElementById('brand-logo');
    logoElement.src = this.config.logo.path;
    logoElement.alt = this.config.logo.altText;

    document.getElementById('brand-title').textContent = this.config.title.navbar;
    document.title = this.config.title.website;

    if (this.config.logo.useFavicon) {
      const favicon = document.getElementById('favicon');
      favicon.href = this.config.logo.path;
    }
  }

  initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme') || this.config.theme.default;
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      themeIcon.className = 'fa-solid fa-moon';
    }

    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark-theme');
      const isDark = document.documentElement.classList.contains('dark-theme');
      themeIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Update modal theme if active (search functionality is in development)
      const searchModalContent = document.querySelector('.search-modal-content');
      if (searchModalContent) {
        if (isDark) {
          searchModalContent.classList.add('dark-theme');
        } else {
          searchModalContent.classList.remove('dark-theme');
        }
      }
    });
  }

  /* -------------- Search placeholders (commented out) --------------
     initializeSearch() { ... }
     fetchAllPages() { ... }
     setupSearchModal() { ... }
     displayModalSearchResults() { ... }
     handleSearch() { ... }
  --------------------------------------------------------------- */

  stripHtml(html) {
    // Create a temporary element to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  extractTitle(markdown) {
    // Extract the first heading as the title
    const lines = markdown.split('\n');
    for (let line of lines) {
      if (line.startsWith('# ')) {
        return line.replace('# ', '').trim();
      }
    }
    return null;
  }

  async loadTableOfContents() {
    try {
      const response = await fetch(this.config.content.tocPath);
      const tocMarkdown = await response.text();
      const tocData = this.parseTocMarkdown(tocMarkdown);
      this.generateTableOfContents(tocData);

      if (this.config.content.defaultPage) {
        this.loadPage(this.config.content.defaultPage);
      }
    } catch (error) {
      console.error('Error loading table of contents:', error);
    }
  }

  parseTocMarkdown(markdown) {
    const lines = markdown.split('\n');
    const tocData = [];
    let currentSection = null;

    const parseIcon = (text) => {
      const iconMatch = text.match(/\[icon:(fa|img|gif):([^\]]+)\]/);
      if (iconMatch) {
        const [fullMatch, type, value] = iconMatch;
        return { type, value, original: fullMatch };
      }
      return null;
    };

    lines.forEach((line) => {
      if (line.startsWith('**')) {
        // Section header
        const iconInfo = parseIcon(line);
        const title = line
          .replace(/\*\*/g, '')
          .replace(/\[icon:[^\]]+\]/, '')
          .trim();
        currentSection = {
          title,
          items: [],
          icon: iconInfo,
        };
        tocData.push(currentSection);
      } else if (line.startsWith('# ')) {
        // Page link
        const iconInfo = parseIcon(line);
        const title = line
          .replace('# ', '')
          .replace(/\[icon:[^\]]+\]/, '')
          .trim();
        const id = title.toLowerCase().replace(/\s+/g, '-');
        const item = {
          title,
          id,
          path: `${id}.md`,
          icon: iconInfo || { type: 'fa', value: 'fa-solid fa-hashtag' },
        };

        if (currentSection) {
          currentSection.items.push(item);
        } else {
          tocData.push(item);
        }
      }
    });

    return tocData;
  }

  createIcon(iconInfo) {
    if (!iconInfo) return null;
    const container = document.createElement('span');
    container.className = 'icon-container';

    switch (iconInfo.type) {
      case 'fa': {
        const icon = document.createElement('i');
        icon.className = iconInfo.value;
        container.appendChild(icon);
        return container;
      }
      case 'img':
      case 'gif': {
        const img = document.createElement('img');
        img.src = iconInfo.value;
        img.alt = 'icon';
        container.appendChild(img);
        return container;
      }
      default:
        return null;
    }
  }

  generateTableOfContents(tocData) {
    const toc = document.getElementById('toc');
    const ul = document.createElement('ul');

    tocData.forEach((item) => {
      if (item.items) {
        // Section header
        const sectionHeader = document.createElement('li');
        sectionHeader.className = 'toc-section';

        if (item.icon) {
          const iconEl = this.createIcon(item.icon);
          if (iconEl) sectionHeader.appendChild(iconEl);
        }
        sectionHeader.appendChild(document.createTextNode(item.title));
        ul.appendChild(sectionHeader);

        item.items.forEach((subItem) => {
          this.createTocItem(subItem, ul);
        });
      } else {
        this.createTocItem(item, ul);
      }
    });

    toc.appendChild(ul);
  }

  createTocItem(item, parent) {
    const li = document.createElement('li');
    const a = document.createElement('a');

    if (item.icon) {
      const iconEl = this.createIcon(item.icon);
      if (iconEl) a.appendChild(iconEl);
    }

    a.href = `#${item.id}`;
    a.appendChild(document.createTextNode(item.title));
    a.dataset.path = item.path;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadPage(item.path);
    });

    li.appendChild(a);
    parent.appendChild(li);
  }

  generatePageToc() {
    const pageToc = document.getElementById('page-toc');
    const headers = document.querySelectorAll('#markdown-content h2');

    if (!headers.length) {
      pageToc.innerHTML = '<p class="no-headers">No sections found</p>';
      return;
    }

    const ul = document.createElement('ul');
    headers.forEach((header) => {
      const headerId = header.id;
      const text = header.textContent;
      const li = document.createElement('li');
      const a = document.createElement('a');
      const baseName = this.currentPage.replace('.md', '');

      a.href = `#${baseName}#${headerId}`;
      a.textContent = text;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(headerId);
        if (target) {
          history.pushState(null, '', `#${baseName}#${headerId}`);
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          document.querySelectorAll('.page-table-of-contents a').forEach((link) =>
            link.classList.remove('active')
          );
          a.classList.add('active');
        }
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    pageToc.innerHTML = '';
    pageToc.appendChild(ul);

    // Scroll spy
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const currentPageBase = this.currentPage.replace('.md', '');
          document.querySelectorAll('.page-table-of-contents a').forEach((link) => {
            const isActive = link.getAttribute('href') === `#${currentPageBase}#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive && entry.intersectionRatio > 0.5) {
              history.replaceState(null, '', `#${currentPageBase}#${id}`);
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -80% 0px',
      threshold: [0, 0.5, 1],
    });
    headers.forEach((header) => observer.observe(header));
  }

  /**
   * Convert the blockquote input (which can be string, object, or array of tokens)
   * into a single string for easier parsing.
   */
  ensureString(input) {
    // If it's already a string, just return it
    if (typeof input === 'string') {
      return input;
    }
    // If it's an array (old Marked versions sometimes pass an array of tokens)
    if (Array.isArray(input)) {
      return input.map((item) => this.ensureString(item)).join('');
    }
    // If it's an object with a 'text' property
    if (input && typeof input === 'object' && 'text' in input) {
      return this.ensureString(input.text);
    }
    // Fallback
    return String(input);
  }

  async loadPage(path) {
    try {
      if (!this.pages.has(path)) {
        const response = await fetch(`${this.config.content.basePath}/${path}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();
        this.pages.set(path, markdown);
      }

      const content = this.pages.get(path);

      // Configure marked to handle blockquotes
      const renderer = new marked.Renderer();

      renderer.blockquote = (rawQuote) => {
        // Convert the incoming quote data to a reliable string
        let quoteText = this.ensureString(rawQuote);

        // By default, the blockquote is 'default' style
        let type = 'default';

        // Detect and remove prefix
        const detectAndRemovePrefix = (pattern, newType) => {
          if (pattern.test(quoteText)) {
            type = newType;
            quoteText = quoteText.replace(pattern, ''); // remove that prefix
          }
        };

        // Check for each type (case-insensitive)
        detectAndRemovePrefix(/\*\*Note:\*\*/i, 'note');
        detectAndRemovePrefix(/<strong>Note:<\/strong>/i, 'note');

        detectAndRemovePrefix(/\*\*Warning:\*\*/i, 'warning');
        detectAndRemovePrefix(/<strong>Warning:<\/strong>/i, 'warning');

        detectAndRemovePrefix(/\*\*Info:\*\*/i, 'info');
        detectAndRemovePrefix(/<strong>Info:<\/strong>/i, 'info');

        detectAndRemovePrefix(/\*\*Tip:\*\*/i, 'tip');
        detectAndRemovePrefix(/<strong>Tip:<\/strong>/i, 'tip');

        // Return the final HTML for the blockquote
        // .trim() is safe now since quoteText is guaranteed to be a string
        return `
          <blockquote class="${type}">
            ${quoteText.trim()}
          </blockquote>
        `;
      };

      marked.setOptions({
        renderer,
        headerIds: true,
        mangle: false,
        gfm: true,
        breaks: true,
        silent: true,
      });

      const htmlContent = marked.parse(content);

      // Create a temporary container to manipulate links & code blocks
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Convert .md links to in-page #hash links
      tempDiv.querySelectorAll('a').forEach((link) => {
        if (link.href.endsWith('.md')) {
          const pageName = link.href.split('/').pop().replace('.md', '');
          link.href = `#${pageName}`;
        }
      });

      // Ensure a language is set for all code blocks
      tempDiv.querySelectorAll('pre code').forEach((block) => {
        const hasLang = Array.from(block.classList).some((c) => c.startsWith('language-'));
        if (!hasLang) {
          block.classList.add('language-plaintext');
        }
      });

      // Update the DOM with the final HTML
      document.getElementById('markdown-content').innerHTML = tempDiv.innerHTML;
      this.currentPage = path;

      // Re-run syntax highlighting on the updated content
      Prism.highlightAllUnder(document.getElementById('markdown-content'));

      // Generate the per-page TOC
      this.generatePageToc();

      // Update active link in the global TOC
      document.querySelectorAll('.table-of-contents a').forEach((link) => {
        link.classList.remove('active');
      });
      const activeLink = document.querySelector(`.table-of-contents a[data-path="${path}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    } catch (error) {
      console.error('Error loading page:', error);
      document.getElementById('markdown-content').innerHTML = '<p>Error loading content.</p>';
    }
  }
}

// Initialize MarkdownBook on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Initializing MarkdownBook');
  new MarkdownBook(MarkdownBookConfig);
});
