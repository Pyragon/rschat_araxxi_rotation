const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';

var _lookup = () => {

    function read(callback) {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), callback);
        });
    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        const {
            client_secret,
            client_id,
            redirect_uris
        } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    function getName(index) {
        switch (index) {
            case 1:
                return 'Top';
            case 2:
                return 'Middle';
            case 3:
                return 'Bottom';
        }
        return index;
    }

    return {

        getRunescapeCommands: () => {
            return ['araxxi', 'araxxor'];
        },

        processRunescapeMessage: (author, commandLine, command, split, discordQueue, runescapeQueue) => {
            read((auth) => {
                const calendar = google.calendar({
                    version: 'v3',
                    auth
                });
                calendar.events.list({
                    calendarId: '2qd32jqaaufscun3vpcum9nhho@group.calendar.google.com',
                    timeMin: (new Date()).toISOString(),
                    maxResults: 1,
                    singleEvents: true,
                    orderBy: 'startTime',
                }, (err, res) => {
                    if (err) return console.log('The API returned an error: ' + err);
                    const events = res.data.items;
                    if (events.length) {
                        var event = events[0].summary;
                        event = event.replace('Araxxor Path ', '');
                        event = event.replace('Path ', '');
                        const paths = event.split('+');
                        runescapeQueue.push([`Current araxxor paths: ${paths[0]} - (${getName(parseInt(paths[0]))}) and ${paths[1]} - (${getName(parseInt(paths[1]))}).`, undefined, new Date()]);
                    } else {
                        console.log('No upcoming events found.');
                    }
                });
            });
        }

    };

};
module.exports = _lookup;