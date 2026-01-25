import React from 'react';
import { Prism as SyntaxHighlighterLib } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterProps {
  language: string;
  children: string;
  className?: string;
  darkMode?: boolean;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  language,
  children,
  className = '',
  darkMode = false
}) => {
  const style = darkMode ? oneDark : oneLight;

  return (
    <SyntaxHighlighterLib
      language={language}
      style={style}
      className={`rounded-md ${className}`}
    >
      {children}
    </SyntaxHighlighterLib>
  );
};