'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  description?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Konfirmasi Tindakan',
  description = 'Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?'
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full flex-col-reverse gap-2 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:pt-6'>
        <Button
          disabled={loading}
          variant='outline'
          onClick={onClose}
          className='w-full text-xs sm:w-auto sm:text-sm'
        >
          Batal
        </Button>
        <Button
          disabled={loading}
          variant='destructive'
          onClick={onConfirm}
          className='w-full text-xs sm:w-auto sm:text-sm'
        >
          {loading ? 'Memproses...' : 'Lanjutkan'}
        </Button>
      </div>
    </Modal>
  );
};
