/**
 * Don't Call Me Shirley - Spotify/SiriusXM Player
 * Refactored using the State Design Pattern for robust playback lifecycle management.
 */

const your_app_id = '';
const your_api_url = '';
const your_redirect = '';
const ROSETTA = {
    "thehighway": "3b99ed09-32af-9253-5cc7-9ffb81541faa",
    "y2kountry": "d3253c66-e1e1-331b-02e6-71580c33791b",
    "primecountry": "dab40a75-03d2-0ab6-1623-8dbebd85d002",
    "classicrewind": "7a642de7-c33f-a628-efb2-3d94a829d17b", 
    "classicvinyl": "5ad8659a-414a-9e26-b973-f5a229d788dd",
    "yachtrock311": "9150cc82-af5c-3be3-d170-0e81d87375a8",
    "lithium": "32c4747f-8739-d578-62d8-08a92d518445",
    "octane": "0fed9647-cc82-24d7-526d-98762e8a52cd",
    "coffeehouse": "41f8b174-fb06-1707-aaa7-e74e109c2ee9",
    "thepulse": "9e8d6f72-0b59-85cf-a222-b18d38acdc0f",
    "pop2k": "40c3d189-9611-e59f-5808-7847e294642e",
    "disneyhits": "95cf8bf1-fc4e-76b9-ac2a-617dca0325e7",
    "siriusxmhits1": "194adbca-34d6-cb94-b153-3488ee563308",
    "60sgold": "6567f2ee-4d7a-cd6d-3402-55ed6089cd0c",
    "70son7": "95d4d8ef-55e4-8337-78f1-2fda944991d8",
    "80son8": "2ea07147-a720-ed0c-d4ce-d7bddd1640d3",
    "90son9": "ef940a5b-255c-9f91-a3a5-41c6a9a24260",
    "the10sspot": "038e9a9a-4878-7561-521b-5d432a0798a0"
    // To Do: Translate the rest of the channels
};

var token = '';
var apiKey = '';

checkCookie().then( reply => {
    if (reply) {
        apiKey = reply;
    } else {
        apiKey = prompt('Please enter your API key. Once entered you will be directed to authorize the app with Spotify. Make sure to check for blocked pop-ups...the app won\'t work without proper authorization. Once authorized you may return back here.');
        setCookie('shirley-api', apiKey, 365);
        window.open(`https://accounts.spotify.com/authorize?client_id=${your_app_id}&response_type=code&redirect_uri=${your_redirect}&scope=streaming%20user-read-private%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20user-read-email&state=${apiKey}`, '_blank');
    }
});

// --- CORE CLASSES & LOGIC ---

class Track {
    constructor(song) {
        this.title = song.name;
        this.artist = song.artists[0].name;
        this.images = song.album.images;
        this.duration = song.duration_ms;
        this.uri = song.uri;
    }

    async play(deviceId) {
        if (!deviceId) return {'error': 'Player is not initialized.'};
        if (!token) return {'error': 'Token is missing.'};
        
        try {
            await window.player.activateElement();
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "uris": [this.uri],
                    "position_ms": 0
                })
            });
            if (response.status === 401) {
                token = await spotifyToken(apiKey);
                return await this.play(deviceId);
            } else if (!response.ok) {
                return {'error': response.status};
            } else {
                console.log(`Now playing: ${this.title} by ${this.artist}`);
                return {'success': 'Track played successfully.'};
            }
        } catch (error) {
            return {'error': error};
        }
    }
}

class Station { 
    constructor(channel) {
        this.id = channel;
        this.track = {};
    }

    async getTrack(lastPlayed) {
        // Strategy 1: Scrape SiriusXM and search Spotify
        let song = await this._getTrackFromSXM(lastPlayed);
        if (song) {
            this.track = song;
            return this.track;
        }

        // Strategy 2: Use backup playlist if primary fails
        console.log('Primary method failed, trying backup.');
        song = await this._getTrackFromBackup(lastPlayed);
        if (song) {
            this.track = song;
            return this.track;
        }

        return { error: 'Failed to find a track from all sources.' };
    }

