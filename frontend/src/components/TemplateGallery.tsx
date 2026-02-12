export function TemplateGallery({ models, onSelect }: { models: string[]; onSelect: (m: string) => void }) {
  return <div className="grid md:grid-cols-3 gap-4">{models.map((m) => <button key={m} onClick={() => onSelect(m)} className="card text-left">{m}<div className="text-sm text-slate-400">Preview placeholder</div></button>)}</div>;
}
