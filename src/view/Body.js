import React, { Component } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import 'typeface-roboto';
import 'jungle_bus_web_components';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import blue from '@material-ui/core/colors/blue';
import orange from '@material-ui/core/colors/orange';
import Header from './Header';
import LineTrip from './LineTrip';
import LoginDialog from './LoginDialog';

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
		
		this.state = {
			lines: {
				"1234": {
					ref: "C4", type: "bus", name: "Ligne Chronostar 4",
					network: "STAR", operator: "Kéolis Rennes", colour: "purple",
					opening_hours: "Mo-Su 05:00-23:00", interval: 10,
					rawTags: { type: "route_master", route_master: "bus", ref: "C4", network: "STAR" },
					trips: {
						"4567": { from: "Grand Quartier", to: "ZA Saint-Sulpice", name: "Grand Quartier > ZA Saint-Sulpice" },
						"4568": { from: "ZA Saint-Sulpice", to: "Grand Quartier", name: "ZA Saint-Sulpice > Grand Quartier" }
					}
				}
			}
		};
	}
	
	render() {
		return <HashRouter>
			<MuiPickersUtilsProvider utils={DateFnsUtils}>
				<ThemeProvider theme={this._theme}>
					<Header {...this.state} />
					
					<div style={{margin: 10}}><Switch>
						<Route
							exact path='/line/:lid'
							render={props => <LineTrip {...this.state} {...this.props} />}
						/>
						<Route
							exact path='/line/:lid/trip/:tid'
							render={props => <LineTrip {...this.state} {...this.props} />}
						/>
					</Switch></div>
					
					<LoginDialog />
				</ThemeProvider>
			</MuiPickersUtilsProvider>
		</HashRouter>;
	}
}

export default Body;
