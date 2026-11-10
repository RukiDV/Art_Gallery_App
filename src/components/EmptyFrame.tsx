import type { ReactNode } from "react";

type EmptyFrameProps = {
  symbol?: ReactNode;
  isLoading?: boolean;
};

// A decorative empty picture frame under a spotlight for the status pages.
export default function EmptyFrame({ symbol, isLoading }: EmptyFrameProps) {
  return (
    <div
      className={isLoading ? "empty-frame empty-frame-loading" : "empty-frame"}
      aria-hidden="true"
    >
      <span>{symbol}</span>
    </div>
  );
}
