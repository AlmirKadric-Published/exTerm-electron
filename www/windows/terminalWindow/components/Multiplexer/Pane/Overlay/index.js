import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';


import './styles.less';


export default observer(
class Overlay extends React.Component {
	render() {
		return (
			<div
				onClick={ this.props.onClick }
				onContextMenu={ this.props.onContextMenu }

				className={ classNames('overlay', this.props.className) }
			></div>
		);
	}
});
