import { useNetwork } from '@/hooks/useNetwork';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export const NetworkStatus = () => {
  const { showOfflineMessage } = useNetwork();

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-4">
      <Alert className="border-red-600 bg-red-500 text-white">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-white">
          لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    </div>
  );
};