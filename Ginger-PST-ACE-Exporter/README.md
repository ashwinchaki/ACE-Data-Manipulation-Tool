~~ All credit goes to Jeff Steinmetz ~~


To run these export scripts, install NODE.JS
http://nodejs.org/


Then assumimg your MongoDB password is ABC123, here are some example commands.

You will need to run the exporter 1 time for each type (ACE, Ginger, PST).
It will create a "complete" dump for that collection, and create a file with todays date and time.


```bash
node app host:midbrain.cin.ucsf.edu port:27017 user:brighten pass:ABC123 dbname:brighten type:ginger outdir:./exports 

node app host:midbrain.cin.ucsf.edu port:27017 user:brighten pass:ABC123 dbname:brighten type:pst outdir:./exports

node app host:midbrain.cin.ucsf.edu port:27017 user:brighten pass:ABC123 dbname:brighten type:ace outdir:./exports

```
