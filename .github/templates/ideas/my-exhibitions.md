# Bonus: My Exhibitions

This is a large bonus story. Work on it only when stories 4 to 9 are done. It is a good fit for a student who is fast and wants a bigger challenge. Keep the pull request small by splitting the work into several steps in your plan.

## Value Proposition

**As an** art enthusiast

**I want to** group art pieces into my own exhibitions

**so that** I can organize art by themes, for example "Blue paintings".

## Acceptance Criteria

- [ ] A page on the route `/exhibitions` lists all exhibitions with their names and the number of art pieces.
- [ ] A form on this page creates a new exhibition with a name. An empty name, and a name that exists already, cannot be saved.
- [ ] The details page of an art piece has a way to add the art piece to an exhibition, and to remove it again.
- [ ] An art piece can be in several exhibitions, and only once in the same exhibition.
- [ ] The route `/exhibitions/:id` shows the name and the art pieces of one exhibition. Clicking an art piece opens its details page.
- [ ] An exhibition can be renamed and deleted. Deleting an exhibition does not delete art pieces, favorites or comments.
- [ ] An unknown exhibition shows an "Exhibition not found" message instead of crashing.
- [ ] The navigation has a link to the exhibitions.
- [ ] If story 12 is done: exhibitions are still there after a reload.

## Tasks

- [ ] Type an exhibition, for example `type Exhibition = { id: string; name: string; slugs: string[] }`.
- [ ] Keep the exhibitions in state, next to the information on art pieces.
- [ ] Create the pages, the form and the controls on the details page.

<details>
<summary>Hint ✨</summary>

Store only the `slug` of every art piece, not the whole art piece. The art pieces always come from the API. When an exhibition shows its pieces, look them up by slug. Think about what should happen when a slug no longer exists in the API.

Give every exhibition an `id`, for example with `crypto.randomUUID()`. A name can change, an `id` does not.

</details>
