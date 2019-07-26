import React, { Component } from 'react';
import AlarmPlus from 'mdi-react/AlarmPlusIcon';
import Button from '@material-ui/core/Button';
import DaysPicker from './DaysPicker';
import Grid from '@material-ui/core/Grid';
import I18n from 'i18nline/lib/i18n';
import InputAdornment from '@material-ui/core/InputAdornment';
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
				defaultValue={this.props.linetrip.rawTags.opening_hours}
				style={{width: "100%"}}
				margin="normal"
			/>
			<TextField
				label={I18n.t("Default interval between two departures on this line")}
				defaultValue={this.props.linetrip.defaultInterval !== "unset" ? this.props.linetrip.defaultInterval : null}
				type="number"
				style={{width: "100%"}}
				margin="normal"
				InputProps={{
					endAdornment: <InputAdornment position="end">min</InputAdornment>,
				}}
			/>

			<h3>{I18n.t("Other intervals")}</h3>

			{this.props.linetrip.otherIntervalsByDays && Array.isArray(this.props.linetrip.otherIntervalsByDays) && this.props.linetrip.otherIntervalsByDays.length > 0 &&
				this.props.linetrip.otherIntervalsByDays.map((intv, i) => (
					<Paper style={{padding: 10, marginBottom: 20}} key={i}>
						<Grid container alignItems="center">
							<Grid item xs={6}>
								<DaysPicker
									label={I18n.t("Days concerned")}
									selection={intv.days}
									onChange={days => console.log(days)}
								/>
							</Grid>
							<Grid item xs={6}>
								{Object.entries(intv.intervals).map((e,i) => {
									const [ hour, min ] = e;
									return <TimePeriodPicker
										fromHour={hour.split("-")[0]}
										toHour={hour.split("-")[1]}
										interval={min}
										key={i}
									/>;
								})}
							</Grid>
						</Grid>
					</Paper>
				)
			)}

				<Button color="secondary" style={{marginTop: 10}}>
					<AlarmPlus /> {I18n.t("Add a new period")}
				</Button>

		</div>;
	}
}

export default HoursEditor;
