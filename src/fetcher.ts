import type { ArtPiece } from "./types";

export async function fetcher(url: string): Promise<ArtPiece[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch art pieces (status ${response.status})`);
  }

  const data: ArtPiece[] = await response.json();
  return data;
}
