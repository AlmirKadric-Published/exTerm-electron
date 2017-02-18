import LayoutTab from './LayoutTab';
import { observable, transaction } from 'mobx';

//
const { remote } = window.require('electron');
const {
	DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_TOP, DIRECTION_BOTTOM,
	SPLIT_VERTICALLY, SPLIT_HORIZONTALLY,
} = remote.require('./constants.js');


/**
 *
 */
export default class Layout {
	constructor(layoutJSON) {
		this.tabs = observable([]);
		this.tabActive = observable(null);

		if (!layoutJSON) {
			const tabRoot = new LayoutTab(this);
			this.tabs.push(tabRoot);
			this.tabActive.set(tabRoot);
		} else {
			for (const tabJSON of layoutJSON.tabs) {
				const tab = new LayoutTab(this, tabJSON);
				this.tabs.push(tab);
				if (tabJSON.active) {
					this.tabActive.set(tab);
				}
			}
		}
	}

	/**
	 *
	 */
	tabCreate() {
		transaction(() => {
			const tab = new LayoutTab(this);
			this.tabs.push(tab);
			this.tabActive.set(tab);
		});
	}

	/**
	 *
	 * @param index
	 * @returns {*}
	 */
	tabGet(index) {
		if (index === undefined) {
			return this.tabActive.get();
		}

		return this.tabs[index];
	}

	/**
	 *
	 * @param modifier
     */
	tabSelectNxtPrv(modifier) {
		transaction(() => {
			//
			const tabActive = this.tabActive.get();
			const tabActiveI = this.tabs.indexOf(tabActive);

			//
			let nextTabI = tabActiveI + modifier;
			nextTabI = (nextTabI >= 0) ? nextTabI : 0;
			nextTabI = (nextTabI < this.tabs.length) ? nextTabI : this.tabs.length - 1;

			//
			if (nextTabI === tabActiveI) {
				return;
			}

			//
			const nextTab = this.tabs[nextTabI];
			this.tabActive.set(nextTab);
		});
	}

	/**
	 *
	 * @param modifier
     */
	tabMove(modifier) {
		transaction(() => {
			//
			const tabActive = this.tabActive.get();
			const tabActiveI = this.tabs.indexOf(tabActive);

			//
			let nextTabI = tabActiveI + modifier;
			nextTabI = (nextTabI >= 0) ? nextTabI : 0;
			nextTabI = (nextTabI < this.tabs.length) ? nextTabI : this.tabs.length - 1;

			//
			if (nextTabI === tabActiveI) {
				return;
			}

			//
			const removeId = (tabActiveI > nextTabI) ? tabActiveI + 1 : tabActiveI;
			const insertId = (nextTabI > tabActiveI) ? nextTabI + 1 : nextTabI;
			this.tabs.splice(insertId, 0, tabActive);
			this.tabs.splice(removeId, 1);
		});
	}

	/**
	 *
	 * @param index
	 */
	tabActivate(index) {
		transaction(() => {
			this.tabGet(index).activate();
		});
	}

	/**
	 *
	 * @param index
	 */
	tabClose(index) {
		transaction(() => {
			this.tabGet(index).close();
		});
	}

