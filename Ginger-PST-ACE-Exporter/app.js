//app version 1.0.8
// we need fs access
var fs = require('fs');
var async = require('async');

// validate & parse arguments
var host, port, user, pass, dbname, type, outdir, inCount = 0, outCount = 0;
var args = process.argv;
for(var i=0; i<args.length; i++) {
    if(args[i].indexOf('host:') === 0) host = args[i].replace('host:', '');
    else if(args[i].indexOf('port:') === 0) port = args[i].replace('port:', '');
    else if(args[i].indexOf('user:') === 0) user = args[i].replace('user:', '');
    else if(args[i].indexOf('pass:') === 0) pass = args[i].replace('pass:', '');
    else if(args[i].indexOf('dbname:') === 0) dbname = args[i].replace('dbname:', '');
    else if(args[i].indexOf('type:') === 0) type = args[i].replace('type:', '');
    else if(args[i].indexOf('outdir:') === 0) outdir = args[i].replace('outdir:', '');
}
if(host == undefined) { // if host missing, assume 127.0.0.1
    console.log('Assuming host 127.0.0.1');
    host = '127.0.0.1';
}
if(port == undefined) { // if port missing, assume 27017
    console.log('Assuming port 27017');
    port = 27017;
}
if(user == undefined || pass == undefined) { // if user/pass missing, assume empty
    console.log('Assuming empty username and password');
    user = '';
    pass = '';
}
if(dbname == undefined) { // if dbname missing, ERROR
    console.error('\nERROR: dbname connect be empty');
    process.exit(1);
}
if(type == undefined) { // if type missing, ERROR
    console.error('\nERROR: type connect be empty');
    process.exit(1);
}
else { // if not valid type, ERROR
    type = type.toLowerCase();
    if(type !== 'ace' && type !== 'pst' && type !== 'ginger') {
        console.error('\nERROR: Invalid value for type. Allowed values are ACE, PST and GINGER');
        process.exit(1);
    }
}
if(outdir == undefined) { // if output directory is missing, assume current directory
    console.log('Assuming current directory as output directory');
    outdir = './';
}
else {
    // check if outdir exists, if not create
    if(!fs.existsSync(outdir)) fs.mkdirSync(outdir)

    // if outdir does not end with a slash, suffix one
    if(!outdir.match(/\/$/)) outdir += '/';
}

// get db connection ready
var db, stream;
var connStr = 'mongodb://' + ( (user != '' && pass != '') ? user+':'+encodeURIComponent(pass)+'@' : '' ) + host + ':' + port + '/' + dbname;
require('mongodb').MongoClient.connect(connStr, {uri_decode_auth: true}, function(_err, _db) {
    if(_err) {
        console.error('\nERROR: Cannot connect to MongoDB');
        process.exit(1);
    }
    console.log('Connected to MongoDB');
    db = _db;
    start();
});

// all set, lets start
function start() {

    var fileName, collectionName, collection, cursor, headerRow;

    switch(type) {
        case 'ginger':
            // each row in CSV will have the fields:
            // id, submitted, user-id, user-name,
            // survery-id, survey-sent, survey-name,
            // question-id, question-text, answer-text, answer-key
            // if a survey has 5 answers, that will result in 5 rows in the CSV
            // filename scheme for ginger 20140501T010000-ginger.csv
            headerRow = '"id","submitted","survey-id","survey-sent","survey-name","user-id","user-name","ques-id","ques-text","ans-text","ans-key"\n';
            fileName = outdir + (new Date().toISOString().replace(/\..+/, '').replace(/[^A-Z0-9]/g, '')) + '-ginger.csv'
            collectionName = 'gingerio';
            break;
        case 'pst':
            // each row in the CSV will have the fields:
            // id, submitted, strategy, area, action_plan, goal, problem, user_id
            // if a row has 5 objects in the data field, it will result in 5 rows in the CSV
            // filename scheme for ginger 20140501T010000-pst.csv
            headerRow = '"id","submitted","strategy","area","action_plan","goal","problem","user_id"\n';
            fileName = outdir + (new Date().toISOString().replace(/\..+/, '').replace(/[^A-Z0-9]/g, '')) + '-pst.csv'
            collectionName = 'pst';
            break;
    }

    // start processing
    if (type === 'ace'){
      inCount = outCount = 0;
      processAce();
    }
    else
    {
        stream = fs.createWriteStream(fileName);
        stream.once('open', function(fd) {
            stream.write(headerRow); // write header row
            collection = db.collection(collectionName);
            cursor = collection.find({}); // get cursor
            inCount = outCount = 0;
            processRecord(cursor, type); // start processing
        });
    }

}

