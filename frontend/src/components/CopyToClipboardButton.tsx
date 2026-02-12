export function CopyToClipboardButton({ text }: { text: string }) {
  return <button className="px-3 py-2 rounded bg-indigo-600" onClick={() => navigator.clipboard.writeText(text)}>Copiar Texto</button>;
}
