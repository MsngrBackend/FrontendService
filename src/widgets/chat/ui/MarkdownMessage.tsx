import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useThemeStore } from "../../../shared/model/themeStore";

interface MarkdownMessageProps {
  content: string;
  isMine: boolean;
}

interface CodeBlockProps {
  language: string;
  codeText: string;
  isMine: boolean;
  theme: string;
}

const CodeBlock = ({ language, codeText, isMine, theme }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeText).then(done);
    } else {
      const el = document.createElement("textarea");
      el.value = codeText;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      done();
    }
  };

  const bgColor = isMine
    ? "rgba(0,0,0,0.28)"
    : theme === "dark"
      ? "rgba(255,255,255,0.07)"
      : "rgba(0,0,0,0.06)";

  const hlStyle = isMine || theme === "dark" ? oneDark : oneLight;

  return (
    <div className="relative my-1.5 rounded-lg overflow-x-auto text-xs">
      <div
        className={`flex items-center justify-between px-3 py-1.5 ${
          isMine
            ? "bg-black/35 text-white/60"
            : theme === "dark"
              ? "bg-white/10 text-white/40"
              : "bg-black/8 text-black/40"
        }`}
        style={{ fontFamily: "monospace" }}
      >
        <span className="text-[11px] uppercase tracking-wide font-medium">
          {language === "text" ? "code" : language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Скопировать код"
          className="flex items-center gap-1 text-[11px] opacity-70 hover:opacity-100 transition-opacity"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>

      <SyntaxHighlighter
        style={hlStyle}
        language={language}
        PreTag="div"
        customStyle={{
          background: bgColor,
          margin: 0,
          borderRadius: 0,
          fontSize: "12px",
          padding: "10px 12px",
        }}
        codeTagProps={{
          style: { fontFamily: "monospace, monospace" },
        }}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
};

export const MarkdownMessage = ({ content, isMine }: MarkdownMessageProps) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="wrap-break-word mb-1 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        del: ({ children }) => (
          <del className="line-through opacity-70">{children}</del>
        ),
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || "");
          const codeText = String(children).replace(/\n$/, "");
          const isBlock = match || codeText.includes("\n");

          if (isBlock) {
            return (
              <CodeBlock
                language={match ? match[1]! : "text"}
                codeText={codeText}
                isMine={isMine}
                theme={theme}
              />
            );
          }

          return (
            <code
              className={`rounded px-1 py-0.5 text-xs font-mono ${
                isMine
                  ? "bg-white/20 text-white"
                  : "bg-black/8 text-(--text-primary)"
              }`}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => (
          <blockquote
            className={`border-l-2 pl-2 my-1 opacity-85 ${
              isMine ? "border-white/50" : "border-(--accent)"
            }`}
          >
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className="text-base font-bold mb-1">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-0.5">{children}</h3>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 ${
              isMine ? "text-white/90" : "text-(--accent)"
            }`}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
