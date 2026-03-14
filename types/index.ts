import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/lib/supabase/database.types';

// ---------------------------------------------------------------------------
// Row types — represent a full row as returned from the database
// ---------------------------------------------------------------------------

export type Build = Tables<'builds'>;
export type Profile = Tables<'profiles'>;
export type Comment = Tables<'comments'>;
export type Upvote = Tables<'upvotes'>;
export type AiTool = Tables<'ai_tools'>;
export type TechStackTag = Tables<'tech_stack_tags'>;
export type BuildScreenshot = Tables<'build_screenshots'>;
export type BuildAiTool = Tables<'build_ai_tools'>;
export type BuildTechStackTag = Tables<'build_tech_stack_tags'>;

// ---------------------------------------------------------------------------
// Insert types — fields required when creating a new row
// ---------------------------------------------------------------------------

export type BuildInsert = TablesInsert<'builds'>;
export type CommentInsert = TablesInsert<'comments'>;
export type UpvoteInsert = TablesInsert<'upvotes'>;
export type BuildScreenshotInsert = TablesInsert<'build_screenshots'>;
export type BuildAiToolInsert = TablesInsert<'build_ai_tools'>;
export type BuildTechStackTagInsert = TablesInsert<'build_tech_stack_tags'>;

// ---------------------------------------------------------------------------
// Update types — fields allowed when updating an existing row
// ---------------------------------------------------------------------------

export type BuildUpdate = TablesUpdate<'builds'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type CommentUpdate = TablesUpdate<'comments'>;

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

export type BuildType = Enums<'build_type'>;

// ---------------------------------------------------------------------------
// Filter types — used for parameterized queries
// ---------------------------------------------------------------------------

/**
 * Optional filters for the feed query. All fields are optional —
 * omitting a field (or passing an empty array) disables that filter.
 */
export interface FeedFilters {
  /** Restrict results to these build types (e.g. "app", "feature"). */
  buildTypes?: BuildType[];
  /** Restrict results to builds that use at least one of these AI tools. */
  aiToolIds?: string[];
}

// ---------------------------------------------------------------------------
// Composite types — used when fetching builds with joined relations
// ---------------------------------------------------------------------------

export type BuildWithDetails = Build & {
  screenshots: BuildScreenshot[];
  ai_tools: AiTool[];
  tech_stack_tags: TechStackTag[];
  profile: Profile | null;
  upvote_count: number;
};
