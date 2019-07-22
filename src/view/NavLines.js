import React, { Component } from 'react';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import I18n from 'i18nline/lib/i18n';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';

/**
 * NavLines is a component for showing currently selected transport line.
 * It allows also to go back in navigation.
 */
class NavLines extends Component {
	render() {
		const line = this.props.selectedLine && this.props.lines && this.props.lines[this.props.selectedLine] ? this.props.lines[this.props.selectedLine] : null;
		const trip = line && this.props.selectedTrip && line.trips[this.props.selectedTrip] ? line.trips[this.props.selectedTrip] : null;
		const stLink = {textDecoration: "none", color: "inherit"}
		
		return <Paper style={{padding: 10}}><Breadcrumbs separator="›" aria-label="Breadcrumb" style={{display: "flex", justifyContent: "center"}}>
			<Link to="/" style={stLink}>
				{I18n.t("All lines")}
			</Link>
			
			{line &&
				<Link to={"/line/"+this.props.selectedLine} style={stLink}>
					{I18n.t("Line")}
					<transport-thumbnail
						data-transport-mode={line.type}
						data-transport-line-code={line.ref}
						data-transport-line-color={line.colour}>
					</transport-thumbnail>
				</Link>
			}
			
			{line && trip &&
				<Link to={"/line/"+this.props.selectedLine+"/trip/"+this.props.selectedTrip} style={stLink}>
					{I18n.t("Trip")}
					<transport-thumbnail
						data-transport-mode={line.type}
						data-transport-line-code={line.ref}
						data-transport-line-color={line.colour}
						data-transport-destination={trip.to}>
					</transport-thumbnail>
				</Link>
			}
		</Breadcrumbs></Paper>;
	}
}

export default NavLines;
