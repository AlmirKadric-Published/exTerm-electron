import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';
import { throttle } from 'lodash';


import './styles.less';


export default observer(
class Emulator extends React.Component {
	constructor(props, context) {
		super(props, context);

		// Throttled handgit statler to update terminal dimensions
		this.updateTerminal = throttle((container) => {
			const pane = this.props.pane;
			const terminal = pane.terminal;

			// In rare cases terminal will not be defined on the update
			// (sometimes update is triggered during terminal close)
			if (!terminal) {
				return;
			}

			// Make sure the terminal is attached to container
			if (container.childNodes.length === 0) {
				terminal.open(container);
			}

			// Fit the terminal to containers boundaries
			terminal.fit();
		}, 300, { trailing: true });
	}

	render() {
		const pane = this.props.pane;
		const baseSize = pane.baseFontSize;
		const fontSize = baseSize + pane.fontSizeModifier.get();

		return (
			<div
				ref={ (container) => container && this.updateTerminal(container) }
				onContextMenu={ this.props.onContextMenu }
				className={ classNames('emulator', this.props.className) }
				style={ { 'fontSize': `${fontSize}px` } }
			>
			</div>
		);
	}
});
