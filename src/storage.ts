import type { ArtPieceInfo } from "./types";

export const STORAGE_KEY = "art-pieces-info";

export function loadArtPiecesInfo(): ArtPieceInfo[] {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
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
