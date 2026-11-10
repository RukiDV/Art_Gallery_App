import { type FormEvent, useId, useState } from "react";

type CommentEditFormProps = {
  initialText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
};

export default function CommentEditForm({
  initialText,
  onSave,
  onCancel,
}: CommentEditFormProps) {
  const [text, setText] = useState(initialText);
  const fieldId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    if (trimmedText === "") {
      return;
    }

    onSave(trimmedText);
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor={fieldId}>Edit your comment</label>
      <input
        id={fieldId}
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
