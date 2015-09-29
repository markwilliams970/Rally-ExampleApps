Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
        {
            xtype: 'container',
            itemId: 'controlsContainer',
            columnWidth: 1,
            layout: 'vbox'
        },
        {
            xtype: 'container',
            itemId: 'gridContainer',
            columnWidth: 1
        }
    ],

    _projectUsersStore: null,
    _projectComboBox: null,
    _projectUsersGrid: null,
    _baseURL: 'https://rally1.rallydev.com',

    _getProjectUsersStore: function(projectOID) {

        var me = this;

        var urlTemplate = "{0}/slm/webservice/x/project/{1}/projectusers.js?query={2}&order={3}&dir={4}&fetch={5}&pagesize={6}";
        var order = "UserName,ObjectID";
        var dir = "ASC,ASC";
        // var query = "((TeamMember = true) AND (Disabled = false))";
        var query = "(Disabled = false)";
        var fetch = "UserName,FirstName,LastName,DisplayName,Disabled,Permission,TeamMember";
        var fields = ["_ref","UserName","FirstName","LastName","DisplayName","Disabled","Permission","TeamMember"];
        var pagesize = "200";

        var projectUsersURL = Ext.String.format(urlTemplate, me._baseURL, projectOID, query, order, dir, fetch, pagesize);

        var projectUsersProxy = new Ext.data.proxy.Rest({
            url : projectUsersURL,
            headers : {
            },
            reader :  {
                type : 'json',
                root : 'QueryResult.Results'
            }
        });

        var newRecords = [];
        var userRefURLTemplate = "https://{0}/slm/webservice/v2.0/user/{1}";

        var userStore = Ext.create('Ext.data.Store', {
            fields: fields,
            restful : true,
            proxy : projectUsersProxy,
            listeners: {
                load: function(store, data, success) {
                    var records = data;
                    Ext.Array.each(records, function(record) {
                        var ref = record.get("_ref");
                        var refSplit = ref.split("/");
                        var baseUrl = refSplit[2];
                        var userOID = refSplit[refSplit.length-1].split(".")[0];
                        var userRef = Ext.String.format(userRefURLTemplate, baseUrl, userOID);

                        var newUserRecord = {
                            "_ref": userRef,
                            "UserName": record.get("UserName"),
                            "FirstName": record.get("FirstName"),
                            "LastName": record.get("LastName"),
                            "DisplayName": record.get("DisplayName"),
                            "Disabled": record.get("Disabled"),
                            "Permission": record.get("Permission"),
                            "TeamMember": record.get("TeamMember")
                        };

                        newRecords.push(newUserRecord);
                    });

                    me._projectUsersStore = Ext.create('Ext.data.Store', {
                        fields: fields,
                        data: newRecords
                    });

                    me._buildGrid();
                }
            }
        }).load();
    },

    _buildGrid: function() {

        var me = this;

        if (me._projectUsersGrid) {
            me._projectUsersGrid.destroy();
        }

        me._projectUsersGrid = Ext.create('Rally.ui.grid.Grid', {
            itemId: 'projectUsersGrid',
            store: me._projectUsersStore,
            columnCfgs: [
                {
                    text: 'UserName', dataIndex: 'UserName', flex: 1
                },
                {
                    text: 'DisplayName', dataIndex: 'DisplayName', flex: 1
                },
                {
                    text: 'Permission', dataIndex: 'Permission'
                }
            ]
        });

        me.down('#gridContainer').add(me._projectUsersGrid);
    },

    _onProjectSelected: function() {

        var me = this;
        var selectedProjectRef = me._projectComboBox.getValue();
        var selectedProjectOID = Ext.create('Rally.util.Ref', selectedProjectRef).getOid();

        me._getProjectUsersStore(selectedProjectOID);

    },

    launch: function() {

        var me = this;

        me._projectComboBox = Ext.create('Rally.ui.picker.project.ProjectPicker', {
            fieldLabel: 'Select Project',
            margin: 10,
            workspace:  this.getContext().getWorkspace()._ref,                
            listeners: {
                change: me._onProjectSelected,
                scope: me
            }
        });

        me.down('#controlsContainer').add(me._projectComboBox);
    }
});