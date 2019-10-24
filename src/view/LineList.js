import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

/**
 * Line list component shows a list of transport lines.
 */
class LineList extends Component {
	render() {
		return this.props.data ?
		<List component="nav">
			{Object.entries(this.props.data)
			.sort((a,b) => parseInt(b[1].ts) - parseInt(a[1].ts))
			.map(e => {
				const [ lid, line ] = e;
				return <ListItem
					button
					component={Link}
					key={lid}
					to={"/line/"+lid}
				>
					<ListItemAvatar>
						<transport-thumbnail
							data-transport-mode={line.type}
							data-transport-line-code={line.ref}
							data-transport-line-color={line.colour}>
						</transport-thumbnail>
					</ListItemAvatar>
					<ListItemText
						primary={line.name}
						secondary={line.operator}
					/>
				</ListItem>;
			})}
		</List>
		: <div></div>;
	}
}

export default LineList;
