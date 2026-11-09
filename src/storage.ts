import type { ArtPieceComment, ArtPieceInfo } from "./types";

export const STORAGE_KEY = "art-pieces-info";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isArtPieceComment(value: unknown): value is ArtPieceComment {
  return (
    isRecord(value) &&
    typeof value.text === "string" &&
    typeof value.date === "string"
  );
}

function isArtPieceInfo(value: unknown): value is ArtPieceInfo {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.isFavorite === "boolean" &&
    Array.isArray(value.comments) &&
    value.comments.every(isArtPieceComment)
  );
}

export function loadArtPiecesInfo(): ArtPieceInfo[] {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(isArtPieceInfo) : [];
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
