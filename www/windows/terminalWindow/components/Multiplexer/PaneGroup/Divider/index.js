import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';


import './styles.less';


export default observer(
class Divider extends React.Component {
	render() {
		return (
			<div
				onMouseDown={ this.props.onMouseDown }

				className={ classNames('divider', this.props.className) }
			></div>
		);
	}
});