    async _getTrackFromSXM(lastPlayed) {
        const MAX_SXM_RETRIES = 3;
        let songInfo = null;

        for (let i = 0; i < MAX_SXM_RETRIES; i++) {
            songInfo = await this._getCurrentSongInfo();

            // If we got a valid song, we can proceed.
            if (songInfo && !songInfo.error) {
                break; 
            }
            
            // If we are not on the last retry, wait.
            if (i < MAX_SXM_RETRIES - 1) {
                console.log(`SXM fetch failed on attempt ${i + 1}. Waiting to retry...`);
                await delay(2000);
            }
        }

        // After the loop, check if we ever got valid info.
        if (!songInfo || songInfo.error) {
            console.error(`Failed to get song info from SXM after ${MAX_SXM_RETRIES} attempts: ${songInfo?.error}`);
            return null;
        }

        if (songInfo.title && songInfo.title.toLowerCase() === lastPlayed) {
            console.log('Duplicate track found from SXM, will let outer loop retry.');
            return null;
        }

        if (songInfo.title && songInfo.artist) {
            return await searchSpotify(songInfo.title, songInfo.artist, '');
        }
        return null;
    }

    async _getCurrentSongInfo() {
        try {
            let url = `${your_api_url}/getsong?channel=${this.id}`;
            const options = { method: 'GET', headers: { 'Accept': 'application/json', 'x-api-key': apiKey } };
            const response = await fetch(url, options);

            if (!response.ok) {
                return { error: `Failed to fetch from /getsong: ${response.status}` };
            }
            const data = await response.json();
            return data.error ? { error: data.error } : { title: data.title, artist: data.artist };
        } catch (error) {
            return { error: error.message };
        }
    }

    async _getTrackFromBackup(lastPlayed) {
        let song = await getBackupTrack(this.id);
        if (!song || song.error) {
            console.error(`Error from getBackupTrack(): ${song?.error}`);
            return null;
        }
        if (song.name && song.name.toLowerCase() === lastPlayed) {
            console.log('Duplicate track found in backup, will retry.');
            return null;
        }
        return song;
    }
}

// --- STATE PATTERN IMPLEMENTATION ---

class PlayerState {
    /** @param {PlayerContext} context */
    constructor(context) { this.context = context; }
    async enter() {}
    async exit() {}
    async togglePlay() { console.warn("togglePlay not allowed in this state."); }
    async changeStation(stationId) { console.warn("changeStation not allowed in this state."); }
    async onTrackEnded() {}
}

class IdleState extends PlayerState {
    async enter() {
        await updateUI({}, false, false);
    }

    async changeStation(stationId) {
        this.context.station = new Station(stationId);
        console.log('Station changed to: ', stationId);
    }

    async togglePlay() {
        if (!this.context.station.id) {
            alert('Please select a station first!');
            return;
        }
        await this.context.transitionTo(new InitializingState(this.context));
    }
}

class InitializingState extends PlayerState {
    async enter() {
        await updateUI({}, true, false); // UI indicates loading
        try {
            if (!window.player) {
                await initPlayer();
            }
            await this.context.transitionTo(new LoadingState(this.context));
        } catch (error) {
            await this.context.transitionTo(new ErrorState(this.context, error));
        }
    }
    
    async togglePlay() {
        // Can optionally cancel initialization, but safer to ignore until ready
        console.log("Initializing... please wait.");
    }
}

