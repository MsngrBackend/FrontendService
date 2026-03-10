export const ChatPlaceholder = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-(--base) select-none">
      <div className="flex flex-col items-center gap-5 max-w-xs text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-2xl bg-(--accent-dim) flex items-center justify-center">
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <path
              d="M8 30V12a4 4 0 014-4h22a4 4 0 014 4v14a4 4 0 01-4 4H18l-8 8V30z"
              stroke="#FF4655"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="17" cy="19" r="2" fill="#FF4655" />
            <circle cx="23" cy="19" r="2" fill="#FF4655" />
            <circle cx="29" cy="19" r="2" fill="#FF4655" />
          </svg>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-lg font-semibold text-(--text-primary) mb-1">
            Выберите чат
          </h2>
          <p className="text-sm text-(--text-muted)">
            Откройте существующий диалог слева или начните новый разговор.
          </p>
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 bg-(--surface) rounded-full px-4 py-2 border border-(--border)">
          <span className="w-2 h-2 rounded-full bg-(--accent)" />
          <span className="text-xs text-(--text-muted) font-medium">
            Select a conversation
          </span>
        </div>
      </div>
    </div>
  );
};
