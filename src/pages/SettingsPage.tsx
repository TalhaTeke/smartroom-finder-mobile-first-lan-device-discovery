// This is a placeholder for a future settings page.
// For Phase 1, it's kept minimal.
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
interface SettingsPageProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
export function SettingsPage({ isOpen, onOpenChange }: SettingsPageProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure network scan parameters. These features will be available in a future update.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8 text-center text-muted-foreground">
          <p>Advanced settings are coming soon!</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}