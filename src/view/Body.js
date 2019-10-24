import React, { Component } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import 'typeface-roboto';
import 'jungle_bus_web_components';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Alert from './Alert';
import Container from '@material-ui/core/Container';
import DataLoader from './DataLoader';
import DateFnsUtils from '@date-io/date-fns';
import blue from '@material-ui/core/colors/blue';
import orange from '@material-ui/core/colors/orange';
import Header from './Header';
import LineTrip from './LineTrip';
import LoginDialog from './LoginDialog';
import Welcome from './Welcome';

const STORAGE_ID = "previous_lines";

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

	/**
	 * Get the list of previously loaded lines from local storage
	 * @private
	 */
	_getPreviousLinesInStorage() {
		return JSON.parse(window.localStorage.getItem(STORAGE_ID) || '{}');
	}

	_onDataLoaded(newData) {
		this.setState({ lines: newData });
		console.log("Loaded data", newData);

		// Append loaded data into localStorage
		const inStore = this._getPreviousLinesInStorage();
		const toAppend = {};
		Object.entries(newData).forEach(e => {
			const [ id, val ] = e;
			toAppend[id] = {
				colour: val.colour,
				name: val.name,
				ref: val.ref,
				type: val.type,
				operator: val.operator,
				ts: parseInt(Math.floor(Date.now() / 1000)) // To allow sort
			};
		});

		try {
			window.localStorage.setItem(STORAGE_ID, JSON.stringify(Object.assign(inStore, toAppend)));
		}
		catch(e) {
			try {
				window.localStorage.clear();
				window.localStorage.setItem(STORAGE_ID, JSON.stringify(toAppend));
			}
			catch(e) {
				console.error(e);
			}
		}
	}

	render() {
		return <HashRouter>
			<MuiPickersUtilsProvider utils={DateFnsUtils}>
				<ThemeProvider theme={this._theme}>
					<Header {...this.state} />

					<Container maxWidth="md" style={{marginTop: 20, marginBottom: 20}}><Switch>
						<Route
							exact
							path='/'
							render={props => (
								<Welcome
									{...props}
									previousLines={this._getPreviousLinesInStorage()}
								/>
							)}
						/>

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

					<Alert />
				</ThemeProvider>
			</MuiPickersUtilsProvider>
		</HashRouter>;
	}
}

export default Body;