//process Ace collection creating files for each game 12 types
function processAce() {

    var game_types = ['BOXED', 'BRT', 'STROOP', 'FLANKER', 'DWM', 'MENTAL ROTATION', 'SPATIAL CUEING', 'TASK SWITCH', 'TNT', 'SAAT', 'SPATIAL SPAN', 'DISCRIMINATION']

    async.eachSeries(game_types, function(game_type, callback){

        fileName = outdir + (new Date().toISOString().replace(/\..+/, '').replace(/[^A-Z0-9]/g, '')) + '-ACE-'+game_type+'.csv'

        stream = fs.createWriteStream(fileName);

        writeHeader(game_type);

        collection = db.collection('ace');

        cursor = collection.find( {'games.game_type': game_type} ); //get cursor

        processRecordAce(cursor, game_type, callback);

    }, function(err){
        if (err){
            console.log(err);
        }
        else
        {
            console.log('\nCompleted.\n------------------------\n' + inCount + ' document read from mongodb.\n' + outCount + ' rows written to CSV.\n');
            db.close();
        }
    } )

    //inCount++;
   // console.log('\nCompleted.\n------------------------\n' + inCount + ' document read from mongodb.\n' + outCount + ' rows written to CSV.\n');
}

function writeHeader(_type) {

    switch(_type) {
        case 'BOXED':

            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'BRT':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'STROOP':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'FLANKER':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'DWM':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'MENTAL ROTATION':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","key","value"\n';
            stream.write(headerRow);
            break;

        case 'SPATIAL CUEING':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","key","value"\n';
            stream.write(headerRow);
            break;

        case 'TASK SWITCH':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","key","value"\n';
            stream.write(headerRow);
            break;

        case 'TNT':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'SAAT':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","key","value"\n';
            stream.write(headerRow);
            break;

        case 'SPATIAL SPAN':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","key","value"\n';
            stream.write(headerRow);
            break;

        case 'DISCRIMINATION':
            headerRow = '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","key","value"\n';
            stream.write(headerRow);
            break;

    }

}

function processRecordAce(_cursor, _type, callback){


    _cursor.nextObject(function(err, record) {

        if(record == null) { // no more records from this cursor
            stream.end(); // close stream
            callback();
        }
        else {


            switch(_type.toString()) {
                case 'BOXED':
                    normalizeAceBoxedDocument(record);
                    break;

                case 'BRT':
                    normalizeAceBrtDocument(record);
                    break;

               // case 'STROOP':
               //     normalizeAceStroopDocument(record);
               //     break;

              //  case 'FLANKER':
              //      normalizeAceFlankerDocument(record);
              //      break;

                case 'DWM':
                    normalizeAceDwmDocument(record);
                    break;

                case 'MENTAL ROTATION':
                    normalizeAceMentalrotationDocument(record);
                    break;

                case 'SPATIAL CUEING':
                    normalizeAceSpatialCueingDocument(record);
                    break;

                case 'TASK SWITCH':
                    normalizeAceTaskSwitchDocument(record);
                    break;

                case 'TNT':
                    normalizeAceTntDocument(record);
                    break;

                case 'SAAT':
                    normalizeAceSaatDocument(record);
                    break;

                case 'SPATIAL SPAN':
                    normalizeAceSpatialSpanDocument(record);
                    break;

                case 'DISCRIMINATION':
                    normalizeAceDiscriminationDocument(record);
                    break;

                default:
                console.log('nothing');

            }

            // process more records
            processRecordAce(_cursor, _type, callback);
        }
    });

    return true;
}



// process one record from the collection for specified type
function processRecord(_cursor, _type) {

    _cursor.nextObject(function(err, record) {

        if(record == null) { // no more records from this cursor
            stream.end(); // close stream and db
            db.close();
            console.log('\nCompleted.\n------------------------\n' + inCount + ' document read from mongodb.\n' + outCount + ' rows written to CSV.\n');
        }
        else {

            switch(_type) {
                case 'ginger':
                    normalizeGingerDocument(record);
                    break;
                case 'pst':
                    normalizePSTDocument(record);
                    break;
            }

            inCount++;

            // process more records
            setTimeout(function() {processRecord(_cursor, _type)},1);

        }
    });

    return true;
}

