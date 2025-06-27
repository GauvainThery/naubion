/**
 * PageAnalysis Entity for TypeORM
 * Stores complete page analysis results for caching
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { PageAnalysisOptions, PageAnalysisResult } from '../../../domain/models/page-analysis.js';
import { GreenHostingResult } from '../../../domain/models/green-hosting.js';
import { HumanReadableImpactResult } from '../../../domain/models/human-readable-impact.js';
import { ResourceCollection } from '../../../domain/models/resource.js';

@Entity('page_analyses')
@Index(['url', 'optionsHash'], { unique: false })
@Index(['url'])
@Index(['createdAt'])
@Index(['expiresAt']) // Index on expiration date for efficient cleanup
export class PageAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 2048 })
  url!: string;

  @Column({ type: 'varchar', length: 64 })
  optionsHash!: string; // Hash of analysis options for caching lookup

  @Column({ type: 'timestamp' })
  analysisTimestamp!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date; // Explicit expiration timestamp

  @Column({ type: 'integer' })
  duration!: number; // Analysis duration in milliseconds

  @Column({ type: 'jsonb' })
  options!: PageAnalysisOptions;

  @Column({ type: 'jsonb' })
  resources!: ResourceCollection;

  @Column({ type: 'jsonb' })
  greenHosting!: GreenHostingResult;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  gCo2e!: number; // CO2 equivalent in grams

  @Column({ type: 'jsonb' })
  humanReadableImpact!: HumanReadableImpactResult;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    pageTitle?: string;
    hasFrames: boolean;
    hasServiceWorker: boolean;
    pageSize: {
      width: number;
      height: number;
    };
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Convert entity to domain model
   */
  toDomainModel(): PageAnalysisResult {
    return {
      url: this.url,
      timestamp: this.analysisTimestamp.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      options: this.options,
      duration: this.duration,
      resources: this.resources,
      greenHosting: this.greenHosting,
      gCo2e: this.gCo2e,
      humanReadableImpact: this.humanReadableImpact,
      metadata: this.metadata || {
        hasFrames: false,
        hasServiceWorker: false,
        pageSize: { width: 0, height: 0 }
      }
    };
  }

  /**
   * Create entity from domain model
   */
  static fromDomainModel(
    result: PageAnalysisResult,
    optionsHash: string,
    ttlHours: number = 24
  ): PageAnalysisEntity {
    const entity = new PageAnalysisEntity();
    entity.url = result.url;
    entity.optionsHash = optionsHash;
    entity.analysisTimestamp = new Date(result.timestamp);
    entity.duration = result.duration;
    entity.options = result.options;
    entity.resources = result.resources;
    entity.greenHosting = result.greenHosting;
    entity.gCo2e = result.gCo2e;
    entity.humanReadableImpact = result.humanReadableImpact;
    entity.metadata = result.metadata;

    // Set explicit expiration date based on TTL
    entity.expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    return entity;
  }

  /**
   * Check if the analysis result is still fresh based on TTL
   */
  isFresh(ttlHours: number): boolean {
    const now = new Date();
    const ttlMs = ttlHours * 60 * 60 * 1000;
    return now.getTime() - this.createdAt.getTime() < ttlMs;
  }

  /**
   * Check if the analysis result has expired based on explicit expiration date
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if the analysis result is still valid (not expired and within TTL)
   */
  isValid(ttlHours?: number): boolean {
    if (this.isExpired()) {
      return false;
    }

    if (ttlHours) {
      return this.isFresh(ttlHours);
    }

    return true;
  }
}
