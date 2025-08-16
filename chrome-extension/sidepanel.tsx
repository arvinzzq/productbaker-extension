import React, { useEffect } from 'react';
import { ProductProvider } from './hooks/useProducts';
import { I18nProvider } from './hooks/useI18n';
import { SidePanelContent } from './components/SidePanelContent';
import './globals.css';

function SidePanel() {
  useEffect(() => {
    // Global error handler to suppress Chrome's "Unable to download all specified images" error
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Unable to download all specified images')) {
        console.log('ℹ️ Suppressed Chrome image download warning (harmless)');
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Unable to download all specified images')) {
        console.log('ℹ️ Suppressed Chrome image download warning (harmless)');
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <I18nProvider>
      <ProductProvider>
        <div className="w-full h-screen bg-background text-foreground">
          <SidePanelContent />
        </div>
      </ProductProvider>
    </I18nProvider>
  );
}

export default SidePanel;