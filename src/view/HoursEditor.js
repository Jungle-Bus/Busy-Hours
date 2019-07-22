import React, { Component } from 'react';
import AlarmPlus from 'mdi-react/AlarmPlusIcon';
import Button from '@material-ui/core/Button';
import DaysPicker from './DaysPicker';
import I18n from 'i18nline/lib/i18n';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import TimePeriodPicker from './TimePeriodPicker';

/**
 * HoursEditor component display opening hours and frequencies of current transport line/trip.
 */
class HoursEditor extends Component {
	render() {
		return <div>
			<h3>{I18n.t("General information")}</h3>
			<TextField
				label={I18n.t("Opening hours of the line")}
				defaultValue={this.props.linetrip.opening_hours}
				style={{width: "100%"}}
				margin="normal"
			/>
			<TextField
				label={I18n.t("Default interval between two departures on this line")}
				defaultValue={this.props.linetrip.interval}
				type="number"
				style={{width: "100%"}}
				margin="normal"
			/>
			
			<h3>{I18n.t("Details")}</h3>
			
			<Paper style={{padding: 10}}>
				<DaysPicker
					label={I18n.t("Days concerned")}
					selection={[]}
					onChange={days => console.log(days)}
				/>
				<br />
				<TimePeriodPicker />
				<br />
				<Button color="secondary" style={{marginTop: 10}}>
					<AlarmPlus /> {I18n.t("Add a new period")}
				</Button>
			</Paper>
		</div>;
	}
}

export default HoursEditor;
