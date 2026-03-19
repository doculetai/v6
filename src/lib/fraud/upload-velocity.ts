/**
 * Upload velocity checker — flags students uploading too many documents
 * in a short time window. Rapid re-uploads may indicate trial-and-error
 * with fraudulent statements.
 * Pure function.
 */

/** Maximum uploads allowed in the time window. */
const MAX_UPLOADS_IN_WINDOW = 5;

/** Time window in hours. */
const WINDOW_HOURS = 24;

export type UploadEvent = {
  documentId: string;
  uploadedAt: string;
};

export type UploadVelocityResult = {
  flagged: boolean;
  uploadsInWindow: number;
  maxAllowed: number;
  windowHours: number;
};

/** Check upload frequency within a rolling window. */
export function checkUploadVelocity(
  uploads: UploadEvent[],
  checkTime: string = new Date().toISOString(),
): UploadVelocityResult {
  const now = new Date(checkTime).getTime();
  const windowMs = WINDOW_HOURS * 60 * 60 * 1000;
  const windowStart = now - windowMs;

  const recentUploads = uploads.filter((u) => {
    const ts = new Date(u.uploadedAt).getTime();
    return ts >= windowStart && ts <= now;
  });

  return {
    flagged: recentUploads.length > MAX_UPLOADS_IN_WINDOW,
    uploadsInWindow: recentUploads.length,
    maxAllowed: MAX_UPLOADS_IN_WINDOW,
    windowHours: WINDOW_HOURS,
  };
}
