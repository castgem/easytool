import { createIcons, icons } from 'lucide';

function $(id: string) {
  return document.getElementById(id)!;
}

function showError(msg: string) {
  const el = $('error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError() {
  $('error').classList.add('hidden');
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

document.getElementById('back-to-tools')?.addEventListener('click', () => {
  window.location.href = import.meta.env.BASE_URL || '/';
});

$('hash-btn').addEventListener('click', async () => {
  clearError();
  try {
    ($('output') as HTMLInputElement).value = await sha256(
      ($('input') as HTMLTextAreaElement).value
    );
  } catch {
    showError('Failed to compute hash.');
  }
});

createIcons({ icons });
