import type { ArtPieceInfo } from "./types";

export const STORAGE_KEY = "art-pieces-info";

// Comments saved before they had an id are still valid: they get one on load.
type StoredComment = { id?: string; text: string; date: string };
type StoredArtPieceInfo = Omit<ArtPieceInfo, "comments"> & {
  comments: StoredComment[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStoredComment(value: unknown): value is StoredComment {
  return (
    isRecord(value) &&
    (value.id === undefined || typeof value.id === "string") &&
    typeof value.text === "string" &&
    typeof value.date === "string"
  );
}

function isStoredArtPieceInfo(value: unknown): value is StoredArtPieceInfo {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.isFavorite === "boolean" &&
    Array.isArray(value.comments) &&
    value.comments.every(isStoredComment)
  );
}

function withCommentIds(info: StoredArtPieceInfo): ArtPieceInfo {
  return {
    ...info,
    comments: info.comments.map((comment) => ({
      ...comment,
      id: comment.id ?? crypto.randomUUID(),
    })),
  };
}

export function loadArtPiecesInfo(): ArtPieceInfo[] {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter(isStoredArtPieceInfo).map(withCommentIds)
      : [];
  } catch {
    return [];
  }
}

export function saveArtPiecesInfo(artPiecesInfo: ArtPieceInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artPiecesInfo));
  } catch {
    // The app keeps working in memory when the storage is full or blocked.
  }
}
