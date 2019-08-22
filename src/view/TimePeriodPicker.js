import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Delete from 'mdi-react/DeleteIcon';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import I18n from 'i18nline/lib/i18n';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { TimePicker } from "@material-ui/pickers";

/**
 * TimePeriodPicker allows to select an hour range.
 */
class TimePeriodPicker extends Component {
	constructor() {
		super();
		this.state = {
			fromDate: null,
			toDate: null,
			interval: ""
		};
	}

	componentDidMount() {
		const newState = {};

		if(this.props.fromHour) {
			newState.fromDate = this._hourStringToDateObj(this.props.fromHour);
		}

		if(this.props.toHour) {
			newState.toDate = this._hourStringToDateObj(this.props.toHour);
		}

		if(this.props.interval) {
			newState.interval = this.props.interval;
		}

		this.setState(newState);
	}

	componentDidUpdate(prevProps) {
		const newState = {};

		if(prevProps.fromHour !== this.props.fromHour) {
			newState.fromDate = this._hourStringToDateObj(this.props.fromHour);
		}

		if(prevProps.toHour !== this.props.toHour) {
			newState.toDate = this._hourStringToDateObj(this.props.toHour);
		}

		if(prevProps.interval !== this.props.interval) {
			newState.interval = this.props.interval;
		}

		if(Object.keys(newState).length > 0) {
			this.setState(newState);
		}
	}

	/**
	 * @private
	 */
	_hourStringToDateObj(hour) {
		return hour ? new Date("1970-01-01T"+hour+":00") : null;
	}

	/**
	 * @private
	 */
	_onChange(what, value) {
		if(this._callOnChange) {
			clearTimeout(this._callOnChange);
			delete this._callOnChange;
		}

		const newState = Object.assign({}, this.state);
		newState[what] = value;

		if(newState.fromDate instanceof Date && newState.toDate instanceof Date && !isNaN(parseInt(newState.interval))) {
			this._callOnChange = setTimeout(() => {
				const fromHour = newState.fromDate.toTimeString().substring(0,5);
				const toHour = newState.toDate.toTimeString().substring(0,5);
				this.props.onChange(fromHour + "-" + toHour, parseInt(newState.interval));
			}, 1000);
		}

		this.setState(newState);
	}

	render() {
		return <FormControl component="fieldset" style={{display: "block"}}>
			<FormGroup
				value={this.props.value}
				row
				style={{marginTop: 5, display: "flex", justifyContent: "space-between"}}
			>
				<TimePicker
					ampm={false}
					initialFocusedDate={new Date("1970-01-01T00:00:00")}
					value={this.state.fromDate}
					label={I18n.t("From")}
					style={{width: 80}}
					onChange={d => this._onChange("fromDate", d)}
				/>

				<TimePicker
					ampm={false}
					initialFocusedDate={new Date("1970-01-01T00:00:00")}
					value={this.state.toDate}
					label={I18n.t("To")}
					style={{marginRight: 20, marginLeft: 20, width: 80}}
					onChange={d => this._onChange("toDate", d)}
				/>

				<TextField
					label={I18n.t("Interval")}
					value={this.state.interval}
					placeholder="42"
					type="number"
					InputProps={{
						endAdornment: <InputAdornment position="end">min</InputAdornment>,
					}}
					style={{width: 150}}
					onChange={evt => this._onChange("interval", evt.target.value)}
				/>

				<IconButton
					title={I18n.t("Delete this interval")}
					size="small"
					style={{marginLeft: 10}}
					onClick={() => this.props.onDelete()}
				>
					<Delete />
				</IconButton>
			</FormGroup>
		</FormControl>;
	}
}

export default TimePeriodPicker;
