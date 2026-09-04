import { categories } from '../config/tools.js';
import { toolTranslationKeys } from '../config/tool-labels.js';
import { isToolDisabled } from '../utils/disabled-tools.js';
import { getLanguageFromUrl, t } from '../i18n/i18n.js';
import { createIcons, icons } from 'lucide';

type ToolEntry = (typeof categories)[number]['tools'][number];

const CLOSE_TOOL_MESSAGE = 'tooleasy:close-tool';
const TOOL_QUERY_PARAM = 'tool';

function getToolLabel(tool: ToolEntry): { name: string; subtitle: string } {
  const key = toolTranslationKeys[tool.name];
  if (!key) {
    return { name: tool.name, subtitle: tool.subtitle || '' };
  }
  const nameKey = `${key}.name`;
  const subtitleKey = `${key}.subtitle`;
  const name = t(nameKey);
  const subtitle = t(subtitleKey);
  return {
    name: name === nameKey ? tool.name : name,
    subtitle: subtitle === subtitleKey ? tool.subtitle || '' : subtitle,
  };
}

function getAllTools(): ToolEntry[] {
  const seen = new Set<string>();
  const tools: ToolEntry[] = [];
  categories.forEach((category) => {
    category.tools.forEach((tool) => {
      if (isToolDisabled(tool.id) || seen.has(tool.id)) return;
      seen.add(tool.id);
      tools.push(tool);
    });
  });
  return tools;
}

function getPopularTools(): ToolEntry[] {
  const popular = categories.find((c) => c.name === 'Popular Tools');
  if (!popular) return [];
  return popular.tools.filter((tool) => !isToolDisabled(tool.id));
}

function buildToolPageUrl(tool: ToolEntry, embed = false): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const lang = getLanguageFromUrl();
  const file = `${tool.id}.html`;
  const path = lang === 'en' ? `${base}${file}` : `${base}${lang}/${file}`;
  if (!embed) return path;
  return `${path}${path.includes('?') ? '&' : '?'}embed=1`;
}

function createToolCard(
  tool: ToolEntry,
  onOpen: (tool: ToolEntry) => void
): HTMLButtonElement {
  const labels = getToolLabel(tool);
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'hero-tool-card';
  card.dataset.toolId = tool.id;

  const icon = document.createElement('i');
  if (tool.icon.startsWith('ph-')) {
    icon.className = `ph ${tool.icon} hero-tool-card__icon`;
  } else {
    icon.className = 'hero-tool-card__icon';
    icon.setAttribute('data-lucide', tool.icon);
  }

  const name = document.createElement('h3');
  name.className = 'hero-tool-card__title';
  name.textContent = labels.name;

  const subtitle = document.createElement('p');
  subtitle.className = 'hero-tool-card__desc';
  subtitle.textContent = labels.subtitle || '';

  card.append(icon, name, subtitle);
  card.addEventListener('click', () => onOpen(tool));
  return card;
}

