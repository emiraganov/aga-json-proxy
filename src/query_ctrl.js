import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {
	constructor($scope, $injector)  {
		super($scope, $injector);
		this.scope = $scope;
		console.log("constructor", this.target.target);
		
		this.operators = ["<", ">", "=", "!="];
		this.target.target = this.target.target || 'select metric';
		this.target.type = this.target.type || 'timeserie';
		this.target.segments = this.target.segments || [];
	}

	getOptions(query) {
		return this.datasource.metricFindQuery(query || '').then(result => {
			return result.data;
		});
	}

	getSegmentOptions(segment, query) {
		return this.datasource.metricFindQuery(segment.name).then(result => {
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
		console.log("onChangeInternal");
		this.panelCtrl.refresh(); // Asks the panel to refresh data.
	}

}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

