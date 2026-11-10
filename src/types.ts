export type ArtPiece = {
  slug: string;
  artist: string;
  name: string;
  imageSource: string;
  year: string;
  genre: string;
  colors: string[];
};

export type ArtPieceCommentVersion = {
  text: string;
  replacedAt: string;
};

export type ArtPieceComment = {
  id: string;
  text: string;
  date: string;
  edited?: boolean;
  history?: ArtPieceCommentVersion[];
};

export type ArtPieceInfo = {
  slug: string;
  isFavorite: boolean;
  comments: ArtPieceComment[];
};
