import { Category, Template, Tag, Variable, Resume, ResumeVersion, GlobalVariable, Platform, Tone, Length, VarType, Contact } from '@prisma/client';

// Template with relations
export interface TemplateWithRelations extends Template {
  categories: Category[];
  tags: Tag[];
  variables: Variable[];
}

// Category with count and children
export interface CategoryWithCount extends Category {
  _count: {
    templates: number;
  };
  children?: CategoryWithCount[];
}

// Resume with current version
export interface ResumeWithVersion extends Resume {
  currentVersion?: ResumeVersion;
  versions?: ResumeVersion[];
  _count?: {
    versions: number;
  };
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
  topTemplates: { template: Template; count: number }[];
  platformBreakdown: { platform: Platform; count: number }[];
  successRate?: number;
}

// Re-export Prisma types
export type {
  Category,
  Template,
  Tag,
  Variable,
  Resume,
  ResumeVersion,
  GlobalVariable,
  Platform,
  Tone,
  Length,
  VarType,
  Contact,
};
