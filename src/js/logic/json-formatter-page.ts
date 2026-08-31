import { createIcons, icons } from 'lucide';

function $(id: string) {
  return document.getElementById(id)!;
}

function $textarea(id: string) {
  return document.getElementById(id) as HTMLTextAreaElement;
}

function showError(msg: string) {
  const el = $('error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError() {
  $('error').classList.add('hidden');
}

function formatJson(text: string, space: number) {
  return JSON.stringify(JSON.parse(text), null, space);
}

document.getElementById('back-to-tools')?.addEventListener('click', () => {
  window.location.href = import.meta.env.BASE_URL || '/';
});

$('format-btn').addEventListener('click', () => {
  clearError();
  try {
    $('output').textContent = formatJson($textarea('input').value, 2);
  } catch {
    showError('Invalid JSON.');
  }
});

$('minify-btn').addEventListener('click', () => {
  clearError();
  try {
    $('output').textContent = formatJson($textarea('input').value, 0);
  } catch {
    showError('Invalid JSON.');
  }
});

$('copy-btn').addEventListener('click', async () => {
  const text = $('output').textContent;
  if (text) await navigator.clipboard.writeText(text);
});

createIcons({ icons });
