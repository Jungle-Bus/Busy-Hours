import React, { Component } from 'react';
import AlarmOff from 'mdi-react/AlarmOffIcon';
import AlarmPlus from 'mdi-react/AlarmPlusIcon';
import Button from '@material-ui/core/Button';
import DaysPicker from './DaysPicker';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import I18n from 'i18nline/lib/i18n';
import TimePeriodPicker from './TimePeriodPicker';

/**
 * Period editor allows to edit days and intervals of a single period.
 */
class PeriodEditor extends Component {
	constructor() {
		super();

		this.state = {
			days: [],
			intervals: null,
			showEmptyInterval: false
		};
	}

	_onDaysChanged(days) {
		this.setState({ days: days }, () => this._notityParent());
	}

	_notityParent() {
		if(
			!this.state.showEmptyInterval
			&& this.state.days.length > 0
			&& this.state.intervals
			&& Object.keys(this.state.intervals).length > 0
			&& Object.entries(this.state.intervals).filter(e => !e[0].match(/^\d{2}:\d{2}-\d{2}:\d{2}$/) || isNaN(e[1])).length === 0
		) {
			this.props.onValid({ days: this.state.days, intervals: this.state.intervals });
		}
		else {
			console.log("invalid", this.state);
			this.props.onInvalid();
		}
	}

	_editInterval(prevHour, nextHour, nextInterval) {
		const newIntervals = this.state.intervals === null ? {} : Object.assign({}, this.state.intervals);

		if(prevHour) {
			delete newIntervals[prevHour];
		}

		if(nextHour) {
			newIntervals[nextHour] = nextInterval || null;
		}

		this.setState({ intervals: Object.keys(newIntervals).length > 0 ? newIntervals : null }, () => this._notityParent());
	}

	render() {
		const intervalsSorted = this.state.intervals ? Object.entries(this.state.intervals).sort((a,b) => a[0].localeCompare(b[0])) : [];

		return <Grid container alignItems="center">
			<Grid item xs={12} sm={6}>
				<DaysPicker
					label={I18n.t("Days concerned")}
					selection={this.state.days}
					onChange={days => this._onDaysChanged(days)}
				/>

				<Button
					style={{marginTop: 10}}
					onClick={() => this.props.onDelete()}
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
						onChange={(nextHour, nextInterval) => this._editInterval(hour, nextHour, nextInterval)}
						onDelete={() => this._editInterval(hour)}
						onInvalid={() => this.props.onInvalid()}
					/>;
				})}

				{this.state.showEmptyInterval &&
					<TimePeriodPicker
						fromHour={intervalsSorted.length > 0 ? intervalsSorted[intervalsSorted.length-1][0].split("-")[1] : null}
						onChange={(nextHour, nextInterval) => {
							this.setState({ showEmptyInterval: false }, () => {
								this._editInterval(null, nextHour, nextInterval);
							});
						}}
						onDelete={() => this.setState({ showEmptyInterval: false })}
						onInvalid={() => this.props.onInvalid()}
					/>
				}

				<Button
					color="secondary"
					style={{marginTop: 10}}
					onClick={() => {
						this.props.onInvalid();
						this.setState({ showEmptyInterval: true });
					}}
				>
					<AlarmPlus /> {I18n.t("Add a new interval")}
				</Button>
			</Grid>
		</Grid>;
	}

	componentDidMount() {
		if(this.props.period) {
			this.setState(this.props.period);
		}
	}

	componentDidUpdate(prevProps) {
		if(this.props.period) {
			if(!prevProps.period || !prevProps.period.days || !deepEqual(prevProps.period.days, this.props.period.days)) {
				this.setState({ days: this.props.period.days });
			}

			if(!prevProps.period || !prevProps.period.intervals || !deepEqual(prevProps.period.intervals, this.props.period.intervals)) {
				this.setState({ intervals: this.props.period.intervals });
			}
		}
		else {
			this.setState({ days: [], intervals: {} });
		}
	}
}

export default PeriodEditor;
