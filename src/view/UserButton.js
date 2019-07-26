import React, { Component } from 'react';
import Account from 'mdi-react/AccountIcon';
import AccountCircle from 'mdi-react/AccountCircleIcon';
import Logout from 'mdi-react/LogoutIcon';
import Button from '@material-ui/core/Button';
import I18n from 'i18nline/lib/i18n';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PubSub from 'pubsub-js';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

/**
 * User button component handles switching between multiple states of user connection.
 */
class UserButtonComponent extends Component {
	constructor() {
		super();
		this.state = {
			connected: false,
			user: null,
			menuOpen: false,
			menuAnchor: null
		};
		
		this.psTokens = {};
	}
	
	/**
	 * Closes the menu.
	 * @private
	 */
	_closeMenu() {
		this.setState({ menuOpen: false, menuAnchor: null });
	}
	
	/**
	 * Handler for logout click.
	 * @private
	 */
	_logoutClick() {
		PubSub.publish("UI.LOGOUT.WANTS");
		this._closeMenu();
		this.setState({ connected: false, user: null });
	}
	
	render() {
		if(this.state.connected) {
			return <div style={{display: "inline"}}>
				<Tooltip title={I18n.t("Account")} placement="bottom">
					<IconButton
						color="inherit"
						onClick={e => this.setState({ menuOpen: true, menuAnchor: e.currentTarget })}
					>
						<AccountCircle />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={this.state.menuAnchor}
					open={this.state.menuOpen}
					onClose={this._closeMenu.bind(this)}
				>
					<MenuItem disabled>{this.state.user}</MenuItem>
					<MenuItem onClick={this._logoutClick.bind(this)}>
						<ListItemIcon>
							<Logout />
						</ListItemIcon>
						<Typography variant="inherit">{I18n.t("Log Out")}</Typography>
					</MenuItem>
				</Menu>
			</div>;
		}
		else {
			return <Tooltip title={I18n.t("Log In")} placement="bottom">
				<Button
					color="inherit"
					onClick={() => PubSub.publish("UI.LOGIN.WANTS")}
				>
					<Account />
					{I18n.t("Log In")}
				</Button>
			</Tooltip>;
		}
	}
	
	componentWillMount() {
		this.psTokens.login = PubSub.subscribe("UI.LOGIN.DONE", (msg, data) => {
			this.setState({ user: data.username, connected: true });
		});
	}
	
	componentWillUnmount() {
		if(this.psTokens.login) {
			PubSub.unsubscribe(this.psTokens.login);
		}
	}
}

export default UserButtonComponent;

/**
 * Event when the user wants to login.
 * @event UI.LOGIN.WANTS
 * @memberof Events
 */

/**
 * Event when user is logged in.
 * @event UI.LOGIN.DONE
 * @type {Object} Event data
 * @property {string} username The user name
 * @memberof Events
 */

/**
 * Event when the user wants to logout.
 * @event UI.LOGOUT.WANTS
 * @memberof Events
 */