function normalizeGingerDocument(_record) {
    var rec = _record['survey-response'], row, ans;
    for(var j=0; j<rec.answers.length; j++) { // for each question
        ans = rec.answers[j];
        for(var k=0; k<ans.question.answers.length; k++) { // for each answer received
            row = [];
            row.push(rec.id.toString());
            row.push(rec.submitted);
            row.push(rec.survey.id.toString());
            row.push(rec.survey.sent);
            row.push(rec.survey.name);
            row.push(rec.user.id.toString());
            row.push(rec.user.name);
            row.push(ans.question.id.toString());
            row.push(ans.question.text);
            row.push(ans.question.answers[k].text);

            if (typeof ans.question.answers[k].key != 'undefined' && ans.question.answers[k].key !== null){
                row.push(ans.question.answers[k].key.toString());
            }
            else {
                row.push('');
            }

            // write to CSV
            if(writeCSVRow(row)) outCount++;
        }
    }
}

function normalizePSTDocument(_record) {
    var row;
    for(var i=0; i<_record.data.length; i++) { // for each value in the data array
        row = [];
        row.push(_record._id.toString());
        row.push(_record.submitted);
        row.push(_record.data[i]['Strategy'] ? _record.data[i]['Strategy'] : '');
        row.push(_record.data[i]['Area'] ? _record.data[i]['Area'] : '');
        row.push(_record.data[i]['Action Plan'] ? _record.data[i]['Action Plan'] : '');
        row.push(_record.data[i]['Goal'] ? _record.data[i]['Goal'] : '');
        row.push(_record.data[i]['Problem'] ? _record.data[i]['Problem'] : '');
        row.push(_record.user.id);

        // write to CSV
        if(writeCSVRow(row)) outCount++;
    }
}

