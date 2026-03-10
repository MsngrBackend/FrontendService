import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { initTheme } from "./store/themeStore";
import { AuthPage } from "./components/auth/AuthPage";
import { MainLayout } from "./components/layout/MainLayout";
import { Spinner } from "./components/ui/Spinner";

initTheme();

const App = () => {
  const { isAuthenticated, loadProfile, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadProfile();
    }
  }, [isAuthenticated, accessToken, loadProfile]);

  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--base)">
        <Spinner size={32} className="text-accent" />
      </div>
    );
  }

  return isAuthenticated ? <MainLayout /> : <AuthPage />;
};

export default App;
