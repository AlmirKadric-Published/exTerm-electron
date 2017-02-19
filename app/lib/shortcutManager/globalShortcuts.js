'use strict';

const terminalManager = require('../terminalManager');

const { globalShortcut } = require('electron');

const {
	DIRECTION_LEFT, DIRECTION_RIGHT,
	DIRECTION_TOP, DIRECTION_BOTTOM
} = require('../../constants.js');


/**
 *
 */
exports.unregisterShortcuts = () => {
	//
	globalShortcut.unregister('CommandOrControl+Up');
	globalShortcut.unregister('CommandOrControl+Down');
	globalShortcut.unregister('CommandOrControl+Left');
	globalShortcut.unregister('CommandOrControl+Right');

	//
	globalShortcut.unregister('CommandOrControl+Shift+Up');
	globalShortcut.unregister('CommandOrControl+Shift+Down');
	globalShortcut.unregister('CommandOrControl+Shift+Left');
	globalShortcut.unregister('CommandOrControl+Shift+Right');

	//
	globalShortcut.unregister('CommandOrControl+1');
	globalShortcut.unregister('CommandOrControl+2');
	globalShortcut.unregister('CommandOrControl+3');
	globalShortcut.unregister('CommandOrControl+4');
	globalShortcut.unregister('CommandOrControl+5');
	globalShortcut.unregister('CommandOrControl+6');
	globalShortcut.unregister('CommandOrControl+7');
	globalShortcut.unregister('CommandOrControl+8');
	globalShortcut.unregister('CommandOrControl+9');
};


/**
 *
 */
exports.registerShortcuts = () => {
	const windowGetActive = terminalManager.windowGetActive;

	// Clear registrations first
	exports.unregisterShortcuts();

	// Register shortcuts for panes selection
	// HACK: The below accelerators don't work from the menu, so we register them globally
	globalShortcut.register('CommandOrControl+Up', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_TOP);
	});
	globalShortcut.register('CommandOrControl+Down', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_BOTTOM);
	});
	globalShortcut.register('CommandOrControl+Left', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_LEFT);
	});
	globalShortcut.register('CommandOrControl+Right', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_RIGHT);
	});

	// Register shortcuts for pane movement
	// HACK: The below accelerators don't work from the menu, so we register them globally
	globalShortcut.register('CommandOrControl+Shift+Up', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_TOP);
	});
	globalShortcut.register('CommandOrControl+Shift+Down', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_BOTTOM);
	});
	globalShortcut.register('CommandOrControl+Shift+Left', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_LEFT);
	});
	globalShortcut.register('CommandOrControl+Shift+Right', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_RIGHT);
	});

	// Register shortcuts for tab selection
	globalShortcut.register('CommandOrControl+1', () => {
		windowGetActive() && windowGetActive().tabSelectI(0);
	});
	globalShortcut.register('CommandOrControl+2', () => {
		windowGetActive() && windowGetActive().tabSelectI(1);
	});
	globalShortcut.register('CommandOrControl+3', () => {
		windowGetActive() && windowGetActive().tabSelectI(2);
	});
	globalShortcut.register('CommandOrControl+4', () => {
		windowGetActive() && windowGetActive().tabSelectI(3);
	});
	globalShortcut.register('CommandOrControl+5', () => {
		windowGetActive() && windowGetActive().tabSelectI(4);
	});
	globalShortcut.register('CommandOrControl+6', () => {
		windowGetActive() && windowGetActive().tabSelectI(5);
	});
	globalShortcut.register('CommandOrControl+7', () => {
		windowGetActive() && windowGetActive().tabSelectI(6);
	});
	globalShortcut.register('CommandOrControl+8', () => {
		windowGetActive() && windowGetActive().tabSelectI(7);
	});
	globalShortcut.register('CommandOrControl+9', () => {
		windowGetActive() && windowGetActive().tabSelectI(8);
	});
};
