import { farmStatusStyles } from '../data/statusStyles';
import type { FarmStatus } from '../types';

type FarmStatusBadgeProps = {
  status: FarmStatus;
};

function FarmStatusBadge({ status }: FarmStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${farmStatusStyles[status]}`}>
      {status}
    </span>
  );
}

export default FarmStatusBadge;

