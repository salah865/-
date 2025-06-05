import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const NotificationBadge = () => {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-red-500 hover:bg-red-600 flex items-center justify-center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};