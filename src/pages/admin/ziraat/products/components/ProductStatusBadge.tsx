import { productStatusStyles } from '../data/statusStyles';
import type { ProductStatus } from '../types';

type ProductStatusBadgeProps = {
  status: ProductStatus;
};

function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${productStatusStyles[status]}`}>
      {status}
    </span>
  );
}

export default ProductStatusBadge;
