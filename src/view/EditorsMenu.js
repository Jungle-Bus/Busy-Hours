import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import I18n from 'i18nline/lib/i18n';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PubSub from 'pubsub-js';

const ID_URL = "https://openstreetmap.org/edit";
const JOSM_URL = "http://localhost:8111";

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
		let url = JOSM_URL + "/load_object?";

		if(this.props.relation) {
			url += "&objects=r" + this.props.relation + "&relation_members=true";
		}

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

		if(this.props.relation) {
			params.id = "r"+this.props.relation;
		}

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
// 			{ id: "id", name: I18n.t("iD"), tip: I18n.t("Recommended, simplest one") },
			{ id: "josm", name: I18n.t("JOSM"), tip: I18n.t("Most complete one") }
		];

		return <div style={{display: "inline-block"}}>
			<Button
				onClick={e => {
					if(editors.length > 1) {
						this.setState({ open: true, anchor: e.currentTarget });
					}
					else {
						this._click(editors[0].id);
					}
				}}
			>
				{editors.length > 1 ? I18n.t("Edit in external editor") : I18n.t("Edit in %{editor}", { editor: editors[0].name })}
			</Button>

			{editors.length > 1 && this.state.anchor &&
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
