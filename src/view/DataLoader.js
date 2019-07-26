import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import I18n from 'i18nline/lib/i18n';
import InAlert from './InAlert';

const ERROR_DETAILS = {
	"cant_get_trips": I18n.t("OSM API can't retrieve all trips associated to this line."),
	"many_route_masters": I18n.t("This line is not consistent : many route_master relations are associated to this line."),
	"invalid_mode": I18n.t("This line is using a transport mode which is not handled (maybe incorrect ?)."),
	"no_trips": I18n.t("This route master doesn't have any route associated.")
};

/**
 * DataLoader is a component for calling DataManager to load wanted relation.
 * It also shows some waiting widget to user.
 */
class DataLoader extends Component {
	constructor() {
		super();
		
		this.state = {
			loading: true,
			error: false
		};
	}
	
	render() {
		return <div style={{textAlign: "center", padding: 30}}>
			{this.state.loading &&
				<CircularProgress size={50} />
			}
			
			{this.state.error && ERROR_DETAILS[this.state.error] &&
				<InAlert
					message={ERROR_DETAILS[this.state.error]}
					level="error"
				/>
			}
			
			{this.state.error === "invalid_id" &&
				<InAlert
					message={I18n.t("The given relation ID is invalid. Please only give the number in the relation ID (example : 1234).")}
					level="warning"
				/>
			}
			
			{this.state.error === "api_failed" &&
				<InAlert
					message={I18n.t("Oops ! OpenStreetMap API seems unavailable. Please retry a bit later.")}
					level="error"
				/>
			}
		</div>;
	}
	
	componentDidMount() {
		const relId = this.props.match.params.rid;
		if(!isNaN(parseInt(relId))) {
			this.setState({ loading: true, error: false });
			
			// Load the relation
			this.props.dataManager
			.loadDataFromRelation("relation/"+relId)
			.then(data => {
				this.setState({ loading: false, error: false });
				this.props.onDataLoaded(data);
				
				// Redirect to proper page
				const lineIds = Object.keys(data);
				if(lineIds.length > 0) {
					const page = lineIds.includes(relId) ? "/line/" + relId : "/line/" + lineIds[0] + "/trip/" + relId;
					
					if(this.props.history.location.pathname !== page) {
						this.props.history.push(page);
					}
				}
			})
			.catch(error => {
				this.setState({ loading: false, error: ERROR_DETAILS[error] ? error : "api_failed" });
				console.error(error);
			});
		}
		else {
			this.setState({ loading: false, error: "invalid_id" });
		}
	}
}

export default withRouter(DataLoader);
