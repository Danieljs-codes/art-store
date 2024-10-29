export const ArtStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    HIDDEN: "HIDDEN"
} as const;
export type ArtStatus = (typeof ArtStatus)[keyof typeof ArtStatus];
