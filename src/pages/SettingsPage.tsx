import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { manualIPProbe } from '@/lib/network/discovery';
import type { ScanSettings } from '@/types/settings';
interface SettingsPageProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDeviceFound: (device: any) => void;
}
const settingsSchema = z.object({
  subnets: z.string().min(1, 'At least one subnet is required.'),
  ports: z.string().min(1, 'At least one port is required.'),
  timeoutMs: z.number().min(500).max(10000),
  manualIp: z.string().optional(),
});
export function SettingsPage({ isOpen, onOpenChange, onDeviceFound }: SettingsPageProps) {
  const { settings, updateSettings } = useSettingsStore();
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      subnets: settings.subnets.join(', '),
      ports: settings.ports.join(', '),
      timeoutMs: settings.timeoutMs,
      manualIp: settings.manualIp || '',
    },
  });
  useEffect(() => {
    form.reset({
      subnets: settings.subnets.join(', '),
      ports: settings.ports.join(', '),
      timeoutMs: settings.timeoutMs,
      manualIp: settings.manualIp || '',
    });
  }, [settings, form]);
  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    const newSettings: Partial<ScanSettings> = {
      subnets: values.subnets.split(',').map(s => s.trim()).filter(Boolean),
      ports: values.ports.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p)),
      timeoutMs: values.timeoutMs,
      manualIp: values.manualIp,
    };
    updateSettings(newSettings);
    toast.success('Settings saved!');
    onOpenChange(false);
  };
  const handleTestManualIp = async () => {
    const ip = form.getValues('manualIp');
    if (!ip) {
      form.setError('manualIp', { type: 'manual', message: 'IP address is required.' });
      return;
    }
    toast.info(`Testing IP: ${ip}...`);
    const currentSettings = useSettingsStore.getState().settings;
    const device = await manualIPProbe(ip, currentSettings);
    if (device) {
      toast.success('Device Found!', { description: `Successfully connected to ${device.hostname} at ${device.ip}` });
      onDeviceFound(device);
      onOpenChange(false);
    } else {
      toast.error('Device Not Found', { description: `No SmartRoomHub device responded at ${ip}.` });
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Scan Settings</SheetTitle>
          <SheetDescription>
            Customize how the app scans for devices on your network.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="manualIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manual IP Address</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="e.g., 192.168.1.50" {...field} />
                      </FormControl>
                      <Button type="button" variant="secondary" onClick={handleTestManualIp}>Test</Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subnets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subnets to Scan</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 192.168.1., 10.0.0." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ports to Scan</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 80, 3000, 8080" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeoutMs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scan Timeout: {field.value}ms</FormLabel>
                    <FormControl>
                      <Slider
                        min={500}
                        max={10000}
                        step={500}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button type="submit" className="w-full btn-gradient">Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}