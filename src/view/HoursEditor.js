import React, { Component } from 'react';
import AlarmPlus from 'mdi-react/AlarmPlusIcon';
import Button from '@material-ui/core/Button';
import DaysPicker from './DaysPicker';
import Grid from '@material-ui/core/Grid';
import I18n from 'i18nline/lib/i18n';
import Paper from '@material-ui/core/Paper';
import TimePeriodPicker from './TimePeriodPicker';

/**
 * HoursEditor component display opening hours and frequencies of current transport line/trip.
 */
class HoursEditor extends Component {
	render() {
		return <div style={{marginTop: 10}}>
			{this.props.linetrip.allComputedIntervals && Array.isArray(this.props.linetrip.allComputedIntervals) && this.props.linetrip.allComputedIntervals.length > 0 && this.props.linetrip.allComputedIntervals.map((intv, i) => (
				<Paper style={{padding: 10, marginBottom: 20}} key={i}>
					<Grid container alignItems="center">
						<Grid item xs={12} sm={6}>
							<DaysPicker
								label={I18n.t("Days concerned")}
								selection={intv.days}
								onChange={days => console.log(days)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							{Object.entries(intv.intervals).sort((a,b) => a[0].localeCompare(b[0])).map((e,i) => {
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
			))}

			<Button color="secondary" style={{marginTop: 10}}>
				<AlarmPlus /> {I18n.t("Add a new period")}
			</Button>

		</div>;
	}
}

export default HoursEditor;
