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
    title: 'Admin Dashboard',
    url: '/rebo/admin',
    icon: 'settings',
    isActive: false,
    shortcut: ['a', 'a'],
    items: []
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
    title: 'Arsip',
    url: '/rebo/arsip',
    icon: 'page',
    isActive: false,
    shortcut: ['r', 'r'],
    items: []
  },
  {
    title: 'Account',
    url: '/dashboard/profile',
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
