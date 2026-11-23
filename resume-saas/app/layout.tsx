import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume Remaster',
  description: 'Rewrite your resume for a specific role. Upload a PDF or DOCX, pick the job, and get a tailored version.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
