import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

/**
 * Header component is the navigation toolbar on top of page.
 */
class Header extends Component {
	render() {
		return <AppBar position="static">
			<Toolbar style={{justifyContent: "space-between"}}>
				<Typography variant="h6">
					{window.EDITOR_NAME}
				</Typography>
				<Button color="inherit">Login</Button>
			</Toolbar>
		</AppBar>;
	}
}

export default Header;
