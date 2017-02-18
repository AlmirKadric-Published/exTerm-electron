'use strict';

/**
 * Managed Windows & Sessions Lists
 * NOTE: This is place above the below requires
 * as they depend on these existing
 */
exports.windows = {};
exports.sessions = {};
exports.relayGroups = {};


/**
 * NOTE: These requires are place below the above
 * lists as they depend on the lists existing
 */
const Window = require('./Window');
const Session = require('./Session');
const RelayGroup = require('./RelayGroup');
const { BrowserWindow, ipcMain } = require('electron');


/**
 * Creates a new terminal window
 * @returns {string} window unique identifier
 */
exports.windowCreate = function () {
	const newWindow = new Window();
	return newWindow.uid;
};


/**
 * Returns the currently active window
 */
exports.windowGetActive = function () {
	const activeBrowserWindow = BrowserWindow.getFocusedWindow();
	if (!activeBrowserWindow) {
		return null;
	}

	const activeUID = activeBrowserWindow.uid;
	return exports.windows[activeUID];
};


/**
 *
 */
exports.windowMinimizeAll = function () {
	const windows = exports.windows;
	for (const windowUID of Object.keys(windows)) {
		const window = windows[windowUID];
		window.minimize();
	}
};


/**
 *
 * @returns {RelayGroup}
 */
exports.relayGroupGetCurrent = function () {
	const relayGroupCurrent = RelayGroup.getCurrent() || {};
	if (!relayGroupCurrent) {
		return null;
	}

	return relayGroupCurrent.uid;
};


/**
 *
 */
exports.relayGroupDestroyCurrent = function () {
	const relayGroupCurrent = RelayGroup.getCurrent();
	if (relayGroupCurrent) {
		relayGroupCurrent.destroy();
	}
};


/**
 *
 * @param relayGroupUID
 */
exports.relayGroupToggleAll = function (relayGroupUID) {
	let relayGroup = exports.relayGroups[relayGroupUID];
	if (!relayGroup) {
		relayGroup = new RelayGroup();
		relayGroupUID = relayGroup.uid;
	}

	const windows = exports.windows;
	for (const windowUID of Object.keys(windows)) {
		const window = windows[windowUID];
		window.relayGroupToggleWindow(relayGroupUID);
	}
};


/**
 * Creates a new shell session
 */
ipcMain.on('session:createSession', (e, options) => {
	const newSession = new Session(options);
	const sessionUID = newSession.uid;
	const paneUID = options.paneUID;

	newSession.window.browserWindow.webContents.send(`pane:${paneUID}:sessionCreated`, sessionUID);
});
