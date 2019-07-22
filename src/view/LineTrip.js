import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ContentLineTrip from './ContentLineTrip';
import NavLines from './NavLines';
import SummaryLineTrip from './SummaryLineTrip';

/**
 * LineTrip component manages the whole display of lines or trips.
 */
class LineTrip extends Component {
	render() {
		const theProps = Object.assign({}, this.props, {
			selectedLine: this.props.match.params.lid,
			selectedTrip: this.props.match.params.tid
		});
		
		return <div>
			<NavLines {...theProps} />
			<SummaryLineTrip {...theProps} />
			<ContentLineTrip {...theProps} />
		</div>;
	}
}

export default withRouter(LineTrip);
