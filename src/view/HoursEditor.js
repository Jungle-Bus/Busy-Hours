import React, { Component } from 'react';
import AlarmOff from 'mdi-react/AlarmOffIcon';
import AlarmPlus from 'mdi-react/AlarmPlusIcon';
import Button from '@material-ui/core/Button';
import DaysPicker from './DaysPicker';
import Grid from '@material-ui/core/Grid';
import I18n from 'i18nline/lib/i18n';
import Paper from '@material-ui/core/Paper';
import TimePeriodPicker from './TimePeriodPicker';

const DEFAULT_PERIOD = { days: ["mo","tu","we","th","fr"], intervals: {} };

/**
 * HoursEditor component display opening hours and frequencies of current transport line/trip.
 */
class HoursEditor extends Component {
	constructor() {
		super();

		this.state = {
			periods: null,
			showEmptyInterval: false
		};
	}

	/**
	 * Choose correct periods set from properties, state or default
	 * @private
	 */
	_getPeriods(withDefault) {
		return this.state.periods || (Array.isArray(this.props.linetrip.allComputedIntervals) && this.props.linetrip.allComputedIntervals) || (withDefault ? [ DEFAULT_PERIOD ] : []);
	}

	/**
	 * Create a new period
	 * @private
	 */
	_addPeriod() {
		const periods = this._getPeriods().slice(0);

		if(periods.length === 0) {
			this.setState({ periods: [ DEFAULT_PERIOD ] });
		}
		else {
			// Find first unused day
			const days = [ "mo", "tu", "we", "th", "fr", "sa", "su", "ph" ];
			periods.forEach(p => {
				p.days.forEach(d => {
					const id = days.indexOf(d);
					if(id >= 0) {
						days.splice(id, 1);
					}
				});
			});

			// Create new period
			periods.push({
				days: days.length > 0 ? [ days[0] ] : [],
				intervals: []
			});

			this.setState({ periods: periods });
		}
	}

	/**
	 * Edit days of an existing period
	 * @private
	 */
	_editPeriodDays(id, days) {
		const periods = this._getPeriods(true).slice(0);

		if(days && periods[id]) {
			periods[id].days = days;
			this.setState({ periods: periods });
		}
	}

	/**
	 * Add new interval in an existing period
	 * @private
	 */
	_addPeriodInterval(pid, hour, interval) {
		const periods = this._getPeriods(true).slice(0);

		if(periods[pid] && hour && interval) {
			periods[pid].intervals[hour] = interval;
			this.setState({ periods: periods, showEmptyInterval: false });
		}
	}

	/**
	 * Edit one interval of an existing period
	 * @private
	 */
	_editPeriodInterval(pid, prevHour, nextHour, nextInterval) {
		const periods = this._getPeriods(true).slice(0);

		if(periods[pid] && periods[pid].intervals[prevHour]) {
			const prevInterval = periods[pid].intervals[prevHour];

			// Hour change
			if(nextHour !== prevHour) {
				const [ prevStartH, prevEndH ] = prevHour.split("-");
				const [ nextStartH, nextEndH ] = nextHour.split("-");
				delete periods[pid].intervals[prevHour];

				// Look for other intervals having same start/end hour (to make coherent change)
				if(prevStartH !== nextStartH) {
					Object.keys(periods[pid].intervals).forEach(currHour => {
						const [ currStartH, currEndH ] = currHour.split("-");
						if(currEndH === prevStartH) {
							periods[pid].intervals[currStartH+"-"+nextStartH] = periods[pid].intervals[currHour];
							delete periods[pid].intervals[currHour];
						}
					});
				}

				if(prevEndH !== nextEndH) {
					Object.keys(periods[pid].intervals).forEach(currHour => {
						const [ currStartH, currEndH ] = currHour.split("-");
						if(currStartH === prevEndH) {
							periods[pid].intervals[nextEndH+"-"+currEndH] = periods[pid].intervals[currHour];
							delete periods[pid].intervals[currHour];
						}
					});
				}

				// Save new interval
				periods[pid].intervals[nextHour] = nextInterval;
			}
			// Interval change
			else if(prevInterval !== nextInterval) {
				periods[pid].intervals[prevHour] = nextInterval;
			}

			this.setState({ periods: periods });
		}
	}

	/**
	 * Delete a given interval for selected period
	 * @private
	 */
	_deletePeriodInterval(pid, hour) {
		const periods = this._getPeriods(true).slice(0);

		if(periods[pid] && periods[pid].intervals[hour]) {
			delete periods[pid].intervals[hour];
			this.setState({ periods: periods });
		}
	}

	/**
	 * Delete a given period
	 * @private
	 */
	_deletePeriod(pid) {
		const periods = this._getPeriods(true).slice(0);

		if(periods[pid]) {
			periods.splice(pid, 1);
			this.setState({ periods: periods });
		}
	}

	render() {
		const periods = this._getPeriods(true);

		return <div style={{marginTop: 10}}>
			{periods && periods.map((intv, pid) => {
				const intervalsSorted = Object.entries(intv.intervals).sort((a,b) => a[0].localeCompare(b[0]));

				return <Paper style={{padding: 10, marginBottom: 20}} key={pid}>
					<Grid container alignItems="center">
						<Grid item xs={12} sm={6}>
							<DaysPicker
								label={I18n.t("Days concerned")}
								selection={intv.days}
								onChange={days => this._editPeriodDays(pid, days)}
							/>

							<Button
								style={{marginTop: 10}}
								onClick={() => this._deletePeriod(pid)}
							>
								<AlarmOff /> {I18n.t("Delete this period")}
							</Button>
						</Grid>
						<Grid item xs={12} sm={6}>
							{intervalsSorted.map((e,itid) => {
								const [ hour, min ] = e;
								return <TimePeriodPicker
									fromHour={hour.split("-")[0]}
									toHour={hour.split("-")[1]}
									interval={min}
									key={itid}
									onChange={(nextHour, nextInterval) => this._editPeriodInterval(pid, hour, nextHour, nextInterval)}
									onDelete={() => this._deletePeriodInterval(pid, hour)}
								/>;
							})}

							{this.state.showEmptyInterval === pid &&
								<TimePeriodPicker
									fromHour={intervalsSorted.length > 0 ? intervalsSorted[intervalsSorted.length-1][0].split("-")[1] : null}
									onChange={(nextHour, nextInterval) => this._addPeriodInterval(pid, nextHour, nextInterval)}
									onDelete={() => this.setState({ showEmptyInterval: false })}
								/>
							}

							<Button
								color="secondary"
								style={{marginTop: 10}}
								onClick={() => this.setState({ showEmptyInterval: pid })}
							>
								<AlarmPlus /> {I18n.t("Add a new interval")}
							</Button>
						</Grid>
					</Grid>
				</Paper>;
			})}

			<Button
				color="secondary"
				style={{marginTop: 10}}
				onClick={() => this._addPeriod()}
			>
				<AlarmPlus /> {I18n.t("Add a new period")}
			</Button>

		</div>;
	}
}

export default HoursEditor;
