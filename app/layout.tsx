import './globals.css';
import { ReactNode } from 'react';

export const metadata = { title: 'FluxBoard', description: 'Post. Like. Earn.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-zinc-900 via-indigo-900 to-black text-gray-100">
        {children}
      </body>
    </html>
  );
}
