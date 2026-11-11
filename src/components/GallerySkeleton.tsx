const PLACEHOLDER_COUNT = 6;
const PLACEHOLDERS = Array.from(
  { length: PLACEHOLDER_COUNT },
  (_, index) => index
);

// Shimmering empty cards while the gallery loads. Only the message is read
// out; the cards are decoration.
export default function GallerySkeleton() {
  return (
    <>
      <p className="skeleton-message">Loading art pieces…</p>
      <ul className="art-list" aria-hidden="true">
        {PLACEHOLDERS.map((placeholder) => (
          <li key={placeholder}>
            <div className="skeleton-card">
              <div className="skeleton-picture" />
              <div className="skeleton-lines">
                <span />
                <span />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
