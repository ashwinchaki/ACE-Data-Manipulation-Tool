# unoriginal_name
ACE Data Formatting and Editing


ACE Formatting tool

To run the files (located here with the names of the games, where the rest are just outputs and such), simply add them to the /documents/matlab folder (on both Windows and OS X / Linux / Unix) and then type the name of the function and the filename in parentheses. 

For example:

If you want to use the discrimination function, you would do: (assuming the file is in the Inputs directory, which it should be)

discrimination('./Inputs/foo.csv') 

make sure to use single quotes as matlab doesn't register double quotes as strings.

If the files are in a directory underneath (such as /users/me/documents/matlab/exportdata) or something similar, you can either:

put in the full name

discrimination('/users/me/documents/matlab/exportdata/foo.csv')

or

discrimination('./exportdata/foo.csv')  - assuming that you're currently in ./documents/matlab (to check type pwd)

These are designed for Linux / OS X use.  If Windows is the host operating system, be sure to format the directory structures (input arguments, as well as outputs in the actual source code).
