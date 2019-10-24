import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ContentLineTrip from './ContentLineTrip';
import I18n from 'i18nline/lib/i18n';
import { Prompt } from 'react-router';
import NavLines from './NavLines';
import SummaryLineTrip from './SummaryLineTrip';

/**
 * LineTrip component manages the whole display of lines or trips.
 */
class LineTrip extends Component {
	constructor() {
		super();

		this.state = {
			edits: null
		};
	}

	render() {
		const theProps = Object.assign({}, this.props, {
			selectedLine: this.props.match.params.lid,
			selectedTrip: this.props.match.params.tid
		});

		return theProps.selectedLine && theProps.lines && theProps.lines[theProps.selectedLine] ? <div>
			<Prompt
				when={this.state.edits !== null}
				message={location => (
					location.pathname === theProps.history.location.pathname ?
					true
					: I18n.t("You have unsaved edits, if you leave these edits will be lost. Are you sure you want to leave the page ?")
				)}
			/>

			<NavLines {...theProps} />
			<SummaryLineTrip {...theProps} />

			<ContentLineTrip
				{...theProps}
				edits={this.state.edits}
				onEdit={periods => this.setState({ edits: periods })}
			/>
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
