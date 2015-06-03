StoryDeepCopyToFeature
=================================================

This is a modified version of the Story Deep Copy App, that allows the user to choose
a target Feature to associate the Story to when copied.
![App Screenshot](https://raw.githubusercontent.com/markwilliams970/Rally-ExampleApps/master/StoryDeepCopyToFeature/images/screenshot1.pnga)

## Usage:

Grab the source code and install as a custom HTML app in Rally. If you have a customized
Feature type (i.e. your bottom-level PortfolioItems are called something other than
'Feature', then follow these steps:

Before installing, save the app source it to a local file. Customize the following lines:

```

	// NOTE: CHANGE THIS IF YOU HAVE CUSTOMIZED PI TYPES!!
	var typeFeature = "PortfolioItem/Feature";

```

For example, if your lowest level PortfolioItems are called "Pebbles" then Change: `PortfolioItem/Feature` to `PortfolioItem/Pebble`

Save the file and install as a Custom HTML App in Rally. Make no other changes to the code.


## License

This App is released under the MIT license.  See the file [LICENSE](./LICENSE) for the full text.

## Support
This app is strictly a code sample and is provided as-is. It's not a part of Rally's App Catalog. Rally Support cannot provide any assistance on the use, configuration, or troubleshooting of this app.

##Documentation for SDK

You can find the documentation on our help [site.](https://developer.rallydev.com)
