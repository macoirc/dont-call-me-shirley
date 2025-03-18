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
var station = '';
var isPlaying = false;
var needNew = true;
var player_id = '';
var lastPlayed = '';
var apiKey = checkCookie().then( reply => {
    if (reply) {
        apiKey=reply;
    } else {
        apiKey = prompt('Please enter your API key. Once entered you will be directed to authorize the app with Spotify. Make sure to check for blocked pop-ups...the app won\'t work without proper authorization. Once authorized you may return back here.');
        setCookie('shirley-api', apiKey, 365);
        window.open(`https://accounts.spotify.com/authorize?client_id=${your_app_id}&response_type=code&redirect_uri=${your_redirect}&scope=streaming%20user-read-private%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20user-read-email&state=${apiKey}`, '_blank');
    }
});

window.onSpotifyWebPlaybackSDKReady = async () => {
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
    player.addListener('initialization_error', ({ message }) => console.error(message));
    player.addListener('authentication_error', ({ message }) => console.error(message));
    player.addListener('account_error', ({ message }) => console.error(message));
    player.addListener('playback_error', ({ message }) => console.error(message));
    player.addListener('not_ready', ({ device_id }) => {console.log('Device ID has gone offline', device_id);});

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready: ', device_id);
        player_id = device_id;
        document.querySelector('.player-body').style.display = 'flex';
        document.getElementById('channel-selector').addEventListener('change', function() {
            station = this.value;
            if (isPlaying) {
                player.pause();
                isPlaying = false;
                togglePlayPause();
            }
            console.log('Station changed to: ', station);
        });
        document.getElementById('togglePlay').onclick = function() {togglePlayPause();};
    });

    // End of Song Event
    player.addListener('player_state_changed', async state => {
        console.log('Player state changed:');
        if (state && state.paused && state.position === 0 && isPlaying && needNew) {
            needNew = false;
            console.log('End of song reached. Getting new track.');
            let newTrack = await getTrack('player_state_changed loading new track.');
            if (newTrack.error) {
                console.error('Error from getTrack():', newTrack.error);
                isPlaying = false;
                alert('An error occurred. Please try again later.');
                document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-play"></i>';
                return;
            }
            try {
                playResult = await playTrack(newTrack);
                lastPlayed = newTrack.uri;
                console.log('Just loaded a new track:', lastPlayed);
                setNewFlag(); // set flag to get new track after 30 seconds
            }
            catch (error) { // check for error playing track
                document.getElementById('album-image').src = 'https://www.shutterstock.com/shutterstock/videos/26235881/thumb/1.jpg?ip=x480';
                document.querySelector('.card-artist').innerHTML = 'Error playing track. Please stand by...';
                document.querySelector('.card-title').innerHTML = '';
                needNew = true;
            }
        } else {
            console.log('State changed was not an end of song.');
        }
    });

    player.connect();
    player.activateElement();
}

async function togglePlayPause() {
    if (!station) {
        alert('Please select a station first!');
        return;
    }
    if (isPlaying) {
        isPlaying = false;
        console.log('Stop button pressed.');
        await player.pause();
        document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-play"></i>';
        document.getElementById('album-image').src = "./Primary_Logo_Green_RGB.svg";
        document.querySelector('.card-artist').style.display = 'none';
        document.querySelector('.card-title').style.display = 'none';
    } else {
        isPlaying = true;
        console.log('Play button pressed.');
        document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-stop"></i>';
        newTrack = await getTrack('togglePlayPause loading new track.');
        if (newTrack.error) {
            console.error('Error from getTrack():', newTrack.error);
            isPlaying = false;
            alert('An error occurred. Please try again later.');
            document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-play"></i>';
            return;
        }
        try {
            playResult = await playTrack(newTrack);
            lastPlayed = newTrack.uri;
            console.log('Just loaded a new track:', lastPlayed);
            setNewFlag(); // set flag to get new track after 30 seconds
        } catch (error) { // check for error playing track
            document.getElementById('album-image').src = 'https://www.shutterstock.com/shutterstock/videos/26235881/thumb/1.jpg?ip=x480';
            document.querySelector('.card-artist').innerHTML = 'Please stand by...';
            document.querySelector('.card-title').innerHTML = '';
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playTrack(current_track) {
    // Play the track
    result = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${player_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            "uris": [current_track.uri],
            "position_ms": 0
        })
    });
    if (result.status === 401) {
        token = await spotifyToken(apiKey);
        return await playTrack(current_track);
    } else if (!result.ok) {
        console.error('Error playing track:', result.status);
        return {'error': result.text()};    
    }
    await player.resume();
    needNew = false;
    let currentTrackName = current_track.name;
    let artist = current_track.artists[0].name
    let myImage = document.getElementById('album-image');
    current_track.album.images.forEach(image => {
        if (image.height === 300 && myImage.src != image.url) {
            myImage.src = image.url;
        }
    });
    var setArtist = document.querySelector('.card-artist');
    var setTitle = document.querySelector('.card-title');
    setArtist.innerHTML = artist;
    setTitle.innerHTML = currentTrackName;
    setArtist.style.display = 'flex';
    setTitle.style.display = 'flex';
    if (artist.length > 35) {
        setArtist.className = 'card-artist marquee';
    } else {
        setArtist.className = 'card-artist';
    }
    if (currentTrackName.length > 35) {
        setTitle.className = 'card-title marquee';
    } else {
        setTitle.className = 'card-title';
    }
    player.activateElement();
};

