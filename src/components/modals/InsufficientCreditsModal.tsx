import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCredits: number;
  requiredCredits: number;
}

export function InsufficientCreditsModal({
  open,
  onOpenChange,
  availableCredits,
  requiredCredits,
}: InsufficientCreditsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Insufficient Credits
          </DialogTitle>
          <DialogDescription>
            You don't have enough credits to perform this action.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Insufficient credits left</p>
              <div className="text-sm mt-2">
                <p>Available credits: <strong>{availableCredits.toLocaleString()}</strong></p>
                <p>Required credits: <strong>{requiredCredits.toLocaleString()}</strong></p>
                <p className="mt-2 text-muted-foreground">
                  You need <strong>{(requiredCredits - availableCredits).toLocaleString()}</strong> more credits to complete this action.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
