# Bonus: Reserve Space for Images

This is a bonus story. It builds on stories 4, 5 and 7. The API gives the size of every image in `dimensions`, and so far the app does not use it.

## Value Proposition

**As an** art enthusiast

**I want** the page to stay still while the images load

**so that** the content does not jump around while I read.

## Acceptance Criteria

- [ ] Every art piece image has a `width` and a `height` that come from the `dimensions` of the art piece.
- [ ] Images keep their aspect ratio and are not stretched.
- [ ] Images in the Gallery and Favorites lists load lazily.
- [ ] The image on the Spotlight page does not load lazily, because it is the first thing the user sees.
- [ ] Every image still has a meaningful `alt` text.

## Tasks

- [ ] Add the `dimensions` to the type of an art piece.
- [ ] Create one image component and use it on all pages.
- [ ] Check in the browser that the page does not move while the images load. Throttle the network in the developer tools to see it.

<details>
<summary>Hint ✨</summary>

`width` and `height` on an `<img>` let the browser reserve space before the image arrives. To keep it responsive, also set `max-width: 100%` and `height: auto` in CSS.

`loading="lazy"` tells the browser to load an image only when it comes near the screen.

</details>
