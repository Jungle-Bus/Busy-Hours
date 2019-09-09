import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import CONFIG from '../config/config.json';
import EditorsMenu from './EditorsMenu';
import I18n from 'i18nline/lib/i18n';
import InAlert from './InAlert';
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
		const linetrip = trip || line;

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

			{linetrip && !isNaN(linetrip.defaultInterval) && linetrip.opens === "unset" &&
				<InAlert message={I18n.t("This line has no opening hours defined, existing intervals are applied 24/7.")} />
			}

			{linetrip && linetrip.defaultInterval === "unset" && linetrip.otherIntervals === "unset" && typeof linetrip.opens === "object" &&
				<InAlert message={I18n.t("This line has no interval defined, but its opening hours are:")+" "+linetrip.rawTags.opening_hours} />
			}

			{linetrip && (linetrip.defaultInterval === "invalid" || linetrip.otherIntervals === "invalid" || linetrip.opens === "invalid") &&
				<InAlert level="warning" message={I18n.t("Some attributes of this line are invalid, please check and correct hours.")} />
			}

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
