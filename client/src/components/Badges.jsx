const priorityConfig = {
  high:   { label: 'High',   cls: 'badge-high' },
  medium: { label: 'Medium', cls: 'badge-medium' },
  low:    { label: 'Low',    cls: 'badge-low' },
};

export const PriorityBadge = ({ priority }) => {
  const cfg = priorityConfig[priority] || priorityConfig.medium;
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

export const StatusBadge = ({ completed }) =>
  completed
    ? <span className="badge badge-completed">Completed</span>
    : <span className="badge badge-pending">Pending</span>;

export default PriorityBadge;
