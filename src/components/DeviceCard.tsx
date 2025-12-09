import { motion } from 'framer-motion';
import { Wifi, Server, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Device } from '@/types/device';
import { cn } from '@/lib/utils';
interface DeviceCardProps {
  device: Device;
  onConnect: (device: Device) => void;
  isConnecting?: boolean;
}
export function DeviceCard({ device, onConnect, isConnecting }: DeviceCardProps) {
  const isOnline = device.status === 'online';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-soft hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {device.hostname || 'Unknown Device'}
          </CardTitle>
          <div className="relative flex items-center">
            {isOnline && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <span className={cn("ml-2 text-sm", isOnline ? "text-green-600" : "text-muted-foreground")}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <Server className="mr-2 h-4 w-4" />
            <span>{device.ip}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" /> {device.foundBy}
              </Badge>
              {device.rttMs && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" /> {device.rttMs}ms
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => onConnect(device)}
              disabled={isConnecting}
              className="btn-gradient hover:scale-105 active:scale-95"
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}