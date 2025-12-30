import { VariableType } from '@/models/Template';

type VarType = VariableType;

interface Variable {
  name: string;
  displayName: string;
  description?: string | null;
  defaultValue?: string | null;
  type: VarType;
  isRequired: boolean;
  order: number;
}

/**
 * Extract variables from template content
 * Supports: {{variable}}, {{variable:description}}, {{variable|default}}
 */
export function extractVariables(content: string): Omit<Variable, 'id' | 'templateId' | 'createdAt'>[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables: Map<string, Omit<Variable, 'id' | 'templateId' | 'createdAt'>> = new Map();

  let match;
  let order = 0;

  while ((match = variableRegex.exec(content)) !== null) {
    const fullMatch = match[1].trim();

    // Parse: name:description|default or name:description or name|default
    let name = fullMatch;
    let description: string | null = null;
    let defaultValue: string | null = null;
    let hasDefaultSyntax = false; // Track if pipe was used

    // Check for description (name:description)
    if (fullMatch.includes(':')) {
      const [namePart, descPart] = fullMatch.split(':');
      name = namePart.trim();
      description = descPart.trim();
    }

    // Check for default value (name|default)
    if (name.includes('|')) {
      const [namePart, defaultPart] = name.split('|');
      name = namePart.trim();
      defaultValue = defaultPart.trim();
      hasDefaultSyntax = true; // Pipe was used, so it's optional
    }

    // Check if description has default value
    if (description && description.includes('|')) {
      const [descPart, defaultPart] = description.split('|');
      description = descPart.trim();
      defaultValue = defaultPart.trim();
      hasDefaultSyntax = true; // Pipe was used, so it's optional
    }

    // Only add unique variables
    if (!variables.has(name)) {
      // Infer type based on name
      const type = inferVariableType(name);
      const displayName = nameToDisplayName(name);

      variables.set(name, {
        name,
        displayName,
        description,
        defaultValue,
        type,
        isRequired: !hasDefaultSyntax, // If pipe syntax used (even with empty default), not required
        order: order++,
      });
    }
  }

  return Array.from(variables.values());
}

/**
 * Infer variable type from name
 */
function inferVariableType(name: string): VarType {
  const lower = name.toLowerCase();

  if (lower.includes('email')) return VariableType.EMAIL;
  if (lower.includes('phone')) return VariableType.PHONE;
  if (lower.includes('url') || lower.includes('link') || lower.includes('website')) return VariableType.URL;
  if (lower.includes('date')) return VariableType.DATE;
  if (lower.includes('resume')) return VariableType.RESUME_SELECT;
  if (lower.includes('description') || lower.includes('bio') || lower.includes('summary')) return VariableType.TEXTAREA;

  return VariableType.TEXT;
}

/**
 * Convert variable name to display name
 * e.g., "firstName" -> "First Name", "company_name" -> "Company Name"
 */
function nameToDisplayName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // camelCase to spaces
    .replace(/[_-]/g, ' ') // underscores/hyphens to spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Fill template with variable values
 */
export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const varName = variable.split(':')[0].split('|')[0].trim();
    return values[varName] || match;
  });
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}

/**
 * Generate a slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Detect long URLs in text (>= minLength)
 * Returns the first URL found that exceeds the minimum length
 */
export function detectLongUrls(text: string, minLength: number = 50): string | null {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);

  if (!matches) return null;

  // Find first URL that exceeds length threshold
  const longUrl = matches.find(url => url.length >= minLength);
  return longUrl || null;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL for display
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