function normalizeAceBoxedDocument(_record){

    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'BOXED') {


            inCount++;

             for(var k=0; k<_record.games[j].details['Feature_12'].length; k++) { // for each Feature_12 detail of game

                var aux_details = _record.games[j].details['Feature_12'][k];

                for(var key in aux_details)
                {

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Feature_12');
                    row.push(key.toString());
                    row.push(aux_details[key].toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
                }
            }

            for(var k=0; k<_record.games[j].details['Feature_4'].length; k++) { // for each Feature_4 detail of game

                var aux_details = _record.games[j].details['Feature_4'][k];

                for(var key in aux_details)
                {

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Feature_4');
                    row.push(key.toString());
                    row.push(aux_details[key].toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
                }
            }

            for(var k=0; k<_record.games[j].details['Conjunction_12'].length; k++) { // for each Conjunction_12 detail of game

                var aux_details = _record.games[j].details['Conjunction_12'][k];

                for(var key in aux_details)
                {

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Conjunction_12');
                    row.push(key.toString());
                    row.push(aux_details[key].toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
                }
            }

            for(var k=0; k<_record.games[j].details['Conjunction_4'].length; k++) { // for each Conjunction_4 detail of game

                var aux_details = _record.games[j].details['Conjunction_4'][k];

                for(var key in aux_details)
                {

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Conjunction_4');
                    row.push(key.toString());
                    row.push(aux_details[key].toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
                }
            }

        }
    }

    return true;
}

function normalizeAceBrtDocument(_record){

    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'BRT') {

            inCount++;

try {
            for(var k=0; k<_record.games[j]['TAP TESTING RIGHT'].length; k++) { // for each TAP TESTING RIGHT detail of game

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('TAP TESTING RIGHT');
                    row.push('');
                    row.push(_record.games[j]['TAP TESTING RIGHT'][k].toString());
                   // console.log(row);
                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
            }

            for(var k=0; k<_record.games[j].details['Left'].length; k++) { // for each Left detail of game

                var aux_details = _record.games[j].details['Left'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Left');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }

            for(var k=0; k<_record.games[j].details['Right'].length; k++) { // for each Right detail of game

                var aux_details = _record.games[j].details['Right'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Right');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }
} catch (ex) {
    console.log("found a bad BRT record")
}


        }
    }

    return true;
}

function normalizeAceStroopDocument(_record){

    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'STROOP') {

            inCount++;

            for(var k=0; k<_record.games[j].details['Word Game'].length; k++) { // for each Word Game detail of game

                var aux_details = _record.games[j].details['Word Game'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Word Game');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }

        }
    }
    return true;
}

function normalizeAceFlankerDocument(_record){
    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'FLANKER') {

            inCount++;

            for(var k=0; k<_record.games[j].details.length; k++) { // for each detail of game

                var aux_details = _record.games[j].details[k];

                    for(var key in aux_details)
                    {
                        if(key === 'First Button' || key === 'Second Button' )
                        {
                                row = [];
                                row.push(_record._id.toString());
                                row.push(_record.participant_id);
                                row.push(_record.timesent_utc);

                                if (typeof _record.name != 'undefined'){
                                    row.push(_record.name);
                                }
                                else {
                                    row.push('');
                                }

                                row.push(_record.gender);
                                row.push(_record.handedness);
                                row.push(_record.games[j].time_gameplayed_utc);
                                row.push(key);
                                row.push('User Tapped');
                                row.push(aux_details[key]['User Tapped']);

                                // write to CSV
                                if(writeCSVRow(row)) outCount++;

                                row = [];
                                row.push(_record._id.toString());
                                row.push(_record.participant_id);
                                row.push(_record.timesent_utc);

                                if (typeof _record.name != 'undefined'){
                                    row.push(_record.name);
                                }
                                else {
                                    row.push('');
                                }

                                row.push(_record.gender);
                                row.push(_record.handedness);
                                row.push(_record.games[j].time_gameplayed_utc);
                                row.push(key);
                                row.push('Keys');
                                row.push(aux_details[key]['Keys']);

                                // write to CSV
                                if(writeCSVRow(row)) outCount++;

                        }
                        else
                        {
                            row = [];
                            row.push(_record._id.toString());
                            row.push(_record.participant_id);
                            row.push(_record.timesent_utc);

                            if (typeof _record.name != 'undefined'){
                                row.push(_record.name);
                            }
                            else {
                                row.push('');
                            }

                            row.push(_record.gender);
                            row.push(_record.handedness);
                            row.push(_record.games[j].time_gameplayed_utc);
                            row.push('');
                            row.push(key);

                            if (isNumber(aux_details[key]))
                            {
                                row.push(aux_details[key].toString());
                            }
                            else
                            {
                                row.push(aux_details[key]);
                            }


                            // write to CSV
                           if(writeCSVRow(row)) outCount++;
                        }

                    }
            }

        }
    }

    return true;
}

function normalizeAceDwmDocument(_record){
    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'DWM') {

            inCount++;

            for(var k=0; k<_record.games[j].details['Ignore Distraction'].length; k++) { // for each Ignore Distraction detail of game

                var aux_details = _record.games[j].details['Ignore Distraction'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Ignore Distraction');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }


            for(var k=0; k<_record.games[j].details['No Distraction'].length; k++) { // for each No Distraction detail of game

                var aux_details = _record.games[j].details['No Distraction'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('No Distraction');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }

            for(var k=0; k<_record.games[j].details['Age Interruption'].length; k++) { // for each Age Interruption detail of game

                var aux_details = _record.games[j].details['Age Interruption'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Age Interruption');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }

        }
    }

    return true;
}

function normalizeAceMentalrotationDocument(_record){
    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'MENTAL ROTATION') {

            inCount++;

            for(var k=0; k<_record.games[j].details.length; k++) { // for each Age Interruption detail of game

                var aux_details = _record.games[j].details[k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }

        }
    }

    return true;
}

function normalizeAceSpatialCueingDocument(_record){
    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'SPATIAL CUEING') {

            inCount++;

            for(var k=0; k<_record.games[j].details.length; k++) { // for each Age Interruption detail of game

                var aux_details = _record.games[j].details[k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }
        }
    }

    return true;
}

function normalizeAceTaskSwitchDocument(_record){

    var detail, row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'TASK SWITCH') {

            inCount++;

            for(var k=0; k<_record.games[j].details.length; k++) { // for each Age Interruption detail of game

                var aux_details = _record.games[j].details[k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }
        }
    }

    return true;

}

function normalizeAceTntDocument(_record){

    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'TNT') {

            inCount++;

try {
            for(var k=0; k<_record.games[j].details['Tap & Trace'].length; k++) { // for each Tap & Trace detail of game

                var aux_details = _record.games[j].details['Tap & Trace'][k];

                for(var key in aux_details)
                {

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Tap & Trace');
                    row.push(key.toString());
                    row.push(aux_details[key].toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
                }
            }

            for(var k=0; k<_record.games[j].details['Tap Only'].length; k++) { // for each Tap Only detail of game

                var aux_details = _record.games[j].details['Tap Only'][k];

                for(var key in aux_details)
                {

                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Tap Only');
                    row.push(key.toString());
                    row.push(aux_details[key].toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
                }
            }


            for(var k=0; k<_record.games[j].details['Tap & Trace (Trace)']['TraceTimeInterval'].length; k++) { // for each Tap & Trace (Trace)  detail of game

                    var aux = _record.games[j].details['Tap & Trace (Trace)']['TraceTimeInterval'][k];
                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Tap & Trace (Trace)');
                    row.push('TraceTimeInterval');
                    row.push(aux.toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
            }

            for(var k=0; k<_record.games[j].details['Trace Only']['TraceTimeInterval'].length; k++) { // for each Trace Only detail of game

                    var aux = _record.games[j].details['Trace Only']['TraceTimeInterval'][k];
                    row = [];

                    row.push(_record._id.toString());
                    row.push(_record.participant_id);
                    row.push(_record.timesent_utc);

                    if (typeof _record.name != 'undefined'){
                        row.push(_record.name);
                    }
                    else {
                        row.push('');
                    }

                    row.push(_record.gender);
                    row.push(_record.handedness);
                    row.push(_record.games[j].time_gameplayed_utc.toString());
                    row.push('Trace Only');
                    row.push('TraceTimeInterval');
                    row.push(aux.toString());

                    // write to CSV
                    if(writeCSVRow(row)) outCount++;
            }
} catch (ex) {
    console.log("found a bad TNT record")
}

        }
    }

    return true;

}

function normalizeAceSaatDocument(_record){
    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'SAAT') {

            inCount++;

            for(var k=0; k<_record.games[j].details['Impulsive'].length; k++) { // for each Impulsive detail of game

                var aux_details = _record.games[j].details['Impulsive'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Impulsive');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }

            for(var k=0; k<_record.games[j].details['Sustained'].length; k++) { // for each Sustained detail of game

                var aux_details = _record.games[j].details['Sustained'][k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push('Sustained');
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }
        }
    }

    return true;
}

function normalizeAceSpatialSpanDocument(_record){
    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'SPATIAL SPAN') {

            inCount++;

            for(var k=0; k<_record.games[j].details.length; k++) { // for each detail of game

                var aux_details = _record.games[j].details[k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }
        }
    }
    return true;
}

function normalizeAceDiscriminationDocument(_record){

    var row;

    for(var j=0; j<_record.games.length; j++) { // for each game

        if (_record.games[j].game_type === 'DISCRIMINATION') {

            inCount++;

            for(var k=0; k<_record.games[j].details.length; k++) { // for each detail of game

                var aux_details = _record.games[j].details[k];

                    for(var key in aux_details)
                    {
                        row = [];

                        row.push(_record._id.toString());
                        row.push(_record.participant_id);
                        row.push(_record.timesent_utc);

                        if (typeof _record.name != 'undefined'){
                            row.push(_record.name);
                        }
                        else {
                            row.push('');
                        }

                        row.push(_record.gender);
                        row.push(_record.handedness);
                        row.push(_record.games[j].time_gameplayed_utc.toString());
                        row.push(key.toString());
                        row.push(aux_details[key].toString());

                        // write to CSV
                       if(writeCSVRow(row)) outCount++;
                    }
            }
        }
    }

    return true;
}

// write a CSV data row into our stream
function writeCSVRow(_row) {

    if(_row && _row.length > 1) { // skip if empty
        // correct CSV escaping

        for(var i=0; i<_row.length; i++) 
            {
                if (_row[i]) // skip undefined
                        _row[i] = '"' + _row[i].trim().replace(/"/g, '\"\"') + '"';
            }
        stream.write(_row.join(",") + "\n");
        return true;
    }
    return false;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}