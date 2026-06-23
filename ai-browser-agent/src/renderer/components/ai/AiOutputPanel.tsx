import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

export function AiOutputPanel({ content }: Props) {
  return (
    <div className="p-4 markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-slate-800 text-brand-300 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>;
            }
            const lang = className?.replace('language-', '') || '';
            return (
              <div className="my-3">
                {lang && (
                  <div className="bg-slate-700 text-slate-400 text-xs px-3 py-1 rounded-t-md border-b border-slate-600">
                    {lang}
                  </div>
                )}
                <pre className={`bg-slate-800 p-4 overflow-x-auto text-xs font-mono ${lang ? 'rounded-b-md' : 'rounded-md'}`}>
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
          // Tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className="w-full border-collapse">{children}</table>
              </div>
            );
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-brand-500 pl-4 py-1 italic text-slate-400 my-2">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
