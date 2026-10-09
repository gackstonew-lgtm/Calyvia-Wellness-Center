import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Calyvia Wellness Center | Clinic Management System',
  description: 'Enterprise HMIS/EMR & Administration Portal for Calyvia Wellness Center, Ruiru, Kenya',
  icons: {
    icon: 'https://calyviawellness.co.ke/img/calyvia-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-sand-50 text-[#3D2E28] min-h-screen antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
