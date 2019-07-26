import React, { Component } from 'react';
import Alert from 'mdi-react/AlertIcon';
import AlertCircle from 'mdi-react/AlertCircleIcon';
import Information from 'mdi-react/InformationIcon';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import lightBlue from '@material-ui/core/colors/lightBlue';
import orange from '@material-ui/core/colors/orange';
import red from '@material-ui/core/colors/red';

const COLORS = { "error": red[600], "warning": orange[600], "info": lightBlue[600] };
const ICONS = { "error": AlertCircle, "warning": Alert, "info": Information };

/**
 * In alert displays a not-so important message to user inline.
 * @property {string} message The text to display
 * @property {string} [level] Importance level (info, warning, error)
 * @property {Component} [icon] An icon to display
 */
class InAlert extends Component {
	render() {
		const level = this.props.level || "info";
		const icon = this.props.icon || React.createElement(ICONS[level], { style: {verticalAlign: "middle"} });
		
		return <SnackbarContent
			message={
				<div>{icon} {this.props.message}</div>
			}
			style={{backgroundColor: COLORS[level], color: "white", verticalAlign: "middle", margin: 10}}
		>
		</SnackbarContent>;
	}
}

export default InAlert;
