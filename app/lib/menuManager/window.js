const {
	windowCreate, windowGetActive, windowMinimizeAll,
	relayGroupGetCurrent, relayGroupDestroyCurrent, relayGroupToggleAll
} = require('../terminalManager');
const {
	DIRECTION_LEFT, DIRECTION_RIGHT,
	DIRECTION_TOP, DIRECTION_BOTTOM
} = require('../../constants.js');

const { app, Menu, shell, globalShortcut } = require('electron');


function createTemplate() {
	// TODO: MOVE ACCELERATORS INTO ACCELERATOR MANAGER
	const fileMenu = [
		{
			label: 'Preferences',
			click: () => console.log('TODO')
		},
		{ type: 'separator' },
		{ role: 'quit' }
	];


	const shellMenu = [
		// TODO INJECT CONFIGURED SHELLS HERE
		{
			label: 'New Window',
			click: () => windowCreate(),
			accelerator: 'CommandOrControl+N'
		},
		{
			label: 'New Tab',
			click: () => windowGetActive() && windowGetActive().newTab(),
			accelerator: 'CommandOrControl+T'
		},
		{ type: 'separator' },
		{
			label: 'Split Pane Vertically',
			click: () => windowGetActive() && windowGetActive().splitVertical(),
			accelerator: 'CommandOrControl+D'
		},
		{
			label: 'Split Pane Horizontally',
			click: () => windowGetActive() && windowGetActive().splitHorizontal(),
			accelerator: 'CommandOrControl+Shift+D'
		},
		{ type: 'separator' },
		{
			label: 'Close Pane',
			click: () => windowGetActive() && windowGetActive().closePane(),
			accelerator: 'CommandOrControl+W'
		},
		{
			label: 'Close Tab',
			click: () => windowGetActive() && windowGetActive().closeTab(),
			accelerator: 'CommandOrControl+Alt+W'
		},
		{
			label: 'Close Window',
			click: () => windowGetActive() && windowGetActive().closeWindow(),
			accelerator: 'CommandOrControl+Shift+W'
		},
		{ type: 'separator' },
		{
			label: 'Broadcast Input',
			submenu: [
				{
					label: 'Toggle Broadcast (Current)',
					click: () => windowGetActive() && windowGetActive().relayGroupToggle(relayGroupGetCurrent()),
					accelerator: 'CommandOrControl+I'
				},
				{
					label: 'Broadcast to all panes in current Tab (Current)',
					click: () => windowGetActive() && windowGetActive().relayGroupToggleTab(relayGroupGetCurrent()),
					accelerator: 'CommandOrControl+Alt+I'
				},
				{
					label: 'Broadcast to all panes in current Window (Current)',
					click: () => windowGetActive() && windowGetActive().relayGroupToggleWindow(relayGroupGetCurrent()),
					accelerator: 'CommandOrControl+Shift+I'
				},
				{
					label: 'Broadcast to all panes (Current)',
					click: () => relayGroupToggleAll(relayGroupGetCurrent()),
					accelerator: 'CommandOrControl+Alt+Shift+I'
				},
				{ type: 'separator' },
				{
					label: 'Toggle Broadcast (New)',
					click: () => windowGetActive() && windowGetActive().relayGroupToggle(null),
					accelerator: 'CommandOrControl+O'
				},
				{
					label: 'Broadcast to all panes in current Tab (New)',
					click: () => windowGetActive() && windowGetActive().relayGroupToggleTab(null),
					accelerator: 'CommandOrControl+Alt+O'
				},
				{
					label: 'Broadcast to all panes in current Window (New)',
					click: () => windowGetActive() && windowGetActive().relayGroupToggleWindow(null),
					accelerator: 'CommandOrControl+Shift+O'
				},
				{
					label: 'Broadcast to all panes (New)',
					click: () => relayGroupToggleAll(null),
					accelerator: 'CommandOrControl+Alt+Shift+O'
				},
				{ type: 'separator' },
				{
					label: 'Clear Current Broadcast Group',
					click: () => relayGroupDestroyCurrent(),
					accelerator: 'CommandOrControl+Alt+Shift+P'
				}
			]
		}
	];


	const editMenu = [
		{ role: 'copy' },
		{ role: 'paste' },
		{ type: 'separator' },
		{
			label: 'Select All',
			click: () => console.log('TODO'),
			accelerator: 'CommandOrControl+A'
		},
		{ type: 'separator' },
		{
			label: 'Find',
			click: () => console.log('TODO'),
			accelerator: 'CommandOrControl+F'
		},
		{ type: 'separator' },
		{
			label: 'Clear Buffer',
			click: () => windowGetActive() && windowGetActive().clearBuffer(),
			accelerator: 'CommandOrControl+K'
		}
	];


	const viewMenu = [
		{
			label: 'Reload',
			click: () => windowGetActive() && windowGetActive().reload(),
			accelerator: 'CommandOrControl+Shift+R'
		},
		{
			label: 'Toggle Developer Tools',
			click: () => windowGetActive() && windowGetActive().toggleDevTools()
		},
		{ type: 'separator' },
		{
			label: 'Make Text Bigger',
			click: () => windowGetActive() && windowGetActive().changeTextSize(1),
			accelerator: 'CommandOrControl+Plus'
		},
		{
			label: 'Make Text Normal Size',
			click: () => windowGetActive() && windowGetActive().changeTextSize(0),
			accelerator: 'CommandOrControl+0'
		},
		{
			label: 'Make Text Smaller',
			click: () => windowGetActive() && windowGetActive().changeTextSize(-1),
			accelerator: 'CommandOrControl+-'
		}
	];


	const windowMenu = [
		{
			label: 'Minimize',
			click: () => windowGetActive() && windowGetActive().minimize(),
			accelerator: 'CommandOrControl+M'
		},
		{
			label: 'Minimize All',
			click: () => windowMinimizeAll()
		},
		{ type: 'separator' },
		{
			label: 'Select Pane',
			submenu: [
				{
					label: 'Select Above',
					click: () => windowGetActive() && windowGetActive().paneSelect(DIRECTION_TOP),
					accelerator: 'CommandOrControl+Up'
				},
				{
					label: 'Select Below',
					click: () => windowGetActive() && windowGetActive().paneSelect(DIRECTION_BOTTOM),
					accelerator: 'CommandOrControl+Down'
				},
				{
					label: 'Select Left',
					click: () => windowGetActive() && windowGetActive().paneSelect(DIRECTION_LEFT),
					accelerator: 'CommandOrControl+Left'
				},
				{
					label: 'Select Right',
					click: () => windowGetActive() && windowGetActive().paneSelect(DIRECTION_RIGHT),
					accelerator: 'CommandOrControl+Right'
				}
			]
		},
		{
			label: 'Move Pane',
			submenu: [
				{
					label: 'Move Up',
					click: () => windowGetActive() && windowGetActive().paneMove(DIRECTION_TOP),
					accelerator: 'CommandOrControl+Shift+Up'
				},
				{
					label: 'Move Down',
					click: () => windowGetActive() && windowGetActive().paneMove(DIRECTION_BOTTOM),
					accelerator: 'CommandOrControl+Shift+Down'
				},
				{
					label: 'Move Left',
					click: () => windowGetActive() && windowGetActive().paneMove(DIRECTION_LEFT),
					accelerator: 'CommandOrControl+Shift+Left'
				},
				{
					label: 'Move Right',
					click: () => windowGetActive() && windowGetActive().paneMove(DIRECTION_RIGHT),
					accelerator: 'CommandOrControl+Shift+Right'
				}
			]
		},
		{
			label: 'Resize Pane',
			submenu: [
				{
					label: 'Move Divider Up',
					click: () => windowGetActive() && windowGetActive().paneResize(DIRECTION_TOP),
					accelerator: 'CommandOrControl+Alt+Up'
				},
				{
					label: 'Move Divider Down',
					click: () => windowGetActive() && windowGetActive().paneResize(DIRECTION_BOTTOM),
					accelerator: 'CommandOrControl+Alt+Down'
				},
				{
					label: 'Move Divider Left',
					click: () => windowGetActive() && windowGetActive().paneResize(DIRECTION_LEFT),
					accelerator: 'CommandOrControl+Alt+Left'
				},
				{
					label: 'Move Divider Right',
					click: () => windowGetActive() && windowGetActive().paneResize(DIRECTION_RIGHT),
					accelerator: 'CommandOrControl+Alt+Right'
				}
			]
		},
		{ type: 'separator' },
		{
			label: 'Select Tab',
			submenu: [
				{
					label: 'Select Next Tab',
					click: () => windowGetActive() && windowGetActive().tabSelect(1),
					accelerator: 'CommandOrControl+Shift+]'
				},
				{
					label: 'Select Previous Tab',
					click: () => windowGetActive() && windowGetActive().tabSelect(-1),
					accelerator: 'CommandOrControl+Shift+['
				},
				{ type: 'separator' }
				//  - TABS
			]
		},
		{
			label: 'Move Tab',
			submenu: [
				{
					label: 'Move Tab Left',
					click: () => windowGetActive() && windowGetActive().tabMove(1),
					accelerator: 'CommandOrControl+Shift+Alt+]'
				},
				{
					label: 'Move Tab Right',
					click: () => windowGetActive() && windowGetActive().tabMove(-1),
					accelerator: 'CommandOrControl+Shift+Alt+['
				}
			]
		}
	];


	const helpMenu = [
		{
			label: 'Search Issues',
			click: () => shell.openExternal('https://github.com/AlmirKadric-org/exTerm-electron/issues')
		},
		{
			label: 'Documentation',
			click: () => shell.openExternal('https://github.com/AlmirKadric-org/exTerm-electron')
		},
		{ type: 'separator' },
		{
			label: 'Check for updates',
			click: () => console.log('TODO')
		},
		{ type: 'separator' },
		{
			label: 'About',
			click: () => console.log('TODO')
		}
	];


	return [
		{ label: (global.isDarwin) ? app.getName() : 'File', submenu: fileMenu },
		{ label: 'Shell', submenu: shellMenu },
		{ label: 'Edit', submenu: editMenu },
		{ label: 'View', submenu: viewMenu },
		{ role: 'window', submenu: windowMenu },
		{ role: 'help', submenu: helpMenu }
	];
}


