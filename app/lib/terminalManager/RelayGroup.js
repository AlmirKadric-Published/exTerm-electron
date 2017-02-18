'use strict';

const uuid = require('node-uuid');

const { ipcMain } = require('electron');
const { relayGroups } = require('.');


//
let relayGroupCurrent = null;


/**
 * Terminal Relay Class
 * @type {RelayGroup}
 */
module.exports = class RelayGroup {
	constructor() {
		// Add to relay groups list
		const uid = this.uid = uuid.v4();
		relayGroups[uid] = this;
		relayGroupCurrent = this;

		//
		this.sessions = [];

		// Setup event handlers
		this._ptyWrite = (e, data) => this.ptyWrite(data);
		this._relayTouch = () => this.relayTouch();

		ipcMain.on(`relayGroup:${uid}:touch`, this._relayTouch);
	}

	/**
	 *
	 * @param session
	 */
	sessionAttach(session) {
		//
		const sessionUID = session.uid;
		if (session.relayGroup !== null) {
			return;
		}

		//
		ipcMain.removeListener(`session:${sessionUID}:data`, session._ptyWrite);
		ipcMain.on(`session:${sessionUID}:data`, this._ptyWrite);

		//
		session.window.browserWindow.webContents.send(`session:${sessionUID}:relayGroupJoin`, this.uid);

		//
		this.sessions.push(session);
		session.relayGroup = this;
	}

	/**
	 *
	 * @param session
	 */
	sessionDetach(session) {
		//
		const sessionUID = session.uid;
		if (this.sessions.indexOf(session) < 0) {
			return;
		}

		//
		ipcMain.removeListener(`session:${sessionUID}:data`, this._ptyWrite);
		ipcMain.on(`session:${sessionUID}:data`, session._ptyWrite);

		//
		session.window.browserWindow.webContents.send(`session:${sessionUID}:relayGroupLeave`);

		//
		const sessionI = this.sessions.indexOf(session);
		this.sessions.splice(sessionI, 1);
		session.relayGroup = null;

		//
		if (this.sessions.length === 0) {
			this.destroy();
		}
	}

	/**
	 *
	 * @param data
	 */
	ptyWrite(data) {
		for (const session of this.sessions) {
			session.ptyWrite(data);
		}
	}

	/**
	 *
	 */
	relayTouch() {
		relayGroupCurrent = this;
	}

	/**
	 *
	 */
	destroy() {
		const uid = this.uid;

		//
		// NOTE: we slice to prevent issues from mutating the original array during the loop
		for (const session of this.sessions.slice()) {
			this.sessionDetach(session);
		}

		//
		ipcMain.removeListener(`relayGroup:${uid}:touch`, this._relayTouch);

		//
		delete relayGroups[uid];

		//
		if (this === relayGroupCurrent) {
			relayGroupCurrent = null;
		}
	}
};


/**
 *
 * @returns {*}
 */
module.exports.getCurrent = function () {
	return relayGroupCurrent;
};
