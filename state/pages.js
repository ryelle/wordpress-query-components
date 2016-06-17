/**
* External dependencies
*/
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
const endpoint = process.env.endpoint;
const site = require( 'wordpress-rest-api' )( { endpoint: endpoint } );

/**
 * Page actions
 */
export const PAGE_REQUEST = 'wordpress-redux/page/REQUEST';
export const PAGE_REQUEST_SUCCESS = 'wordpress-redux/page/REQUEST_SUCCESS';
export const PAGE_REQUEST_FAILURE = 'wordpress-redux/page/REQUEST_FAILURE';
export const PAGE_RECEIVE = 'wordpress-redux/page/RECEIVE';

/**
 * Tracks all known page objects, indexed by post global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function items( state = {}, action ) {
	switch ( action.type ) {
		case PAGE_RECEIVE:
			const posts = keyBy( [ action.page ], 'id' );
			return Object.assign( {}, state, posts );
		default:
			return state;
	}
}

/**
 * Returns the updated page requests state after an action has been
 * dispatched. The state reflects a mapping of page ID to a
 * boolean reflecting whether a request for the page is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function requests( state = {}, action ) {
	switch ( action.type ) {
		case PAGE_REQUEST:
		case PAGE_REQUEST_SUCCESS:
		case PAGE_REQUEST_FAILURE:
			return Object.assign( {}, state[ action.pagePath ], { [ action.pagePath ]: PAGE_REQUEST === action.type } );
		default:
			return state;
	}
}

/**
 * Tracks the path->ID mapping for pages
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function paths( state = {}, action ) {
	switch ( action.type ) {
		case PAGE_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ action.pagePath ]: action.postId
			} );
		default:
			return state;
	}
}

export default combineReducers( {
	items,
	requests,
	paths
} );

/**
 * Triggers a network request to fetch a specific page from a site.
 *
 * @param  {string}   path  Path path
 * @return {Function}       Action thunk
 */
export function requestPage( path ) {
	return ( dispatch ) => {
		dispatch( {
			type: PAGE_REQUEST,
			pagePath: path
		} );

		return site.pages().path( path ).embed().then( ( data ) => {
			const page = data[0];
			dispatch( {
				type: PAGE_RECEIVE,
				page
			} );
			dispatch( {
				type: PAGE_REQUEST_SUCCESS,
				postId: page.id,
				pagePath: path,
				page
			} );
			return null;
		} ).catch( ( error ) => {
			dispatch( {
				type: PAGE_REQUEST_FAILURE,
				pagePath: path,
				error
			} );
		} );
	};
}
