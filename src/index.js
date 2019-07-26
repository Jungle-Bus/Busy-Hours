import React from 'react';
import ReactDOM from 'react-dom';
import Body from './view/Body';
import CONFIG from './config/config.json';
import DataManager from './ctrl/DataManager';
import I18n from 'i18nline/lib/i18n';
import OsmAuth from 'osm-auth';
import PubSub from 'pubsub-js';

/*
 * Global variables definition
 */
window.EDITOR_NAME = CONFIG.editor_name;
const LOCALES = [ "en" ];
window.EDITOR_URL = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + "/";

/**
 * App is the application starter.
 * It creates mostly everything.
 */
class App {
	constructor() {
		this._initI18n();
		this._initCtrl();
		this._initView();
		this._initAuth();
	}
	
	/**
	 * Initializes internationalization system
	 * @private
	 */
	_initI18n() {
		let locale = null;
		if(window.navigator.languages) {
			for(const l of window.navigator.languages) {
				if(LOCALES.includes(l)) {
					locale = l;
					break;
				}
			}
		}
		
		I18n.locale = locale || window.navigator.userLanguage || window.navigator.language;
		I18n.fallbacks = true;
		
		//Load translation files
		for(const l of LOCALES) {
			Object.assign(I18n.translations, require("./config/locales/"+l.replace("-", "_")+".json"));
		}
		
		window.I18n = I18n;
	}
	
	/**
	 * Creates controller objects.
	 * @private
	 */
	_initCtrl() {
		this._dataManager = new DataManager();
	}
	
	/**
	 * Create view components
	 * @private
	 */
	_initView() {
		ReactDOM.render(<Body dataManager={this._dataManager} />, document.getElementById('root'));
		document.title=window.EDITOR_NAME;
	}
	
	/**
	 * Initializes authentication system.
	 * @private
	 */
	_initAuth() {
		const opts = {
			url: CONFIG.osm_api_url,
			oauth_consumer_key: CONFIG.oauth_consumer_key,
			oauth_secret: CONFIG.oauth_secret,
			landing: window.location.pathname + window.location.hash,
			singlepage: true
		};
		this.auth = OsmAuth(opts);
		
		const params = this._readURLParams(window.location.href);
		const token = params.oauth_token || localStorage.getItem("oauth_token") || null;
		
		if(token) {
			this.auth.bootstrapToken(token, () => {
				this._checkAuth();
				window.history.pushState({}, "", window.location.href.replace("?oauth_token="+token, ""));
				localStorage.setItem("oauth_token", token);
			});
		}
		else {
			//Check if we receive auth token
			this._checkAuth();
			this.authWait = setInterval(this._checkAuth.bind(this), 100);
		}
		
		PubSub.subscribe("UI.LOGIN.SURE", (msg, data) => {
			opts.landing = window.location.pathname + window.location.hash;
			this.auth.options(opts);
			
			if(!this.auth.authenticated()) {
				this.auth.authenticate((err, res) => {
					if(err) {
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when trying to log you in") });
					}
					else {
						this._checkAuth();
					}
				});
			}
		});
		
		PubSub.subscribe("UI.LOGOUT.WANTS", (msg, data) => {
			if(this.auth && this.auth.authenticated()) {
				this.auth.logout();
			}
			
			this.user = null;
			localStorage.removeItem("oauth_token");
			PubSub.publish("USER.INFO.READY", this.user);
		});
		
		PubSub.subscribe("USER.INFO.WANTS", (msg, data) => {
			PubSub.publish("USER.INFO.READY", this.user);
		});
	}
	
	/**
	 * Check if authentication happened
	 * @private
	 */
	_checkAuth() {
		if(this.auth.authenticated()) {
			if(this.authWait) {
				clearInterval(this.authWait);
			}
			
			//Get user details
			this.auth.xhr({
				method: 'GET',
				path: '/api/0.6/user/details'
			}, (err, details) => {
				if(err) {
					console.log(err);
					this.auth.logout();
				}
				else {
					try {
						this.user = {
							id: details.firstChild.childNodes[1].attributes.id.value,
							name: details.firstChild.childNodes[1].attributes.display_name.value,
							auth: this.auth
						};
						
						PubSub.publish("UI.LOGIN.DONE", { username: this.user.name });
					}
					catch(e) {
						console.error(e);
						PubSub.publish("UI.LOGOUT.WANTS");
					}
				}
			});
		}
	}
	
	/**
	 * Parse URL parameters
	 * @private
	 */
	_readURLParams(str) {
		const u = str.split('?');
		
		if(u.length > 1) {
			const p = u[1].split('#')[0];
			
			return p.split('&').filter(function (pair) {
				return pair !== '';
			}).reduce(function(obj, pair){
				var parts = pair.split('=');
				obj[decodeURIComponent(parts[0])] = (null === parts[1]) ?
					'' : decodeURIComponent(parts[1]);
				return obj;
			}, {});
		}
		else {
			return {};
		}
	}
}

// Create app
new App();
