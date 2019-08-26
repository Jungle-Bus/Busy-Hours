import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import AlarmOff from 'mdi-react/AlarmOffIcon';
import AlarmPlus from 'mdi-react/AlarmPlusIcon';
import Button from '@material-ui/core/Button';
import Cancel from 'mdi-react/CancelIcon';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloudUpload from 'mdi-react/CloudUploadIcon';
import DaysPicker from './DaysPicker';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import I18n from 'i18nline/lib/i18n';
import InAlert from './InAlert';
import Paper from '@material-ui/core/Paper';
import PubSub from 'pubsub-js';
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
			showEmptyInterval: false,
			alert: null,
			notConnectedAlert: false,
			uploading: false
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
	 * Create a shallow copy of given periods object for editing
	 * @private
	 */
	_copyPeriods(periods) {
		return periods.slice(0).map(p => {
			const newP = Object.assign({}, p);
			newP.days = p.days.slice(0);
			newP.intervals = Object.assign({}, p.intervals);
			return newP;
		});
	}

	/**
	 * Create a new period
	 * @private
	 */
	_addPeriod() {
		const periods = this._copyPeriods(this._getPeriods());

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
				intervals: {}
			});

			this.setState({ periods: periods });
			this.props.onEdit(periods);
		}
	}

	/**
	 * Edit days of an existing period
	 * @private
	 */
	_editPeriodDays(id, days) {
		const periods = this._copyPeriods(this._getPeriods(true));

		if(days && periods[id]) {
			periods[id].days = days;
			this.setState({ periods: periods });
			this.props.onEdit(periods);
		}
	}

	/**
	 * Add new interval in an existing period
	 * @private
	 */
	_addPeriodInterval(pid, hour, interval) {
		const periods = this._copyPeriods(this._getPeriods(true));

		if(periods[pid] && hour && interval) {
			periods[pid].intervals[hour] = interval;
			this.setState({ periods: periods, showEmptyInterval: false });
			this.props.onEdit(periods);
		}
	}

	/**
	 * Edit one interval of an existing period
	 * @private
	 */
	_editPeriodInterval(pid, prevHour, nextHour, nextInterval) {
		const periods = this._copyPeriods(this._getPeriods(true));

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
			this.props.onEdit(periods);
		}
	}

	/**
	 * Delete a given interval for selected period
	 * @private
	 */
	_deletePeriodInterval(pid, hour) {
		const periods = this._copyPeriods(this._getPeriods(true));

		if(periods[pid] && periods[pid].intervals[hour]) {
			delete periods[pid].intervals[hour];
			this.setState({ periods: periods });
			this.props.onEdit(periods);
		}
	}

	/**
	 * Delete a given period
	 * @private
	 */
	_deletePeriod(pid) {
		const periods = this._copyPeriods(this._getPeriods(true));

		if(periods[pid]) {
			periods.splice(pid, 1);
			this.setState({ periods: periods });
			this.props.onEdit(periods);
		}
	}

	/**
	 * Event handler after click on send button
	 * @private
	 */
	_onSend() {
		if(this.state.periods && this.props.dataManager) {
			this.setState({ uploading: true });

			this.props.dataManager
			.saveRelationPeriods("relation/"+this.props.relid, this.state.periods)
			.then(() => {
				// Clear tmp data
				this.props.onEdit(null);
				this.setState({ periods: null, uploading: false }, () => {
					// Show success message
					alert(I18n.t("Your edits were successfully sent to OSM"));

					// Redirect to data loader
					this.props.history.push("/load/"+this.props.relid);
				});
			})
			.catch(e => {
				// Show failure message
				let message = e.message ? e.message : e.toString();
				if(message === "not_connected") { message = I18n.t("You have to be connected before sending your edits"); }
				else if(message === "changeset_failed") { message = I18n.t("OSM server is not able to create a changeset for now"); }
				else if(message === "cant_find_relation") { message = I18n.t("This public transport route is not available on OSM server"); }
				else if(message === "sending_failed") { message = I18n.t("An error happened when sending your changes to OSM server"); }

				this.setState({ uploading: false, alert: { message: message } }, () => {
					setTimeout(() => this.setState({ alert: null }), 5000);
				});
			});
		}
	}

	/**
	 * Event handler after cancel button click
	 * @private
	 */
	_onCancel() {
		this.setState({ periods: null });
		this.props.onEdit(null);
	}

	render() {
		if(this.state.uploading) {
			return <div style={{marginTop: 10, textAlign: "center"}}>
				<CircularProgress style={{verticalAlign: "middle", marginRight: 10}} /> {I18n.t("Uploading your edits")}
			</div>;
		}
		else {
			const periods = this._getPeriods(true);

			return <div style={{marginTop: 10}}>
				{this.state.alert &&
					<InAlert
						level={this.state.alert.level || "warning"}
						message={this.state.alert.message}
					/>
				}

				{this.state.periods &&
					<Grid container alignItems="center" spacing={2} style={{marginBottom: 10}}>
						<Grid item xs={12} sm={6}>
							{I18n.t("You have edited this line hours.")}
						</Grid>
						<Grid item xs={6} sm={3}>
							<Button
								variant="contained"
								color="primary"
								style={{width: "100%"}}
								onClick={() => this._onSend()}
							>
								<CloudUpload /> {I18n.t("Send to OSM")}
							</Button>
						</Grid>
						<Grid item xs={6} sm={3}>
							<Button
								variant="contained"
								color="secondary"
								style={{width: "100%"}}
								onClick={() => this._onCancel()}
							>
								<Cancel /> {I18n.t("Cancel all")}
							</Button>
						</Grid>
					</Grid>
				}

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

	componentDidMount() {
		if(this.props.editedPeriods) {
			this.setState({ periods: this.props.editedPeriods });
		}

		if(!window.editor_user || !window.editor_user_auth) {
			this.setState({ alert: { level: "info", message: I18n.t("You have to be connected to edit line hours") }, notConnectedAlert: true });
		}

		this.psTokenLogin = PubSub.subscribe("APP.USER.READY", (msg, data) => {
			if(data && this.state.notConnectedAlert) {
				this.setState({ alert: null, notConnectedAlert: false });
			}
		});

		this.psTokenLogout = PubSub.subscribe("APP.USER.LOGOUT", (msg, data) => {
			if(!this.state.notConnectedAlert) {
				this.setState({ alert: { level: "info", message: I18n.t("You have to be connected to edit line hours") }, notConnectedAlert: true });
			}
		});
	}

	componentDidUpdate(prevProps) {
		if(!deepEqual(this.props.editedPeriods, this.state.periods)) {
			this.setState({ periods: this.props.editedPeriods });
		}

		if(!this.state.notConnectedAlert && (!window.editor_user || !window.editor_user_auth)) {
			this.setState({ alert: { level: "info", message: I18n.t("You have to be connected to edit line hours") }, notConnectedAlert: true });
		}

		if(this.state.notConnectedAlert && window.editor_user && window.editor_user_auth) {
			this.setState({ alert: null, notConnectedAlert: false });
		}
	}

	componentWillUnmount() {
		if(this.psTokenLogin) {
			PubSub.unsubscribe("APP.USER.READY", this.psTokenLogin);
		}
		if(this.psTokenLogout) {
			PubSub.unsubscribe("APP.USER.LOGOUT", this.psTokenLogout);
		}
	}
}

export default withRouter(HoursEditor);
