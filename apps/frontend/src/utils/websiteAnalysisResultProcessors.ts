import { Resource } from '../../../backend/src/domain/models/resource';

/**
 * @fileoverview Utility functions for processing and formatting website analysis results.
 * This module provides functions to format resource data, calculate statistics,
 * and process results from website performance analysis.
 */

/**
 * Converts a size in bytes to a human-readable string format.
 * Automatically selects the most appropriate unit (B, KB, MB).
 *
 * @param size - The size in bytes to format
 * @returns A formatted string with the appropriate unit (e.g., "1.23 KB", "4.56 MB")
 *
 * @example
 * ```typescript
 * roundResourceSize(1024) // "1.00 KB"
 * roundResourceSize(1536) // "1.50 KB"
 * roundResourceSize(2097152) // "2.00 MB"
 * ```
 */
export function roundResourceSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Calculates the percentage that a given size represents of the total size.
 *
 * @param size - The partial size to calculate percentage for
 * @param totalSize - The total size to calculate percentage against
 * @returns The percentage as a number rounded to 2 decimal places
 *
 * @example
 * ```typescript
 * calculateResourcePercentage(512, 1024) // 50.00
 * calculateResourcePercentage(0, 1024) // 0.00
 * calculateResourcePercentage(256, 0) // 0.00 (handles division by zero)
 * ```
 */
function calculateResourcePercentage(size: number, totalSize: number): number {
  if (totalSize === 0) {
    return 0;
  }
  return parseFloat(((size / totalSize) * 100).toFixed(2));
}

/**
 * Calculates the average size of resources and returns it as a formatted string.
 *
 * @param totalSize - The total size of all resources in bytes
 * @param count - The number of resources
 * @returns A formatted string representing the average size per resource
 *
 * @example
 * ```typescript
 * calculateAverageResourceSize(2048, 4) // "512.00 B"
 * calculateAverageResourceSize(0, 0) // "0 KB"
 * calculateAverageResourceSize(5120, 2) // "2.50 KB"
 * ```
 */
function calculateAverageResourceSize(totalSize: number, count: number): string {
  if (count === 0) {
    return '0 KB';
  }
  const average = totalSize / count;
  return roundResourceSize(average);
}

/**
 * Filters an array of resources by their resource type.
 *
 * @param resources - Array of Resource objects to filter
 * @param type - The resource type to filter by (e.g., 'image', 'script', 'stylesheet')
 * @returns A new array containing only resources matching the specified type
 *
 * @example
 * ```typescript
 * const allResources = [
 *   { resourceType: 'image', transferSize: 1024, url: 'image.jpg' },
 *   { resourceType: 'script', transferSize: 2048, url: 'script.js' }
 * ];
 * filterResourcesByType(allResources, 'image') // Returns only the image resource
 * ```
 */
function filterResourcesByType(resources: Resource[], type: string): Resource[] {
  return resources.filter(resource => resource.resourceType === type);
}

/**
 * Processes resource data for a specific resource type and returns formatted statistics.
 * This is the main function for analyzing resource usage by type.
 *
 * @param resources - Array of all Resource objects to analyze
 * @param totalSize - The total size of all resources (used for percentage calculation)
 * @param resourceType - The specific type of resources to analyze
 * @returns An object containing formatted statistics for the resource type
 *
 * @example
 * ```typescript
 * const result = processResourceData(resources, 10240, 'image');
 * // Returns:
 * // {
 * //   size: "2.50 KB",
 * //   count: 3,
 * //   percentage: 25.00,
 * //   average: "853.33 B"
 * // }
 * ```
 */
export function processResourceData(
  resources: Resource[],
  totalSize: number,
  resourceType: string
): {
  size: string;
  count: number;
  percentage: number;
  average: string;
} {
  const filteredResources = filterResourcesByType(resources, resourceType);
  if (filteredResources.length === 0) {
    return {
      size: '0 KB',
      count: 0,
      percentage: 0,
      average: '0 KB'
    };
  }

  const totalTransferSize = filteredResources.reduce((sum, res) => sum + res.transferSize, 0);
  const count = filteredResources.length;

  return {
    size: roundResourceSize(totalTransferSize),
    count,
    percentage: calculateResourcePercentage(totalTransferSize, totalSize),
    average: calculateAverageResourceSize(totalTransferSize, count)
  };
}

/**
 * Processes and formats the largest resources from the analysis results.
 * Sorts resources by transfer size in descending order and returns the top N resources.
 *
 * @param resources - Array of Resource objects to analyze
 * @param limit - Maximum number of resources to return (default: 5)
 * @returns An array of objects containing name, type, and formatted size for the largest resources
 *
 * @example
 * ```typescript
 * const largestResources = processLargestResources(resources, 3);
 * // Returns:
 * // [
 * //   { name: "large-image.jpg", type: "image", size: "2.34 MB" },
 * //   { name: "bundle.js", type: "script", size: "1.56 MB" },
 * //   { name: "styles.css", type: "stylesheet", size: "234.56 KB" }
 * // ]
 * ```
 */
export function processLargestResources(
  resources: Resource[],
  limit: number = 5
): { name: string; type: string; size: string }[] {
  const sortedResources = [...resources].sort((a, b) => b.transferSize - a.transferSize);
  return sortedResources.slice(0, limit).map(resource => ({
    name: resource.url,
    type: resource.resourceType,
    size: roundResourceSize(resource.transferSize)
  }));
}

/**
 * Converts CO₂e emissions from grams to the most appropriate unit (g, kg, t).
 * Automatically selects the unit based on the magnitude of the value.
 *
 * @param gCo2e - The CO₂e emissions in grams
 * @returns An object with the formatted value and unit
 *
 * @example
 * ```typescript
 * formatCo2eEmissions(500) // { value: "500", unit: "gCO₂e" }
 * formatCo2eEmissions(1500) // { value: "1.50", unit: "kgCO₂e" }
 * formatCo2eEmissions(1500000) // { value: "1.50", unit: "t CO₂e" }
 * ```
 */
export function formatCo2eEmissions(gCo2e: number): { value: string; unit: string } {
  if (gCo2e < 1000) {
    return {
      value: String(Math.round(gCo2e * 100) / 100),
      unit: 'gCO₂e'
    };
  } else if (gCo2e < 1000000) {
    return {
      value: (gCo2e / 1000).toFixed(2),
      unit: 'kgCO₂e'
    };
  } else {
    return {
      value: (gCo2e / 1000000).toFixed(2),
      unit: 't CO₂e'
    };
  }
}

/**
 * Converts distance from meters to the most appropriate unit (m, km).
 * Automatically selects the unit based on the magnitude of the value.
 *
 * @param meters - The distance in meters
 * @returns An object with the formatted value and unit
 *
 * @example
 * ```typescript
 * formatDistance(500) // { value: "500", unit: "m" }
 * formatDistance(1500) // { value: "1.50", unit: "km" }
 * formatDistance(25000) // { value: "25.00", unit: "km" }
 * ```
 */
export function formatDistance(meters: number): { value: string; unit: string } {
  if (meters < 1000) {
    return {
      value: String(Math.round(meters * 100) / 100),
      unit: 'm'
    };
  } else {
    return {
      value: (meters / 1000).toFixed(2),
      unit: 'km'
    };
  }
}
