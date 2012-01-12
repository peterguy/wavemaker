/*
 *  Copyright (C) 2011 VMware, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

dojo.provide("wm.base.widget.List_design");
dojo.require("wm.base.widget.List");
dojo.require("wm.base.Control_design");


wm.Object.extendSchema(wm.VirtualList, {

    /* wm.List group; selection subgroup */
    multiSelect: { ignore: 1, group: "widgetName", subgroup: "selection", order: 40},    // FIXME: disabling this as we're not using it at all, and grid supports it.
    toggleSelect: {group: "widgetName", subgroup: "selection", order: 41},

    /* Ignored Group */
    box: { ignore: 1 },

    /* Methods group */
    getCount: {method:1, returns: "Number"},
    getItem: {method:1, returns: "wm.ListItem"},
    getItemByCallback: {method:1, returns: "wm.ListItem"},
    getItemByFieldName: {method:1, returns: "wm.ListItem"},
    removeItem: {method:1},
    setHeaderVisible: {method:1},
    clear: {method:1},
    getSelectedIndex: {method:1, returns: "Number"},
    selectByIndex: {method:1},
    select: {method:1},
    eventSelect: {method:1},
    eventDeselect: {method:1},
    deselectAll: {method:1}
});


// design-time only
wm.Object.extendSchema(wm.List, {
    /* widgetName group; data subgroup */
    editColumns:       {group: "widgetName", subgroup: "layout", order:5, requiredGroup: 1, contextMenu: true, operation: 1},
    dataSet:           {group: "widgetName", subgroup: "data", order: 1, requiredGroup: 1, bindTarget: 1, isList: true, simpleBindTarget: true, editor: "wm.prop.DataSetSelect", editorProps: {listMatch: true, widgetDataSets: true, allowAllTypes: true}},
    dataFields:        {group: "widgetName", subgroup: "data", order: 50, advanced:1},
    columnWidths:      {group: "widgetName", subgroup: "layout", order: 51, advanced:1},

    /* Display group; layout subgroup */
    headerVisible: {group: "display", subgroup: "layout", order: 1}, /* Or does this go in the style group? or in the widgetName group? */
    
    /* Events group; flagged as advanced any event NOT compatable with DojoGrid */
    onSelectionChange: {order: 1, group: "events"},
    onselect: {order: 2, advanced:1, group: "events"},   
    ondeselect: {order: 3, advanced:1, group: "events"},
    onclick: {order: 4, advanced:1, group: "events"},
    ondblclick: {order: 5, advanced:1, group: "events"},
    onsetdata: {order: 10, advanced:1, group: "events"},
    onformat: {order:15, advanced:1, group: "events"},
    onGridButtonClick: {order: 20, group: "events"},

    /* Hidden/bindSource group */
    selectedItem: { ignore: 1, bindSource: 1, isObject: true, simpleBindProp: true },
    emptySelection: { ignore: true, bindSource: 1, type: "Boolean" },

    /* Operations group */
    updateNow: {group: "operation", operation:1},    

    /* Hidden/ignored group */
    columns: {hidden:1},
    disabled: { ignore: 1 },

    /* Methods group */
    getEmptySelection: {method:1, returns: "Boolean"},
    setColumnWidths: {method:1},
    //getDataItemCount: {method:1, returns: "Number"},
    setDataSet: {method:1},
    getItemData: {method:1, returns: "Object"}   

});

wm.List.description = "Displays list of items.";

wm.List.extend({
    updateNow: function() {this.update();},
    showMenuDialog: function(e){
	if (!this.columns) {
	    this.columns = [];
	    this.updateColumnData();
	}
	studio.gridDesignerDialog.show();
	studio.gridDesignerDialog.page.setGrid(this);
    },
    updateColumnData: function () {
	var defaultSchema = {dataValue: {type: this.dataSet.type}}; // this is the schema to use if there is no schema (i.e. the type is a literal)
        var viewFields = this.getViewFields() || defaultSchema;
        dojo.forEach(viewFields, function (f, i) {
            // if the column already exists, skip it
            if (dojo.some(this.columns, function (item) {
                return item.field == f.dataIndex;
            })) return;

	    var schema = wm.typeManager.getTypeSchema(this.dataSet.type) || defaultSchema;
            // don't show one-to-many subentities in the grid
            if (wm.typeManager.isPropInList(schema, f.dataIndex)) return;

            var align = 'left';
            var width = '100%';
            var formatFunc = '';
            if (f.displayType == 'Number') {
                align = 'right';
                width = '80px';
            } else if (f.displayType == 'Date') {
                width = '80px';
                formatFunc = 'wm_date_formatter';
            }
            this.columns.push({
                show: i < 15,
                field: f.dataIndex,
                title: wm.capitalize(f.dataIndex),
                width: width,
                displayType: f.displayType,
                align: align,
                formatFunc: formatFunc
            });
        }, this);

        var newcolumns = [];
        dojo.forEach(this.columns, dojo.hitch(this, function (col) {
            // we don't update custom fields
            if (col.isCustomField) {
                newcolumns.push(col);
                return;
            }
            // If the column is still in the viewFields after whatever change happened, then do nothing
            if (dojo.some(viewFields, dojo.hitch(this, function (field) {
                return field.dataIndex == col.field;
            }))) {
                newcolumns.push(col);
                return;
            }

            // col is no longer relevant
            return;
        }));
        this.columns = newcolumns;
    },
	getViewFields: function(){
	    var fields = [];
	    if (this.dataSet instanceof wm.LiveVariable)
		fields = this.dataSet.getViewFields();
	    else if (this.dataSet instanceof wm.Variable)
		fields = wm.getDefaultView(this.dataSet.type) || [];
	    return fields;
	},

    editColumns:function() {
	return this.showMenuDialog();
    },
    set_columns: function(inColumns){
	this.setColumns(inColumns);
	this._render();
    }

});



wm.Object.extendSchema(wm.FocusableList, {
	focusEventTime: { ignore: 1 },
	nextFocus: {bindable: 1, type: "wm.FocusableList"},
	priorFocus: {bindable: 1, type: "wm.FocusableList"},
	hasFocus: {ignore:1},
	focusOnStart: {type: "boolean"},
	defaultFocusListIndex: {}
	
});

wm.Object.extendSchema(wm.FocusablePanel, {
	focusEventTime: { ignore: 1 }
});


