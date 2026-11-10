import { addTransitionType, startTransition } from "react";
import { Link, type LinkProps, useNavigate } from "react-router";

// Pictures glide between a card and its details page only for navigations
// marked with this type. Going from one list page to another must not glide:
// every card would glide at once.
export const OPEN_DETAILS_TRANSITION = "art-details";

export default function TransitionLink({ to, onClick, ...props }: LinkProps) {
  const navigate = useNavigate();

  return (
    <Link
      to={to}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        const isPlainClick =
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey;
        // Other clicks (a new tab, for example) stay with the link itself.
        if (event.defaultPrevented || !isPlainClick || props.target) {
          return;
        }
        event.preventDefault();
        startTransition(() => {
          addTransitionType(OPEN_DETAILS_TRANSITION);
          navigate(to);
        });
      }}
    />
  );
}