class LoadingState extends PlayerState {
    async enter() {
        await updateUI({}, true, false);
        const MAX_RETRIES = 3;

        for (let i = 0; i < MAX_RETRIES; i++) {
            if (this.context.currentState !== this) return; // Abort if state changed

            console.log(`Attempt ${i + 1} to find a track...`);
            const newTrack = await this.context.station.getTrack(this.context.lastPlayed);

            if (newTrack && !newTrack.error) {
                try {
                    const myTrack = new Track(newTrack);
                    const result = await myTrack.play(this.context.deviceId);

                    if (this.context.currentState !== this) return;

                    if (result.error) {
                        await this.context.transitionTo(new ErrorState(this.context, `Failed to play track: ${result.error}`));
                        return;
                    }
                    this.context.lastPlayed = myTrack.title.toLowerCase();
                    await this.context.transitionTo(new PlayingState(this.context, myTrack));
                    return; // Success!
                } catch (error) {
                    if (this.context.currentState === this) {
                        await this.context.transitionTo(new ErrorState(this.context, error));
                    }
                    return;
                }
            }

            if (i < MAX_RETRIES - 1) await delay(3000); // Wait before retrying
        }

        await this.context.transitionTo(new ErrorState(this.context, 'Failed to find a track after multiple retries.'));
    }

    async togglePlay() {
        // User aborted during load
        if (window.player) {
            await window.player.pause();
            await window.player.disconnect();
            window.player = null;
        }
        await this.context.transitionTo(new IdleState(this.context));
    }

    async changeStation(stationId) {
        this.context.station.id = stationId;
        console.log('Station changed to: ', stationId);
        // Re-enter loading state to abort current load and start a new one
        await this.context.transitionTo(new LoadingState(this.context));
    }
}

class PlayingState extends PlayerState {
    constructor(context, currentTrack) {
        super(context);
        this.currentTrack = currentTrack;
    }

    async enter() {
        await updateUI(this.currentTrack, false, true);
    }

    async togglePlay() {
        if (window.player) {
            await window.player.pause();
            await window.player.disconnect();
            window.player = null;
        }
        await this.context.transitionTo(new IdleState(this.context));
    }

    async changeStation(stationId) {
        this.context.station.id = stationId;
        console.log('Station changed to: ', stationId);
        await this.context.transitionTo(new LoadingState(this.context));
    }

    async onTrackEnded() {
        console.log('End of song reached. Getting new track.');
        await this.context.transitionTo(new LoadingState(this.context));
    }
}

class ErrorState extends PlayerState {
    constructor(context, error) {
        super(context);
        this.error = error;
    }

    async enter() {
        console.error('Player error state entered:', this.error);
        await updateUI({}, false, false);
        if (window.player) {
            await window.player.disconnect();
            window.player = null;
        }
    }

    async togglePlay() {
        await this.context.transitionTo(new InitializingState(this.context));
    }

    async changeStation(stationId) {
        this.context.station = new Station(stationId);
        console.log('Station changed to: ', stationId);
        await this.context.transitionTo(new InitializingState(this.context));
    }
}

class PlayerContext {
    constructor() {
        this.station = new Station('');
        this.deviceId = '';
        this.lastPlayed = 'None';
        this.currentState = new IdleState(this);
    }

    async transitionTo(state) {
        if (this.currentState) {
            await this.currentState.exit();
        }
        this.currentState = state;
        await this.currentState.enter();
    }

    async togglePlay() { await this.currentState.togglePlay(); }
    async changeStation(id) { await this.currentState.changeStation(id); }
    async onTrackEnded() { await this.currentState.onTrackEnded(); }
}

const playerContext = new PlayerContext();

// --- UTILITY & SETUP FUNCTIONS ---

async function updateUI(current_track = {}, isRetrying = false, isPlaying = false) {
    const setImage = document.getElementById('album-image');
    const setArtist = document.querySelector('.card-artist');
    const setTitle = document.querySelector('.card-title');
    const setButton = document.getElementById('togglePlay');
    
    if (current_track && Array.isArray(current_track.images) && current_track.images.length > 0) {
        current_track.images.forEach(image => {
            if (image.height === 300 && setImage.src != image.url) {
                setImage.src = image.url;
            }
        });
    } else {
        setImage.src = './logo_300.png';
    }

    setArtist.innerHTML = (current_track && current_track.artist) || (isRetrying ? 'Please wait...' : '');
    setTitle.innerHTML = (current_track && current_track.title) || (isRetrying ? 'Retrying...' : '');

    if (current_track && current_track.artist && current_track.artist.length > 35) {
        setArtist.className = 'card-artist marquee';
    } else {
        setArtist.className = 'card-artist';
    }
    if (current_track && current_track.title && current_track.title.length > 35) {
        setTitle.className = 'card-title marquee';
    } else {
        setTitle.className = 'card-title';
    }

    if (isPlaying) {
        setButton.innerHTML = '<i class="fa-solid fa-stop"></i>';
    } else {
        setButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;samesite=strict;secure=true";
}

async function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

async function checkCookie() {
    let user = await getCookie("shirley-api");
    return user !== "" ? user : false;
}

async function spotifyToken(apiKey) {
    let response = await fetch(`${your_api_url}/spotifytoken`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': apiKey
        }
    });

    if (!response.ok) {
        console.error('Error fetching Spotify token:', response.status);
        return '';
    } else {
        let body = await response.json();
        token = body.spotifyToken;
        return token;
    }
}

