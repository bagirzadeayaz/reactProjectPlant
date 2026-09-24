# entities

The business nouns: plant, review, cart. Each entity owns its type, its RTK Query
endpoints or slice, its selectors, and the components that render _one_ of it (a card, a
row, an avatar).

**May import:** shared.
**May be imported by:** features, widgets, pages, app.

An entity never knows about a user action. `PlantCard` renders a plant; it does not know
what "add to cart" means — it takes that as a prop or as children.
