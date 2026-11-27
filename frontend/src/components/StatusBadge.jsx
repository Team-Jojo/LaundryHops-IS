const COLORS = {
  pending: 'yellow',
  confirmed: 'blue',
  received: 'violet',
  washing: 'magenta',
  ready: 'green',
  delivered: 'cyan',
  claimed: 'cyan',
  cancelled: 'red',
  paid: 'green',
  unpaid: 'yellow',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge badge-${COLORS[status] || 'gray'}`}>{status}</span>;
}
