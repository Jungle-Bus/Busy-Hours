import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import I18n from 'i18nline/lib/i18n';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Link } from 'react-router-dom';
import LineList from './LineList';
import Magnify from 'mdi-react/MagnifyIcon';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

/**
 * Welcome component is the main page content.
 * From there you can search for a particular relation.
 */
class Welcome extends Component {
	constructor() {
		super();

		this.state = {
			searchText: ""
		};
	}

	render() {
		return <div>
			<div style={{marginTop: 30, marginBottom: 30}}>
				<Typography>{I18n.t("Busy Hours is a public transport editor for OpenStreetMap. You can easily edit details of public transport lines.")}</Typography>
				<Typography>{I18n.t("To start, enter a transport line relation ID in the search field below.")}</Typography>
			</div>

			<TextField
				id="relation-id-field"
				ref="relnumber"
				type="text"
				placeholder="1234567"
				variant="outlined"
				label={I18n.t("Relation ID")}
				style={{width: "100%", marginBottom: 30}}
				value={this.state.searchText}
				onChange={e => this.setState({ searchText: e.target.value })}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<IconButton
								component={Link}
								to={"/load/"+this.state.searchText.trim()}
							>
								<Magnify />
							</IconButton>
						</InputAdornment>
					)
				}}
			/>

			{this.props.previousLines && Object.keys(this.props.previousLines).length > 0 && [
				<Typography key={0}>{I18n.t("Previously loaded lines")}</Typography>
				,
				<LineList key={1} data={this.props.previousLines} />
			]}
		</div>;
	}

	componentDidMount() {
		this.refs.relnumber.addEventListener("keyup", evt => {
			if(evt.key === "Enter") {
				this.props.history.push("/load/"+this.state.searchText.trim());
			}
		});
	}
}

export default withRouter(Welcome);
