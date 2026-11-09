# Bonus: Artist Details Page

This is a bonus story. It builds on story 7 (Art Piece Details Page). Users can see everything the gallery has by one artist.

## Value Proposition

**As an** art enthusiast

**I want to** see all art pieces of an artist on one page

**so that** I can discover more work by an artist I like.

## Acceptance Criteria

- [ ] On the details page and on the spotlight page, the artist's name is a link to the page of this artist.
- [ ] The artist page is available on the route `/artists/:artist`, for example `/artists/vincent-van-gogh`.
- [ ] The artist page shows the artist's name and the number of art pieces by this artist.
- [ ] The artist page shows all art pieces of this artist, and no art pieces of other artists.
- [ ] Clicking an art piece on the artist page opens its details page.
- [ ] An unknown artist shows an "Artist not found" message instead of crashing.

## Tasks

- [ ] Write a helper that turns an artist name into a URL-friendly text, and test it with different names.
- [ ] Create a component for the artist page and a route for it.
- [ ] Reuse your existing list component.

<details>
<summary>Hint ✨</summary>

The API has no endpoint for artists. Do not add a new fetch: filter the art pieces you already have.

The route needs a text that is safe to use in a URL. Think about spaces, upper case letters and special characters in names. Two names must never end up with the same text.

</details>