	/**
	 *
	 */
	paneSplitVertical() {
		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();
			activePane.splitVertical();
		});
	}

	/**
	 *
	 */
	paneSplitHorizontal() {
		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();
			activePane.splitHorizontal();
		});
	}

	/**
	 *
	 * @param direction
     */
	paneSelect(direction) {
		const isLeftRight = direction === DIRECTION_LEFT || direction === DIRECTION_RIGHT;
		const isLeftTop = direction === DIRECTION_LEFT || direction === DIRECTION_TOP;
		const splitDirection = (isLeftRight) ? SPLIT_VERTICALLY : SPLIT_HORIZONTALLY;
		const directionModifier = (isLeftTop) ? -1 : 1;

		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();

			//
			if (!activePane.parent) {
				return;
			}

			//
			let nextPane;
			const parent = activePane.parent;
			if (parent.direction === splitDirection) {
				//
				const activePaneI = activePane.getIndex();
				let nextI = activePaneI + directionModifier;
				nextI = (nextI >= 0) ? nextI : 0;
				nextI = (nextI < parent.panes.length) ? nextI : parent.panes.length - 1;

				//
				if (activePaneI === nextI) {
					return;
				}

				//
				nextPane = parent.panes[nextI];
			} else {
				//
				if (!parent.parent) {
					return;
				}

				//
				const parentsParent = parent.parent;
				const parentsI = parent.getIndex();
				let nextI = parentsI + directionModifier;
				nextI = (nextI >= 0) ? nextI : 0;
				nextI = (nextI < parentsParent.panes.length) ? nextI : parentsParent.panes.length - 1;

				//
				if (parentsI === nextI) {
					return;
				}

				//
				nextPane = parentsParent.panes[nextI];
			}

			//
			if (!nextPane) {
				return;
			}

			// If the next pane is a group select one of its children
			// TODO: Change this to something that depends on ratios or
			// pane placement to determine the logical next pane
			while (nextPane.panes !== undefined) {
				nextPane = nextPane.panes[0];
			}

			//
			nextPane.activate();
		});
	}

	/**
	 *
	 * @param direction
     */
	paneMove(direction) {
		const isLeftRight = direction === DIRECTION_LEFT || direction === DIRECTION_RIGHT;
		const isLeftTop = direction === DIRECTION_LEFT || direction === DIRECTION_TOP;
		const splitDirection = (isLeftRight) ? SPLIT_VERTICALLY : SPLIT_HORIZONTALLY;
		const directionModifier = (isLeftTop) ? -1 : 1;

		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();

			//
			if (!activePane.parent) {
				return;
			}

			//
			let nextPane;
			const parent = activePane.parent;
			if (parent.direction === splitDirection) {
				//
				const activePaneI = activePane.getIndex();
				let nextI = activePaneI + directionModifier;
				nextI = (nextI >= 0) ? nextI : 0;
				nextI = (nextI < parent.panes.length) ? nextI : parent.panes.length - 1;

				//
				if (activePaneI === nextI) {
					return;
				}

				//
				nextPane = parent.panes[nextI];
			} else {
				//
				if (!parent.parent) {
					return;
				}

				//
				const parentsParent = parent.parent;
				const parentsI = parent.getIndex();
				let nextI = parentsI + directionModifier;
				nextI = (nextI >= 0) ? nextI : 0;
				nextI = (nextI < parentsParent.panes.length) ? nextI : parentsParent.panes.length - 1;

				//
				if (parentsI === nextI) {
					return;
				}

				//
				nextPane = parentsParent.panes[nextI];
			}

			//
			if (!nextPane) {
				return;
			}

			// If the next pane is a group select one of its children
			// TODO: Change this to something that depends on ratios or
			// pane placement to determine the logical next pane
			while (nextPane.panes !== undefined) {
				nextPane = nextPane.panes[0];
			}

			// Inject pane into new location
			const injectI = nextPane.getIndex();
			const injectWidth = nextPane.parent.widths[injectI];
			activePane.parent.paneRemove(activePane);
			nextPane.parent.paneAdd(activePane, injectI, injectWidth);
		});
	}

	/**
	 *
	 * @param direction
     */
	paneResize(direction) {
		const isLeftRight = direction === DIRECTION_LEFT || direction === DIRECTION_RIGHT;
		const isLeftTop = direction === DIRECTION_LEFT || direction === DIRECTION_TOP;
		const splitDirection = (isLeftRight) ? SPLIT_VERTICALLY : SPLIT_HORIZONTALLY;
		const directionModifier = (isLeftTop) ? -1 : 1;

		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();

			//
			if (!activePane.parent) {
				return;
			}

			//
			const parent = activePane.parent;
			if (parent.direction === splitDirection) {
				//
				const activePaneI = activePane.getIndex();
				const nextI = activePaneI + 1;
				if (nextI >= parent.panes.length) {
					return;
				}

				//
				const activeWidth = parent.widths[activePaneI];
				const nextWidth = parent.widths[nextI];
				parent.widths[activePaneI] = activeWidth + (directionModifier * 2.5);
				parent.widths[nextI] = nextWidth - (directionModifier * 2.5);
				parent.widthsNormalise();
			} else {
				//
				if (!parent.parent) {
					return;
				}

				//
				const parentsParent = parent.parent;
				const parentsI = parent.getIndex();
				const nextI = parentsI + 1;
				if (nextI >= parentsParent.panes.length) {
					return;
				}

				//
				const parentsWidth = parentsParent.widths[parentsI];
				const nextWidth = parentsParent.widths[nextI];
				parentsParent.widths[parentsI] = parentsWidth + (directionModifier * 5);
				parentsParent.widths[nextI] = nextWidth - (directionModifier * 5);
				parentsParent.widthsNormalise();
			}
		});
	}

	/**
	 *
	 */
	paneClose() {
		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();
			activePane.close();
		});
	}

	/**
	 *
	 * @param relayGroupUID
	 */
	relayGroupToggle(relayGroupUID) {
		transaction(() => {
			const activeTab = this.tabActive.get();
			const activePane = activeTab.paneActive.get();
			activePane.relayGroupToggle(relayGroupUID);
		});
	}

	/**
	 *
	 * @param relayGroupUID
	 */
	relayGroupToggleTab(relayGroupUID) {
		transaction(() => {
			const activeTab = this.tabActive.get();
			for (const pane of activeTab.panes) {
				pane.relayGroupToggle(relayGroupUID, true);
			}
		});
	}

	/**
	 *
	 * @param relayGroupUID
	 */
	relayGroupToggleWindow(relayGroupUID) {
		transaction(() => {
			for (const tab of this.tabs) {
				for (const pane of tab.panes) {
					pane.relayGroupToggle(relayGroupUID, true);
				}
			}
		});
	}

	/**
	 *
	 */
	paneClearBuffer() {
		const activeTab = this.tabActive.get();
		const activePane = activeTab.paneActive.get();
		activePane.clearBuffer();
	}

	/**
	 *
	 * @param modifier
     */
	paneChangeTextSize(modifier) {
		const activeTab = this.tabActive.get();
		const activePane = activeTab.paneActive.get();
		activePane.changeTextSize(modifier);
	}

	/**
	 *
	 * @returns {Object}
	 */
	toJSON() {
		const rtnJSON = {
			tabs: this.tabs
		};

		return rtnJSON;
	}
}
