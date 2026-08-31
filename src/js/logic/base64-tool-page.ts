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

document.getElementById('back-to-tools')?.addEventListener('click', () => {
  window.location.href = import.meta.env.BASE_URL || '/';
});

$('encode-btn').addEventListener('click', () => {
  clearError();
  try {
    $textarea('output').value = btoa(unescape(encodeURIComponent($textarea('input').value)));
  } catch {
    showError('Failed to encode. Check your input.');
  }
});

$('decode-btn').addEventListener('click', () => {
  clearError();
  try {
    $textarea('output').value = decodeURIComponent(escape(atob($textarea('input').value.trim())));
  } catch {
    showError('Invalid Base64 input.');
  }
});

$('copy-btn').addEventListener('click', async () => {
  const text = $textarea('output').value;
  if (text) await navigator.clipboard.writeText(text);
});

createIcons({ icons });
