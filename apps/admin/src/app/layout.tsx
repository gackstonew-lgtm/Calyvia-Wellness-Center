import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { CalyviaAiAssistant } from '../components/CalyviaAiAssistant';

export const metadata: Metadata = {
  title: 'Calyvia Wellness Center | Clinic Management System',
  description: 'Enterprise HMIS/EMR & Administration Portal for Calyvia Wellness Center, Ruiru, Kenya',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/calyvia-emblem-light.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/calyvia-emblem-light.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('calyvia_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
          <CalyviaAiAssistant />
        </ThemeProvider>
      </body>
    </html>
  );
}
