/**
 * Website domain model - Core domain concepts for websites
 */

import { ResourceCollection } from './resource.js';

// Page entity - represents a single webpage
export interface WebPage {
  url: string;
  title: string;
  resources: ResourceCollection;
}

// Website aggregate root - represents a complete website
export interface Website {
  domain: string;
  pages: WebPage[];
  avgResourcesPerPage: number;
  totalResourceSize: number;
  totalPages: number;
}
