export const ArtStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED"
} as const;
export type ArtStatus = (typeof ArtStatus)[keyof typeof ArtStatus];
