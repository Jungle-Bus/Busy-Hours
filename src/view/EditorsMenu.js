import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import I18n from 'i18nline/lib/i18n';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PubSub from 'pubsub-js';

// const RGX_OSMID = /^(node|way|relation)\/\d+$/;
const ID_URL = "https://openstreetmap.org/edit";
const JOSM_URL = "http://localhost:27000?";

Math.toRadians = function(degrees) {
	return degrees * Math.PI / 180;
};

Math.toDegrees = function(radians) {
	return radians * 180 / Math.PI;
};

/**
 * EditorsMenu component display editor selection menu, and launch appropriate action.
 */
class EditorsMenu extends Component {
	constructor() {
		super();
		
		this.state = {
			open: false,
			anchor: false
		};
	}
	
	/**
	 * Close the menu
	 * @private
	 */
	_onClose() {
		this.setState({ open: false, anchor: null });
	}
	
	/**
	 * Opens and zoom in JOSM on current picture area.
	 * @private
	 */
	_editJOSM() {
		//Find bbox
		const Y = 47.7; /*this.props.feature.coordinates[0];*/
		const X = -1.17; /*this.props.feature.coordinates[1];*/
		const R = 6371000;
		const radius = 50;
		const x1 = X - Math.toDegrees(radius / R / Math.cos(Math.toRadians(Y)));
		const x2 = X + Math.toDegrees(radius / R / Math.cos(Math.toRadians(Y)));
		const y1 = Y - Math.toDegrees(radius / R);
		const y2 = Y + Math.toDegrees(radius / R);

		let url = JOSM_URL+"left="+x1+"&right="+x2+"&top="+y2+"&bottom="+y1;
		
// 		if(this.props.feature.properties.id && RGX_OSMID.test(this.props.feature.properties.id)) {
// 			const parts = this.props.feature.properties.id.split("/");
// 			url += "&select=" + parts[0] + parts[1];
// 		}
		
		fetch(url)
		.then(response => {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Opened in JOSM") });
		})
		.catch(error => {
			console.error(error);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't open in JOSM, are you sure remote control is enabled ?") });
		});
	}
	
	/**
	 * Opens ID editor on current picture area.
	 * @private
	 */
	_editId() {
		let url = ID_URL + "#";
		
		const params = {
// 			map: "21/"+this.props.feature.coordinates.join("/"),
			hashtags: "#"+window.EDITOR_NAME.replace(/ /g, "_")
		};
		
// 		if(this.props.feature.properties.id && RGX_OSMID.test(this.props.feature.properties.id)) {
// 			const parts = this.props.feature.properties.id.split("/");
// 			params.id = parts[0].substring(0, 1) + parts[1];
// 		}
		
		url += Object.entries(params).map(p => p[0] + "=" + encodeURIComponent(p[1])).join("&");
		
		window.open(
			url,
			"_blank"
		).focus();
	}
	
	_click(editor) {
		this._onClose();
		switch(editor) {
			case "id":
				this._editId();
				break;
			case "josm":
				this._editJOSM();
				break;
			default:
		}
	}
	
	render() {
		const editors = [
			{ id: "id", name: I18n.t("iD"), tip: I18n.t("Recommended, simplest one") },
			{ id: "josm", name: I18n.t("JOSM"), tip: I18n.t("Most complete one") }
		];
		
		return <div style={{display: "inline-block"}}>
			<Button
				onClick={e => this.setState({ open: true, anchor: e.currentTarget })}
			>
				{I18n.t("Edit in external editor")}
			</Button>
			
			{this.state.anchor &&
				<Menu
					id="editors-menu"
					anchorEl={this.state.anchor}
					open={this.state.open}
					keepMounted
					onClose={() => this._onClose()}
				>
					{editors.map(e => {
						return <MenuItem key={e.id} onClick={() => this._click(e.id)}><ListItemText primary={e.name} secondary={e.tip} /></MenuItem>
					})}
				</Menu>
			}
		</div>;
	}
}

export default EditorsMenu;
