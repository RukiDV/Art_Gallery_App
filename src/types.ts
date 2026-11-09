export type ArtPiece = {
  slug: string;
  artist: string;
  name: string;
  imageSource: string;
  year: string;
  genre: string;
};

export type ArtPieceInfo = {
  slug: string;
  isFavorite: boolean;
};
