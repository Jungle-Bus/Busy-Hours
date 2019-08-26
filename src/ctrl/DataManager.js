import CONFIG from '../config/config.json';
import OsmRequest from 'osm-request';
import PACKAGE from '../../package.json';
import TransportHours from 'transport-hours';

const VALID_MODES = [ "bus", "coach", "train", "subway", "monorail", "trolleybus", "aerialway", "funicular", "ferry", "tram", "share_taxi", "light_rail", "walking_bus" ];

/**
 * DataManager allows to communicate with OSM API.
 * It retrieves relations data, and allows to edit them back.
 */
class DataManager {
	constructor() {
		// Create OSM Request
		this._osmApi = new OsmRequest({
			endpoint: CONFIG.osm_api_url,
			oauthConsumerKey: CONFIG.oauth_consumer_key,
			oauthSecret: CONFIG.oauth_secret
		});

		this._transportHours = new TransportHours();
	}

	/**
	 * @private
	 */
	_getRelNumber(relid) {
		return relid.split("/")[1];
	}

	/**
	 * @private
	 */
	_createSimplifiedLineTrip(relid, reltags, trips) {
		if(relid.includes("/")) { relid = relid.split("/")[1]; }

		const result = Object.assign(
			{
				ref: reltags.ref,
				name: reltags.name,
				colour: reltags.colour,
				network: reltags.network,
				operator: reltags.operator,
				rawTags: reltags
			},
			this._transportHours.tagsToHoursObject(reltags)
		);

		if(reltags.type === "route") {
			result.type = reltags.route;
			result.from = reltags.from;
			result.to = reltags.to;
		}
		else {
			result.type = reltags.route_master;
			result.trips = trips;
		}

		return { [relid]: result };
	}

	/**
	 * Load all data related to given relation.
	 * If relation is a route, loads route_master and all other routes.
	 * If relation is a route_master, loads all routes in it.
	 * @param {string} relationId The relation to load (example : "relation/1234")
	 * @return {Promise} Resolves on loaded data (ready to use)
	 */
	loadDataFromRelation(relationId) {
		return new Promise((resolve, reject) => {
			this._osmApi.fetchElement(relationId)
			.then(relation => {
				const relTags = this._osmApi.getTags(relation);
				const transportMode = relTags.type === "route" ? relTags.route : relTags.route_master;

				// Check transport mode
				if(VALID_MODES.includes(transportMode)) {
					// Simple route
					if(relTags.type === "route") {
						// Fetch route_master
						this._osmApi.fetchRelationsForElement(relationId)
						.then(parentRelations => {
							const routeMasters = parentRelations.filter(r => this._osmApi.getTags(r).type === "route_master");

							// Single route master
							if(routeMasters.length === 1) {
								// Fetch other trips for this line
								const otherTripsRel = routeMasters[0].member.filter(m => m.$.type === "relation" && m.$.ref !== relationId);

								// Other trips available
								if(otherTripsRel.length > 0) {
									Promise.all(
										otherTripsRel.map(tr => this._osmApi.fetchElement(tr.$.type+"/"+tr.$.ref))
									)
									.then(otherTripsData => {
										resolve(this._createSimplifiedLineTrip(
											routeMasters[0].$.id,
											this._osmApi.getTags(routeMasters[0]),
											Object.assign({}, ...otherTripsData.map(t => this._createSimplifiedLineTrip(t.$.id, this._osmApi.getTags(t), null)))
										));
									})
									.catch(error => {
										reject("cant_get_trips");
									});
								}
								// No other trips : send back route_master + original route
								else {
									resolve(this._createSimplifiedLineTrip(
										routeMasters[0].$.id,
										this._osmApi.getTags(routeMasters[0]),
										[
											this._createSimplifiedLineTrip(relationId, relTags, null)
										]
  									));
								}
							}
							// No route master : trip used as line
							else if(routeMasters.length === 0) {
								resolve(this._createSimplifiedLineTrip(relationId, relTags, null));
							}
							else {
								reject("many_route_masters");
							}
						})
						.catch(e => {
							reject(e);
						});
					}
					// Route master
					else if(relTags.type === "route_master") {
						// Fetch trips for this line
						const tripsRel = relation.member.filter(m => m.$.type === "relation");

						// Other trips available
						if(tripsRel.length > 0) {
							Promise.all(
								tripsRel.map(tr => this._osmApi.fetchElement(tr.$.type+"/"+tr.$.ref))
							)
							.then(otherTripsData => {
								resolve(this._createSimplifiedLineTrip(
									relationId,
									this._osmApi.getTags(relation),
									Object.assign({}, ...otherTripsData.map(t => this._createSimplifiedLineTrip(t.$.id, this._osmApi.getTags(t), null)))
								));
							})
							.catch(error => {
								reject("cant_get_trips");
							});
						}
						// No other trips : send back route_master + original route
						else {
							reject("no_trips");
						}
					}
				}
				else {
					reject("invalid_mode");
				}
			})
			.catch(e => {
				reject(e);
			});
		});
	}

	/**
	 * Upload period changes made on a relation to OSM.
	 * @param {string} relationId The relation to update (example : "relation/1234")
	 * @param {Object} allPeriods Object returned by HoursEditor, containing period array (days + intervals)
	 * @return {Promise} Resolves on successful upload
	 */
	async saveRelationPeriods(relationId, allPeriods) {
		// Check if user is authenticated
		if(!window.editor_user || !window.editor_user_auth) {
			return new Error("not_connected");
		}
		this._osmApi._auth = window.editor_user_auth;

		// Convert editor data into tags
		let newTags;
		try {
			newTags = this._transportHours.intervalsObjectToTags(allPeriods);
		}
		catch(e) {
			return e;
		}

		// Retrieve data from OSM server (to ensure we have latest version)
		let osmElement;
		try {
			osmElement = await this._osmApi.fetchElement(relationId);
			if(!osmElement) { throw new Error(); }
		}
		catch(e) {
			console.error(e);
			return new Error("cant_find_relation");
		}

		// Create changeset
		let changesetId;
		try {
			changesetId = await this._osmApi.createChangeset(
				window.EDITOR_NAME+' '+PACKAGE.version,
				"Changed hours/interval of public transport route "+relationId,
				{ host: window.EDITOR_URL }
			);
		}
		catch(e) {
			console.error(e);
			return new Error("changeset_failed");
		}

		// Send data to OSM
		if(newTags && changesetId && osmElement) {
			osmElement = this._osmApi.setTags(osmElement, newTags);
			osmElement = this._osmApi.setTimestampToNow(osmElement);

			let result;
			try {
				result = await this._osmApi.sendElement(osmElement, changesetId);
				if(isNaN(result)) {
					throw new Error("Version number invalid", result);
				}
			}
			catch(e) {
				console.error(e);
				return new Error("sending_failed");
			}

			// Close changeset
			try {
				await this._osmApi.closeChangeset(changesetId);
			}
			catch(e) {
				console.error("Changeset was not closed, will be automatically closed after 30 minutes");
			}

			return true;
		}
	}
}

export default DataManager;
