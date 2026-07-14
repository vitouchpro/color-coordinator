export default function Toast({ message }) {
  return <div id="toast" className={message ? 'show' : ''} role="status" aria-live="polite">{message}</div>;
}
