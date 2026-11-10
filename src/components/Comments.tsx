import type { ArtPieceComment } from "../types";
import CommentItem from "./CommentItem";

type CommentsProps = {
  comments: ArtPieceComment[];
  onDeleteComment: (id: string) => void;
  onEditComment: (id: string, text: string) => void;
};

export default function Comments({
  comments,
  onDeleteComment,
  onEditComment,
}: CommentsProps) {
  return (
    <section>
      <h3>Comments</h3>
      {comments.length > 0 && (
        <ul className="comments">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={onDeleteComment}
              onEdit={onEditComment}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
