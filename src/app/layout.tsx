import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/components/auth/session-provider';

export const metadata: Metadata = {
  title: 'CodePet - Your AI Coding Companion',
  description: 'Track your coding progress with an AI-powered mascot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
