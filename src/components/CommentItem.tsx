import { useState } from "react";

import type { ArtPieceComment } from "../types";
import CommentEditForm from "./CommentEditForm";

type CommentItemProps = {
  comment: ArtPieceComment;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
};

export default function CommentItem({
  comment,
  onDelete,
  onEdit,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  function handleSave(text: string) {
    if (text !== comment.text) {
      onEdit(comment.id, text);
    }
    setIsEditing(false);
  }

  return (
    <li>
      {isEditing ? (
        <CommentEditForm
          initialText={comment.text}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <p>{comment.text}</p>
      )}
      <p className="comment-meta">
        <time dateTime={comment.date}>
          {new Date(comment.date).toLocaleString()}
        </time>
        {comment.edited && <span className="comment-edited">edited</span>}
      </p>
      {!isEditing && (
        <>
          <button
            type="button"
            aria-label={`Edit comment: ${comment.text}`}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete comment: ${comment.text}`}
            onClick={() => onDelete(comment.id)}
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
}
