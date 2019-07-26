import CONFIG from '../config/config.json';
import OsmRequest from 'osm-request';

/**
 * DataManager allows to communicate with OSM API.
 * It retrieves relations data, and allows to edit them back.
 */
class DataManager {
	constructor() {
		// Create OSM Request
		this._osmApi = new OsmRequest({ endpoint: CONFIG.osm_api_url });
	}
	
	/**
	 * Load all data related to given relation.
	 * If relation is a route, loads route_master and all other routes.
	 * If relation is a route_master, loads all routes in it.
	 * @param {string} relationId The relation to load (example : "relation/1234")
	 * @return {Promise} Resolves on loaded data (ready to use)
	 */
	loadDataFromRelation(relationId) {
		return null;
	}
}

export default DataManager;
