import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { initTheme } from "./store/themeStore";
import { AuthPage } from "./components/auth/AuthPage";
import { MainLayout } from "./components/layout/MainLayout";
import { ProfileSettings } from "./components/profile/ProfileSettings";
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

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/settings" element={<ProfileSettings />} />
      <Route path="/" element={<MainLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
