# unoriginal_name
ACE Data Formatting and Editing


ACE Formatting tool

To run the files (located here with the names of the games, where the rest are just outputs and such), simply add them to the /documents/matlab folder (on both Windows and OS X / Linux / Unix) and then type the name of the function and the filename in parentheses. 

For example:

If you want to use the discrimination function, you would do: (assuming the file is in the same directory, which it should be)

discrimination('foo.csv') 

make sure to use single quotes as matlab doesn't register double quotes as strings.

If the files are in a directory underneath (such as /documents/matlab/exportdata) or something similar, you can either:

put in the full name

discrimination('/users/gazzlab/documents/matlab/exportdata/foo.csv')

or

discrimination('./exportdata/foo.csv')  - assuming that you're currently in ./documents/matlab (to check type pwd)

Since I wrote these on OS X and Linux, they might have problems opening an export file on Windows machines. If so, just manually change the export path in the program.
