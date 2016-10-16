/*global SiteSettings */
/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
const site = require( 'wpapi' )( { endpoint: SiteSettings.endpoint, nonce: SiteSettings.nonce } );

/**
 * Comment actions
 */
export const COMMENTS_REQUEST = 'wordpress-redux/comments/REQUEST';
export const COMMENTS_REQUEST_SUCCESS = 'wordpress-redux/comments/REQUEST_SUCCESS';
export const COMMENTS_REQUEST_FAILURE = 'wordpress-redux/comments/REQUEST_FAILURE';
export const COMMENT_SUBMIT_REQUEST = 'wordpress-redux/comment-submit/REQUEST';
export const COMMENT_SUBMIT_REQUEST_SUCCESS = 'wordpress-redux/comment-submit/REQUEST_SUCCESS';
export const COMMENT_SUBMIT_REQUEST_FAILURE = 'wordpress-redux/comment-submit/REQUEST_FAILURE';

/**
 * Tracks all known comment objects, indexed by comment ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function items( state = {}, action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST_SUCCESS:
			const comments = keyBy( action.comments, 'id' );
			return Object.assign( {}, state, comments );
		case COMMENT_SUBMIT_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ action.comment.id ]: action.comment
			} );
		default:
			return state;
	}
}

/**
 * Tracks comments IDs for each post.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function itemsOnPost( state = {}, action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ action.postId ]: action.comments.map( ( comment ) => comment.id )
			} );
		case COMMENT_SUBMIT_REQUEST_SUCCESS:
			if ( ! state[ action.postId ] ) {
				return Object.assign( {}, state, {
					[ action.postId ]: action.comment.id
				} );
			}
			return Object.assign( {}, state, {
				[ action.postId ]: [ ...state[ action.postId ], action.comment.id ]
			} );
		default:
			return state;
	}
}

/**
 * Returns the updated comment requests state after an action has been
 * dispatched. The state reflects a mapping of post ID to a
 * boolean reflecting whether a request for the comments is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function requests( state = {}, action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST:
		case COMMENTS_REQUEST_SUCCESS:
		case COMMENTS_REQUEST_FAILURE:
			return Object.assign( {}, state[ action.postId ], { [ action.postId ]: COMMENTS_REQUEST === action.type } );
		default:
			return state;
	}
}

/**
 * Returns the updated comment count state after an action has been
 * dispatched. The state reflects a mapping of post ID to a total count
 * of comments attached to that post.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function totals( state = {}, action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST_SUCCESS:
			return Object.assign( {}, state[ action.postId ], { [ action.postId ]: action.count } );
		case COMMENT_SUBMIT_REQUEST_SUCCESS:
			if ( ! state[ action.postId ] ) {
				return Object.assign( {}, state[ action.postId ], { [ action.postId ]: 1 } );
			}
			return Object.assign( {}, state[ action.postId ], { [ action.postId ]: parseInt( state[ action.postId ], 10 ) + 1 } );
		default:
			return state;
	}
}

/**
 * Returns the updated comment requests state after an action has been
 * dispatched. The state reflects a mapping of post ID to a
 * boolean reflecting whether a request for the comments is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function isSubmitting( state = {}, action ) {
	switch ( action.type ) {
		case COMMENT_SUBMIT_REQUEST:
		case COMMENT_SUBMIT_REQUEST_SUCCESS:
		case COMMENT_SUBMIT_REQUEST_FAILURE:
			return Object.assign( {}, state[ action.postId ], { [ action.postId ]: COMMENT_SUBMIT_REQUEST === action.type } );
		default:
			return state;
	}
}

export default combineReducers( {
	items,
	itemsOnPost,
	requests,
	totals,
	isSubmitting
} );

/**
 * Triggers a network request to fetch the comments for a given post.
 *
 * @param  {int}       postId  Post ID of post to get comments for
 * @return {Function}          Action thunk
 */
export function requestComments( postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: COMMENTS_REQUEST,
			postId,
		} );

		return site.comments().forPost( postId ).order( 'asc' ).then( ( data ) => {
			dispatch( {
				type: COMMENTS_REQUEST_SUCCESS,
				comments: data,
				count: data._paging.total,
				postId
			} );
			return null;
		} ).catch( ( error ) => {
			dispatch( {
				type: COMMENTS_REQUEST_FAILURE,
				postId,
				error
			} );
		} );
	};
}

/**
 * Triggers a network request to submit a new comment
 *
 * @param  {object}    comment  The comment object to be submitted
 * @return {Function}           Action thunk
 */
export function submitComment( comment ) {
	return ( dispatch ) => {
		dispatch( {
			type: COMMENT_SUBMIT_REQUEST,
			postId: comment.post,
		} );

		return site.comments().post( comment ).then( ( data ) => {
			dispatch( {
				type: COMMENT_SUBMIT_REQUEST_SUCCESS,
				comment: data,
				postId: comment.post,
			} );
			return data;
		} ).catch( ( error ) => {
			dispatch( {
				type: COMMENT_SUBMIT_REQUEST_FAILURE,
				postId: comment.post,
				error
			} );
			return error;
		} );
	};
}
