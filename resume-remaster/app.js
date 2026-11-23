pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const MODEL = 'claude-opus-5-5';
const KEY_STORAGE = 'resumeRemaster_apiKey';
const MIN_TEXT_LENGTH = 50;

const $ = id => document.getElementById(id);

const els = {
  modeApi: $('mode-api'),
  modePrompt: $('mode-prompt'),
  apiKeySection: $('api-key-section'),
  apiKey: $('api-key'),
  rememberKey: $('remember-key'),
  fileInput: $('file-input'),
  dropZone: $('drop-zone'),
  fileInfo: $('file-info'),
  fileName: $('file-name'),
  fileSize: $('file-size'),
  removeFile: $('remove-file'),
  moreJobs: $('more-jobs'),
  notes: $('notes'),
  button: $('remaster-btn'),
  buttonLabel: $('btn-label'),
  error: $('error-box'),
  promptPanel: $('prompt-panel'),
  promptPreview: $('prompt-preview'),
  copyPrompt: $('copy-prompt'),
  outputSection: $('output-section'),
  output: $('resume-output'),
  copyOutput: $('copy-btn'),
  download: $('download-btn'),
};

let uploadedFile = null;

// Storage can throw in private windows or when site data is blocked.
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* not persisted */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* nothing to remove */ } },
};

// Mode

function isApiMode() {
  return els.modeApi.checked;
}

function idleLabel() {
  return isApiMode() ? 'Rewrite resume' : 'Build prompt';
}

function onModeChange() {
  els.apiKeySection.hidden = !isApiMode();
  els.buttonLabel.textContent = idleLabel();
  hideResults();
  hideError();
}

els.modeApi.addEventListener('change', onModeChange);
els.modePrompt.addEventListener('change', onModeChange);

// API key

const savedKey = storage.get(KEY_STORAGE);
if (savedKey) {
  els.apiKey.value = savedKey;
  els.rememberKey.checked = true;
  els.modeApi.checked = true;
}

function persistKey() {
  const key = els.apiKey.value.trim();
  if (els.rememberKey.checked && key) storage.set(KEY_STORAGE, key);
  else storage.remove(KEY_STORAGE);
}

els.apiKey.addEventListener('input', persistKey);
els.rememberKey.addEventListener('change', persistKey);

// File selection

['dragenter', 'dragover'].forEach(type =>
  els.dropZone.addEventListener(type, e => {
    e.preventDefault();
    els.dropZone.classList.add('dragging');
  })
);

['dragleave', 'drop'].forEach(type =>
  els.dropZone.addEventListener(type, e => {
    e.preventDefault();
    els.dropZone.classList.remove('dragging');
  })
);

els.dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file) selectFile(file);
});

els.fileInput.addEventListener('change', () => {
  if (els.fileInput.files[0]) selectFile(els.fileInput.files[0]);
});

els.removeFile.addEventListener('click', clearFile);

function fileExtension(file) {
  return file.name.split('.').pop().toLowerCase();
}

function selectFile(file) {
  if (!['pdf', 'docx'].includes(fileExtension(file))) {
    clearFile();
    showError('Only PDF and DOCX files are supported.');
    return;
  }
  uploadedFile = file;
  els.fileName.textContent = file.name;
  els.fileSize.textContent = formatBytes(file.size);
  els.fileInfo.hidden = false;
  els.dropZone.hidden = true;
  hideError();
}

function clearFile() {
  uploadedFile = null;
  els.fileInput.value = '';
  els.fileInfo.hidden = true;
  els.dropZone.hidden = false;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Job selection: the chips and the dropdown are one choice.

function selectedJob() {
  const checked = document.querySelector('input[name="job"]:checked');
  return checked ? checked.value : els.moreJobs.value || null;
}

els.moreJobs.addEventListener('change', () => {
  const checked = document.querySelector('input[name="job"]:checked');
  if (els.moreJobs.value && checked) checked.checked = false;
});

document.querySelectorAll('input[name="job"]').forEach(radio =>
  radio.addEventListener('change', () => { els.moreJobs.value = ''; })
);

// Text extraction

// FileReader instead of file.arrayBuffer(): the latter hung on some iOS Safari versions.
function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsArrayBuffer(file);
  });
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function extractPdf(file) {
  const data = await readAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join(''));
  }
  return pages.join('\n');
}

