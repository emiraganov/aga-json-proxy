import { QueryCtrl } from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {
	constructor($scope, $injector) {
		super($scope, $injector);
		this.scope = $scope;
		console.log("constructor", this.target.target);

		this.operators = ["<", ">", "=", "!="];
		this.target.target = this.target.target || 'select metric';
		this.target.type = this.target.type || 'timeserie';
		this.target.options = this.target.options || [];
		this.target.segments = this.target.segments || [];
	}

	getOptions(query) {
		if (query != "" && this.target.options.length > 0) {
			return this.target.options;
		}

		return this.datasource.metricFindQuery(query || '').then(result => {
			this.target.options = result.data;
			return result.data;
		});
	}

	getSegmentOptions(segment, query) {
		if (query != "" && segment.options.length > 0) {
			return segment.options;
		}

		return this.datasource.metricFindQuery(segment.name).then(result => {
			segment.options = result.data;
			return result.data;
		});
	}

	updateSegments() {
		if (this.target.target && this.target.target != 'select metric') {
			this.datasource.metricFindQuery(this.target.target || '').then(result => {
				this.target.segments = result.data;
				this.panelCtrl.refresh();
			});;
		}
	}

	toggleEditorMode() {
		this.target.rawQuery = !this.target.rawQuery;
	}

	onChangeTarget() {
		this.updateSegments();
	}

	onChangeInternal() {
		this.panelCtrl.refresh(); // Asks the panel to refresh data.
	}

}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

