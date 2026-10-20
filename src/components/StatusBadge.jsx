const MAP = {
  // success
  active:       'badge-success',
  operational:  'badge-success',
  completed:    'badge-success',
  passed:       'badge-success',
  pass:         'badge-success',
  resolved:     'badge-success',
  'in stock':   'badge-success',
  // warning
  pending:      'badge-warning',
  'in progress':'badge-warning',
  maintenance:  'badge-warning',
  low:          'badge-warning',
  'low stock':  'badge-warning',
  'expiring soon':'badge-warning',
  'under installation':'badge-warning',
  high:         'badge-warning',
  scheduled:    'badge-warning',
  // danger
  breakdown:    'badge-danger',
  critical:     'badge-danger',
  delayed:      'badge-danger',
  expired:      'badge-danger',
  failed:       'badge-danger',
  'out of stock':'badge-danger',
  // purple
  medium:       'badge-purple',
  // info
  testing:      'badge-info',
  // gray
  'not started':'badge-gray',
};

export default function StatusBadge({ text }) {
  const cls = MAP[text?.toLowerCase()] || 'badge-gray';
  return <span className={`badge ${cls}`}>{text}</span>;
}
