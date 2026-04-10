import { Card } from "@/components/ui/card";

type StatsCardProps = {
  label: string;
  value: number | string;
  helperText?: string;
};

export function StatsCard({ label, value, helperText }: StatsCardProps) {
  return (
    <Card className="p-6 transition hover:-translate-y-0.5">
      <p className="app-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-soft)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{value}</p>
      {helperText ? <p className="mt-2 text-xs text-[var(--text-muted)]">{helperText}</p> : null}
    </Card>
  );
}
