export const MimeType = {
  PNG: "image/png",
  JPEG: "image/jpeg",
  GIF: "image/gif",
  WEBP: "image/webp",
} as const;

export type MimeType = (typeof MimeType)[keyof typeof MimeType];

export const MimeExtension: Record<MimeType, string> = {
  [MimeType.PNG]: ".png",
  [MimeType.JPEG]: ".jpg",
  [MimeType.GIF]: ".gif",
  [MimeType.WEBP]: ".webp",
};
