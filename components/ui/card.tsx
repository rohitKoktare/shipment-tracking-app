type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <div className={`app-surface rounded-[var(--radius-xl)] ${className}`.trim()}>{children}</div>;
}
