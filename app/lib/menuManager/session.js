const { windowCreate, windowGetActive, relayGroupGetCurrent } = require('../terminalManager');

const { ipcMain, Menu } = require('electron');


function createTemplate() {
	return [
		{
			label: 'New Tab',
			click: () => windowGetActive() && windowGetActive().newTab()
		},
		{
			label: 'New Window',
			click: () => windowCreate()
		},
		// TODO: SELECT TAB LIST
		// TODO: SELECT WINDOW LIST
		{ type: 'separator' },
		{
			label: 'Split Pane Vertically',
			click: () => windowGetActive() && windowGetActive().splitVertical()
		},
		{
			label: 'Split Pane Horizontally',
			click: () => windowGetActive() && windowGetActive().splitHorizontal()
		},
		{ type: 'separator' },
		{
			label: 'Move To Split Pane',
			click: () => console.log('TODO')
		},
		{
			label: 'Move To Window',
			click: () => console.log('TODO')
		},
		{ type: 'separator' },
		{ role: 'copy' },
		{ role: 'paste' },
		{ type: 'separator' },
		{
			label: 'Select All',
			click: () => windowGetActive() && windowGetActive().selectAll()
		},
		{ type: 'separator' },
		{
			label: 'Clear Buffer',
			click: () => windowGetActive() && windowGetActive().clearBuffer()
		},
		{ type: 'separator' },
		{
			label: 'Toggle Broadcast Input (Current Group)',
			click: () => windowGetActive() && windowGetActive().relayGroupToggle(relayGroupGetCurrent())
		},
		{
			label: 'Toggle Broadcast Input (New Group)',
			click: () => windowGetActive() && windowGetActive().relayGroupToggle(null)
		},
		{ type: 'separator' },
		{
			label: 'Close',
			click: () => windowGetActive() && windowGetActive().closePane()
		}
	];
}


let currentHandler = null;

exports.update = () => {
	const template = createTemplate();
	const sessionMenu = Menu.buildFromTemplate(template);

	//
	if (currentHandler) {
		ipcMain.removeEventListener('sessionMenu', currentHandler);
	}

	//
	currentHandler = () => sessionMenu.popup(windowGetActive().browserWindow);
	ipcMain.on('sessionMenu', currentHandler);
};
