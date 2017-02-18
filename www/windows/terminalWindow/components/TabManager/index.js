import React from 'react';
import classNames from 'classnames';

import { observer } from 'mobx-react';

import TabButton from './TabButton';
import Multiplexer from '../Multiplexer';


import './styles.less';


export default observer(
class TabManager extends React.Component {
	render() {
		const tabs = this.props.layout.tabs;
		const tabActive = this.props.layout.tabActive.get();
		const paneRoot = tabActive.paneRoot.get();

		return (
			<div className="tabManager">
				<div className={ classNames('tabButtons', { hide: tabs.length <= 1 }) }>
				{tabs.map((tab) =>
					<TabButton key={ tab.uid } tab={ tab }
						className={classNames({ active: tab === tabActive })}
					></TabButton>
				)}
				</div>

				<Multiplexer key={ paneRoot.uid } pane={ paneRoot }
					className={ classNames('tabView', { noTabs: tabs.length <= 1 }) }
				></Multiplexer>
			</div>
		);
	}
});
