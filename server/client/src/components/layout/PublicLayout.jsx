import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import FloatingActions from './FloatingActions.jsx';
import CommandPalette from './CommandPalette.jsx';
import Toast from './Toast.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function PublicLayout({ children }) {
  const { toast } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
      <CommandPalette />
      {toast && <Toast {...toast} />}
    </div>
  );
}
