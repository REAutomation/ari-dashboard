/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Text widget component with markdown support
 */

import ReactMarkdown from 'react-markdown';
import type { TextWidgetData } from '@/types/widget';

interface TextWidgetProps {
  data: TextWidgetData;
}

export function TextWidget({ data }: TextWidgetProps) {
  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'info':
        return 'bg-sky-50 border border-sky-200 text-sky-900 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-200';
      case 'warning':
        return 'bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200';
      case 'success':
        return 'bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-200';
      default:
        return '';
    }
  };

  const getFontSizeClasses = (fontSize?: string) => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  return (
    <div
      className={`h-full p-4 rounded-lg ${getVariantClasses(
        data.variant
      )}`}
    >
      <div className={`prose max-w-none dark:prose-invert ${getFontSizeClasses(data.fontSize)}`}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
            ),
            p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            hr: () => <hr className="my-4 border-border" />,
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <code className="block bg-secondary p-3 rounded-md mb-3 overflow-x-auto font-mono text-sm">
                    {children}
                  </code>
                );
              }
              return (
                <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-sm">
                  {children}
                </code>
              );
            },
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/30 pl-4 italic my-3">
                {children}
              </blockquote>
            ),
          }}
        >
          {data.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