async function extractDocx(file) {
  const arrayBuffer = await readAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractText(file) {
  const extraction = fileExtension(file) === 'pdf' ? extractPdf(file) : extractDocx(file);
  let text;
  try {
    text = await withTimeout(extraction, 30000, 'Reading the file took longer than 30 seconds.');
  } catch (err) {
    throw new Error(`Could not read this file. ${err.message || ''} Try saving it again as PDF or DOCX.`.trim());
  }
  text = text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('No readable text found. If the PDF is a scanned image, export it from your editor as a text PDF or DOCX.');
  }
  return text;
}

// Prompt

function buildPrompt(resumeText, jobType, notes) {
  const extra = notes.trim() ? `\n\nExtra instructions from the candidate:\n${notes.trim()}` : '';
  return `You are an experienced resume writer. Rewrite the resume below for a ${jobType} role.

Rules:
- Keep every fact accurate: names, employers, titles, dates, education, and grades.
- Do not invent experience, skills, employers, or numbers that are not in the original. Quantify results only where the original gives the figures.
- Rewrite bullet points to start with strong verbs and show impact.
- Put the experience and skills most relevant to ${jobType} roles first.
- Write or tighten a short summary aimed at ${jobType} roles.
- Use keywords an applicant tracking system would look for in ${jobType} postings, where they truthfully apply.
- Output plain text with no Markdown. Use consistent section headings and "-" for bullets.${extra}

Original resume:
---
${resumeText}
---

Return only the rewritten resume.`;
}

// Anthropic API (browser request with the user's own key)

async function callClaude(prompt, apiKey) {
  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2026-10-21',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        // If a safety classifier declines, the API retries on a fallback model in the same call.
        fallbacks: 'default',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw new Error('Could not reach the Anthropic API. Check your connection and try again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) throw new Error('The API key was rejected. Check that it is correct and active.');
    if (response.status === 429) throw new Error('Rate limited by the Anthropic API. Wait a moment and try again.');
    const detail = data && data.error && data.error.message;
    throw new Error(`Anthropic API error ${response.status}${detail ? ': ' + detail : ''}`);
  }

  if (data.stop_reason === 'refusal') {
    throw new Error('Claude declined to process this request.');
  }

  const text = data.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
    .trim();

  if (!text) throw new Error('The API returned an empty response. Try again.');
  return { text, truncated: data.stop_reason === 'max_tokens' };
}

// Main action

els.button.addEventListener('click', async () => {
  hideError();
  hideResults();

  if (!uploadedFile) return showError('Choose a PDF or DOCX resume first.');
  const jobType = selectedJob();
  if (!jobType) return showError('Pick a target role.');
  const apiKey = els.apiKey.value.trim();
  if (isApiMode() && !apiKey) return showError('Enter your Anthropic API key, or switch to the Claude.ai option.');

  setLoading(true);
  try {
    const resumeText = await extractText(uploadedFile);
    const prompt = buildPrompt(resumeText, jobType, els.notes.value);

    if (isApiMode()) {
      setLoading(true, 'Rewriting, this can take a minute');
      const { text, truncated } = await callClaude(prompt, apiKey);
      els.output.textContent = text;
      showPanel(els.outputSection);
      if (truncated) showError('The response hit the length limit and may be cut off at the end.');
    } else {
      els.promptPreview.value = prompt;
      showPanel(els.promptPanel);
    }
  } catch (err) {
    showError(err.message || 'Something went wrong. Try again.');
  } finally {
    setLoading(false);
  }
});

// Copy and download

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers and non-HTTPS contexts have no async clipboard.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function flashCopied(button) {
  const label = button.querySelector('span');
  label.textContent = 'Copied';
  clearTimeout(button._resetTimer);
  button._resetTimer = setTimeout(() => { label.textContent = 'Copy'; }, 2000);
}

els.copyPrompt.addEventListener('click', async () => {
  await copyText(els.promptPreview.value);
  flashCopied(els.copyPrompt);
});

els.copyOutput.addEventListener('click', async () => {
  await copyText(els.output.textContent);
  flashCopied(els.copyOutput);
});

els.download.addEventListener('click', () => {
  const blob = new Blob([els.output.textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume-rewritten.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// UI helpers

function setLoading(loading, label) {
  els.button.disabled = loading;
  els.button.classList.toggle('loading', loading);
  els.buttonLabel.textContent = loading ? (label || 'Reading file') : idleLabel();
}

function showPanel(panel) {
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
  els.promptPanel.hidden = true;
  els.outputSection.hidden = true;
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
  els.error.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  els.error.hidden = true;
}

onModeChange();
