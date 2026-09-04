import { categories } from '../config/tools.js';
import {
  categoryTranslationKeys,
  toolTranslationKeys,
} from '../config/tool-labels.js';
import { isToolDisabled } from '../utils/disabled-tools.js';
import { t } from '../i18n/i18n.js';
import { createIcons, icons } from 'lucide';

type ToolEntry = (typeof categories)[number]['tools'][number];

function getCategoryLabel(name: string): string {
  const key = categoryTranslationKeys[name];
  if (!key) return name;
  const translated = t(key);
  return translated === key ? name : translated;
}

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

function getFilteredCategories() {
  return categories
    .map((category) => ({
      ...category,
      tools: category.tools.filter((tool) => !isToolDisabled(tool.id)),
    }))
    .filter((category) => category.tools.length > 0);
}

function createToolLink(tool: ToolEntry): HTMLAnchorElement {
  const labels = getToolLabel(tool);
  const link = document.createElement('a');
  link.href = tool.href;
  link.className = 'tools-mega__tool';
  link.innerHTML = `
    <i class="${
      tool.icon.startsWith('ph-') ? `ph ${tool.icon}` : ''
    } tools-mega__tool-icon" ${
      tool.icon.startsWith('ph-') ? '' : `data-lucide="${tool.icon}"`
    }></i>
    <span class="tools-mega__tool-text">
      <span class="tools-mega__tool-name"></span>
      <span class="tools-mega__tool-desc"></span>
    </span>
  `;
  link.querySelector('.tools-mega__tool-name')!.textContent = labels.name;
  const desc = link.querySelector('.tools-mega__tool-desc')!;
  if (labels.subtitle) {
    desc.textContent = labels.subtitle;
  } else {
    desc.remove();
  }
  return link;
}

export function initToolsMegamenu(): void {
  const trigger = document.getElementById('tools-mega-trigger');
  const panel = document.getElementById('tools-mega-panel');
  const catsEl = document.getElementById('tools-mega-cats');
  const toolsEl = document.getElementById('tools-mega-tools');
  const topCatsEl = document.getElementById('tools-mega-top-cats');
  const mobileToolsRoot = document.getElementById('mobile-tools-menu');
  const desktopWrap = document.getElementById('tools-mega');

  if (!trigger || !panel || !catsEl || !toolsEl) return;

  const filtered = getFilteredCategories();
  if (filtered.length === 0) return;

  const topCategoryOrder = ['Popular Tools'];

  const topCategories = topCategoryOrder
    .map((name) => filtered.find((c) => c.name === name))
    .filter(Boolean) as typeof filtered;

  let activeCategory = (topCategories[0] || filtered[0]).name;
  let closeTimer: number | null = null;

  const syncTopCatState = (open: boolean) => {
    topCatsEl?.querySelectorAll('.tools-mega__top-cat').forEach((btn) => {
      const isActive = (btn as HTMLElement).dataset.category === activeCategory;
      btn.classList.toggle('is-active', open && isActive);
      btn.setAttribute('aria-expanded', open && isActive ? 'true' : 'false');
    });
  };

  const openPanel = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    panel.classList.remove('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    desktopWrap?.classList.add('is-open');
    syncTopCatState(true);
  };

  const closePanel = () => {
    panel.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    desktopWrap?.classList.remove('is-open');
    syncTopCatState(false);
  };

  const scheduleClose = () => {
    if (closeTimer) window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(closePanel, 160);
  };

  const renderTools = (categoryName: string) => {
    const category = filtered.find((c) => c.name === categoryName);
    if (!category) return;

    activeCategory = categoryName;
    toolsEl.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'tools-mega__heading';
    heading.textContent = getCategoryLabel(category.name);
    toolsEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'tools-mega__grid';
    category.tools.forEach((tool) => {
      grid.appendChild(createToolLink(tool));
    });
    toolsEl.appendChild(grid);

    catsEl.querySelectorAll('.tools-mega__cat').forEach((btn) => {
      const isActive = (btn as HTMLElement).dataset.category === categoryName;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    syncTopCatState(!panel.classList.contains('hidden'));
    createIcons({ icons });
  };

  catsEl.innerHTML = '';
  filtered.forEach((category) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tools-mega__cat';
    btn.dataset.category = category.name;
    btn.textContent = getCategoryLabel(category.name);
    btn.addEventListener('mouseenter', () => renderTools(category.name));
    btn.addEventListener('focus', () => renderTools(category.name));
    btn.addEventListener('click', () => renderTools(category.name));
    catsEl.appendChild(btn);
  });

  if (topCatsEl) {
    topCatsEl.innerHTML = '';
    topCategories.forEach((category) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-link tools-mega__top-cat';
      btn.dataset.category = category.name;
      btn.textContent = getCategoryLabel(category.name);
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
      btn.title = getCategoryLabel(category.name);
      btn.addEventListener('mouseenter', () => {
        renderTools(category.name);
        openPanel();
      });
      btn.addEventListener('focus', () => {
        renderTools(category.name);
        openPanel();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const wasOpen = !panel.classList.contains('hidden');
        const sameCategory = activeCategory === category.name;
        renderTools(category.name);
        if (wasOpen && sameCategory) closePanel();
        else openPanel();
      });
      topCatsEl.appendChild(btn);
    });
  }

  renderTools(activeCategory);

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (panel.classList.contains('hidden')) openPanel();
    else closePanel();
  });

  trigger.addEventListener('mouseenter', openPanel);
  desktopWrap?.addEventListener('mouseenter', openPanel);
  desktopWrap?.addEventListener('mouseleave', scheduleClose);
  panel.addEventListener('mouseenter', openPanel);
  panel.addEventListener('mouseleave', scheduleClose);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    if (
      !panel.classList.contains('hidden') &&
      !panel.contains(target) &&
      !desktopWrap?.contains(target)
    ) {
      closePanel();
    }
  });

  if (mobileToolsRoot) {
    mobileToolsRoot.innerHTML = '';
    filtered.forEach((category) => {
      const details = document.createElement('details');
      details.className = 'mobile-tools__group';

      const summary = document.createElement('summary');
      summary.className = 'mobile-tools__summary';
      summary.textContent = getCategoryLabel(category.name);
      details.appendChild(summary);

      const list = document.createElement('div');
      list.className = 'mobile-tools__list';
      category.tools.forEach((tool) => {
        const labels = getToolLabel(tool);
        const a = document.createElement('a');
        a.href = tool.href;
        a.className = 'mobile-nav-link mobile-tools__link';
        a.textContent = labels.name;
        list.appendChild(a);
      });
      details.appendChild(list);
      mobileToolsRoot.appendChild(details);
    });
  }
}
