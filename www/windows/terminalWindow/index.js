import React from 'react';
import ReactDOM from 'react-dom';

import TabManager from './components/TabManager';
import Layout from './states/Layout';

import './styles.less';
import 'font-awesome/css/font-awesome.css'

const { ipcRenderer, remote } = window.require('electron');


// Get current window handler
const thisWindow = remote.getCurrentWindow();


// Register globals
global.isDarwin = remote.getGlobal('isDarwin');
global.isDevelopmentMode = remote.getGlobal('isDevelopmentMode');
global.windowUID = window.location.href.replace(/.*\?.*uid=([^&]+).*/, '$1');


// Get layout data from localstorage if it exists
let layoutJSON;
try {
	const layoutData = localStorage.getItem(`windowLayout:${global.windowUID}`);
	localStorage.removeItem(`windowLayout:${global.windowUID}`);

	layoutJSON = JSON.parse(layoutData);
} catch (e) {
	layoutJSON = null;
}


// Once the page has completely downloaded, inject our multiplexer and show the window
document.onreadystatechange = function () {
	if (document.readyState === 'complete') {
		// Create either a new terminal layout or creates one from existing data
		const layout = new Layout(layoutJSON);

		// Preserve layout between reloads, but not window closes
		window.onbeforeunload = function () {
			try {
				const layoutData = JSON.stringify(layout);
				localStorage.setItem(`windowLayout:${global.windowUID}`, layoutData);
			} catch (e) {
				// On failure catch and bail
				return;
			}
		};

		// Callback to close current terminal window
		window.close = function () {
			// Controlled window close should not preserve layout state
			window.onbeforeunload = null;
			thisWindow.close()
		};


		// Setup window event handlers
		ipcRenderer.on('newTab', () => layout.tabCreate());
		ipcRenderer.on('splitVertical', () => layout.paneSplitVertical());
		ipcRenderer.on('splitHorizontal', () => layout.paneSplitHorizontal());
		ipcRenderer.on('relayGroupToggle', (e, relayGroupUID) => layout.relayGroupToggle(relayGroupUID));
		ipcRenderer.on('relayGroupToggleTab', (e, relayGroupUID) => layout.relayGroupToggleTab(relayGroupUID));
		ipcRenderer.on('relayGroupToggleWindow', (e, relayGroupUID) => layout.relayGroupToggleWindow(relayGroupUID));
		ipcRenderer.on('clearBuffer', () => layout.paneClearBuffer());
		ipcRenderer.on('changeTextSize', (e, modifier) => layout.paneChangeTextSize(modifier));
		ipcRenderer.on('tabSelect', (e, modifier) => layout.tabSelectNxtPrv(modifier));
		ipcRenderer.on('tabMove', (e, modifier) => layout.tabMove(modifier));
		ipcRenderer.on('paneSelect', (e, direction) => layout.paneSelect(direction));
		ipcRenderer.on('paneMove', (e, direction) => layout.paneMove(direction));
		ipcRenderer.on('paneResize', (e, direction) => layout.paneResize(direction));
		ipcRenderer.on('closePane', () => layout.paneClose());
		ipcRenderer.on('closeTab', () => layout.tabClose());
		ipcRenderer.on('closeWindow', () => window.close());


		// Inject REACT renderer for terminal layout data
		ReactDOM.render((
			<TabManager layout={ layout }></TabManager>
		), document.getElementById('app'));

		// TODO: replace this timeout with a proper after render callback
		setTimeout(() => {
			// Show the window once initial rendering is complete
			thisWindow.show();

			// Open up developer tools if in dev mode
			if (global.isDevelopmentMode) {
				thisWindow.webContents.openDevTools();
			}
		}, 1000);
	}
};
