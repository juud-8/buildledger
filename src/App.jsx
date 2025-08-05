import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import ChatWidget from './components/ai-assistant/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <div className="dark font-sans bg-background text-foreground">
        <Routes />
        <ChatWidget />
      </div>
    </AuthProvider>
  );
}

export default App;