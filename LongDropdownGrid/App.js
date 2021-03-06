Ext.define('CustomApp', {

    // Customize THESE FOLLOWING TWO FIELDS ONLY!!
    // _artifactType - Set this to be the artifact type for your Grid, i.e.:
    //      _artifactType: "HierarchicalRequirement",
    //      _artifactType: "Defect",
    //      _artifactType: "Task",
    // etc.
    // _customFieldDisplayName : "Defect Dropdown",
    //      this needs to be set to the DISPLAY NAME of the custom field that contains the extra-long dropdown list.

    _artifactType           : "Defect",
    _customFieldDisplayName : "Defect Dropdown",

    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
        {
            xtype: 'container',
            itemId: 'customFieldDropdown',
            columnWidth: 1
        }
    ],

    _rallyServer: null,
    _currentContext: null,

    _customFieldCombobox: null,
    _customFieldName: null,
    _allowedValuesStore: null,

    _getAllowedValues: function(scope, allowedValuesCollection) {

        // console.log('_getAllowedValues');

        var me = scope;
        var allowedValuesCount       = allowedValuesCollection.getCount();
        var allowedValuesData        = [];

        allowedValuesCollection.load({
            callback: function(records, operation, success) {
                // console.log('_callback');
                Ext.Array.each(records, function(record) {
                    var allowedValueString = record.get('StringValue');
                    allowedValuesData.push({
                        "Name": allowedValueString,
                        "Value": allowedValueString
                    });

                });
                me._allowedValuesStore = Ext.create('Ext.data.Store', {
                    fields: ['Name', 'Value'],
                    data: allowedValuesData
                });

                me._getData(me);
            }
        });

    },

    _hydrateAllowedValuesCollection: function(allowedValuesCollection, scope) {

        // console.log('_hydrateAllowedValuesCollection');

        var deferred = Ext.create('Deft.Deferred');
        var me = scope;

        var allowedValuesCollectionRef    = allowedValuesCollection.get('_ref');

        Rally.data.ModelFactory.getModel({
            type: 'AllowedAttributeValue',
            success: function(allowedAttributesModel) {
                var allowedAttributesID = Rally.util.Ref.getOidFromRef(allowedValuesCollectionRef);
                allowedAttributesModel.load(allowedAttributesID, {
                    fetch: ['StringValue', 'ValueIndex'],
                    callback: function(allowedAttributeValue, operation) {
                        // console.log(allowedAttributeValue);
                    }
                });
            }
        });

        allowedValuesCollection.load({
            callback: function(records, operation, success) {
                deferred.resolve(records);
            }
        });
        return deferred;
    },

    _getAttributes: function(scope, data) {

        // console.log('_getAttributes');

        var me = scope;
        var promises = [];

        var typeDefinition = data[0];

        promises.push(me._hydrateAttributesCollection(data[0], me));

        Deft.Promise.all(promises).then({
            success: function(results) {
                var theseAttributes = results[0];
                var match_found = false;
                Ext.Array.each(theseAttributes, function(attribute) {
                    var attributeName = attribute.get('Name');
                    if (attributeName === me._customFieldDisplayName) {
                        match_found = true;
                        var allowedValuesCollection = attribute.getCollection('AllowedValues',
                            {fetch: ['StringValue','ValueIndex'], limit: Infinity});
                        me._getAllowedValues(me, allowedValuesCollection);
                    }
                });
                if (match_found === false) {
                    Ext.Msg.alert('Custom Field not found!', 'Custom Field with Display Name: ' + me._customFieldDisplayName + ' not found!');
                }
            }
        });
    },

    _hydrateAttributesCollection: function(typeDefinition, scope) {

        // console.log('_hydrateAttributesCollection');

        var deferred = Ext.create('Deft.Deferred');
        var me = scope;

        var typeDefinitionRef    = typeDefinition.get('_ref');

        var attributesCollection = typeDefinition.getCollection("Attributes",
            { fetch: ['Name','AllowedValues'] }
        );

        var attributesCount       = attributesCollection.getCount();

        attributesCollection.load({
            callback: function(records, operation, success) {
                deferred.resolve(records);
            }
        });
        return deferred;

    },

    _populateAllowedValuesList: function() {

        // console.log('_getAllowedValues');

        var me = this;
        var attrDefStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'TypeDefinition',
            autoLoad: true,
            filters: [
                {
                    property: 'Name',
                    value: me._artifactType
                }
            ],
            listeners: {
                load: function(store, data, success) {
                    me._getAttributes(me, data);
                }
            },
            fetch: ['Name','Attributes','AllowedValues']
        });
    },

    _selectedCallback: function(combobox, data, record) {

        var me = this;

        var recordObjectID = record.get('ObjectID');
        var selectedValue = combobox.rawValue;

        var objectModel = Rally.data.ModelFactory.getModel({
            type: me._artifactType,
            scope: this,
            success: function(model, operation) {
                model.load(recordObjectID, {
                    scope: this,
                    success: function(model, operation) {
                        model.set(me._customFieldName, selectedValue);
                        model.save({
                            callback: function(result, operation) {
                                if(operation.wasSuccessful()) {
                                    // console.log("Successfully updated dropdown value.");
                                } else {
                                    Ext.Msg.alert('Not updated!', 'A problem occurred when attempting to save updated value.');
                                }
                            }
                        });
                    }
                });
            }
        });
    },

    _onDataLoaded: function(store, data) {

        var me = this;
        var records = [];
        // console.log(me._customFieldName);
        Ext.Array.each(data, function(record) {
            var artifactRef             = record.get('_ref');
            var artifactObjectID        = record.get('ObjectID');
            var artifactFormattedID     = record.get('FormattedID');
            var artifactName            = record.get('Name');
            var artifactType            = record.get('_type');
            var customFieldValue        = record.get(me._customFieldName);
            records.push({
                _ref: record.get('_ref'),
                ObjectID: record.get('ObjectID'),
                FormattedID: {"FormattedID": artifactFormattedID, "ObjectID": artifactObjectID, "Type": artifactType},
                Name: artifactName,
                CustomField: customFieldValue
            });
        });

        var formattedIdTemplate = "<a href='{0}/#/detail/{1}/{2}' target='_blank'>{3}</a>";

        this.add({
            xtype: 'rallygrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: records,
                pageSize: 50
            }),
            columnCfgs: [
                {
                    text: 'Formatted ID', dataIndex: 'FormattedID',
                    renderer: function(value) {
                        return Ext.String.format(formattedIdTemplate, me._rallyServer, value.Type, value.ObjectID, value.FormattedID);
                    }
                },
                {
                    text: 'Name', dataIndex: 'Name', flex: 1
                },
                {
                    text: me._customFieldDisplayName,
                    renderer: function (value, model, record) {
                        var defaultValue = record.get('CustomField');
                        var id = Ext.id();
                        Ext.defer(function () {
                            Ext.widget('combobox', {
                                renderTo: id,
                                store:        me._allowedValuesStore,
                                queryMode:    'local',
                                displayField: 'Name',
                                valueField:   'Value',
                                listeners: {
                                    //This event will fire when combobox rendered completely
                                    afterrender: function() {
                                        if (defaultValue) {
                                            this.setValue(defaultValue);
                                        }
                                    },
                                    select: function(combobox, data) {
                                        me._selectedCallback(combobox, data, record);
                                    }
                                }
                            });
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    },
                    flex: 1
                }
            ]
        });

    },

    _getData: function(scope) {
        // console.log('_buildUI');
        var me = scope;

        var currentUser = me._currentContext.getUser();
        var currentWorkspaceRef = me._currentContext.getWorkspaceRef();
        var currentProjectRef = me._currentContext.getProjectRef();
        var currentProjectScopeUp = me._currentContext.getProjectScopeUp();
        var currentProjectScopeDown = me._currentContext.getProjectScopeDown();

        Ext.create('Rally.data.wsapi.Store', {
            model: me._artifactType,
            autoLoad: true,
            fetch: true,
            limit: Infinity,
            listeners: {
                load: me._onDataLoaded,
                scope: this
            },
            context: {
                projectScopeUp: currentProjectScopeUp,
                projectScopeDown: currentProjectScopeDown,
                workspace: currentWorkspaceRef,
                project: currentProjectRef
            }
        });

    },

    _getHostName: function() {
        testUrl = window.location.hostname || "rally1.rallydev.com";
        testUrlSplit = testUrl.split("/");
        if (testUrlSplit.length === 1) {
            this._rallyHost = "rally1.rallydev.com";
        } else {
            this._rallyHost = testUrlSplit[2];
        }
        this._rallyServer = "https://" + this._rallyHost;
    },

    launch: function() {

        var me = this;
        me._currentContext = me.getContext();

        me._customFieldName= "c_" + me._customFieldDisplayName.replace(/\s+/g, ''),
        me._getHostName();
        me._populateAllowedValuesList();

    }
});