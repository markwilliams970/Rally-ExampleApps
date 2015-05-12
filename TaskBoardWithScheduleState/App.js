Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    requires:['CustomCard'],

    items: [
        {
            xtype: 'container',
            html: '<font color="blue">Blue-Colored</font> Cards Associate to <font color="blue">Accepted</font> Work Products'
        },
        {
            xtype: 'container',
            itemId: 'iterationDropDown',
            columnWidth: 1
        },
        {
            xtype: 'container',
            itemId: 'boardContainer',
            columnWidth: 1
        }
    ],

    cardBoard: null,


    launch: function() {

        // Grab and use the timebox scope if we have it
        var timeboxScope = this.getContext().getTimeboxScope();
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
                listeners: {
                    select: this._onIterationSelect,
                    ready:  this._onIterationSelect,
                    scope:  this
                }
            });
        }

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

        if (this.cardBoard) {
            console.log('got here');
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
                fields: ['ToDo', 'WorkProduct']
            },
            rowConfig: {
                field: 'WorkProduct'
            },
            storeConfig:{
                fetch: ['WorkProduct','ScheduleState'],
                filters: [
                    {
                        property: 'Iteration.Name',
                        operator: '=',
                        value: iterationName
                    }
                ]
            }
        });

        this.down('#boardContainer').add(this.cardBoard);
    }
});