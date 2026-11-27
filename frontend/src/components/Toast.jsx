import { useEffect, useState } from 'react';

let toastId = 0;

/** Fire a toast from anywhere: toast('Saved!', 'success') */
export function toast(message, type = 'info') {
  window.dispatchEvent(
    new CustomEvent('lh-toast', { detail: { id: (toastId += 1), message, type } })
  );
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const t = e.detail;
      setToasts((list) => [...list, t]);
      setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== t.id));
      }, 4200);
    };
    window.addEventListener('lh-toast', handler);
    return () => window.removeEventListener('lh-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
