import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScanLine, X, Settings } from 'lucide-react';
interface ScanControlsProps {
  isScanning: boolean;
  onScan: () => void;
  onStop: () => void;
  progress: number;
  deviceCount: number;
}
export function ScanControls({ isScanning, onScan, onStop, progress, deviceCount }: ScanControlsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {!isScanning ? (
          <Button
            size="lg"
            onClick={onScan}
            className="btn-gradient w-full sm:w-auto flex-1 text-lg font-semibold hover:-translate-y-0.5 transition-all duration-200"
          >
            <ScanLine className="mr-2 h-5 w-5" />
            Scan Network
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            onClick={onStop}
            className="w-full sm:w-auto flex-1 text-lg font-semibold hover:-translate-y-0.5 transition-all duration-200"
          >
            <X className="mr-2 h-5 w-5" />
            Stop Scan
          </Button>
        )}
        {/* Placeholder for settings button */}
        <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
          <Settings className="mr-2 h-5 w-5" />
          Settings
        </Button>
      </div>
      {isScanning && (
        <div className="space-y-2 text-center animate-fade-in">
          <Progress value={progress * 100} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Scanning... {Math.round(progress * 100)}% complete. Found {deviceCount} devices.
          </p>
        </div>
      )}
    </div>
  );
}