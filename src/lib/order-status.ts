export const ORDER_STATUS_OPTIONS = ['Waiting Verification', 'Approved', 'Rejected', 'Completed', 'Cancelled'] as const;

export function getStatusClasses(status: string) {
  switch (status) {
    case 'Approved':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Cancelled':
      return 'bg-slate-200 text-slate-700 border-slate-300';
    case 'Waiting Verification':
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
}

export function getStatusTimeline(status: string) {
  const base = [
    { label: 'Waiting Verification', value: 'Waiting Verification' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Completed', value: 'Completed' },
  ];

  const currentIndex = base.findIndex((step) => step.value === status);
  return base.map((step, index) => ({
    ...step,
    active: index <= currentIndex,
    done: index < currentIndex,
    failed: status === 'Rejected' || status === 'Cancelled',
  }));
}
