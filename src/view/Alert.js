import React, { Component } from 'react';
import Close from 'mdi-react/CloseIcon';
import IconButton from '@material-ui/core/IconButton';
import PubSub from 'pubsub-js';
import Snackbar from '@material-ui/core/Snackbar';

/**
 * Alert component handles non-blocking dialogs display to user.
 * This component listens to {@link Events|UI.MESSAGE.BASIC} events.
 */
class Alert extends Component {
	constructor() {
		super();
		this.state = {
			duration: 5000,
			message: "",
			type: "info",
			open: false
		};

		PubSub.subscribe("UI.MESSAGE.BASIC", (msg, data) => {
			this.setState({
				message: data.message+(data.details ? " ("+data.details+")" : ""),
				duration: data.duration || (data.details ? 7000 : 5000),
				type: data.type || "info",
				open: true
			});
		});
	}

	render() {
		return <Snackbar
			open={this.state.open}
			autoHideDuration={this.state.duration}
			onClose={() => this.setState({ open: false })}
			message={this.state.message}
			action={[
				<IconButton
					key="close"
					onClick={() => this.setState({ open: false })}
					color="inherit"
				>
					<Close />
				</IconButton>
			]}
		/>;
	}
}

export default Alert;

/**
 * Event for displaying a non-blocking message to user.
 * @event UI.MESSAGE.BASIC
 * @type {Object} Event data
 * @property {string} [type] The kind of message (error, alert, info). Defaults to info.
 * @property {string} message The message text.
 * @property {int} [duration] The message display duration in milliseconds. Defaults to 3000.
 * @memberof App
 */
