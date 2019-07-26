import React, { Component } from 'react';
import I18n from 'i18nline/lib/i18n';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

/**
 * TagsTable is a component for displaying OSM feature tags as a table.
 */
class TagsTable extends Component {
	render() {
		return <Paper style={Object.assign({overflowX: "auto"}, this.props.style)}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>{I18n.t("Key")}</TableCell>
						<TableCell>{I18n.t("Value")}</TableCell>
					</TableRow>
				</TableHead>
				
				<TableBody>
					{Object.entries(this.props.tags).map((e, i) => (
						<TableRow key={i}>
							<TableCell>{e[0]}</TableCell>
							<TableCell>{e[1]}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Paper>;
	}
}

export default TagsTable;
