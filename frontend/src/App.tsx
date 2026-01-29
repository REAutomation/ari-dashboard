/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Root application component
 */

import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { DisplayModeProvider } from '@/components/DisplayModeProvider';

function App() {
  return (
    <DisplayModeProvider>
      <div className="min-h-screen">
        <Header />
        <main className="pt-14 h-screen">
          <Dashboard />
        </main>
      </div>
    </DisplayModeProvider>
  );
}

export default App;
