import { useId } from "react";

type GenreFilterProps = {
  genres: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function GenreFilter({
  genres,
  value,
  onChange,
}: GenreFilterProps) {
  const selectId = useId();

  return (
    <div>
      <label htmlFor={selectId}>Genre</label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
}