exports.update = () => {
	const template = createTemplate();
	const windowMenu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(windowMenu);

	// HACK: The below accelerators don't work from the menu
	// NOTE; This seems to hijack the ctrl+arrow sequence from all applcations on windows
	globalShortcut.unregister('CommandOrControl+Up');
	globalShortcut.register('CommandOrControl+Up', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_TOP);
	});
	globalShortcut.unregister('CommandOrControl+Down');
	globalShortcut.register('CommandOrControl+Down', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_BOTTOM);
	});
	globalShortcut.unregister('CommandOrControl+Left');
	globalShortcut.register('CommandOrControl+Left', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_LEFT);
	});
	globalShortcut.unregister('CommandOrControl+Right');
	globalShortcut.register('CommandOrControl+Right', () => {
		windowGetActive() && windowGetActive().paneSelect(DIRECTION_RIGHT);
	});

	globalShortcut.unregister('CommandOrControl+Shift+Up');
	globalShortcut.register('CommandOrControl+Shift+Up', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_TOP);
	});
	globalShortcut.unregister('CommandOrControl+Shift+Down');
	globalShortcut.register('CommandOrControl+Shift+Down', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_BOTTOM);
	});
	globalShortcut.unregister('CommandOrControl+Shift+Left');
	globalShortcut.register('CommandOrControl+Shift+Left', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_LEFT);
	});
	globalShortcut.unregister('CommandOrControl+Shift+Right');
	globalShortcut.register('CommandOrControl+Shift+Right', () => {
		windowGetActive() && windowGetActive().paneMove(DIRECTION_RIGHT);
	});
};