async function searchSpotify(title='', artist='', id='') {
    console.log(`searchSpotify() called: title: ${title}, artist: ${artist}, id: ${id}`);
    if (id != '') {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        if (response.status === 401) {
            token = await spotifyToken(apiKey);
            return await searchSpotify(title, artist, id);
        }
        if (!response.ok) {
            console.error('Error fetching track:', response.status);
            return '';
        } else {
            let body = await response.json();
            return body;
        }
    } else {
        if (artist.includes('/')) { 
            artist = artist.slice(0, artist.indexOf('/'));
        }
        let query = encodeURIComponent(`${title} artist:${artist}`);
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&market=US`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        if (response.status === 401) {
            token = await spotifyToken(apiKey);
            return await searchSpotify(title, artist, id);
        }
        if (!response.ok) {
            console.error('Error fetching track:', response.status);
            return '';
        } else {
            let body = await response.json();
            return body.tracks.items[0];
        }
    }
}

async function getBackupTrack(stationId) {
    let bkpResponse = await fetch(`${your_api_url}/xmplaylist?channel=${stationId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (bkpResponse.ok) {
        let data = await bkpResponse.json();
        if (data.error) {
            console.error(`Error from backup api: ${data.error}`);
            return data;
        }
        let targetNum = data.count - 1;
        let track = data.results[targetNum];
        let backupID = '';
        if (track) {
            backupID = track.spotify.id;
        }
        let song = await searchSpotify('', '', backupID);
        return song;
    }
}

function initPlayer() {
    return new Promise((resolve, reject) => {
        window.player = new Spotify.Player({
            name: 'Don\'t Call Me Shirley',
            getOAuthToken: async cb => { 
                token = await spotifyToken(apiKey);
                cb(token); 
            },
            volume: 0.5,
            enableMediaSession: true
        });

        // Error handling
        window.player.addListener('initialization_error', ({ message }) => { console.error(message); reject(message); });
        window.player.addListener('authentication_error', ({ message }) => { console.error(message); reject(message); });
        window.player.addListener('account_error', ({ message }) => { console.error(message); reject(message); });
        window.player.addListener('playback_error', ({ message }) => console.error(message));
        window.player.addListener('not_ready', ({ device_id }) => { console.log('Device ID has gone offline', device_id); });

        // Ready
        window.player.addListener('ready', ({ device_id }) => {
            console.log('Ready: ', device_id);
            playerContext.deviceId = device_id;
            resolve(device_id);
        });

        // End of Song Event
        window.player.addListener('player_state_changed', async state => {
            if (state && state.paused && state.position === 0) {
                await playerContext.onTrackEnded();
            }
        });

        window.player.connect().then(success => {
            if (!success) reject("Failed to connect to Spotify player");
        });
    });
}

// --- EVENT LISTENERS ---

window.onSpotifyWebPlaybackSDKReady = async () => {
    document.querySelector('.player-body').style.display = 'flex';
    document.getElementById('channel-selector').addEventListener('change', async function() {
        await playerContext.changeStation(this.value);
    });
    document.getElementById('togglePlay').onclick = async function() {
        await playerContext.togglePlay();
    };
};

window.onbeforeunload = async function() {
    if (window.player) {
        await window.player.disconnect();
    }
};