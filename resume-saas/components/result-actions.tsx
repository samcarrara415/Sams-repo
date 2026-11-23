'use client';
import { useState } from 'react';
import { CopyIcon, DownloadIcon } from '@/components/icons';

export default function ResultActions({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-rewritten.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex gap-2">
      <button onClick={copy} className="btn-secondary px-3 py-1.5 text-sm">
        <CopyIcon />{copied ? 'Copied' : 'Copy'}
      </button>
      <button onClick={download} className="btn-secondary px-3 py-1.5 text-sm">
        <DownloadIcon />Download .txt
      </button>
    </div>
  );
}
