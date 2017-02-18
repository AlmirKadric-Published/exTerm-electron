import uuid from 'uuid';
import LayoutPaneGroup from './LayoutPaneGroup';
import { observable } from 'mobx';

// Setup terminal emulator component & addons
// TODO: FIX FIT ADDON FOR HORIZONTAL SPLIT PANES
// NOTE: SEEMS THAT THE VIEWPORT IS ALL WEIRD
import Terminal from 'xterm/lib/xterm.js';
import EscapeSequences from 'xterm/lib/EscapeSequences.js'
import 'xterm/lib/xterm.css';
import 'xterm/lib/addons/fit';
import 'xterm/lib/addons/linkify';

//
const { ipcRenderer, remote } = window.require('electron');
const {
	DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_TOP,
	SPLIT_VERTICALLY, SPLIT_HORIZONTALLY,
} = remote.require('./constants.js');


/**
 *
 */
export default class LayoutPane {
	constructor(parent, tab, { sessionUID = null, relayGroupUID = null }) {
		this.uid = uuid.v4();
		this.tab = observable(tab);
		this.parent = parent;

		this.name = observable('');
		this.sessionUID = observable(sessionUID);
		this.relayGroupUID = observable(relayGroupUID);
		this.dropDirection = observable(null);

		this.baseFontSize = 14;
		this.fontSizeModifier = observable(0);


		// Create terminal
		// TODO: MOVE TAB PANES LOGIC TO LayoutPaneGroup
		tab.panes.push(this);
		const terminal = this.terminal = new Terminal({ cursorBlink: true });


		// Handle custom keydown events
		const CommandOrCtrl = (global.isDarwin) ? 8 : 4;
		const applicationShortcuts = {};

		// CommandOrCtrl+? Keys
		applicationShortcuts[CommandOrCtrl] = [
			'KeyN', 'KeyT', 'KeyD', 'KeyW', 'KeyI', 'KeyO',				// Shell Menu
			'KeyV', 'KeyA', 'KeyF', 'KeyK',									// Edit Menu
			'Digit0', 'Minus',												// View Menu
			'KeyM', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'	// Window Menu
		];

		// CommandOrCtrl+Shift+? Keys
		applicationShortcuts[CommandOrCtrl + 1] = [
			'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
		];

		// CommandOrCtrl+Alt+? Keys
		applicationShortcuts[CommandOrCtrl + 2] = [
			'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
		];

		terminal.attachCustomKeydownHandler((e) => {
			const currentModifiers = e.shiftKey << 0 | e.altKey << 1 | e.ctrlKey << 2 | e.metaKey << 3;
			const currentModifiersStr = currentModifiers.toString();

			// Make sure all shortcut key sequences we use in the application are ignored
			for (const shortcutModifier of Object.keys(applicationShortcuts)) {
				const shortcutKeys = applicationShortcuts[shortcutModifier];
				if (currentModifiersStr === shortcutModifier && shortcutKeys.indexOf(e.code) >= 0) {
					return false;
				}
			}

			// Remap 'Ctrl+D' to 'Ctrl+Alt+D'
			if (currentModifiers === 6 && e.code === 'KeyD') {
				terminal.send(EscapeSequences.C0.EOT);
				return false;
			}
		});


		// Setup event handlers
		this._termWrite = (e, data) => this.termWrite(data);
		this._termFit = () => this.termFit();
		this._sessionWrite = (data) => this.sessionWrite(data);
		this._sessionResize = (dimensions) => this.sessionResize(dimensions.cols, dimensions.rows);
		this._windowChange = () => this.windowChange();
		this._relayJoin = (e, data) => this.relayGroupUID.set(data);
		this._relayLeave = () => this.relayGroupUID.set(null);
		this._close = () => this.close();

		terminal.on('open', this._termFit);
		terminal.on('data', this._sessionWrite);
		terminal.on('resize', this._sessionResize);


		// Create a session if one wasn't provided
		if (!sessionUID) {
			terminal.once('open', () => {
				// Fit the terminal to its parent container
				terminal.fit();

				// Create session synchronously with terminal dimensions
				const cols = terminal.cols;
				const rows = terminal.rows;
				ipcRenderer.send('session:createSession', {
					paneUID: this.uid,
					windowUID: global.windowUID,
					cols, rows
				});

				// Wait for session to be created
				ipcRenderer.once(`pane:${this.uid}:sessionCreated`, (e, sessionUID) => {
					this.sessionUID.set(sessionUID);

					// Setup session event handlers
					ipcRenderer.on(`session:${sessionUID}:data`, this._termWrite);
					ipcRenderer.on(`session:${sessionUID}:windowChange`, this._windowChange);
					ipcRenderer.on(`session:${sessionUID}:relayGroupJoin`, this._relayJoin);
					ipcRenderer.on(`session:${sessionUID}:relayGroupLeave`, this._relayLeave);
					ipcRenderer.on(`session:${sessionUID}:exit`, this._close);
				});
			});
		} else {
			// Setup session event handlers
			ipcRenderer.on(`session:${sessionUID}:data`, this._termWrite);
			ipcRenderer.on(`session:${sessionUID}:windowChange`, this._windowChange);
			ipcRenderer.on(`session:${sessionUID}:relayGroupJoin`, this._relayJoin);
			ipcRenderer.on(`session:${sessionUID}:relayGroupLeave`, this._relayLeave);
			ipcRenderer.on(`session:${sessionUID}:exit`, this._close);
		}
	}

