import resourceData from '@/data/resources.json';

export type LearningResource = {
  id: string;
  type: 'course';
  title: string;
  institution: string;
  instructors: string[];
  term: string;
  url: string;
  codeUrl?: string;
  level: string;
  descriptionZh: string;
  whyUsefulZh: string;
  topics: string[];
  lastVerified: string;
};

export const resources = resourceData as LearningResource[];
