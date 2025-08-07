import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import ChatWidget from './components/ai-assistant/ChatWidget';
import { Toaster } from 'react-hot-toast';
import RoleSwitcher from './components/dev/RoleSwitcher';

function App() {
  const isDevelopment = import.meta.env.DEV;

  return (
    <AuthProvider>
      <OnboardingProvider>
        <div className="dark font-sans bg-background text-foreground">
          <Routes />
          <ChatWidget />
          {isDevelopment && <RoleSwitcher />}
          <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </div>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;