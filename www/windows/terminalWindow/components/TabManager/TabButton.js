import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';


export default observer(
class TabButton extends React.Component {
	render() {
		const tab = this.props.tab;
		const tabIndex = tab.getIndex();

		const btnClasses = classNames('tabButton', this.props.className);
		const commandOrControl = (global.isDarwin) ? '⌘' : '⌃';

		return (
			<div
				onClick={ () => tab.activate() }
				className={ btnClasses }
			>
				<div
					onClick={ (e) => { tab.close(); e.stopPropagation(); }}
					className="close fa fa-times"
				></div>

				<div className="name">{ tab.name }</div>

				{tabIndex < 9 && <div className="shortcut">{ commandOrControl }{ tabIndex + 1 }</div>}
			</div>
		);
	}
});
