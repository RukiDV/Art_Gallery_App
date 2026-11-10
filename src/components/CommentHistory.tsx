import type { ArtPieceCommentVersion } from "../types";

type CommentHistoryProps = {
  history: ArtPieceCommentVersion[];
};

export default function CommentHistory({ history }: CommentHistoryProps) {
  if (history.length === 0) {
    return <p>No earlier versions saved</p>;
  }

  return (
    <ol aria-label="Earlier versions">
      {history.map((version, index) => (
        <li key={`${version.replacedAt}-${index}`}>
          <p>{version.text}</p>
          <p className="comment-meta">
            Replaced{" "}
            <time dateTime={version.replacedAt}>
              {new Date(version.replacedAt).toLocaleString()}
            </time>
          </p>
        </li>
      ))}
    </ol>
  );
}
