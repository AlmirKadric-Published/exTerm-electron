import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import Multiplexer from '../index.js';
import Divider from './Divider';

import { transaction } from 'mobx';
import { observer } from 'mobx-react';

//
const { remote } = window.require('electron');
const { SPLIT_VERTICALLY } = remote.require('./constants.js');


import './styles.less';


export default observer(
class TitleBar extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.dragPanes = null;
	}

	/**
	 *
	 * @param paneBeforeI
	 * @param paneAfterI
	 * @param direction
	 */
	dividerDragStart(paneBeforeI, paneAfterI, direction) {
		this.dragPanes = { before: paneBeforeI, after: paneAfterI, direction };
		document.body.classList.add('dragging', (direction === SPLIT_VERTICALLY) ? 'col-resize' : 'row-resize');
	}

	/**
	 *
	 * @param e
	 */
	dividerDrag(e) {
		// Make sure we're still dragging
		if (e.buttons === 0) {
			this.dividerDragStop();
			return;
		}

		// Also if we're dragging a divider, resize the panes
		const dragPanes = this.dragPanes;
		if (dragPanes) {
			const pane = this.props.pane;
			const paneBeforeI = dragPanes.before;
			const paneAfterI = dragPanes.after;
			const direction = dragPanes.direction;

			const boundsBefore = ReactDOM.findDOMNode(this.refs['pane_' + paneBeforeI]).getBoundingClientRect();
			const boundsAfter = ReactDOM.findDOMNode(this.refs['pane_' + paneAfterI]).getBoundingClientRect();
			const farBefore = (direction === SPLIT_VERTICALLY) ? boundsBefore.left : boundsBefore.top;
			const farAfter = (direction === SPLIT_VERTICALLY) ? boundsAfter.left + boundsAfter.width : boundsAfter.top + boundsAfter.height;

			const cursorPos = (direction === SPLIT_VERTICALLY) ? e.clientX : e.clientY;
			const newRatio = (cursorPos - farBefore) / (farAfter - farBefore);

			const widths = pane.widths;
			const oldWidthBefore = widths[paneBeforeI];
			const oldWidthAfter = widths[paneAfterI];
			const newWidthBefore = newRatio * (oldWidthBefore + oldWidthAfter);
			const newWidthAfter = oldWidthBefore + oldWidthAfter - newWidthBefore;

			transaction(() => {
				widths[paneBeforeI] = newWidthBefore;
				widths[paneAfterI] = newWidthAfter;
				pane.widthsNormalise();
			});
		}
	}

	/**
	 *
	 */
	dividerDragStop() {
		this.dragPanes = null;
		document.body.classList.remove('dragging', 'col-resize', 'row-resize');
	}

	/**
	 *
	 * @returns {XML}
	 */
	render() {
		const pane = this.props.pane;

		const panes = pane.panes;
		const widths = pane.widths;
		const direction = pane.direction;

		const paneElements = panes.map((pane, index) =>
			<Multiplexer key={ pane.uid } pane={ pane } ref={ 'pane_' + index }
				style={ { 'flexBasis': `${widths[index]}%` } }
			></Multiplexer>
		);

		for (let i = panes.length - 1; i > 0; i -= 1) {
			const paneLeftI = i - 1;
			const paneRightI = i;

			paneElements.splice(i, 0,
				<Divider key={ 'divider-' + i }
					onMouseDown={ () => this.dividerDragStart(paneLeftI, paneRightI, direction) }
				></Divider>
			);
		}

		return (
			<div
				onMouseMove={ (e) => this.dividerDrag(e) }
				onMouseUp={ (e) => this.dividerDragStop(e) }

				className={ classNames('pane-group', 'fill', this.props.className, {
					vertical: direction === SPLIT_VERTICALLY,
					horizontal: direction !== SPLIT_VERTICALLY
				})}
			>{ paneElements }</div>
		);
	}
});
