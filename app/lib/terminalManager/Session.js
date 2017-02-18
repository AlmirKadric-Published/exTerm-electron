'use strict';

const uuid = require('node-uuid');
const nodePTY = require('node-pty');

const { ipcMain } = require('electron');
const { homedir } = require('os');
const { windows, sessions, relayGroups } = require('.');


// TODO: GET THIS FROM CONFIGURATION MANAGER
const defaultShell = (global.isWin32) ? 'C:\\cygwin64\\bin\\bash.exe' : '/bin/bash';
const defaultShellArgs = ['--login'];


/**
 * Terminal Session Class
 * @type {Session}
 */
module.exports = class Session {
	constructor({ windowUID, shell, shellArgs, cols, rows }) {
		this.window = windows[windowUID];
		this.relayGroup = null;

		// Add to sessions list
		const uid = this.uid = uuid.v4();
		sessions[uid] = this;

		// Create PTY session instance
		this.pty = nodePTY.spawn(shell || defaultShell, shellArgs || defaultShellArgs, {
			cols,
			rows,
			cwd: homedir(),
			env: process.env
		});

		// Setup event handlers
		this._termWrite = (data) => this.termWrite(data);
		this._ptyWrite = (e, data) => this.ptyWrite(data);
		this._ptyResize = (e, { cols, rows }) => this.ptyResize(cols, rows);
		this._windowChange = (e, windowUID) => this.windowChanged(windowUID);
		this._relayToggle = (e, relayGroupUID, alwaysAdditive) => this.relayGroupToggle(relayGroupUID, alwaysAdditive);
		this._exit = () => this.exit();

		this.pty.on('data', this._termWrite);
		this.pty.on('exit', this._exit);

		ipcMain.on(`session:${uid}:data`, this._ptyWrite);
		ipcMain.on(`session:${uid}:resize`, this._ptyResize);
		ipcMain.on(`session:${uid}:windowChange`, this._windowChange);
		ipcMain.on(`session:${uid}:relayGroupToggle`, this._relayToggle);
		ipcMain.on(`session:${uid}:close`, this._exit);
	}

	/**
	 * Re-assigns session to a new window
	 * @param windowUID
	 */
	windowChanged(windowUID) {
		// Assigned new window
		const newWindow = windows[windowUID];
		const oldWindow = this.window;
		this.window = newWindow;

		// Tell old window to remove pane
		const uid = this.uid;
		oldWindow.browserWindow.webContents.send(`session:${uid}:windowChange`);
	}

	/**
	 * Proxies PTY data to terminal renderer
	 * @param data
	 */
	termWrite(data) {
		const uid = this.uid;
		this.window.browserWindow.webContents.send(`session:${uid}:data`, data);
	}

	/**
	 * Proxies terminal input data to PTY session
	 * @param data
	 */
	ptyWrite(data) {
		if (this.pty) {
			this.pty.write(data);
		}
	}

	/**
	 * Re-sizes PTY session
	 * @param cols
	 * @param rows
	 */
	ptyResize(cols, rows) {
		if (this.pty) {
			this.pty.resize(cols, rows);
		}
	}

	/**
	 *
	 * @param relayGroupUID
	 * @param alwaysAdditive
	 */
	relayGroupToggle(relayGroupUID, alwaysAdditive) {
		if (this.relayGroup === null || alwaysAdditive) {
			const relayGroup = relayGroups[relayGroupUID];
			relayGroup.sessionAttach(this);
		} else {
			this.relayGroup.sessionDetach(this);
		}
	}

	/**
	 * Cleans up PTY session and its corresponding terminal pane
	 */
	exit() {
		const uid = this.uid;

		// Detach from relay group if attached
		if (this.relayGroup) {
			this.relayGroup.sessionDetach(this);
		}

		// Remove event handlers
		this.pty.removeListener('data', this._termWrite);
		this.pty.removeListener('exit', this._exit);

		ipcMain.removeListener(`session:${uid}:data`, this._ptyWrite);
		ipcMain.removeListener(`session:${uid}:resize`, this._ptyResize);
		ipcMain.removeListener(`session:${uid}:windowChange`, this._windowChange);
		ipcMain.removeListener(`session:${uid}:close`, this._exit);

		// Destroy PTY instance
		this.pty.destroy();
		this.pty = null;

		// Tell window that session is gone
		if (this.window) {
			this.window.browserWindow.webContents.send(`session:${uid}:exit`);
		}

		// Remove from sessions list
		delete sessions[uid];
	}
};
