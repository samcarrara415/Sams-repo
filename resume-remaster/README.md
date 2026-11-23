# Resume Remaster

A static web page that rewrites a resume for a chosen job using Claude.

Live: https://samcarrara415.github.io/Sams-repo/resume-remaster/

## How it works

1. Pick a PDF or DOCX resume. The text is extracted in the browser with pdf.js and mammoth.js; the file is never uploaded.
2. Pick one of 35 target roles and add optional notes.
3. Choose how to run it:
   - **Paste into Claude.ai** builds the prompt and shows it with a Copy button and a link to claude.ai. You paste it into your own chat. No key or login is involved on this page.
   - **Anthropic API key** sends the prompt from the browser straight to `api.anthropic.com` with your key (model `claude-opus-5-5`) and shows the result, which you can copy or download as a `.txt` file. The key is only stored, in `localStorage`, if you tick "Remember on this device".

There is no backend. The only network requests are to cdnjs (the two parsing libraries) and, in API mode, to Anthropic.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

Any static file server works.

## Files

- `index.html`: markup and inline SVG icons
- `app.js`: file parsing, prompt building, API call, copy and download
- `style.css`: styles

## Limits

- Scanned PDFs (images of text) have no extractable text and are rejected. Export a text PDF or DOCX instead.
- Output is plain text; layout and fonts from the original are not kept.
- API mode bills your Anthropic account. A rewrite usually takes 20 to 60 seconds.
- Claude can still make mistakes. Check the result against your original before sending it anywhere.
