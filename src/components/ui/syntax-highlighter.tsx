import React from 'react';
import { Prism as SyntaxHighlighterLib } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterProps {
  language: string;
  children: string;
  className?: string;
  darkMode?: boolean;
  showLineNumbers?: boolean;
  highlightPattern?: RegExp;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  language,
  children,
  className = '',
  darkMode = false,
  showLineNumbers = false,
  highlightPattern
}) => {
  const style = darkMode ? oneDark : oneLight;

  return (
    <SyntaxHighlighterLib
      language={language}
      style={style}
      className={`rounded-md ${className}`}
      showLineNumbers={showLineNumbers}
      wrapLines={Boolean(highlightPattern)}
      lineProps={highlightPattern ? (lineNumber) => {
        const lines = children.split('\n');
        const line = lines[lineNumber - 1] || '';
        if (highlightPattern.test(line)) {
          return { style: { backgroundColor: darkMode ? 'rgba(234, 179, 8, 0.15)' : 'rgba(250, 204, 21, 0.2)' } };
        }
        return {};
      } : undefined}
    >
      {children}
    </SyntaxHighlighterLib>
  );
};