async function getTrack(message = '', retries = 0) {
    console.log(`getTrack() called: ${message}`);
    try {
        const response = await fetch(`${your_api_url}/getsong?channel=${station}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': apiKey
            }
        });

        if (response.error) {
            console.error(await response.text());
            if (retries < 3) {
                document.getElementById('album-image').src = 'https://www.shutterstock.com/shutterstock/videos/26235881/thumb/1.jpg?ip=x480';
                document.querySelector('.card-artist').innerHTML = 'Please stand by...';
                document.querySelector('.card-title').innerHTML = 'Retrying...';
                await delay(3000);
                return await getTrack('Did not retrieve XM list...retrying.', retries + 1);
            } 
        } else {
            const data = await response.json();
            if (data.error) {
                console.error(`Error from getTrack(): ${data.error}`);
                return data;
            }
            var title = data.title;
            var artist = data.artist;
        }
        if (title && artist) {
            var song = await searchSpotify(title, artist, '');
        }
        if (!song && retries < 3) {
            console.log('Spotify search unsuccessful. Waiting and then retrying.');
            document.getElementById('album-image').src = 'https://www.shutterstock.com/shutterstock/videos/26235881/thumb/1.jpg?ip=x480';
            document.querySelector('.card-artist').innerHTML = 'Please stand by...';
            document.querySelector('.card-title').innerHTML = 'Retrying...';    
            await delay(3000);
            return await getTrack('No song found...retrying.', retries + 1);
        }
        if (!song) {
            // If there's still no song at this point, try the backup.
            console.log('No song found. Trying backup.');
            song = await getBackupTrack();
            if (song.error) {
                console.error(`Error from getBackupTrack(): ${song.error}`);
            }
        }
        return song;
    } catch (error) {
        console.error('Retrieval error:', error);
        return { 'error': error };
    }
}

window.onbeforeunload = async function() {
    await player.disconnect();
};

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
    if (user != "") {
        return user;
    } else {
        return false;
    }
}

async function spotifyToken(apiKey) {
    response = await fetch(`${your_api_url}/spotifytoken`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': apiKey
        }
    });

    if (!response.ok) {
        console.error('Error fetching Spotify token:', response.status);
        return;
    } else {
        body = await response.json();
        token = await body.spotifyToken;
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
            body = await response.json();
            return body;
        }
    } else {
        if (artist.includes('/')) { // remove anything after the slash
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
            body = await response.json();
            return body.tracks.items[0];
        }
    }
}

async function setNewFlag() {
    await delay(30000);
    needNew = true;
    console.log('Flag just set to true after waiting 30 seconds.');
}

async function getBackupTrack() {
    let bkpResponse = await fetch(`${your_api_url}/xmplaylist?channel=${station}`, {
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
        track = data.results[targetNum];
        if (track) {
            backupID = track.spotify.id;
        }
        song = await searchSpotify('', '', backupID);
        return song;
    }
}