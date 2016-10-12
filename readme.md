WordPress Query Components
==========================

Query components and redux "ducks" & selectors for use with the WordPress REST API.

Very much a work-in-progress! Currently best used as a submodule in a theme, see [Foxhound](https://github.com/ryelle/Foxhound).

This uses the [`node-wpapi`](https://github.com/WP-API/node-wpapi) package to get your site's data via Query Components ([inspired by calypso](https://github.com/Automattic/wp-calypso/blob/master/docs/our-approach-to-data.md#query-components)). The Query Components call the API, which via actions set your site's data into the state.

## Query Components

These are a handful of components that abstract out the fetching of data. Simply include the query component in the component where you want to use this data, and the lifecycle methods of the query component handle fetching the data into the global state. Then you can use the selectors here to fetch the data out of the state for use in your component.

### Posts

Used to request a single post, or list of posts, based on either a query object, or post slug.

`<QueryPosts query={ { search: 'Themes' } } />`

`<QueryPosts postSlug="local-development-for-wordcamp-websites" />`

[See QueryPosts docs](query-posts)

### Pages

Used to request a single page given a path.

`<QueryPage pagePath="cafe/about" />`

[See QueryPage docs](query-page)

### Terms

Used to request data about a term (category, tag, other taxonomies untested).

`<QueryTerm taxonomy="category" termSlug="photos" />`

[See QueryTerm docs](query-term)

### Comments

Used to request the comments on a given post or page.

`<QueryComments postId={ 27 } />`

[See QueryComments docs](query-comments)

## Selectors

### Posts

#### `getPost( state, globalId )`

#### `getPostsForQuery( state, query )`

#### `isRequestingPostsForQuery( state, query )`

#### `getTotalPagesForQuery( state, query )`

#### `isRequestingPost( state, postSlug )`

#### `getPostIdFromSlug( state, slug )`

### Pages

#### `getPage( state, globalId )`

#### `isRequestingPage( state, path )`

#### `getPageIdFromPath( state, path )`

### Terms

#### `getTerm( state, globalId )`

#### `isRequestingTerm( state, taxonomy, slug )`

#### `getTermIdFromSlug( state, taxonomy, slug )`

### Comments

#### `getComment( state, globalId )`

#### `getCommentsForPost( state, postId )`

#### `isRequestingCommentsForPost( state, postId )`

#### `getTotalCommentsForPost( state, postId )`

#### `isSubmittingCommentOnPost( state, postId )`
