export const ChatPlaceholder = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-(--base) select-none">
      <div className="flex flex-col items-center gap-4 max-w-65 text-center">

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: "var(--accent-dim)" }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M6 28V10a3.5 3.5 0 013.5-3.5h21A3.5 3.5 0 0134 10v13a3.5 3.5 0 01-3.5 3.5H15L6 34V28z"
              fill="var(--accent)"
              opacity="0.18"
            />
            <path
              d="M6 28V10a3.5 3.5 0 013.5-3.5h21A3.5 3.5 0 0134 10v13a3.5 3.5 0 01-3.5 3.5H15L6 34V28z"
              stroke="var(--accent)"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="14.5" cy="16.5" r="1.8" fill="var(--accent)" />
            <circle cx="20" cy="16.5" r="1.8" fill="var(--accent)" />
            <circle cx="25.5" cy="16.5" r="1.8" fill="var(--accent)" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-semibold text-(--text-primary) tracking-tight">
            Выберите чат
          </h2>
          <p className="text-3.25 text-(--text-muted) leading-relaxed">
            Откройте диалог слева или создайте новый
          </p>
        </div>

      </div>
    </div>
  );
};
