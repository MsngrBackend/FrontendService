import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type Mode = "login" | "register";

export const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="min-h-screen bg-(--base) flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0F1923] rounded-2xl shadow-lg mb-3 relative overflow-hidden">
            {/* Valorant-style diagonal accent */}
            <div className="absolute inset-0 bg-linear-to-br from-[#FF4655]/20 to-transparent" />
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* Valorant "V" mark */}
              <path
                d="M4 6H13L18 18L23 6H32L18 30L4 6Z"
                fill="#FF4655"
              />
              {/* Inner cut */}
              <path
                d="M12 10H16L18 15L20 10H24L18 24L12 10Z"
                fill="#0F1923"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">
            <span className="text-(--accent)">ВЛРТНРТ</span>
            <span className="text-(--text-muted) font-light ml-2">LITE</span>
          </h1>
          <p className="text-sm text-(--text-muted) mt-1">
            {mode === "login"
              ? "Войдите в свой аккаунт"
              : "Создайте новый аккаунт"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-(--surface) rounded-2xl shadow-xl p-6 border border-(--border)">
          {/* Tab switcher */}
          <div className="flex bg-(--base) rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
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
      </div>
    </div>
  );
}
