    Ext.define('CustomCard', {
        extend: 'Rally.ui.cardboard.Card',
        alias: 'widget.customcard',

        afterRender: function() {
            this.callParent(arguments);
            var color = this._setColor();
            var colorDiv = this.getEl().down('.artifact-color');
            colorDiv.setStyle('backgroundColor', color);
        },

        reRender: function() {
            this.callParent(arguments);
            var color = this._setColor();
            var colorDiv = this.getEl().down('.artifact-color');
            colorDiv.setStyle('backgroundColor', color);
        },

        _setColor: function(){
            var color;
            var workProduct = this.getRecord().get('WorkProduct');
            var scheduleState = workProduct['ScheduleState'];
            if (scheduleState === "Accepted") {
                color = 'blue';
            } else {
                color = 'gray';
            }
            return color;
        }

    });