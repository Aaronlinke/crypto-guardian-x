import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface KaTeXMathProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const KaTeXMath = ({ math, display = false, className = "" }: KaTeXMathProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(math, ref.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (e) {
        if (ref.current) {
          ref.current.textContent = math;
        }
      }
    }
  }, [math, display]);

  return <span ref={ref} className={className} />;
};
