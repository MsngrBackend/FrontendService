import { useState, useEffect } from "react";
import { LoginForm } from "../../../features/auth/ui/LoginForm";
import { RegisterForm } from "../../../features/auth/ui/RegisterForm";
import { AuthOverlayPanel } from "../../../features/auth/ui/AuthOverlayPanel";

type Mode = "login" | "register";

const LogoText = () => <img src="/logo-text.svg" width="100" alt="Logo text" />;

export const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");
  // Delayed overlay content — switches halfway through the slide
  const [overlayContent, setOverlayContent] = useState<Mode>("login");

  useEffect(() => {
    const t = setTimeout(() => setOverlayContent(mode), 320);
    return () => clearTimeout(t);
  }, [mode]);

  return (
    <div className="min-h-screen bg-(--base) flex items-center justify-center p-4 md:p-0">
      {/* ─── DESKTOP: full-screen split-panel with sliding overlay ─── */}
      <div
        className="hidden md:flex fixed inset-0 z-0"
        style={{ background: "var(--surface)" }}
      >
        {/* LEFT PANEL — Register form */}
        <div className="w-1/2 overflow-y-auto flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            {/* Brand header */}
            <div className="flex items-center gap-2.5 mb-2">
              <div>
                <LogoText />
              </div>
            </div>
            <h2
              className="text-6.5 font-bold text-(--text-primary) mb-1"
              style={{ letterSpacing: "-0.3px" }}
            >
              Регистрация
            </h2>
            <p className="text-sm text-(--text-muted) mb-6">
              Создайте новый аккаунт
            </p>
            <RegisterForm onSwitch={() => setMode("login")} />
          </div>
        </div>

        {/* RIGHT PANEL — Login form */}
        <div className="w-1/2 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            {/* Brand header */}
            <div className="flex items-center gap-2.5 mb-2">
              <div>
                <LogoText />
              </div>
            </div>
            <h2
              className="text-6.5 font-bold text-(--text-primary) mb-1"
              style={{ letterSpacing: "-0.3px" }}
            >
              Вход
            </h2>
            <p className="text-sm text-(--text-muted) mb-6">С возвращением!</p>
            <LoginForm onSwitch={() => setMode("register")} />
          </div>
        </div>

        {/* ── SLIDING OVERLAY ── */}
        <AuthOverlayPanel
          mode={mode}
          overlayContent={overlayContent}
          onSwitch={() =>
            setMode(overlayContent === "login" ? "register" : "login")
          }
        />
      </div>

      {/* ─── MOBILE: stacked tab layout ─── */}
      <div className="flex md:hidden flex-col w-full max-w-95 relative z-10">
        {/* Logo header */}
        <div className="flex flex-col items-center mb-4 gap-1">
          <LogoText />
          <div className="text-center">
            <p className="text-sm text-(--text-muted)">
              {mode === "login" ? "Войдите в аккаунт" : "Создайте аккаунт"}
            </p>
          </div>
        </div>

        <div
          className="bg-(--surface) rounded-2xl p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          {/* Segmented control */}
          <div className="flex bg-(--input-bg) rounded-xl p-1 mb-5 gap-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-3.25 font-semibold rounded-xl transition-all ${
                  mode === m
                    ? "bg-(--surface) text-(--text-primary) shadow-sm"
                    : "text-(--text-muted) hover:text-(--text-secondary)"
                }`}
              >
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => setMode("login")} />
          )}
        </div>

        <p className="text-center text-xs text-(--text-muted) mt-5 leading-relaxed">
          Безопасный мессенджер · Егор
        </p>
      </div>
    </div>
  );
};
