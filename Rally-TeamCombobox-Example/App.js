Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
        {
            xtype: 'container',
            itemId: 'controlsContainer',
            columnWidth: 1
        }
    ],

    _projectUsersStore: null,
    _artifactTypeCombobox: null,

    _getProjectUsersStore: function(projectOID) {

        var me = this;

        var urlTemplate = "https://rally1.rallydev.com/slm/webservice/x/project/{0}/projectusers.js?query={1}&order={2}&dir={3}&fetch={4}";
        var order = "UserName,ObjectID";
        var dir = "ASC,ASC";
        var query = "((TeamMember = true) AND (Disabled = false))";
        var fetch = "UserName,FirstName,LastName,DisplayName,Disabled,Permission,TeamMember";
        var fields = ["_ref","UserName","FirstName","LastName","DisplayName","Disabled","Permission","TeamMember"];

        var projectUsersURL = Ext.String.format(urlTemplate, projectOID, query, order, dir, fetch);

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

                    me._buildComboBox();
                }
            }
        }).load();
    },

    _buildComboBox: function() {

        this._artifactTypeCombobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel:   'Choose Project User',
            store:        this._projectUsersStore,
            queryMode:    'local',
            displayField: 'DisplayName',
            valueField:   'UserName',
            listeners: {
                scope: this,
                'select': this._onUserSelected
            }
        });

        this.down('#controlsContainer').add(this._artifactTypeCombobox);        
    },

    _onUserSelected: function(combobox) {
        Ext.create('Rally.ui.dialog.ConfirmDialog', {
            title: "Selected User",
            message: "UserName of Selected User:" + combobox.getValue(),
            confirmLabel: "Ok",
            listeners: {
                confirm: function () {
                    return;
                }
            }
        });
    },

    launch: function() {

        var currentProjectRef = this.getContext().getProjectRef();
        var currentProjectOID = Ext.create('Rally.util.Ref', currentProjectRef).getOid(); // returns "workspace", 123

        this._getProjectUsersStore(currentProjectOID);
    }
});