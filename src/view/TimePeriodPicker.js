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
	render() {
		return <FormControl component="fieldset">
			<FormGroup
				value={this.props.value}
				row
				style={{marginTop: 5, display: "flex", justifyContent: "space-between"}}
			>
				<TimePicker
					ampm={false}
					value={null}
					label={I18n.t("From")}
					style={{width: 150}}
				/>
				
				<TimePicker
					ampm={false}
					value={null}
					label={I18n.t("To")}
					style={{marginRight: 20, marginLeft: 20, width: 150}}
				/>
				
				<TextField
					label={I18n.t("Interval")}
					type="number"
					InputProps={{
						endAdornment: <InputAdornment position="end">min</InputAdornment>,
					}}
					style={{width: 150}}
				/>
				
				<IconButton
					title={I18n.t("Delete this interval")}
					size="small"
					style={{marginLeft: 10}}
				>
					<Delete />
				</IconButton>
			</FormGroup>
		</FormControl>;
	}
}

export default TimePeriodPicker;
