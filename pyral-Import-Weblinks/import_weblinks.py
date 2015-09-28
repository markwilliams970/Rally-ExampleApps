import sys
import os
import csv
from pyral import Rally, rallySettings

def main(args):

    # Settings
    rally_server = 'rally1.rallydev.com'
    user_id = 'user@company.com'
    rally_password = 't0p$3cr3t'
    my_workspace = 'My Workspace'
    my_project = 'My Project'
    weblinks_csv = 'story_weblinks.csv'

    weblink_field_id = "c_MarksWeblink"

    csvfile  = open(weblinks_csv, "rb")
    weblinksreader = csv.reader(csvfile)

    # Rally Connection info
    rally = Rally(rally_server, user_id, rally_password, workspace=my_workspace, project=my_project)

    # Set logging
    rally.enableLogging('import_weblinks.log')

    # Get a handle to Rally Project
    proj = rally.getProject()


    # Column name to index mapping
    column_name_index_lookup = {
        0 : 'FormattedID',
        1 : 'WebLinkID',
        2 : 'WebLinkLabel'
    }

    rownum = 0
    for row in weblinksreader:
        # Save header row.
        if rownum == 0:
            header = row
        else:
            print "Importing Weblink count %d" % (rownum)
            colnum = 0
            for col in row:
                column_name = column_name_index_lookup[colnum]
                if column_name == "FormattedID":
                    story_formatted_id = col
                elif column_name == "WebLinkID":
                    web_link_id = col
                elif column_name == "WebLinkLabel":
                    web_link_label = col
                colnum += 1

            # Find the story to add the weblink to
            query_criteria = 'FormattedID = "%s"' % story_formatted_id
            response = rally.get('Story', fetch=True, query=query_criteria)
            if response.errors:
                sys.stdout.write("\n".join(errors))
                sys.exit(1)
                


            if response.resultCount == 0:
                print "No Story %s found in Rally - No Parent will be assigned." % (story_formatted_id)
            else:
                print "Story %s found in Rally - Weblink will be added." % (story_formatted_id)
                story_in_rally = response.next()
                story_update_data = {
                    "FormattedID": story_formatted_id,
                    weblink_field_id: {
                        "LinkID": web_link_id,
                        "DisplayString": web_link_label
                    }
                }
            try:
                story_updated = rally.update('HierarchicalRequirement', story_update_data)
            except Exception, details:
                sys.stderr.write('ERROR: %s \n' % details)
                sys.exit(1)
            print "Story Updated created, ObjectID: %s  FormattedID: %s" % (story_updated.oid, story_updated.FormattedID)
        rownum += 1

if __name__ == '__main__':
    main(sys.argv[1:])