export function initHeroToolFinder(): void {
  const searchBar = document.getElementById(
    'search-bar'
  ) as HTMLInputElement | null;
  const heroResults = document.getElementById('hero-search-results');
  const heroLabel = document.getElementById('hero-search-label');
  const heroEmpty = document.getElementById('hero-search-empty');
  const embedPanel = document.getElementById('hero-tool-embed');
  const embedFrame = document.getElementById(
    'hero-tool-embed-frame'
  ) as HTMLIFrameElement | null;
  const embedTitle = document.getElementById('hero-tool-embed-title');
  const embedBack = document.getElementById('hero-tool-embed-back');
  const finder = document.getElementById('hero-tool-finder');

  if (!heroResults) return;

  const allTools = getAllTools();
  let activeToolId: string | null = null;
  let lastBrowseMode: 'popular' | 'search' = 'popular';
  let lastBrowseTools = getPopularTools();

  const setBrowseVisible = (visible: boolean) => {
    heroResults.classList.toggle('hidden', !visible);
    heroLabel?.classList.toggle(
      'hidden',
      !visible || lastBrowseTools.length === 0
    );
    if (heroEmpty && visible) {
      heroEmpty.classList.toggle(
        'hidden',
        lastBrowseTools.length > 0 || lastBrowseMode === 'popular'
      );
    } else {
      heroEmpty?.classList.add('hidden');
    }
  };

  const closeTool = (updateHistory = true) => {
    activeToolId = null;
    document.body.classList.remove('hero-tool-open');
    finder?.classList.remove('hero-tool-finder--open');
    embedPanel?.classList.add('hidden');
    if (embedFrame) {
      embedFrame.src = 'about:blank';
    }
    setBrowseVisible(true);
    renderTools(lastBrowseTools, lastBrowseMode);

    if (updateHistory) {
      const url = new URL(window.location.href);
      if (url.searchParams.has(TOOL_QUERY_PARAM)) {
        url.searchParams.delete(TOOL_QUERY_PARAM);
        history.pushState({}, '', url.pathname + url.search + url.hash);
      }
    }
  };

  const openTool = (tool: ToolEntry, updateHistory = true) => {
    if (!embedPanel || !embedFrame) {
      window.location.href = buildToolPageUrl(tool, false);
      return;
    }

    activeToolId = tool.id;
    const labels = getToolLabel(tool);
    document.body.classList.add('hero-tool-open');
    finder?.classList.add('hero-tool-finder--open');
    setBrowseVisible(false);
    embedPanel.classList.remove('hidden');
    if (embedTitle) embedTitle.textContent = labels.name;
    embedFrame.src = buildToolPageUrl(tool, true);

    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set(TOOL_QUERY_PARAM, tool.id);
      history.pushState(
        { tool: tool.id },
        '',
        url.pathname + url.search + url.hash
      );
    }

    embedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    createIcons({ icons });
  };

  const renderTools = (tools: ToolEntry[], mode: 'popular' | 'search') => {
    lastBrowseMode = mode;
    lastBrowseTools = tools;

    if (activeToolId) return;

    heroResults.innerHTML = '';
    tools.forEach((tool) => {
      heroResults.appendChild(createToolCard(tool, openTool));
    });

    if (heroLabel) {
      const popularLabel = t('tools:categories.popularTools');
      const searchLabel = t('hero.searchResults');
      heroLabel.textContent =
        mode === 'search'
          ? searchLabel !== 'hero.searchResults'
            ? searchLabel
            : 'Search results'
          : popularLabel !== 'tools:categories.popularTools'
            ? popularLabel
            : t('hero.popularTools') !== 'hero.popularTools'
              ? t('hero.popularTools')
              : 'Popular tools';
      heroLabel.classList.toggle('hidden', tools.length === 0);
    }

    if (heroEmpty) {
      heroEmpty.classList.toggle(
        'hidden',
        tools.length > 0 || mode === 'popular'
      );
    }

    createIcons({ icons });
  };

  embedBack?.addEventListener('click', () => closeTool(true));

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === CLOSE_TOOL_MESSAGE) {
      closeTool(true);
    }
  });

  window.addEventListener('popstate', () => {
    const toolId = new URLSearchParams(window.location.search).get(
      TOOL_QUERY_PARAM
    );
    if (!toolId) {
      if (activeToolId) closeTool(false);
      return;
    }
    const tool = allTools.find((item) => item.id === toolId);
    if (tool) openTool(tool, false);
  });

  const initialToolId = new URLSearchParams(window.location.search).get(
    TOOL_QUERY_PARAM
  );
  if (initialToolId) {
    const tool = allTools.find((item) => item.id === initialToolId);
    if (tool) {
      openTool(tool, false);
    } else {
      renderTools(getPopularTools(), 'popular');
    }
  } else {
    renderTools(getPopularTools(), 'popular');
  }

  if (!searchBar) return;

  searchBar.addEventListener('input', () => {
    const searchTerm = searchBar.value.toLowerCase().trim();
    if (activeToolId) {
      closeTool(true);
    }

    if (!searchTerm) {
      renderTools(getPopularTools(), 'popular');
      return;
    }

    // Search across every catalogued tool (all categories, deduped).
    const matches = allTools.filter((tool) => {
      const labels = getToolLabel(tool);
      return (
        labels.name.toLowerCase().includes(searchTerm) ||
        labels.subtitle.toLowerCase().includes(searchTerm) ||
        tool.name.toLowerCase().includes(searchTerm) ||
        (tool.subtitle || '').toLowerCase().includes(searchTerm) ||
        tool.id.toLowerCase().includes(searchTerm)
      );
    });

    renderTools(matches, 'search');
  });

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const isMac = navigator.userAgent.toUpperCase().includes('MAC');
    const isCtrlK = e.ctrlKey && key === 'k';
    const isCmdK = isMac && e.metaKey && key === 'k';

    if (isCtrlK || isCmdK) {
      e.preventDefault();
      searchBar.focus();
    }

    if (e.key === 'Escape' && activeToolId) {
      closeTool(true);
    }
  });
}