	/**
	 * Proxy session PTY data to terminal renderer
	 * @param data
	 */
	termWrite(data) {
		if (this.terminal) {
			this.terminal.write(data);
		}
	}

	/**
	 * Fit terminal to parent container dimensions
	 */
	termFit() {
		if (!this.terminal) {
			return;
		}

		this.terminal.fit();

		// Re-focus terminal just in case we've re-bound it to a container
		const tab = this.tab.get();
		const paneActive = tab.paneActive.get();
		if (paneActive.terminal && paneActive.terminal.textarea) {
			paneActive.terminal.focus();
		}
	}

	/**
	 * Proxy terminal input data to session PTY
	 * @param data
	 */
	sessionWrite(data) {
		const sessionUID = this.sessionUID.get();
		if (sessionUID) {
			ipcRenderer.send(`session:${sessionUID}:data`, data);
		}
	}

	/**
	 * Resize session PTY
	 * @param cols
	 * @param rows
	 */
	sessionResize(cols, rows) {
		const sessionUID = this.sessionUID.get();
		if (!sessionUID) {
			return;
		}

		ipcRenderer.send(`session:${sessionUID}:resize`, { cols, rows });
	}

	/**
	 * Closes pane in current window leaving session intact as
	 * it has been assigned to another window.
	 */
	windowChange() {
		this.close(true);
	}

	/**
	 *
	 * @param relayGroupUID
	 * @param alwaysAdditive
	 */
	relayGroupToggle(relayGroupUID, alwaysAdditive) {
		const sessionUID = this.sessionUID.get();
		ipcRenderer.send(`session:${sessionUID}:relayGroupToggle`, relayGroupUID, alwaysAdditive);
	}

	/**
	 * Ensures that the terminal and session associated with
	 * this pane are properly destroyed.
	 * @param termOnly - Whether or not to only destroy the terminal leaving the session intact
	 */
	destroy(termOnly) {
		const sessionUID = this.sessionUID.get();

		// Remove event handlers
		this.terminal.off('open', this._termFit);
		this.terminal.off('data', this._sessionWrite);
		this.terminal.off('resize', this._sessionResize);

		ipcRenderer.removeListener(`session:${sessionUID}:data`, this._termWrite);
		ipcRenderer.removeListener(`session:${sessionUID}:windowChange`, this._windowChange);
		ipcRenderer.removeListener(`session:${sessionUID}:relayGroupJoin`, this._relayJoin);
		ipcRenderer.removeListener(`session:${sessionUID}:relayGroupLeave`, this._relayLeave);
		ipcRenderer.removeListener(`session:${sessionUID}:exit`, this._close);

		// Destroy the terminal if it exists
		if (this.terminal) {
			this.terminal.destroy();
			this.terminal = null;
		}

		// Let the terminal manager know to destroy the session
		if (!termOnly) {
			ipcRenderer.send(`session:${sessionUID}:close`);
			this.sessionUID.set(null);
		}
	}

	/**
	 * Clears terminal buffer
	 */
	clearBuffer() {
		if (this.terminal) {
			this.terminal.reset();
			// TODO: This isn't right as broadcasting will send clear screen to all panes
			// but without it text re-appears on a resize. What should be sent to the PTY?
			this.terminal.send(EscapeSequences.C0.FF);
		}
	}

	/**
	 *
	 * @param modifier
     */
	changeTextSize(modifier) {
		if (modifier === 0) {
			this.fontSizeModifier.set(0);
		} else {
			const baseSize = this.baseFontSize;
			const currentSize = this.fontSizeModifier.get();
			if (baseSize + currentSize + modifier < 10) {
				return;
			}

			this.fontSizeModifier.set(currentSize + modifier);
		}
	}

	/**
	 * Marks this pane as active and enables it for input
	 */
	activate() {
		const tab = this.tab.get();

		// Set this pane as active
		const isPaneActive = tab.paneActive.get() === this;
		if (!isPaneActive) {
			tab.paneActive.set(this);
		}

		// Focus terminal input if it is available
		const isSelecting = document.getSelection().type === 'Range';
		const inputExists = this.terminal && this.terminal.textarea;
		const inputFocused = inputExists && this.terminal.textarea === document.activeElement;
		if (inputExists && !isSelecting && !inputFocused) {
			this.terminal.focus();
		}

		// If pane session is in a relay group, set it as current
		const relayGroupUID = this.relayGroupUID.get();
		if (relayGroupUID) {
			ipcRenderer.send(`relayGroup:${relayGroupUID}:touch`);
		}
	}

	/**
	 * If this pane is in a pane group, will return this pane's
	 * index in that group. Otherwise, will return null.
	 * @returns {null|number}
	 */
	getIndex() {
		if (!this.parent) {
			return null;
		}

		return this.parent.panes.indexOf(this);
	}

