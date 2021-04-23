import { AppProvider } from 'context/app/provider';
import RootPage from './pages';

function App() {
  return (
    <AppProvider>
      <RootPage />
    </AppProvider>
  );
}

export default App;
