export function PracticeSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-12 rounded-lg bg-line/70" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-line/70" />
        <div className="h-56 rounded-xl bg-line/50" />
      </div>
    </div>
  );
}