	/**
	 * Ensures the parent is a pane group in the given direction
	 * @param direction
	 */
	ensureDirection(direction) {
		let parent = this.parent;
		if (!parent) {
			const newGroup = new LayoutPaneGroup(direction, null, this.tab.get());
			newGroup.paneAdd(this, 0, 100);

			const tab = this.tab.get();
			tab.paneRoot.set(newGroup);

			parent = newGroup;
		}

		const parentDirection = parent.direction;
		if (parentDirection !== direction) {
			const previousIndex = this.getIndex();
			const newGroup = new LayoutPaneGroup(direction, parent, this.tab.get());

			parent.paneSwap(newGroup, previousIndex);
			newGroup.paneAdd(this, 0, 100);

			parent = newGroup;
		}
	}

	/**
	 *
	 * @param {LayoutPane|string} session - LayoutPane instance to move or a session UID to bind
	 * @param direction
	 */
	drop(session, direction) {
		const isLeftRight = direction === DIRECTION_LEFT || direction === DIRECTION_RIGHT;
		const isLeftTop = direction === DIRECTION_LEFT || direction === DIRECTION_TOP;

		// Ensure parent pane group is in the right direction
		const splitDirection = (isLeftRight) ? SPLIT_VERTICALLY : SPLIT_HORIZONTALLY;
		this.ensureDirection(splitDirection);

		// Now we can get the parent for later use,
		// NOTE: This must be after the ensureDirection function as the parent could change as a result
		const tab = this.tab.get();
		const parent = this.parent;

		// If we didn't get a pane, it must be a session from
		// another window. If so bind it to a pane.
		let pane = session;
		if (!(session instanceof LayoutPane)) {
			pane = new LayoutPane(parent, tab, {
				sessionUID: session
			});
		}

		// Check if pane belonged to a different tab, if so move it
		const oldTab = pane.tab.get();
		if (tab !== oldTab) {
			const paneI = oldTab.panes.indexOf(this);
			tab.panes.splice(paneI, 1);
			tab.panes.push(pane);
		}

		// Inject pane into parent pane group and activate it
		const index = this.getIndex();
		const width = parent.widths[index];
		const insertAt = index + ((isLeftTop) ? 0 : 1);
		parent.paneAdd(pane, insertAt, width);

		pane.activate();
	}

	/**
	 * Create a new pane following the current one in the given direction
	 * @param direction
	 */
	split(direction) {
		// Ensure the parent is a pane group in the required direction
		this.ensureDirection(direction);

		// Create a new pane and add it to the parent pane group after this one
		const parent = this.parent;
		const index = this.getIndex();
		const width = parent.widths[index];

		const newPane = new LayoutPane(parent, this.tab.get(), {});
		parent.paneAdd(newPane, this.getIndex() + 1, width);

		// Activate the new pane
		newPane.activate();
	}

	/**
	 * Create a new pane following the current one in the horizontal
	 * direction (divider or split will be vertical)
	 */
	splitVertical() {
		this.split(SPLIT_VERTICALLY);
	}

	/**
	 * Create a new pane following the current one in the vertical
	 * direction (divider or split will be horizontal)
	 */
	splitHorizontal() {
		this.split(SPLIT_HORIZONTALLY);
	}

	/**
	 * Close this pane
	 * @param termOnly - Whether or not to only destroy the terminal leaving the session intact
	 */
	close(termOnly) {
		// Make sure that the session and terminal are properly destroyed
		this.destroy(termOnly);

		// Remove pane from tab
		const tab = this.tab.get();
		const paneI = tab.panes.indexOf(this);
		tab.panes.splice(paneI, 1);

		// Close the tab if we are the root of it
		const root = tab.paneRoot.get();
		if (this === root) {
			tab.close();
			return;
		}

		// Keep track of parents & positions in case it is removed below
		const parent = this.parent;
		const parentsParent = parent.parent;
		const pIndex = parentsParent && parentsParent.panes.indexOf(parent);

		// Remove us from the parent group
		const index = this.getIndex();
		parent.paneRemove(this);

		// Activate a sibling if this pane was the active one
		const paneActive = tab.paneActive.get();
		if (paneActive === this) {
			// Find the nearest pane we can activate
			let nearestPane = null;
			if (parent.panes.length === 0) {
				if (parentsParent) {
					nearestPane = parentsParent.panes[pIndex];
				} else {
					nearestPane = tab.paneRoot.get();
				}
			} else {
				const nearestIndex = (index > 0) ? index - 1 : index;
				nearestPane = parent.panes[nearestIndex];
			}

			// Active pane or its first child if it a group
			while (nearestPane instanceof LayoutPaneGroup) {
				nearestPane = nearestPane.panes[0];
			}
			nearestPane.activate();
		}
	}

	/**
	 *
	 * @returns {Object}
	 */
	toJSON() {
		const rtnJSON = {
			sessionUID: this.sessionUID.get(),
			relayGroupUID: this.relayGroupUID.get()
		};

		if (this.tab.get().paneActive.get() === this) {
			rtnJSON.active = true;
		}

		return rtnJSON;
	}
}
