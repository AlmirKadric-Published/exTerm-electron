import React from 'react';
import classNames from 'classnames';

import Pane from './Pane';
import PaneGroup from './PaneGroup';

import { observer } from 'mobx-react';


import './styles.less';


export default observer(
class Multiplexer extends React.Component {
	render() {
		const pane = this.props.pane;

		let paneType;
		if (pane.panes === undefined) {
			paneType = <Pane pane={ pane }></Pane>
		} else {
			paneType = <PaneGroup  pane={ pane }></PaneGroup>
		}

		return (
			<div
				style={ this.props.style }
				className={ classNames('multiplexer', 'fill', this.props.className) }
			>{ paneType }</div>
		);
	}
});
