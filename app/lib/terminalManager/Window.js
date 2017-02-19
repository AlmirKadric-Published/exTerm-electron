'use strict';

const uuid = require('node-uuid');
const RelayGroup = require('./RelayGroup');
const globalShortcuts = require('../shortcutManager/globalShortcuts');

const { BrowserWindow } = require('electron');
const { windows, sessions, relayGroups } = require('.');


/**
 * Terminal Window Class
 * @type {Window}
 */
module.exports = class Window {
	constructor() {
		// Add to windows list
		const uid = this.uid = uuid.v4();
		windows[uid] = this;

		// Get window state from userData store
		// TODO: IMPLEMENT THIS

		// Create our main window, we don't show it on creation since we wait
		// for it to render first and show it from within the browser side code
		this.browserWindow = new BrowserWindow({
			show: global.isDevelopmentMode
		});

		// Load entry point file into the main window
		this.browserWindow.uid = uid;
		this.browserWindow.loadURL(`file://${__dirname}/../../windows/terminalWindow/index.html?uid=${uid}`);

		// Show window and open up developer tools if in dev mode
		this.browserWindow.show();
		if (global.isDevelopmentMode) {
			this.browserWindow.webContents.openDevTools();
		}

		// Register global shortcuts on first window show as the focus event is not always fired
		globalShortcuts.registerShortcuts();

		// Setup event handlers
		this.browserWindow.on('focus', () => globalShortcuts.registerShortcuts());
		this.browserWindow.on('blur', () => globalShortcuts.unregisterShortcuts());
		this.browserWindow.on('close', () => this.closeWindow());
		this.browserWindow.on('closed', () => {
			// Destroy all sessions associated with this window
			for (const sessionUID of Object.keys(sessions)) {
				const session = sessions[sessionUID];
				if (session.window === this) {
					session.window = null;
					session.exit();
				}
			}

			// Now remove window from windows list
			this.browserWindow = null;
			delete windows[uid];
		});
	}

	/**
	 * Tells window layout manager to create a new tab
	 */
	newTab() {
		this.browserWindow.webContents.send('newTab');
	}

	/**
	 * Tells window layout manager to split current pane vertically
	 */
	splitVertical() {
		this.browserWindow.webContents.send('splitVertical');
	}

	/**
	 * Tells window layout manager to split current pane horizontally
	 */
	splitHorizontal() {
		this.browserWindow.webContents.send('splitHorizontal');
	}

	/**
	 *
	 * @param relayGroupUID
	 */
	relayGroupToggle(relayGroupUID) {
		let relayGroup = relayGroups[relayGroupUID];
		if (!relayGroup) {
			relayGroup = new RelayGroup();
			relayGroupUID = relayGroup.uid;
		}

		this.browserWindow.webContents.send('relayGroupToggle', relayGroupUID);
	}

	/**
	 *
	 * @param relayGroupUID
	 */
	relayGroupToggleTab(relayGroupUID) {
		let relayGroup = relayGroups[relayGroupUID];
		if (!relayGroup) {
			relayGroup = new RelayGroup();
			relayGroupUID = relayGroup.uid;
		}

		this.browserWindow.webContents.send('relayGroupToggleTab', relayGroupUID);
	}

	/**
	 *
	 * @param relayGroupUID
	 */
	relayGroupToggleWindow(relayGroupUID) {
		let relayGroup = relayGroups[relayGroupUID];
		if (!relayGroup) {
			relayGroup = new RelayGroup();
			relayGroupUID = relayGroup.uid;
		}

		this.browserWindow.webContents.send('relayGroupToggleWindow', relayGroupUID);
	}

	/**
	 * Tells window to select all contents of active pane buffer
	 */
	selectAll() {
		this.browserWindow.webContents.send('selectAll');
	}

	/**
	 * Tells window to begin searching within active pane buffer
	 */
	find() {
		this.browserWindow.webContents.send('find');
	}

	/**
	 * Tells window to clear active pane buffer
	 */
	clearBuffer() {
		this.browserWindow.webContents.send('clearBuffer');
	}

	/**
	 *
	 * @param modifier
	 */
	changeTextSize(modifier) {
		this.browserWindow.webContents.send('changeTextSize', modifier);
	}

	/**
	 *
	 * @param modifier
     */
	tabSelect(modifier) {
		this.browserWindow.webContents.send('tabSelect', modifier);
	}

	/**
	 *
	 * @param index
	 */
	tabSelectI(index) {
		this.browserWindow.webContents.send('tabSelectI', index);
	}

	/**
	 *
	 * @param modifier
     */
	tabMove(modifier) {
		this.browserWindow.webContents.send('tabMove', modifier);
	}

	/**
	 *
	 * @param direction
     */
	paneSelect(direction) {
		this.browserWindow.webContents.send('paneSelect', direction);
	}

	/**
	 *
	 * @param direction
     */
	paneMove(direction) {
		this.browserWindow.webContents.send('paneMove', direction);
	}

	/**
	 *
	 * @param direction
     */
	paneResize(direction) {
		this.browserWindow.webContents.send('paneResize', direction);
	}

	/**
	 * Tells window layout manager to close current pane
	 */
	closePane() {
		this.browserWindow.webContents.send('closePane');
	}

	/**
	 * Tells window layout manager to close current tab
	 */
	closeTab() {
		this.browserWindow.webContents.send('closeTab');
	}

	/**
	 * Tells window to close
	 */
	closeWindow() {
		this.browserWindow.webContents.send('closeWindow');
	}

	/**
	 * Opens window dev tools on
	 */
	toggleDevTools() {
		this.browserWindow.toggleDevTools();
	}

	/**
	 * Reloads window entry point file
	 */
	reload() {
		this.browserWindow.reload();
	}

	/**
	 *
	 */
	minimize() {
		this.browserWindow.minimize();
	}
};
