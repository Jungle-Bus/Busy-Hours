import React, { Component } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import 'typeface-roboto';
import 'jungle_bus_web_components';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Container from '@material-ui/core/Container';
import DataLoader from './DataLoader';
import DateFnsUtils from '@date-io/date-fns';
import blue from '@material-ui/core/colors/blue';
import orange from '@material-ui/core/colors/orange';
import Header from './Header';
import LineTrip from './LineTrip';
import LoginDialog from './LoginDialog';
import Welcome from './Welcome';

/**
 * Body is the view main class.
 * It creates all other component in cascade.
 */
class Body extends Component {
	constructor() {
		super();
		
		// Set main colors of app
		this._theme = createMuiTheme({
			palette: {

				primary: blue,

				secondary: {
					light: orange[500],
					main: orange[800],
					dark: orange[900]
				},

			}
		});
		
		this.state = {};
	}
	
	_onDataLoaded(newData) {
		this.setState({ lines: newData });
		console.log("Loaded data", newData);
	}
	
	render() {
		return <HashRouter>
			<MuiPickersUtilsProvider utils={DateFnsUtils}>
				<ThemeProvider theme={this._theme}>
					<Header {...this.state} />
					
					<Container maxWidth="md" style={{marginTop: 20, marginBottom: 20}}><Switch>
						<Route exact path='/' component={Welcome} />
						
						<Route
							exact
							path={this.state.lines ? '/load/:rid' : ['/load/:rid', '/line/:rid', '/line/:lid/trip/:rid' ]}
							render={props => (
								<DataLoader
									{...props}
									{...this.props}
									onDataLoaded={d => this._onDataLoaded(d)}
								/>
							)}
						/>
						
						{this.state.lines && [
							<Route
								key={0}
								exact path='/line/:lid'
								render={props => <LineTrip {...this.state} {...this.props} />}
							/>,
							<Route
								key={1}
								exact path='/line/:lid/trip/:tid'
								render={props => <LineTrip {...this.state} {...this.props} />}
							/>
						]}
					</Switch></Container>
					
					<LoginDialog />
				</ThemeProvider>
			</MuiPickersUtilsProvider>
		</HashRouter>;
	}
}

export default Body;
