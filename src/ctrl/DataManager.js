import CONFIG from '../config/config.json';
import OsmRequest from 'osm-request';
import TransportHours from 'transport-hours';

const VALID_MODES = [ "bus", "coach", "train", "subway", "monorail", "trolleybus", "aerialway", "funicular", "ferry", "tram", "share_taxi", "light_rail", "walking_bus" ];

/**
 * DataManager allows to communicate with OSM API.
 * It retrieves relations data, and allows to edit them back.
 */
class DataManager {
	constructor() {
		// Create OSM Request
		this._osmApi = new OsmRequest({ endpoint: CONFIG.osm_api_url });
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
}

export default DataManager;
