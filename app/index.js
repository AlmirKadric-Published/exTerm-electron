require('./lib/configManager');
const terminalManager = require('./lib/terminalManager');
const { windowCreate } = terminalManager;

const { app } = require('electron');
const { webpackWatch } = require('./dev');
const { sessionMenu, windowMenu } = require('./lib/menuManager');


// Make sure we close the app under all exit conditions
function resetAndQuit(error) {
	if (error) {
		console.error(error);
	}

	app.quit();
}

process.on('exit', resetAndQuit);
process.on('SIGINT', resetAndQuit);
process.on('SIGTERM', resetAndQuit);
process.on('SIGHUP', resetAndQuit);
process.on('uncaughtException', (error) => resetAndQuit(error));


// Electron application entry point
app.on('ready', () => {
	// Setup context menus
	windowMenu.update();
	sessionMenu.update();


	// Create the first terminal window
	if (global.isDevelopmentMode) {
		// If we are in development mode, if so run the first
		// instance of webpack and continue to watch after that
		webpackWatch(() => {
			windowCreate();
		});
	} else {
		// Otherwise just open the main window
		windowCreate();
	}
});


// Determine application behaviour when all windows are closed
app.on('window-all-closed', function () {
	// On OS X stay active until the user quits explicitly
	// with 'Command+Q' or 'Quit' menu item.
	if (global.isDarwin) {
		return;
	}

	// Otherwise quit the application
	app.quit();
});
