import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  Calendar,
  Camera,
  Award,
  ClipboardList,
  Compass,
  FolderOpen,
  Home,
  Image,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  Newspaper,
  Quote,
  Tv,
  Settings,
  Share2,
  Shield,
  UserPlus,
  Users,
  FlaskConical,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/**
 * Content-ops CMS nav — library items, people, events/forms.
 * Design tokens, SEO, and button styling stay in code — not editable here.
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Overview',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'What is published on the site',
      },
    ],
  },
  {
    label: 'Homepage',
    items: [
      {
        label: 'Homepage content',
        href: '/admin/homepage',
        icon: Home,
        description: 'Which stored items appear on the homepage',
      },
      {
        label: 'What our researchers say',
        href: '/admin/researcher-say',
        icon: Quote,
        description: 'Statements on the homepage',
      },
    ],
  },
  {
    label: 'Content library',
    items: [
      {
        label: 'Research',
        href: '/admin/research',
        icon: FlaskConical,
        description: 'Ongoing & completed · add by category · attach links',
      },
      {
        label: 'Focus areas',
        href: '/admin/research-areas',
        icon: Compass,
        description: 'Filter categories for Research',
      },
      {
        label: 'Publications',
        href: '/admin/publications',
        icon: BookOpen,
        description: '→ /publications',
      },
      {
        label: 'BKSR in Media',
        href: '/admin/bksr-in-media',
        icon: Tv,
        description: '→ /media',
      },
      {
        label: 'News',
        href: '/admin/news',
        icon: Newspaper,
        description: '→ /news',
      },
      {
        label: 'Events',
        href: '/admin/events',
        icon: Calendar,
        description: '→ /events',
      },
      {
        label: 'Notices',
        href: '/admin/notices',
        icon: Megaphone,
        description: '→ /notices',
      },
      {
        label: 'Programmes & activities',
        href: '/admin/activities',
        icon: Activity,
        description: '→ /activities',
      },
      {
        label: 'Resources',
        href: '/admin/resources',
        icon: FolderOpen,
        description: '→ /resources',
      },
      {
        label: 'Team & people',
        href: '/admin/people',
        icon: Users,
        description: '→ /people',
      },
    ],
  },
  {
    label: 'Events & applications',
    items: [
      {
        label: 'Forms',
        href: '/admin/registration-forms',
        icon: ClipboardList,
        description: 'Events, Career vacancies + entries',
      },
      {
        label: 'Join applications',
        href: '/admin/join-applications',
        icon: UserPlus,
        description: 'People applying to join BKSR',
      },
      {
        label: 'Achievements & certificates',
        href: '/admin/achievements',
        icon: Award,
      },
    ],
  },
  {
    label: 'Photos',
    items: [
      {
        label: 'Photo & file library',
        href: '/admin/media',
        icon: Image,
      },
      {
        label: 'Gallery albums',
        href: '/admin/gallery',
        icon: Camera,
        description: '→ /gallery',
      },
    ],
  },
  {
    label: 'Organisation',
    items: [
      {
        label: 'Organisation profile',
        href: '/admin/settings',
        icon: Settings,
        description: 'Name, mission, vision',
      },
      {
        label: 'Contact details',
        href: '/admin/contact',
        icon: Mail,
      },
      {
        label: 'Social links',
        href: '/admin/social',
        icon: Share2,
      },
      {
        label: 'Menus',
        href: '/admin/navigation',
        icon: Menu,
        description: 'Header and footer links',
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'System & data',
        href: '/admin/system',
        icon: Shield,
        description: 'Storage and unlock',
      },
    ],
  },
];
