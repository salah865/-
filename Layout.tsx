import { ReactNode } from 'react';
import { ResponsiveTopNavbar } from './ResponsiveTopNavbar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <ResponsiveTopNavbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
