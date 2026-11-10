import type { ArtPieceComment } from "../types";

type CommentsProps = {
  comments: ArtPieceComment[];
  onDeleteComment: (id: string) => void;
};

export default function Comments({ comments, onDeleteComment }: CommentsProps) {
  return (
    <section>
      <h3>Comments</h3>
      {comments.length > 0 && (
        <ul className="comments">
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.text}</p>
              <time dateTime={comment.date}>
                {new Date(comment.date).toLocaleString()}
              </time>
              <button
                type="button"
                aria-label={`Delete comment: ${comment.text}`}
                onClick={() => onDeleteComment(comment.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
