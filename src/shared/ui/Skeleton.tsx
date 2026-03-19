interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

/** Скелетон одного чата в сайдбаре */
export const ChatItemSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-2.5" aria-hidden="true">
    <Skeleton className="w-11.5 h-11.5 shrink-0 rounded-full" />
    <div className="flex-1 flex flex-col gap-2">
      <Skeleton className="h-3.5 w-2/3 rounded-md" />
      <Skeleton className="h-2.5 w-1/3 rounded-md" />
    </div>
  </div>
);

/** Скелетон сообщения — isMine управляет стороной */
export const MessageSkeleton = ({ isMine }: { isMine: boolean }) => (
  <div
    className={`flex px-1 ${isMine ? "justify-end" : "justify-start"}`}
    aria-hidden="true"
  >
    <div className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {!isMine && (
        <Skeleton className="w-7 h-7 rounded-full shrink-0 self-end mb-1" />
      )}
      <div className="flex flex-col gap-1">
        {!isMine && <Skeleton className="h-2.5 w-16 rounded-md ml-1" />}
        <Skeleton
          className={`h-10 rounded-2xl ${isMine ? "rounded-br-md" : "rounded-bl-md"} ${
            isMine ? "w-40" : "w-52"
          }`}
        />
      </div>
    </div>
  </div>
);
