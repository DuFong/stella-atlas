import type { ReactNode } from "react";

type StatusPanelProps = {
  title: string;
  description: string;
  symbol: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function StatusPanel({
  title,
  description,
  symbol,
  action,
  children,
}: StatusPanelProps) {
  return (
    <main className="status-shell">
      <section className="status-card">
        <span className="status-symbol" aria-hidden="true">
          {symbol}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        {action}
      </section>
    </main>
  );
}
