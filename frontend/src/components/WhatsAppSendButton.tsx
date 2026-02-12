export function WhatsAppSendButton({ text }: { text: string }) {
  return <a className="px-3 py-2 rounded bg-green-600 inline-block" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank">Enviar para WhatsApp</a>;
}
