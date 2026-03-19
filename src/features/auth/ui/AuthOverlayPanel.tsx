type Mode = "login" | "register";

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
    <rect x="7" y="8" width="4" height="19" rx="2" fill="white" />
    <rect x="7" y="8" width="20" height="4" rx="2" fill="white" />
    <rect
      x="7"
      y="15.5"
      width="13"
      height="4"
      rx="2"
      fill="white"
      fillOpacity="0.85"
    />
    <circle cx="25" cy="17.5" r="2.5" fill="white" />
    <rect x="7" y="23" width="20" height="4" rx="2" fill="white" />
  </svg>
);

interface AuthOverlayPanelProps {
  mode: Mode;
  overlayContent: Mode;
  onSwitch: () => void;
}

export const AuthOverlayPanel = ({
  mode,
  overlayContent,
  onSwitch,
}: AuthOverlayPanelProps) => {
  return (
    <div
      className="absolute inset-y-0 left-0 w-1/2 z-20 overflow-hidden flex flex-col items-center justify-center text-white text-center"
      style={{
        background: "linear-gradient(145deg, #FF4655 0%, #BF1E2E 100%)",
        transform: mode === "login" ? "translateX(0%)" : "translateX(100%)",
        borderRadius: mode === "login" ? "0 160px 160px 0" : "160px 0 0 160px",
        transition:
          "transform 0.65s cubic-bezier(0.77, 0, 0.175, 1), border-radius 0.65s cubic-bezier(0.77, 0, 0.175, 1)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 220,
          height: 220,
          top: -70,
          right: -70,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          bottom: -100,
          left: -80,
          background: "rgba(255,255,255,0.08)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 100,
          height: 100,
          bottom: 60,
          right: -20,
          background: "rgba(255,255,255,0.10)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-10">
        {/* Brand block */}
        <div className="flex flex-col items-center mb-3">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.22)",
              borderRadius: "20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            <LogoMark />
          </div>
        </div>

        {/* Dynamic text — switches halfway through slide */}
        <div className="flex flex-col items-center">
          <h3 className="text-5.5 font-bold text-white mb-2">
            {overlayContent === "login" ? "Привет!" : "С возвращением!"}
          </h3>
          <p
            className="text-sm text-white leading-relaxed mb-8 text-center"
            style={{ opacity: 0.82, maxWidth: 210 }}
          >
            {overlayContent === "login"
              ? "Нет аккаунта? Зарегистрируйтесь — это займёт минуту!"
              : "Уже есть аккаунт? Войдите, чтобы продолжить общение!"}
          </p>
          <button
            onClick={onSwitch}
            className="border-2 border-white/70 px-9 py-2.5 rounded-full text-sm font-semibold text-white hover:bg-white hover:text-(--accent) hover:border-white cursor-pointer transition-all duration-200"
          >
            {overlayContent === "login" ? "Регистрация" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
};
