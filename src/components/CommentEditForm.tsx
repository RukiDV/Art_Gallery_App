import { type FormEvent, useEffect, useId, useRef, useState } from "react";

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
  const [isEmpty, setIsEmpty] = useState(false);
  const fieldId = useId();
  const errorId = useId();
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    if (trimmedText === "") {
      setIsEmpty(true);
      return;
    }

    onSave(trimmedText);
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor={fieldId}>Edit your comment</label>
      <input
        ref={fieldRef}
        id={fieldId}
        type="text"
        aria-label={`Edit your comment: ${initialText}`}
        aria-invalid={isEmpty}
        aria-describedby={isEmpty ? errorId : undefined}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setIsEmpty(false);
        }}
      />
      {isEmpty && (
        <p id={errorId} role="alert">
          A comment cannot be empty.
        </p>
      )}
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
