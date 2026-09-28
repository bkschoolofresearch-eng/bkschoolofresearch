import type { ContentDatabase } from '@/types/content';
import { activities } from './activities';
import { events } from './events';
import { galleryAlbums, galleryImages } from './gallery';
import { homepage } from './homepage';
import { media } from './media';
import {
  footerNavigation,
  knowledgeHubNavigation,
  mainNavigation,
} from './navigation';
import { news } from './news';
import { notices } from './notices';
import { pages } from './pages';
import { people } from './people';
import { personContentLinks } from './person-content-links';
import {
  achievementAssignments,
  achievements,
  joinApplications,
  memberAchievements,
  roleAssignments,
} from './people-extras';
import { mediaClippings } from './press-coverage';
import { publications } from './publications';
import { registrationEntries, registrationForms } from './registration-forms';
import { researchAreas } from './research-areas';
import { researchProjects } from './research-projects';
import { resources } from './resources';
import { siteSettings } from './site-settings';

export const seedDatabase: ContentDatabase = {
  version: 1,
  siteSettings,
  navigation: {
    main: mainNavigation,
    footer: footerNavigation,
    knowledgeHub: knowledgeHubNavigation,
  },
  homepage,
  pages,
  people,
  researchAreas,
  researchProjects,
  publications,
  mediaClippings,
  activities,
  news,
  events,
  notices,
  resources,
  galleryAlbums,
  galleryImages,
  media,
  personContentLinks,
  registrationForms,
  registrationEntries,
  roleAssignments,
  joinApplications,
  achievements,
  achievementAssignments,
  memberAchievements,
};

export {
  activities,
  events,
  galleryAlbums,
  galleryImages,
  homepage,
  media,
  mainNavigation,
  footerNavigation,
  knowledgeHubNavigation,
  news,
  notices,
  pages,
  people,
  personContentLinks,
  roleAssignments,
  joinApplications,
  achievements,
  achievementAssignments,
  memberAchievements,
  registrationForms,
  registrationEntries,
  publications,
  mediaClippings,
  researchAreas,
  researchProjects,
  resources,
  siteSettings,
};
