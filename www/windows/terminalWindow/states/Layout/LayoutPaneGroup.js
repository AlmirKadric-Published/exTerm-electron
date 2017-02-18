import uuid from 'uuid';
import LayoutPane from './LayoutPane';
import { observable } from 'mobx';


/**
 *
 */
export default class LayoutPaneGroup {
	constructor(direction, parent, tab, layoutJSON) {
		this.uid = uuid.v4();
		this.tab = observable(tab);
		this.parent = parent;

		this.panes = observable([]);
		this.widths = observable([]);
		this.direction = direction;

		if (layoutJSON) {
			for (let i = 0; i < layoutJSON.panes.length; i += 1) {
				const paneJSON = layoutJSON.panes[i];
				const paneWidth = layoutJSON.widths[i];

				let pane;
				if (paneJSON.panes) {
					const direction = paneJSON.direction;
					pane = new LayoutPaneGroup(direction, this, tab, paneJSON);
				} else {
					pane = new LayoutPane(this, tab, paneJSON);
					if (paneJSON.active) {
						tab.paneActive.set(pane);
					}
				}

				this.panes.push(pane);
				this.widths.push(paneWidth);
			}
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
	 *
	 * @param pane
	 * @param position
     */
	paneAdd(pane, position, width) {
		//
		this.panes.splice(position, 0, pane);
		this.widths.splice(position, 0, width);

		//
		pane.parent = this;

		// Normalise
		this.widthsNormalise();
	}

	/**
	 *
	 * @param newPane
	 * @param position
     */
	paneSwap(newPane, position) {
		//
		const oldPane = this.panes[position];
		this.panes.splice(position, 1, newPane);

		//
		oldPane.parent = null;
		newPane.parent = this;
	}

	/**
	 *
	 * @param pane
     */
	paneRemove(pane) {
		// Remove pane from list
		const paneI = this.panes.indexOf(pane);
		this.panes.splice(paneI, 1);
		this.widths.splice(paneI, 1);

		// Unlink group from child
		pane.parent = null;

		// If there is only 1 child left, swap only child with
		// parent or root if there is no parent.
		if (this.panes.length === 1) {
			const onlyChild = this.panes[0];

			const parent = this.parent;
			if (parent) {
				const pIndex = parent.panes.indexOf(this);
				this.paneRemove(onlyChild);
				parent.paneSwap(onlyChild, pIndex);
			} else {
				const tab = this.tab.get();
				this.paneRemove(onlyChild);
				tab.paneRoot.set(onlyChild);
			}
		}

		// Normalise
		this.widthsNormalise();
	}

	/**
	 * Normalise widths within group to sum to 100. This prevents
	 * rounding errors from breaking the layout as well as auto
	 * adjusting panes when a pane is added or removed.
	 */
	widthsNormalise() {
		const length = this.panes.length;

		// Calculate current total width
		let totalWidth = 0;
		for (let i = 0; i < length; i += 1) {
			totalWidth += this.widths[i];
		}

		// Spread the difference from 100 over other panes
		// according to their ratio within the group.
		const difference = 100 - totalWidth;
		for (let i = 0; i < length; i += 1) {
			const oldWidth = this.widths[i];
			const ratio = oldWidth / totalWidth;
			this.widths[i] = oldWidth + (difference * ratio);
		}
	}

	/**
	 *
	 * @returns {Object}
	 */
	toJSON() {
		const rtnJSON = {
			panes: this.panes,
			widths: this.widths,
			direction: this.direction
		};

		return rtnJSON;
	}
}
