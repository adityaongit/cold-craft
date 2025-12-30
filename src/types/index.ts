import { ITemplate, ICategory, ITag, IResume, TemplateLength, VariableType } from '../models';
import mongoose from 'mongoose';

// Template with relations
export interface TemplateWithRelations extends ITemplate {
  categories: ICategory[];
  tags: ITag[];
  usageHistoryCount: number;
}

// Category with count and children
export interface CategoryWithCount extends ICategory {
  templateCount: number;
  children?: CategoryWithCount[];
}

// Resume with version details
export interface ResumeWithVersion extends IResume {
  currentVersion: any;
  latestVersion: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsageStats {
  totalMessages: number;
  thisWeek: number;
  thisMonth: number;
  topTemplates: { template: { id: string; title: string }; count: number }[];
  successRate: number | null;
}

// Shortened URL types
export interface ShortenedUrlWithTemplate {
  id: string;
  _id: string;
  userId: string;
  originalUrl: string;
  shortenedUrl: string;
  templateId?: string | null;
  templateTitle?: string | null;
  variableName?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShortenedUrlStats {
  totalUrls: number;
  totalClicks: number;
  recentCount: number;
  mostUsedUrl: {
    originalUrl: string;
    shortenedUrl: string;
    usageCount: number;
  } | null;
}

// Re-export model types
export type {
  ICategory as Category,
  ITemplate as Template,
  ITag as Tag,
  IResume as Resume,
  TemplateLength as Length,
  VariableType as VarType,
};
