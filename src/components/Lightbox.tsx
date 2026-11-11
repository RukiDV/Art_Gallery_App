import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

type LightboxProps = {
  imageSource: string;
  name: string;
  artist: string;
  glow: string;
  onClose: () => void;
};

// The large view of a painting. It is rendered into the body, so that it
// covers the whole window including the navigation.
export default function Lightbox({
  imageSource,
  name,
  artist,
  glow,
  onClose,
}: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const figureRef = useRef<HTMLElement>(null);

  // The focus moves into the dialog and goes back to the opener afterwards.
  useEffect(() => {
    const opener = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      if (opener instanceof HTMLElement) {
        opener.focus();
      }
    };
  }, []);

  // The page behind does not scroll while the dialog is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  // Everything outside of the picture and its caption is backdrop.
  function closeOnBackdropClick(event: MouseEvent<HTMLDivElement>) {
    const clicked = event.target;
    if (clicked instanceof Node && figureRef.current?.contains(clicked)) {
      return;
    }
    onClose();
  }

  // The Close button is the only control, so Tab has nowhere else to go.
  function keepFocusInside(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      closeButtonRef.current?.focus();
    }
  }

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      style={{ "--art-glow": glow } as CSSProperties}
      onClick={closeOnBackdropClick}
      onKeyDown={keepFocusInside}
    >
      <div
        className="lightbox-backdrop"
        aria-hidden="true"
        style={{ backgroundImage: `url(${JSON.stringify(imageSource)})` }}
      />
      <figure className="lightbox-figure" ref={figureRef}>
        <img src={imageSource} alt={name} />
        <figcaption>
          <p className="lightbox-name">{name}</p>
          <p className="lightbox-artist">{artist}</p>
        </figcaption>
      </figure>
      <button
        type="button"
        className="lightbox-close"
        aria-label="Close"
        ref={closeButtonRef}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
