import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import UserButton from './UserButton';

/**
 * Header component is the navigation toolbar on top of page.
 */
class Header extends Component {
	render() {
		return <AppBar position="static" style={{backgroundColor: "#0267b1"}}>
			<Toolbar style={{justifyContent: "space-between"}}>
				<div>
					<img
						src="header.png"
						height={64}
						title={window.EDITOR_NAME}
						alt=""
						style={{verticalAlign: "middle", marginRight: 10}}
					/>
					<Typography variant="h6" style={{display: "inline-block"}}>
						{window.EDITOR_NAME}
					</Typography>
				</div>

				<UserButton />
			</Toolbar>
		</AppBar>;
	}
}

export default Header;
