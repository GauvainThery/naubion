export type Page = 'home' | 'pageCarbonFootprint' | 'admin';

export const page: Record<Page, string> = {
  home: '/',
  pageCarbonFootprint: '/page-carbon-footprint',
  admin: '/admin'
};
