/**
 * Resource domain model - Core domain concepts for web resources
 */

// Resource types
export type ResourceType = 'html' | 'css' | 'js' | 'media' | 'font' | 'other';

// Resource entity
export interface Resource {
  url: string;
  contentType: string;
  transferSize: number;
  status: number;
  resourceType: ResourceType;
}

// Resource size breakdown value object
export interface ResourceSizeBreakdown {
  html: number;
  css: number;
  js: number;
  media: number;
  font: number;
  other: number;
}

// Resource collection entity
export interface ResourceCollection {
  resources: Resource[];
  totalTransferSize: number;
  sizeByType: ResourceSizeBreakdown;
  resourceCount: number;
}

// Domain service for resource type determination
export function determineResourceType(url: string, contentType: string): ResourceType {
  // Extract file extension from URL
  const fileExtension = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() || '';

  // Special handling for favicon
  if (url.includes('favicon.ico') || fileExtension === 'ico') {
    return 'media';
  }

  // Determine resource type based on content type and file extension
  if (contentType.includes('text/html')) {
    return 'html';
  } else if (contentType.includes('text/css') || fileExtension === 'css') {
    return 'css';
  } else if (
    contentType.includes('javascript') ||
    contentType.includes('text/javascript') ||
    fileExtension === 'js'
  ) {
    return 'js';
  } else if (
    contentType.includes('image/') ||
    contentType.includes('video/') ||
    contentType.includes('audio/') ||
    contentType.includes('model/') ||
    [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'svg',
      'webp',
      'ico',
      'bmp',
      'mp4',
      'webm',
      'avi',
      'mov',
      'mp3',
      'wav',
      'ogg'
    ].includes(fileExtension)
  ) {
    return 'media';
  } else if (
    contentType.includes('font/') ||
    contentType.includes('application/font') ||
    ['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(fileExtension)
  ) {
    return 'font';
  } else {
    return 'other';
  }
}
