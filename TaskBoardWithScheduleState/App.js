Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    requires:['CustomCard'],

    items: [
        {
            xtype: 'container',
            html: '<p style="font-size:12px"><strong><font color="blue">Blue-Colored </font></strong>Cards Associate to <strong><font color="blue">Accepted</font></strong> Work Products</p>',
            columnWidth: 1,
            width: 600
        },
        {
            xtype: 'container',
            itemId: 'iterationDropDown',
            columnWidth: 1
        },
        {
            xtype: 'container',
            itemId: 'ownerDropDown',
            columnWidth: 1,
            layout: {
                type: 'hbox'
            },
            padding: '10px'
        },
        {
            xtype: 'container',
            itemId: 'boardContainer',
            columnWidth: 1
        }
    ],

    cardBoard: null,
    selectedIteration: null,
    selectedOwner: null,
    filters: [],

    launch: function() {

        var me = this;
        var currentContext = this.getContext();

        // Grab and use the timebox scope if we have it
        var timeboxScope = currentContext.getTimeboxScope();
        if(timeboxScope) {
            var record = timeboxScope.getRecord();
            var name = record.get('Name');

            this.myIteration = record.data;
            this._onIterationSelect();

            // Otherwise add an iteration combo box to the page
        } else {
            // add the iteration dropdown selector
            this.down('#iterationDropDown').add( {
                xtype: 'rallyiterationcombobox',
                itemId : 'iterationSelector',
                fieldLabel: 'Choose Iteration',
                listeners: {
                    select: this._onIterationSelect,
                    ready:  this._onIterationSelect,
                    scope:  this
                },
                width: 400
            });
        }

        // Add Owner dropdown box
        this.down('#ownerDropDown').add({
            xtype: 'rallyusersearchcombobox',
            itemId: 'ownerSelector',
            fieldLabel: 'Filter Owner',
            project: currentContext.getProject(),
            columnWidth: 1,
            listeners: {
                select: this._onOwnerSelect,
                scope:  this
            }
        });

        // Add Clear Owner filter button
        this.down('#ownerDropDown').add({
            xtype: 'rallybutton',
            text: 'Clear Owner Filter',
            handler: function() {
                me.down('#ownerSelector').clearValue();
                me.selectedOwner = null;
                me._buildCardBoard();
            }
        });
    },

    onTimeboxScopeChange: function(newTimeboxScope) {
        this.callParent(arguments);

        if(newTimeboxScope) {
            var record = newTimeboxScope.getRecord();

            this.myIteration = record.data;
            this._onIterationSelect();
        }
    },

    _onIterationSelect : function() {

        if (_.isUndefined( this.getContext().getTimeboxScope())) {
            var value =  this.down('#iterationSelector').getRecord();
            this.myIteration = value.data;
        }

        var iterationName = this.myIteration.Name;
        this.selectedIteration = iterationName;

        this._buildCardBoard();

    },

    _onOwnerSelect : function() {

        var value = this.down('#ownerSelector').getRecord();
        this.selectedOwner = value.get('UserName')

        this._buildCardBoard();

    },

    _getFilters: function() {

        var me = this;
        var filters = [];

        if ( me.selectedIteration !== null) {
            filters.push({
                property: 'Iteration.Name',
                operator: '=',
                value: me.selectedIteration
            });
        }

        if ( me.selectedOwner !== null) {
            filters.push({
                property: 'Owner.UserName',
                operator: '=',
                value: me.selectedOwner
            });
        }
        return filters;
    },

    _buildCardBoard: function() {

        var me = this;

        if (this.cardBoard) {
            this.cardBoard.destroy();
        }

        this.cardBoard = Ext.create('Rally.ui.cardboard.CardBoard', {
            types: ['Task'],
            attribute: 'State',
            context: this.getContext(),
            cardConfig: {
                xtype: 'customcard',
                showIconsAndHighlightBorder: true,
                editable: false,
                fields: ['ToDo', 'Estimate', 'WorkProduct' ]
            },
            rowConfig: {
                field: 'WorkProduct'
            },
            storeConfig:{
                fetch: ['WorkProduct','ScheduleState','Owner','UserName'],
                filters: me._getFilters()
            }
        });

        this.down('#boardContainer').add(this.cardBoard);
    }
});