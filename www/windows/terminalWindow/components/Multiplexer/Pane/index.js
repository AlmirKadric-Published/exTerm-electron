import React from 'react';
import classNames from 'classnames';

import Emulator from '../../Emulator';
import Overlay from './Overlay';
import TitleBar from './TitleBar';
import DropIndicator from './DropIndicator';

import { observer } from 'mobx-react';

const { ipcRenderer, remote } = window.require('electron');
const {
	DIRECTION_LEFT, DIRECTION_RIGHT,
	DIRECTION_TOP, DIRECTION_BOTTOM
} = remote.require('./constants.js');


import './styles.less';


let dragSourcePane = null;
let dragSourceElement = null;
let dragTargetPane = null;
let dragTargetElement = null;


export default observer(
class Pane extends React.Component {
	paneActivate(pane) {
		pane.activate();
	}

	paneClose(pane) {
		pane.close();
	}

	paneMenu(pane) {
		pane.activate();
		ipcRenderer.send('sessionMenu');
	}

	paneDragAllow(e) {
		// Enable dragging action on pane
		e.target.parentNode.parentNode.setAttribute('draggable', true);
		document.body.classList.add('dragging');
	}

	paneDragBlock(e) {
		// Disable dragging action on pane
		e.target.parentNode.parentNode.setAttribute('draggable', false);
		document.body.classList.remove('dragging');
	}

	paneDragStart(e, pane) {
		// Check if we should accept the drag start action
		if (pane.dropDirection === undefined) {
			return;
		}

		// Initialise dragging action
		dragSourcePane = pane;
		dragSourceElement = e.target;
		dragTargetPane = null;
		dragTargetElement = null;

		//
		e.dataTransfer.setData('exTerm/sessionUID', pane.sessionUID.get());
		e.dataTransfer.setData('exTerm/windowUID', global.windowUID);

		// TODO: REMOVE THIS HACK
		// For some reason the generatePreview function hangs with the existing DOM
		const test = document.createElement('div');
		e.dataTransfer.setDragImage(test, 0, 0);
	}

	paneDragOver(e, pane) {
		// Check if the element should accept drag-drop action
		if (pane.dropDirection === undefined || dragSourcePane === pane) {
			return;
		}

		// Enable drag-drop action
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';

		// Set current drag-drop target
		dragTargetPane = pane;
		dragTargetElement = e.currentTarget;
		const targetBounds = dragTargetElement.getBoundingClientRect();

		// Calculate distance from each edge
		const distance = {};
		distance[DIRECTION_LEFT] = e.clientX - targetBounds.left;
		distance[DIRECTION_RIGHT] = targetBounds.right - e.clientX;
		distance[DIRECTION_TOP] = e.clientY - (targetBounds.top + 20);
		distance[DIRECTION_BOTTOM] = targetBounds.bottom - e.clientY;

		// Determine direction based on distances
		let direction = DIRECTION_LEFT;
		direction = (distance[direction] > distance[DIRECTION_RIGHT]) ? DIRECTION_RIGHT : direction;
		direction = (distance[direction] > distance[DIRECTION_TOP]) ? DIRECTION_TOP : direction;
		direction = (distance[direction] > distance[DIRECTION_BOTTOM]) ? DIRECTION_BOTTOM : direction;

		pane.dropDirection.set(direction);
	}

	paneDragLeave(e, pane) {
		// Check if the element left was a valid drag-drop target
		if (pane.dropDirection === undefined || !dragTargetElement) {
			return;
		}

		// Reset drag-drop target
		dragTargetPane.dropDirection.set(null);
		dragTargetPane = null;
		dragTargetElement = null;
	}

	paneDragDrop(e, pane) {
		// Only fire once
		e.stopPropagation();

		// Check if the pane being dropped belongs to another window,
		// if so move it's session to this window.
		const windowUID = e.dataTransfer.getData('exTerm/windowUID');
		const sessionUID = e.dataTransfer.getData('exTerm/sessionUID');
		if (windowUID === global.windowUID) {
			// TODO: REPLACE THIS WITH A GETTER USING sessionUID
			dragSourcePane.parent.paneRemove(dragSourcePane);
		} else {
			ipcRenderer.send(`session:${sessionUID}:windowChange`, global.windowUID);
			dragSourcePane = sessionUID;
		}

		// Drop source pane onto target
		const dropDirection = dragTargetPane.dropDirection.get();
		pane.drop(dragSourcePane, dropDirection);

		// Clear drag action
		if (dragSourceElement) {
			dragSourceElement.setAttribute('draggable', false);
			document.body.classList.remove('dragging');
		}

		if (dragTargetPane) {
			dragTargetPane.dropDirection.set(null);
		}

		dragSourcePane = null;
		dragSourceElement = null;
		dragTargetPane = null;
		dragTargetElement = null;
	}

	paneDragStop(e) {
		// Only fire once
		e.stopPropagation();

		// Clear drag action
		if (dragSourceElement) {
			dragSourceElement.setAttribute('draggable', false);
			document.body.classList.remove('dragging');
		}

		if (dragTargetPane) {
			dragTargetPane.dropDirection.set(null);
		}

		dragSourcePane = null;
		dragSourceElement = null;
		dragTargetPane = null;
		dragTargetElement = null;
	}

	render() {
		const pane = this.props.pane;
		const tab =  pane.tab.get();
		const paneActive = tab.paneActive.get();
		const relayGroupUID = pane.relayGroupUID.get();
		const activeRelayGroupUID = paneActive.relayGroupUID.get();

		const isActive = pane === paneActive;
		const isAlone = tab.paneRoot.get().panes === undefined;
		const isReceivingBroadcast = relayGroupUID && relayGroupUID === activeRelayGroupUID;
		const dropDirection = pane.dropDirection.get();

		return (
			<div
				onDragStart={ (e) => this.paneDragStart(e, pane) }
				onDragEnd={ (e) => this.paneDragStop(e) }

				onDragOver={ (e) => this.paneDragOver(e, pane)  }
				onDragLeave={ (e) => this.paneDragLeave(e, pane)  }
				onDrop={ (e) => this.paneDragDrop(e, pane) }

				className={ classNames('pane', 'fill', this.props.className, { noTitle: isAlone}) }
			>
				<Overlay key="overlay" pane={ pane }
					onClick={ () => this.paneActivate(pane) }
					onContextMenu={ () => this.paneMenu(pane) }
					className={ classNames({ hide: isActive, clear: isReceivingBroadcast, noTitle: isAlone }) }
				></Overlay>

				<DropIndicator key="dropIndicator"
					className={ classNames({
						droppingLeft: dropDirection === DIRECTION_LEFT,
						droppingRight: dropDirection === DIRECTION_RIGHT,
						droppingTop: dropDirection === DIRECTION_TOP,
						droppingBottom: dropDirection === DIRECTION_BOTTOM
					}) }
				></DropIndicator>

				<TitleBar key="titlebar" pane={ pane }
					onClose={ () => this.paneClose(pane) }
					onActivate={ () => this.paneActivate(pane) }
					onMenu={ () => this.paneMenu(pane) }
					onMouseDown={ (e) => this.paneDragAllow(e) }
					onMouseUp={ (e) => this.paneDragBlock(e) }
					className={ classNames({ hide: isAlone }) }
				></TitleBar>

				<Emulator key={ pane.uid } pane={ pane }
					onContextMenu={ () => { this.paneMenu(pane) } }
					className={ classNames('fill', { active: isActive }) }
				></Emulator>
			</div>
		);
	}
});
