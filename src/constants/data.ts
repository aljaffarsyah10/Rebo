import { NavItem } from '@/types';

// Data used for sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Beranda',
    url: '/rebo/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Monitoring',
    url: '/rebo/monitoring',
    icon: 'laptop',
    isActive: false,
    shortcut: ['m', 'm'],
    items: []
  },
  {
    title: 'Admin',
    url: '/rebo/admin',
    icon: 'settings',
    isActive: true,
    shortcut: ['a', 'a'],
    items: [
      {
        title: 'Manajemen Pengguna',
        url: '/rebo/admin',
        icon: 'userPen',
        shortcut: ['u', 's']
      },
      {
        title: 'Manajemen Periode',
        url: '/rebo/admin/periode',
        icon: 'calendar',
        shortcut: ['p', 'e']
      },
      {
        title: 'GDrive Generator',
        url: '/rebo/admin/gdrive-generator',
        icon: 'folder',
        shortcut: ['g', 'd']
      },
      {
        title: 'Audit Log & Riwayat',
        url: '/rebo/admin/audit-log',
        icon: 'page',
        shortcut: ['a', 'l']
      },
      {
        title: 'Notifikasi & Kontak WA',
        url: '/rebo/admin/kontak',
        icon: 'billing',
        shortcut: ['w', 'a']
      }
    ]
  },
  {
    title: 'Form Bukti Dukung RB',
    url: '/rebo/formRB',
    icon: 'post',
    isActive: true,
    items: [
      {
        title: 'Aspek-Pengungkit',
        url: '/rebo/formRB/area',
        icon: 'userPen',
        shortcut: ['u', 'u']
      },
      {
        title: 'Aspek-Hasil',
        url: '/rebo/pilarHasil',
        icon: 'userPen',
        shortcut: ['h', 'h']
      },
      {
        title: 'Area-Pemenuhan',
        url: '/rebo/formRB/pemenuhan',
        icon: 'userPen',
        shortcut: ['p', 'p']
      },
      {
        title: 'Area-Reform',
        url: '/rebo/formRB/reform',
        icon: 'userPen',
        shortcut: ['r', 'r']
      }
    ]
  },
  {
    title: 'Data RB',
    url: '#',
    icon: 'page',
    isActive: false,
    items: [
      {
        title: 'Pilar',
        url: '/rebo/dataRB/pilar',
        icon: 'post',
        shortcut: ['l', 'l']
      },
      {
        title: 'Subpilar',
        url: '/rebo/dataRB/pilar/subpilar',
        icon: 'post',
        shortcut: ['s', 's']
      },
      {
        title: 'Pertanyaan',
        url: '/rebo/dataRB/pilar/pertanyaan',
        icon: 'post',
        shortcut: ['q', 'q']
      }
    ]
  },
  {
    title: 'Agenda & Rencana Kerja',
    url: '/rebo/agenda',
    icon: 'calendar',
    isActive: false,
    shortcut: ['a', 'g'],
    items: []
  },
  {
    title: 'Notulen Rapat Digital',
    url: '/rebo/notulen',
    icon: 'notulen',
    isActive: false,
    shortcut: ['n', 't'],
    items: []
  },
  {
    title: 'Kanban Tindak Lanjut',
    url: '/rebo/kanban',
    icon: 'kanban',
    isActive: false,
    shortcut: ['k', 'k'],
    items: []
  },
  {
    title: 'Inovasi Layanan',
    url: '/rebo/inovasi',
    icon: 'sparkles',
    isActive: false,
    shortcut: ['i', 'v'],
    items: []
  },
  {
    title: 'Arsip',
    url: '/rebo/arsip',
    icon: 'page',
    isActive: false,
    shortcut: ['r', 'r'],
    items: []
  },
  {
    title: 'Profil Pengguna',
    url: '/rebo/profile',
    icon: 'userPen',
    shortcut: ['c', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'Informasi RB',
    url: '/rebo/informasi',
    icon: 'help',
    shortcut: ['i', 'i'],
    isActive: false,
    items: []
  }
];
