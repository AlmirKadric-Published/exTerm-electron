import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';


import './styles.less';


export default observer(
	class Overlay extends React.Component {
		render() {
			return (
				<div className={ classNames('drop-indicator', 'fill', this.props.className) }>
					<div className="overlay"></div>
				</div>
			);
		}
	});
