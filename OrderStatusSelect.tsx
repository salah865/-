import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';

interface OrderStatusSelectProps {
  status: string;
  orderId: number;
  onStatusChange: (orderId: number, status: string) => void;
  disabled?: boolean;
}

const statusMap = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة', 
  completed: 'مكتمل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي'
};

export function OrderStatusSelect({ status, orderId, onStatusChange, disabled }: OrderStatusSelectProps) {
  const getStatusDisplay = (status: string) => {
    if (!status) return 'قيد الانتظار';
    return statusMap[status as keyof typeof statusMap] || 'قيد الانتظار';
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={(newStatus) => onStatusChange(orderId, newStatus)}
        disabled={disabled}
      >
        <SelectTrigger className="w-32 h-7 text-xs">
          <SelectValue>
            {getStatusDisplay(status)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">قيد الانتظار</SelectItem>
          <SelectItem value="processing">قيد المعالجة</SelectItem>
          <SelectItem value="completed">مكتمل</SelectItem>
          <SelectItem value="delivered">تم التسليم</SelectItem>
          <SelectItem value="cancelled">ملغي</SelectItem>
        </SelectContent>
      </Select>
      <Edit className="w-3 h-3 text-gray-400" />
    </div>
  );
}