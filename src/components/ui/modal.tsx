'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className='max-w-[95vw] p-4 sm:max-w-lg sm:p-6'>
        <DialogHeader className='gap-1.5 text-left'>
          <DialogTitle className='text-base font-semibold sm:text-lg'>
            {title}
          </DialogTitle>
          <DialogDescription className='text-xs text-slate-500 sm:text-sm dark:text-slate-400'>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className='pt-2'>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
