import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../entities/session/model/authStore";
import { initTheme } from "../shared/model/themeStore";
import { AuthPage } from "../pages/auth/ui/AuthPage";
import { MainPage } from "../pages/main/ui/MainPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import { Spinner } from "../shared/ui/Spinner";

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

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
