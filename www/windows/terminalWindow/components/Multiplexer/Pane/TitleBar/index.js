import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';


import './styles.less';


export default observer(
class TitleBar extends React.Component {
	render() {
		const pane = this.props.pane;
		const name = pane.name.get();
		const sessionUID = pane.sessionUID.get();

		return (
			<div
				onContextMenu={ this.props.onMenu }

				className={ classNames('title-bar', this.props.className) }
			>
				<div
					onClick={ this.props.onClose }
					className="close fa fa-times"
				></div>

				<div
					onMouseDown={ this.props.onMouseDown }
					onMouseUp={ this.props.onMouseUp }
					onClick={ this.props.onActivate }
					className="title"
				>
					<div className="fill inner">{ sessionUID }</div>
				</div>

				<div
					onClick={ this.props.onMenu }
					className="menu fa fa-bars"
				></div>
			</div>
		);
	}
});
