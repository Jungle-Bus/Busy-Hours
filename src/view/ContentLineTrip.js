import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import CalendarEdit from 'mdi-react/CalendarEditIcon';
import I18n from 'i18nline/lib/i18n';
import InAlert from './InAlert';
import HoursEditor from './HoursEditor';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

/**
 * ContentTripLine is a component for both seeing trips of a line, and viewing/editing line hours.
 */
class ContentTripLine extends Component {
	constructor() {
		super();
		
		this.state = {
			tab: 0
		};
	}
	
	render() {
		const line = this.props.selectedLine && this.props.lines && this.props.lines[this.props.selectedLine] ? this.props.lines[this.props.selectedLine] : null;
		const trip = line && this.props.selectedTrip && line.trips[this.props.selectedTrip] ? line.trips[this.props.selectedTrip] : null;
		
		return <div>
			<Tabs
				value={trip ? 0 : this.state.tab}
				onChange={(e, newval) => this.setState({ tab: newval })}
				indicatorColor="primary"
				textColor="primary"
			>
				<Tab label={I18n.t("Hours")} />
				{!trip && line.trips && <Tab label={I18n.t("Trips")} />
}
			</Tabs>
			
			{((!trip && this.state.tab === 0) || trip) && <div>
				{trip &&
					<InAlert
						message={I18n.t("This trip belongs to line %{line}. If all trips of this line have similar hours, please edit line information instead of trips ones.", { line: line.ref })}
					/>
				}
				
				<HoursEditor
					linetrip={trip || line}
					relid={trip ? this.props.selectedTrip : this.props.selectedLine}
				/>
			</div>}
			
			{!trip && this.state.tab === 1 && <div>
				{(line.opening_hours || line.interval) &&
					<InAlert
						message={I18n.t("This line already has hours defined. You may not need to add hours on trips if they are similar.")}
					/>
				}
				
				<List>
					{Object.entries(line.trips).map(e => {
						const [ tid, t ] = e;
						return <ListItem key={tid}>
							<ListItemAvatar>
								<transport-thumbnail
									data-transport-mode={line.type}
									data-transport-line-code={t.ref || line.ref}
									data-transport-line-color={t.colour || line.colour}>
								</transport-thumbnail>
							</ListItemAvatar>
							<ListItemText
								primary={I18n.t("Destination : %{dest}", { dest: t.to })}
								secondary={I18n.t("From : %{from}", { from: t.from })}
							/>
							<ListItemSecondaryAction>
								<Button
									edge="end"
									color="secondary"
									component={Link}
									to={"/line/"+this.props.selectedLine+"/trip/"+tid}
								>
									<CalendarEdit />
 {I18n.t("Edit hours")}
								</Button>
							</ListItemSecondaryAction>
						</ListItem>;
					})}
				</List>
			</div>}
		</div>;
	}
}

export default ContentTripLine;
