import uuid from 'uuid';
import LayoutPane from './LayoutPane';
import LayoutPaneGroup from './LayoutPaneGroup';
import { observable } from 'mobx';


/**
 * Layout Tab Class
 */
export default class LayoutTab {
	constructor(parent, layoutJSON) {
		this.uid = uuid.v4();
		this.parent = parent;
		this.name = null;

		this.panes = [];
		this.paneRoot = observable(null);
		this.paneActive = observable(null);

		if (!layoutJSON) {
			const paneRoot = new LayoutPane(null, this, {});
			this.paneRoot.set(paneRoot);
			this.paneActive.set(paneRoot);
		} else {
			const paneRootJSON = layoutJSON.paneRoot;
			if (paneRootJSON.panes) {
				const direction = paneRootJSON.direction;
				const paneRoot = new LayoutPaneGroup(direction, null, this, paneRootJSON);
				this.paneRoot.set(paneRoot);
			} else {
				const paneRoot = new LayoutPane(null, this, paneRootJSON);
				this.paneRoot.set(paneRoot);
				if (paneRootJSON.active) {
					this.paneActive.set(paneRoot);
				}
			}
		}
	}

	/**
	 *
	 * @returns {number}
	 */
	getIndex() {
		return this.parent.tabs.indexOf(this);
	}

	/**
	 *
	 */
	activate() {
		this.parent.tabActive.set(this);
	}

	/**
	 *
	 */
	close() {
		const index = this.parent.tabs.indexOf(this);
		this.parent.tabs.splice(index, 1);

		// Close the window if there are no tabs left
		if (this.parent.tabs.length === 0) {
			window.close();
			return;
		}

		// Open tab to left or right if the active tab has been closed
		if (this.parent.tabActive.get() === this) {
			const nearestIndex = (index > 0) ? index - 1 : index;
			const nearestTab = this.parent.tabs[nearestIndex];
			this.parent.tabActive.set(nearestTab);
		}
	}

	/**
	 *
	 * @returns {Object}
	 */
	toJSON() {
		const rtnJSON = {
			paneRoot: this.paneRoot.get()
		};

		if (this.parent.tabActive.get() === this) {
			rtnJSON.active = true;
		}

		return rtnJSON;
	}
}
