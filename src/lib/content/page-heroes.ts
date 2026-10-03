import { brandPhotos } from '@/lib/content/prototype-media';

/** Shared photographic planes for inner-page heroes (homepage language). */
export const pageHeroMedia = {
  about: brandPhotos.fieldResearchCommunity,
  people: brandPhotos.icbeScholarsGroup,
  research: brandPhotos.fieldResearchRural,
  publications: brandPhotos.conferencePresentation,
  activities: brandPhotos.awardCeremony,
  events: brandPhotos.academicNetworking,
  newsEvents: brandPhotos.academicNetworking,
  news: brandPhotos.classroomSeminar,
  notices: brandPhotos.awardCaice,
  contact: brandPhotos.communityEngagement,
  resources: brandPhotos.conferencePresentation,
  gallery: brandPhotos.questConferenceGroup,
  default: brandPhotos.fieldResearchCommunity,
} as const;
