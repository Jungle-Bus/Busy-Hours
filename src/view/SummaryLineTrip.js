import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import CONFIG from '../config/config.json';
import EditorsMenu from './EditorsMenu';
import I18n from 'i18nline/lib/i18n';
import TagsTable from './TagsTable';

/**
 * SummaryTripLine is a component which displays a summary of given line/trip.
 * It allows to open external editor.
 */
class SummaryTripLine extends Component {
	constructor() {
		super();
		
		this.state = {
			showTags: false
		};
	}
	
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
				<li>{I18n.t("Network") + " : " + (line.network ? line.network : I18n.t("not set"))}</li>
				<li>{I18n.t("Operator") + " : " + (line.operator ? line.operator : I18n.t("not set"))}</li>
			</ul>
			
			{this.state.showTags &&
				<TagsTable tags={trip ? trip.rawTags : line.rawTags} style={{marginBottom: 20}}/>
			}
			
			<div style={{textAlign: "right"}}>
				<Button
					onClick={() => this.setState({ showTags: !this.state.showTags })}
				>
					{this.state.showTags ? I18n.t("Hide tags") : I18n.t("See all tags")}
				</Button>
				<Button
					href={CONFIG.osm_api_url+"/relation/"+(trip ? this.props.selectedTrip : this.props.selectedLine)}
					target="_blank"
				>
					{I18n.t("See on OSM.org")}
				</Button>
				
				<EditorsMenu relation={this.props.selectedTrip || this.props.selectedLine} />
			</div>
		</div>;
	}
}

export default SummaryTripLine;
