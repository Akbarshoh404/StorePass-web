import { StarIcon } from "./Icons";

export function StarRating({ value, size = "sm" }) {
  const rounded = Math.round(value || 0);
  return (
    <span className={`stars ${size === "lg" ? "lg" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= rounded} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={n <= value ? "filled" : ""}
          onClick={() => onChange(n)}
        >
          <StarIcon filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
