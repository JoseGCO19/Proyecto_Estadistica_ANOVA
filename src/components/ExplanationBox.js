export default function ExplanationBox({ children, show, title = "Explicación Detallada" }) {
  if (!show) return null;
  return (
    <div className="animate-fade-in my-3 rounded-xl bg-amber-50 border border-amber-300 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-amber-400 px-4 py-2">
        <span className="text-lg">📖</span>
        <span className="font-bold text-amber-900 text-sm uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 py-3 text-amber-900 text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
