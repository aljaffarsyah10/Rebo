import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import { getAuditLogsAction } from '@/actions/audit-actions';
import AuditLogClient from '@/components/rebo/audit-log-client';

export const metadata = {
  title: 'Audit Trail & Riwayat Aktivitas | REBO V2',
  description:
    'Jejak aktivitas transaksional pengajuan bukti dukung, catatan perbaikan, persetujuan verifikasi, dan otomasi Zona Integritas BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  // 1. Verifikasi hak akses: hanya Admin dan TPI yang diizinkan
  const session = await getCurrentUserSession();
  const isAuthorized = isAdmin(session.role) || isTPI(session.role);

  if (!isAuthorized) {
    redirect('/rebo/overview');
  }

  // 2. Ambil data log audit awal
  const result = await getAuditLogsAction({ limit: 100 });

  return (
    <AuditLogClient
      initialLogs={result.logs}
      initialTotal={result.totalCount}
      initialActionStats={result.actionStats}
      initialRoleStats={result.roleStats}
      isFallbackData={result.isFallbackData}
    />
  );
}
