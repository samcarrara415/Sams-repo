// ── PDF.js: disable worker to avoid cross-origin issues on iOS/Safari ──
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

// ── State ────────────────────────────────────────────────────────
let uploadedFile = null;

// ── DOM refs ─────────────────────────────────────────────────────
const apiKeyInput   = document.getElementById('api-key');
const keyStatus     = document.getElementById('key-status');
const dropZone      = document.getElementById('drop-zone');
const fileInput     = document.getElementById('file-input');
const fileInfo      = document.getElementById('file-info');
const fileName      = document.getElementById('file-name');
const fileSize      = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file');
const moreJobsSelect = document.getElementById('more-jobs');
const notesInput    = document.getElementById('notes');
const remasterBtn   = document.getElementById('remaster-btn');
const btnLabel      = document.getElementById('btn-label');
const errorBox      = document.getElementById('error-box');
const outputSection = document.getElementById('output-section');
const resumeOutput  = document.getElementById('resume-output');
const copyBtn       = document.getElementById('copy-btn');
const downloadBtn   = document.getElementById('download-btn');

// ── API Key persistence ───────────────────────────────────────────
const SAVED_KEY = 'resumeRemaster_apiKey';

(function loadSavedKey() {
  const saved = localStorage.getItem(SAVED_KEY);
  if (saved) {
    apiKeyInput.value = saved;
    showKeyStatus(true);
  }
})();

apiKeyInput.addEventListener('input', () => {
  const val = apiKeyInput.value.trim();
  if (val.startsWith('sk-ant-') && val.length > 20) {
    localStorage.setItem(SAVED_KEY, val);
    showKeyStatus(true);
  } else {
    keyStatus.textContent = '';
    keyStatus.className = 'key-status';
  }
});

function showKeyStatus(saved) {
  if (saved) {
    keyStatus.textContent = 'Saved';
    keyStatus.className = 'key-status saved';
  }
}

// ── Drag & Drop ───────────────────────────────────────────────────
['dragenter', 'dragover'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.add('dragging');
  })
);

['dragleave', 'drop'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
  })
);

dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

removeFileBtn.addEventListener('click', e => {
  e.stopPropagation();
  clearFile();
});

function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'docx'].includes(ext)) {
    showError('Only PDF and DOCX files are supported.');
    return;
  }
  uploadedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  fileInfo.style.display = 'flex';
  hideError();
}

function clearFile() {
  uploadedFile = null;
  fileInput.value = '';
  fileInfo.style.display = 'none';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── Job selection (radio + select combo) ─────────────────────────
function getSelectedJob() {
  // Check radio buttons first
  const checked = document.querySelector('input[name="job"]:checked');
  if (checked && checked.value !== 'other') return checked.value;
  // Fall back to dropdown
  const ddVal = moreJobsSelect.value;
  if (ddVal) return ddVal;
  return null;
}

// Deselect radio when dropdown is changed
moreJobsSelect.addEventListener('change', () => {
  if (moreJobsSelect.value) {
    const checked = document.querySelector('input[name="job"]:checked');
    if (checked) checked.checked = false;
  }
});

// Deselect dropdown when radio is selected
document.querySelectorAll('input[name="job"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked && radio.value !== 'other') {
      moreJobsSelect.value = '';
    }
  });
});

// ── Text extraction ───────────────────────────────────────────────
async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return extractPDF(file);
  if (ext === 'docx') return extractDOCX(file);
  throw new Error('Unsupported file type');
}

async function extractPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  // disableWorker avoids cross-origin worker restrictions on iOS Safari
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += pageText + '\n';
  }
  return text.trim();
}

async function extractDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

// ── Claude API call ───────────────────────────────────────────────
async function callClaude(resumeText, jobType, notes, apiKey) {
  const noteSection = notes.trim()
    ? `\n\nAdditional instructions from the user:\n${notes.trim()}`
    : '';

  const prompt = `You are an expert professional resume writer specializing in tailoring resumes for specific roles.

Remaster the resume below to be highly optimized for a **${jobType}** position.

Guidelines:
- Keep ALL factual details accurate (dates, company names, titles, education, GPAs, etc.)
- Rewrite bullet points with strong action verbs and quantifiable achievements where possible
- Emphasize skills, tools, and experiences most relevant to ${jobType} roles
- Optimize section ordering to lead with the most relevant content
- Add or refine a professional Summary/Objective targeting ${jobType} roles
- Use ATS-friendly language and relevant keywords for ${jobType}
- Keep formatting clean with consistent structure${noteSection}

Original Resume:
---
${resumeText}
---

Return only the fully remastered resume text, properly formatted and ready to use:`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    let msg = `API error ${response.status}`;
    try {
      const err = await response.json();
      msg = err.error?.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ── Main action ───────────────────────────────────────────────────
remasterBtn.addEventListener('click', async () => {
  hideError();

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showError('Please enter your Anthropic API key in Step 1.');
    return;
  }

  if (!uploadedFile) {
    showError('Please upload a PDF or DOCX resume in Step 2.');
    return;
  }

  const jobType = getSelectedJob();
  if (!jobType) {
    showError('Please select a target job type in Step 3.');
    return;
  }

  setLoading(true);
  outputSection.classList.remove('visible');

  try {
    let resumeText;
    try {
      resumeText = await extractText(uploadedFile);
    } catch (e) {
      throw new Error('Could not read the file. Make sure it is a valid PDF or DOCX with selectable text. (' + (e.message || 'parse error') + ')');
    }

    if (!resumeText || resumeText.length < 50) {
      throw new Error('Not enough text found in the file. Make sure your PDF has selectable text (not a scanned image).');
    }

    let result;
    try {
      result = await callClaude(resumeText, jobType, notesInput.value, apiKey);
    } catch (e) {
      const msg = e.message || '';
      if (msg.toLowerCase().includes('load failed') || msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        throw new Error('Network error reaching the Anthropic API. Check your internet connection, or your API key may be invalid.');
      }
      throw new Error('API error: ' + msg);
    }

    resumeOutput.textContent = result;
    outputSection.classList.add('visible');
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
});

// ── Copy ──────────────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  const text = resumeOutput.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = '✓ Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.innerHTML = '&#128203; Copy';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (_) {
    showError('Could not copy to clipboard. Please select and copy manually.');
  }
});

// ── Download ──────────────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  const text = resumeOutput.textContent;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'remastered-resume.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// ── Helpers ───────────────────────────────────────────────────────
function setLoading(loading) {
  remasterBtn.disabled = loading;
  if (loading) {
    remasterBtn.innerHTML = '<div class="spinner"></div><span>Remastering...</span>';
  } else {
    remasterBtn.innerHTML = '<span id="btn-label">✨ Remaster My Resume</span>';
  }
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('visible');
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorBox.classList.remove('visible');
}
