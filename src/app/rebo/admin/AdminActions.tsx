'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Props = {
  userId: string;
};

export default function AdminActions({ userId }: Props) {
  async function makeAdmin() {
    try {
      const res = await fetch('/rebo/admin/api/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'set', role: 'admin' })
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('User promoted to admin');
        // reload to show updated role
        window.location.reload();
      } else {
        toast.error(json.message || 'Failed to promote');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to promote');
    }
  }

  async function removeRole() {
    try {
      const res = await fetch('/rebo/admin/api/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'remove' })
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('User role removed');
        window.location.reload();
      } else {
        toast.error(json.message || 'Failed to remove role');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove role');
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <Button size='sm' variant='ghost' onClick={makeAdmin}>
        Make Admin
      </Button>
      <Button size='sm' variant='destructive' onClick={removeRole}>
        Remove
      </Button>
    </div>
  );
}
