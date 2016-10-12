/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { isRequestingCommentsForPost } from '../state/selectors';
import { requestComments } from '../state/comments';

const debug = debugFactory( 'query:comment' );

class QueryComments extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.postId === nextProps.postId ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.requesting ) {
			debug( `Request comments for ${ props.postId }` );
			props.requestComments( props.postId );
		}
	}

	render() {
		return null;
	}
}

QueryComments.propTypes = {
	postId: PropTypes.number.isRequired,
	requesting: PropTypes.bool,
	requestComments: PropTypes.func
};

QueryComments.defaultProps = {
	requestComments: () => {}
};

export default connect(
	( state, ownProps ) => {
		const postId = ownProps.postId;
		return {
			requesting: isRequestingCommentsForPost( state, postId ),
		};
	},
	( dispatch ) => bindActionCreators( { requestComments }, dispatch )
)( QueryComments );
