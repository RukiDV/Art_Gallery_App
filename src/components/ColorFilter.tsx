import { COLOR_FAMILIES, type ColorFamily } from "../colorFamilies";

type ColorFilterProps = {
  families: ColorFamily[];
  selected: ColorFamily[];
  onChange: (family: ColorFamily) => void;
};

export default function ColorFilter({
  families,
  selected,
  onChange,
}: ColorFilterProps) {
  if (families.length === 0) {
    return null;
  }

  return (
    <fieldset className="color-filter">
      <legend>Color</legend>
      {families.map((family) => (
        <label key={family}>
          <input
            type="checkbox"
            checked={selected.includes(family)}
            onChange={() => onChange(family)}
          />
          <span
            className="color-circle"
            aria-hidden="true"
            style={{
              backgroundColor: COLOR_FAMILIES.find(
                (candidate) => candidate.name === family
              )?.color,
            }}
          />
          {family}
        </label>
      ))}
    </fieldset>
  );
}
