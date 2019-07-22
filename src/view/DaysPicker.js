import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import I18n from 'i18nline/lib/i18n';

/**
 * DaysPicker allows to select days in a week.
 * Shown days are localized thanks to `toLocaleDateString` browser method.
 * 
 * @property {String} label Label for the field
 * @property {String[]} selection Values to show as selected
 * @property {function} [onChange] Handler for value changes
 */
class DaysPicker extends Component {
	_getWeekDays(locale) {
		let baseDate = new Date(Date.UTC(2017, 0, 2)); // just a Monday
		const weekDays = [];
		for(let i = 0; i < 7; i++) {       
			weekDays.push({
				val: baseDate.toLocaleDateString("en-GB", { weekday: "long" }).substring(0, 2).toLowerCase(),
				lbl: baseDate.toLocaleDateString(locale, { weekday: "short" })
			});
			baseDate.setDate(baseDate.getDate() + 1);
		}
		return weekDays;
	}
	
	_onChange(evt) {
		const clicked = evt.target.value;
		let newList = this.props.selection.slice(0);
		
		if(!this.props.selection.includes(clicked)) {
			newList.push(clicked);
		}
		else {
			newList = newList.filter(v => v !== clicked);
		}
		
		this.setState({ selected: newList });
		
		if(this.props.onChange) {
			this.props.onChange(newList);
		}
	}
	
	render() {
		const days = this._getWeekDays(I18n.locale);
		
		return <FormControl component="fieldset">
			<FormLabel component="legend">{this.props.label}</FormLabel>
			<FormGroup
				value={this.props.value}
				onChange={e => this._onChange(e)}
				row
				style={{marginTop: 5}}
			>
				{days.map(d => (
					<FormControlLabel
						key={d.val}
						value={d.val}
						control={<Checkbox color="primary" />}
						label={d.lbl}
						labelPlacement="top"
						style={{margin: 0}}
						checked={this.props.selection.includes(d.val)}
					/>
				))}
			</FormGroup>
		</FormControl>;
	}
}

export default DaysPicker;
