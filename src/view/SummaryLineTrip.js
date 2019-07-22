import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import EditorsMenu from './EditorsMenu';
import I18n from 'i18nline/lib/i18n';

/**
 * SummaryTripLine is a component which displays a summary of given line/trip.
 * It allows to open external editor.
 */
class SummaryTripLine extends Component {
	render() {
		const line = this.props.selectedLine && this.props.lines && this.props.lines[this.props.selectedLine] ? this.props.lines[this.props.selectedLine] : null;
		const trip = line && this.props.selectedTrip && line.trips[this.props.selectedTrip] ? line.trips[this.props.selectedTrip] : null;
		
		return <div>
			<h2>
				<transport-thumbnail
					data-transport-mode={line.type}
					data-transport-line-code={line.ref}
					data-transport-line-color={line.colour}>
				</transport-thumbnail>
				{trip ?
					trip.name
					:
					line.name
				}
			</h2>
			
			<ul>
				<li>{I18n.t("Network") + " : " + line.network}</li>
				<li>{I18n.t("Operator") + " : " + line.operator}</li>
			</ul>
			
			<div style={{textAlign: "right"}}>
				<Button>{I18n.t("See all tags")}</Button>
				<Button
					href={"https://openstreetmap.org/relation/"+(trip ? this.props.selectedTrip : this.props.selectedLine)}
					target="_blank"
				>
					{I18n.t("See on OpenStreetMap.org")}
				</Button>
				<EditorsMenu />
			</div>
		</div>;
	}
}

export default SummaryTripLine;
