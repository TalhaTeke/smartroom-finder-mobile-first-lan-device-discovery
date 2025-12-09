import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { connectivityTest } from '@/lib/network/discovery';
import type { Device } from '@/types/device';
interface ConnectionModalProps {
  device: Device | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
type ConnectionStatus = 'idle' | 'connecting' | 'success' | 'failed';
export function ConnectionModal({ device, isOpen, onOpenChange }: ConnectionModalProps) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen && device) {
      setStatus('connecting');
      setErrorDetails(null);
      const testConnection = async () => {
        const result = await connectivityTest(device.ip);
        if (result.ok) {
          setStatus('success');
        } else {
          setStatus('failed');
          setErrorDetails(result.details || 'An unknown error occurred.');
        }
      };
      testConnection();
    } else {
      // Reset state when modal is closed
      setTimeout(() => setStatus('idle'), 300);
    }
  }, [isOpen, device]);
  const handleOpenUI = () => {
    if (device) {
      window.open(`http://${device.ip}`, '_blank');
    }
  };
  const renderContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Connecting to {device?.hostname}...</p>
            <p className="text-sm text-muted-foreground/80">({device?.ip})</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-xl font-semibold">Successfully Connected!</p>
            <p className="text-muted-foreground">You can now access the SmartRoomHub UI.</p>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-xl font-semibold">Connection Failed</p>
            <p className="text-muted-foreground max-w-sm">{errorDetails}</p>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Device Connection</SheetTitle>
          <SheetDescription>
            Attempting to establish a connection with the selected SmartRoomHub.
          </SheetDescription>
        </SheetHeader>
        <div className="my-8">{renderContent()}</div>
        <SheetFooter>
          {status === 'success' && (
            <Button onClick={handleOpenUI} className="w-full btn-gradient">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Device UI
            </Button>
          )}
          {status === 'failed' && (
             <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
              Close
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}