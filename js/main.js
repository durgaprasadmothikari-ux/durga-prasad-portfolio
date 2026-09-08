/**
 * Personal Portfolio Script
 * Durga Prasad Mothikari — "From Machines to Machine Learning"
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCopyEmail();
  initContactForm();
  initActiveNavHighlight();
  fetchGitHubRepos();
});

// Mobile Navigation Toggle
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('nav-menu');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen.toString());
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// One-click Copy Email to Clipboard
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const email = copyBtn.getAttribute('data-email') || 'durgaprasadmothikari@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      if (copyFeedback) {
        copyFeedback.classList.add('visible');
        setTimeout(() => {
          copyFeedback.classList.remove('visible');
        }, 2200);
      }
    }).catch(() => {
      // Fallback if clipboard API is restricted
      const tempInput = document.createElement('input');
      tempInput.value = email;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      if (copyFeedback) {
        copyFeedback.classList.add('visible');
        setTimeout(() => {
          copyFeedback.classList.remove('visible');
        }, 2200);
      }
    });
  });
}

// Contact Form Handling (Client-side feedback)
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-success-msg');
  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedback.classList.add('visible');
    form.reset();

    setTimeout(() => {
      feedback.classList.remove('visible');
    }, 6000);
  });
}

// Active Nav Link On Scroll
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// GitHub Dynamic Repository Fetcher
const GITHUB_USERNAME = 'durgaprasadmothikari-ux';

// Authentic Fallback Data matching verified public repositories
const FALLBACK_REPOS = [
  {
    name: 'predictive-maintenance-ai',
    html_url: 'https://github.com/durgaprasadmothikari-ux/predictive-maintenance-ai',
    description: 'Machine learning approaches and predictive algorithms for mechanical equipment health monitoring and fault detection.',
    language: 'Python',
    stargazers_count: 0,
    fork: false
  },
  {
    name: 'metrodoc.ai',
    html_url: 'https://github.com/durgaprasadmothikari-ux/metrodoc.ai',
    description: 'Intelligent document indexing and automated analysis prototype.',
    language: 'JavaScript',
    stargazers_count: 0,
    fork: false
  }
];

function getLanguageClass(language) {
  if (!language) return 'lang-default';
  const lang = language.toLowerCase();
  if (lang.includes('python')) return 'lang-python';
  if (lang.includes('javascript') || lang.includes('js')) return 'lang-javascript';
  if (lang.includes('c++') || lang === 'c') return 'lang-c';
  if (lang.includes('java')) return 'lang-java';
  return 'lang-default';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchGitHubRepos() {
  const container = document.getElementById('github-repos-container');
  const statusBadge = document.getElementById('repo-status-indicator');
  if (!container) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();
    // Filter out forks if there are original repos, or include all public repos
    const validRepos = Array.isArray(repos)
      ? repos.filter(r => !r.fork).concat(repos.filter(r => r.fork))
      : [];

    if (validRepos.length > 0) {
      renderRepoCards(container, validRepos);
      if (statusBadge) {
        statusBadge.textContent = 'Live GitHub Sync';
      }
      return;
    }

    // Fallback if no repos returned
    renderRepoCards(container, FALLBACK_REPOS);
  } catch (err) {
    console.warn('Unable to load live GitHub repositories, using verified local fallback:', err);
    renderRepoCards(container, FALLBACK_REPOS);
    if (statusBadge) {
      statusBadge.textContent = 'GitHub Repositories';
    }
  }
}

function renderRepoCards(container, repos) {
  if (!container || !repos || !repos.length) {
    container.innerHTML = `
      <div class="bubbly-card" style="padding: 24px; text-align: center; grid-column: 1 / -1;">
        <p style="color: var(--text-secondary); margin-bottom: 12px;">Visit my GitHub profile to explore active projects.</p>
        <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          Open GitHub Profile ↗
        </a>
      </div>
    `;
    return;
  }

  // Deduplicate by name if needed
  const seen = new Set();
  const uniqueRepos = repos.filter(r => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });

  const cardsHtml = uniqueRepos.map(repo => {
    const name = escapeHtml(repo.name);
    const url = escapeHtml(repo.html_url);
    const desc = escapeHtml(repo.description || 'Public engineering and software project by Durga Prasad Mothikari.');
    const lang = repo.language || 'Code';
    const langClass = getLanguageClass(lang);
    const stars = Number(repo.stargazers_count || 0);

    const starBadge = stars > 0 ? `
      <span class="repo-badge-stat" title="${stars} GitHub star${stars === 1 ? '' : 's'}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        <span>${stars}</span>
      </span>
    ` : '';

    return `
      <article class="bubbly-card repo-card">
        <div class="repo-header">
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="repo-name-link" aria-label="Repository ${name}">
            <span>${name}</span>
            <span class="repo-icon-ext" aria-hidden="true">↗</span>
          </a>
        </div>
        <p class="repo-desc">${desc}</p>
        <div class="repo-footer">
          <div class="repo-lang">
            <span class="lang-dot ${langClass}"></span>
            <span>${escapeHtml(lang)}</span>
          </div>
          <div class="repo-meta-links">
            ${starBadge}
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="repo-view-link">
              View Repo ↗
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}
