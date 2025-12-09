import { useState, useCallback, useRef, useEffect } from 'react';
import { create } from 'zustand';
import { Wifi, Search } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScanControls } from '@/components/ScanControls';
import { DeviceCard } from '@/components/DeviceCard';
import { ConnectionModal } from '@/components/ConnectionModal';
import { SettingsPage } from '@/pages/SettingsPage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { discoverSmartRoomHubs } from '@/lib/network/discovery';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Device } from '@/types/device';
interface AppState {
  isScanning: boolean;
  scanProgress: number;
  devices: Map<string, Device>;
  selectedDevice: Device | null;
  isModalOpen: boolean;
  startScan: () => void;
  stopScan: () => void;
  setScanProgress: (progress: number) => void;
  addDevice: (device: Device) => void;
  clearDevices: () => void;
  selectDevice: (device: Device | null) => void;
  openModal: () => void;
  closeModal: () => void;
}
const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  scanProgress: 0,
  devices: new Map(),
  selectedDevice: null,
  isModalOpen: false,
  startScan: () => set({ isScanning: true, scanProgress: 0 }),
  stopScan: () => set({ isScanning: false }),
  setScanProgress: (progress) => set({ scanProgress: progress }),
  addDevice: (device) => set((state) => ({
    devices: new Map(state.devices).set(device.ip, device)
  })),
  clearDevices: () => set((state) => {
    const newDevices = new Map();
    state.devices.forEach((device, key) => {
        if (device.foundBy === 'mock') {
            newDevices.set(key, device);
        }
    });
    return { devices: newDevices, scanProgress: 0 };
  }),
  selectDevice: (device) => set({ selectedDevice: device }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, selectedDevice: null }),
}));
const mockDevice: Device = {
  ip: '192.168.1.100',
  hostname: 'SmartRoomHub (Demo)',
  foundBy: 'mock',
  rttMs: 42,
  lastSeen: new Date().toISOString(),
  status: 'online',
};
// Initialize store with mock data only once
if (useAppStore.getState().devices.size === 0) {
    useAppStore.getState().addDevice(mockDevice);
}
export function HomePage() {
  const isScanning = useAppStore((s) => s.isScanning);
  const scanProgress = useAppStore((s) => s.scanProgress);
  const devices = useAppStore((s) => s.devices);
  const selectedDevice = useAppStore((s) => s.selectedDevice);
  const isModalOpen = useAppStore((s) => s.isModalOpen);
  const { startScan, stopScan, setScanProgress, addDevice, clearDevices, selectDevice, openModal, closeModal } = useAppStore.getState();
  const settings = useSettingsStore((s) => s.settings);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const scanController = useRef<boolean>(false);
  const handleScan = useCallback(async () => {
    clearDevices();
    startScan();
    scanController.current = true;
    toast.info('Starting network scan...', { description: `Using ${settings.subnets.length} subnets.` });
    try {
      const discoveryProcess = discoverSmartRoomHubs((progress) => {
        if (scanController.current) setScanProgress(progress);
      }, settings);
      for await (const device of discoveryProcess) {
        if (!scanController.current) break;
        addDevice(device);
      }
    } catch (error) {
      console.error("Scanning failed:", error);
      toast.error('Scan Failed', { description: 'Could not complete the network scan.' });
    } finally {
      if (scanController.current) {
        const foundCount = Array.from(useAppStore.getState().devices.values()).filter(d => d.foundBy !== 'mock').length;
        toast.success('Scan Complete!', { description: `Found ${foundCount} new device(s).` });
      }
      stopScan();
      scanController.current = false;
    }
  }, [settings, startScan, stopScan, setScanProgress, addDevice, clearDevices]);
  const handleStop = useCallback(() => {
    scanController.current = false;
    stopScan();
    toast.warning('Scan Stopped', { description: 'The network scan was cancelled.' });
  }, [stopScan]);
  const handleConnect = useCallback((device: Device) => {
    selectDevice(device);
    openModal();
  }, [selectDevice, openModal]);
  const deviceList = Array.from(devices.values());
  const discoveredDeviceCount = deviceList.filter(d => d.foundBy !== 'mock').length;
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <main className="space-y-16">
            <section className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary floating">
                  <Wifi className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
                SmartRoom <span className="text-gradient">Finder</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Automatically discover and connect to your SmartRoomHub on the local network.
              </p>
            </section>
            <section>
              <ScanControls
                isScanning={isScanning}
                onScan={handleScan}
                onStop={handleStop}
                onSettingsOpen={() => setSettingsOpen(true)}
                progress={scanProgress}
                deviceCount={discoveredDeviceCount}
                settings={settings}
              />
            </section>
            <section>
              {deviceList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {deviceList.map((device) => (
                    <DeviceCard key={device.ip} device={device} onConnect={handleConnect} />
                  ))}
                  {isScanning && Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className="space-y-4 p-6 rounded-xl border">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-8 w-1/3" />
                        </div>
                     </div>
                  ))}
                </div>
              ) : (
                !isScanning && (
                  <div className="text-center py-16 border-2 border-dashed rounded-2xl space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold">No Devices Found</h3>
                    <p className="text-muted-foreground">Click "Scan Network" or enter an IP manually in Settings.</p>
                    <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Enter IP Manually
                    </Button>
                  </div>
                )
              )}
            </section>
          </main>
        </div>
      </div>
      <footer className="text-center py-8 text-muted-foreground/80">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
      <ConnectionModal device={selectedDevice} isOpen={isModalOpen} onOpenChange={closeModal} />
      <SettingsPage isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} onDeviceFound={addDevice} />
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}