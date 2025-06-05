interface ProfitDisplayProps {
  profit: number;
}

import { formatCurrency } from '../utils/formatters';

export function ProfitDisplay({ profit }: ProfitDisplayProps) {

  return (
    <div className="flex justify-between">
      <span className="text-gray-600">ربح التاجر:</span>
      <span className="font-medium text-purple-600">{formatCurrency(profit || 0)} د.ع</span>
    </div>
  );
}