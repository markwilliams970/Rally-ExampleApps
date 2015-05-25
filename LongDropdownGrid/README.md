LongDropdownGrid
=========================

This is a custom grid that provides a dropdown editor/column intended to handle Dropdown fields where the custom field contains more than 200 entries, as a workaround for DE24698.

![App Screenshot](https://raw.githubusercontent.com/markwilliams970/Rally-ExampleApps/master/LongDropdownGrid/images/screenshot1.png)

## Usage:

Grab the source code from:

And save it to a local file. Customize the following lines from App-uncompressed.html as follows:

``
    // Customize THESE FOLLOWING TWO FIELDS ONLY!!
    // _artifactType - Set this to be the artifact type for your Grid, i.e.:
    //      _artifactType: "HierarchicalRequirement",
    //      _artifactType: "Defect",
    //      _artifactType: "Task",
    // etc.
    // _customFieldDisplayName : "Defect Dropdown",
    //      this needs to be set to the DISPLAY NAME of the custom field that contains the extra-long dropdown list.

    _artifactType           : "Defect",
    _customFieldDisplayName : "Defect Dropdown"
``

Then install into your environment as a Custom HTML App. See directions here:

[Custom Page Directions from Rally Help](https://help.rallydev.com/use_apps#create)

## License

This App is released under the MIT license.  See the file [LICENSE](./LICENSE) for the full text.

## Support
This app is strictly a code sample and is provided as-is. It's not a part of Rally's App Catalog. Rally Support cannot provide any assistance on the use, configuration, or troubleshooting of this app.

##Documentation for SDK

You can find the documentation on our help [site.](https://developer.rallydev.com)
