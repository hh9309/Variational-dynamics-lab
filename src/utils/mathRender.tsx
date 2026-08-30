import React, { useMemo } from "react";
import katex from "katex";

interface MathProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathTex: React.FC<MathProps> = ({ math, block = false, className = "" }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    } catch (e) {
      console.warn("KaTeX render error for:", math, e);
      return `<span class="text-red-500">${math}</span>`;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block ${block ? "my-2 w-full overflow-x-auto text-center" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const InlineMath: React.FC<{ math: string; className?: string }> = ({
  math,
  className = "",
}) => <MathTex math={math} block={false} className={className} />;

export const BlockMath: React.FC<{ math: string; className?: string }> = ({
  math,
  className = "",
}) => <MathTex math={math} block={true} className={className} />;
