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

		return theProps.selectedLine && theProps.lines && theProps.lines[theProps.selectedLine] ? <div>
			<NavLines {...theProps} />
			<SummaryLineTrip {...theProps} />
			<ContentLineTrip {...theProps} />
		</div> : <div></div>;
	}

	/**
	 * Redirects to loader if relation data is missing
	 * @private
	 */
	_checkDataLoaded() {
		if(!this.props.match.params.lid || !this.props.lines || !this.props.lines[this.props.match.params.lid]) {
			this.props.history.push("/load/"+this.props.match.params.lid);
		}
	}

	componentDidMount() {
		this._checkDataLoaded();
	}

	componentDidUpdate() {
		this._checkDataLoaded();
	}
}

export default withRouter(LineTrip);
