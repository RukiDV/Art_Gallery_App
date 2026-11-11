import { useId } from "react";

import { SORT_OPTIONS, type SortOption } from "../sortArtPieces";

type SortSelectProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export default function SortSelect({ value, onChange }: SortSelectProps) {
  const selectId = useId();

  return (
    <div>
      <label htmlFor={selectId}>Sort by</label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
