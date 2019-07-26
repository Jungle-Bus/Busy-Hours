import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import I18n from 'i18nline/lib/i18n';
import PubSub from 'pubsub-js';

/**
 * Login dialog component informs user on the login procedure of OpenStreetMap.
 * It allows user to go to connect page on OSM, or create an account.
 */
class LoginDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			open: false
		};
		
		PubSub.subscribe("UI.LOGIN.WANTS", (msg, data) => {
			data = data || {};
			this.setState({ open: true });
		});
	}
	
	/**
	 * Handler for login button click.
	 * @private
	 */
	_loginClicked() {
		PubSub.publish("UI.LOGIN.SURE");
		this._closeDialog(false);
	}
	
	/**
	 * Handler for closing dialog
	 * @private
	 */
	_closeDialog(backToHome) {
		this.setState({ open: false });
		
		if(backToHome && this.props.history) {
			this.props.history.push('/');
		}
	}
	
	render() {
		return <Dialog
			open={this.state.open}
			onClose={() => this._closeDialog(true)}
		>
			<DialogTitle>{I18n.t("Connect to OpenStreetMap")}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{I18n.t("%{editor} uses OpenStreetMap accounts. Please connect to OSM or create an account in order to be able to contribute.", { editor: window.EDITOR_NAME })}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => this._closeDialog(true)} color="default">
					{I18n.t("Cancel")}
				</Button>
				<Button onClick={() => this._loginClicked()} color="primary" autoFocus>
					{I18n.t("Login or create account")}
				</Button>
			</DialogActions>
		</Dialog>;
	}
}

export default withRouter(LoginDialogComponent);

/**
 * Event when the user wants to login for sure.
 * @event UI.LOGIN.SURE
 * @memberof Events
 */
