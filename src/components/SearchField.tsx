import { type Ref, useId } from "react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
};

export default function SearchField({
  value,
  onChange,
  inputRef,
}: SearchFieldProps) {
  const fieldId = useId();

  return (
    <div>
      <label htmlFor={fieldId}>Search</label>
      <input
        ref={inputRef}
        id={fieldId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
