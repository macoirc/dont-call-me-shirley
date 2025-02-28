const your_app_id = 'f9f9e208c1bd4e69b53f7a7126f4d655';
const your_api_url = 'https://22q08igefi.execute-api.us-east-1.amazonaws.com/v1';
const your_redirect = 'https%3A%2F%2F22q08igefi.execute-api.us-east-1.amazonaws.com%2Fv1%2Fspotifyauth';
const ROSETTA = {
    "holiday-traditions":"33794a0f-2a24-08bb-492e-12e441fab2f0", 
    "holly": "ba107a8d-fb2d-571e-1894-f6ea03ed318a", 
    "hallmark-radio": "acf8556b-03f4-e739-554f-464d50ba738d", 
    "country-christmas": "71dbb5a0-8995-958b-e139-b63b2864cabb", 
    "10s-spot": "038e9a9a-4878-7561-521b-5d432a0798a0", 
    "1st-wave": "65f04311-3581-256c-97b9-279838d6ff5e", 
    "70s-on-7": "95d4d8ef-55e4-8337-78f1-2fda944991d8", 
    "80s-on-8": "2ea07147-a720-ed0c-d4ce-d7bddd1640d3", 
    "90s-on-9": "ef940a5b-255c-9f91-a3a5-41c6a9a24260", 
    "90s-to-now": "212e2e23-06e3-3a86-5f89-6ce7a26c35c3", 
    "accoustic-rock": "dd042955-b3fa-bf2b-6b64-6f08236ed48f", 
    "blue-grass": "9e545d10-7c21-9707-1d34-3d503b7365bc", 
    "bob-marleys-tuff-gong-radio": "881c9b1f-e7fd-4637-b87a-0dd06f1831a5", 
    "bon-jovi": "3adfcd26-b336-23cb-f40d-8e4f1a40e1de", 
    "carries-country": "75301b34-2f01-2c17-0b52-028bec0d271c", 
    "classic-rewind": "7a642de7-c33f-a628-efb2-3d94a829d17b", 
    "classic-vinyl": "5ad8659a-414a-9e26-b973-f5a229d788dd", 
    "coffeehouse": "41f8b174-fb06-1707-aaa7-e74e109c2ee9", 
    "dave-matthews-band-radio": "69e5185d-d218-8fbc-082f-6ea5a16ca4db", 
    "disney-hits": "95cf8bf1-fc4e-76b9-ac2a-617dca0325e7", 
    "e-street-radio": "727fa612-6e53-458e-720d-b662dc974e5d",
    "grateful-dead": "067801cb-bb3f-1707-dd21-d77e06bb27c0", 
    "classic-rock-hits": "aff703b3-1492-c8d7-55de-80a6612c08a3",
    "mosaic": "d0759ae0-eeef-48e4-c4b9-526217aac33d", 
    "country-top-1000": "451bf902-005b-da8b-08bf-e24d34df486e", 
    "on-broadway": "adc27a20-6fc4-7269-5ca6-4a492f7dfa55",
    "outlaw-country": "176daca5-6810-3a1c-49e9-39b69055e811", 
    "pandora-now": "02394c8d-7afe-6ba2-3791-fce63b1e4d85", 
    "pearl-jam": "cdc9bee8-9317-37fa-ec8e-464096670c60",
    "pop-rocks": "44f9129f-579a-3d23-218f-3c3518036fc6", 
    "pop2k": "40c3d189-9611-e59f-5808-7847e294642e", 
    "prime-country": "dab40a75-03d2-0ab6-1623-8dbebd85d002",
    "radio-margaritaville": "c636d008-7cb0-99eb-7fb7-7c489f862a26", 
    "red-white-booze": "5b537ac7-2357-55f9-a81c-1229382feffb",
    "deep-tracks": "e3041d19-daa5-6517-8c73-41976582d1f9", 
    "rock-pop-mix": "175161c2-7224-8d31-b4dc-88ec5d625ce2",
    "phish": "0b5b5f60-dfcf-eba9-1dc6-ec3c909f4541", 
    "pop-mix-upbeat": "2243f789-5662-2ab7-c51e-04dc8e6fe08d", 
    "spectrum": "804a5411-b234-1188-27da-f01197103886", 
    "sirius-xm-u": "f49737db-bea3-0c13-9834-b879fb1894c4", 
    "xm-hits-1": "194adbca-34d6-cb94-b153-3488ee563308",
    "the-beatles-channel": "20801778-3df2-d607-eab5-e03de0ca7815", 
    "the-blend": "bda81f03-f231-d4db-56ad-40cb132c5663",
    "the-bridge": "1898923d-071d-0abd-1a62-ed0d2702d4f1", 
    "tik-tok": "6e59f0fe-6fcc-ef8f-0ba7-72eb77385eb0", 
    "top-40-hits": "c4c36606-49ca-b948-c7ba-019f13a451a2", 
    "the-highway": "3b99ed09-32af-9253-5cc7-9ffb81541faa",
    "the-pulse": "9e8d6f72-0b59-85cf-a222-b18d38acdc0f", 
    "tom-petty": "60b0ea2e-dec7-1d4a-da2a-6de09f273fe7", 
    "u2-xradio": "a4b7a4f7-af96-3ae6-53df-f78ff9ac9aab",
    "underground-garage": "3b83dc80-5987-6898-e98d-a98012f700c1", 
    "top-of-the-country": "60035cea-1181-5b91-4c33-ba63663a37e2", 
    "willies-roadhouse": "0aee72ed-5dd8-2848-3567-d8809e123cd1",
    "y2kountry": "d3253c66-e1e1-331b-02e6-71580c33791b", 
    "yacht-rock-311": "9150cc82-af5c-3be3-d170-0e81d87375a8"
};
const CHANNELMAP = {
    // To Do: Translate the rest of the channels
    'y2kountry': 'y2kountry',
    'the-highway': 'thehighway',
    'classic-rewind': 'classicrewind',
    'classic-vinyl': 'classicvinyl',
    'coffeehouse': 'coffeehouse',
    'the-pulse': 'thepulse',
    'pop2k': 'pop2k',
    'disney-hits': 'disneyhits',
    'xm-hits-1': 'siriusxmhits1',
    'yacht-rock-311': 'yachtrock311'
};
var token = '';
var station = '';
var isPlaying = false;
var player_id = '';
var duration = 0;
var runID = 0;
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
    token = await spotifyToken(apiKey);
    window.player = new Spotify.Player({
        name: 'Don\'t Call Me Shirley',
        getOAuthToken: cb => { cb(token); },
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
                clearTimeout(runID);
                togglePlayPause();
            }
            console.log('Station changed to: ', station);
        });
        document.getElementById('togglePlay').onclick = function() {togglePlayPause();};
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
        clearTimeout(runID);
        document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-play"></i>';
        document.getElementById('album-image').src = "https://store-images.s-microsoft.com/image/apps.10546.13571498826857201.6603a5e2-631f-4f29-9b08-f96589723808.dc893fe0-ecbc-4846-9ac6-b13886604095?h=380";
        document.querySelector('.card-artist').style.display = 'none';
        document.querySelector('.card-title').style.display = 'none';
    } else {
        isPlaying = true;
        let lastPlayed = '';
        console.log('Play button pressed.');
        document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-stop"></i>';
        do {
            newTrack = await getTrack('loading new track.');
            if (newTrack.error) {
                console.error('Error from getTrack():', newTrack.error);
                isPlaying = false;
                alert('An error occurred. Please try again later.');
                document.getElementById('togglePlay').innerHTML = '<i class="fa-solid fa-play"></i>';
                break;
            }
            if (newTrack.uri == lastPlayed) {
                console.log('Duplicate track found. Waiting 3 seconds.');
                document.getElementById('album-image').src = 'https://www.shutterstock.com/shutterstock/videos/26235881/thumb/1.jpg?ip=x480';
                document.querySelector('.card-artist').innerHTML = 'Please stand by...';
                document.querySelector('.card-title').innerHTML = '';
                await delay(3000);
                continue;
            }
            duration = newTrack.duration_ms;
            await playTrack(newTrack);
            console.log(`Successfully loaded track: ${newTrack.name}. Waiting ${duration}ms.`);
            runID = await delay(duration);
            console.log('Delay expired. Getting new track.');
        } while (isPlaying);
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
    }
    await player.resume();
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
};

async function getTrack(message = '', retries = 0) {
    console.log(`getTrack() called: ${message}`);
    let backupID = '';
    try {
        const response = await fetch('scripts/shirley.php?scrape=true', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.error) {
            console.error(await response.text());
            if (retries < 3) {
                document.getElementById('album-image').src = 'https://www.shutterstock.com/shutterstock/videos/26235881/thumb/1.jpg?ip=x480';
                document.querySelector('.card-artist').innerHTML = 'Please stand by...';
                document.querySelector('.card-title').innerHTML = 'Retrying...';
                return await getTrack('Did not retrieve XM list...retrying.', retries + 1);
            } else {
                console.log('Max retries reached. Trying backup.');
                let bkpResponse = await fetch(`scripts/shirley.php?backup=${CHANNELMAP[station]}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (bkpResponse.ok) {
                    const data = await bkpResponse.json();
                    if (data.error) {
                        console.error(`Error from backup api: ${data.error}`);
                        return data.error;
                    } else {
                        const track = data.results[data.count - 1];
                        backupID = track.spotify.id;
                    }
                }
            }
        } else {
            const data = await response.json();
            if (data.error) {
                console.error(`Error from getTrack(): ${data.error}`);
                return data.error;
            } else {
                const channel = ROSETTA[station]; 
                const result = data.channels[channel];
                track = result.cuts[0];
                title = track.name;
                artist = track.artistName;
            }
        }
        song = await searchSpotify(title, artist, backupID);
        if (!song && !backupID) {
            // We must not have tried the backup...try it now
            console.log('No song found. Trying backup.');
            let bkpResponse = await fetch(`scripts/shirley.php?backup=${CHANNELMAP[station]}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (bkpResponse.ok) {
                const data = await bkpResponse.json();
                if (data.error) {
                    console.error(`Error from backup api: ${data.error}`);
                    return data.error;
                } else {
                    const track = data.results[data.count - 1];
                    backupID = track.spotify.id;
                }
                song = await searchSpotify('', '', backupID);
            }
        }
        return song;
    } catch (error) {
        console.error('Retrieval error:', error);
        return { 'Retrieval error': error };
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
        const response = await fetch(`https://api.spotify.com/v1/search?q=${title}+artist%3A${artist}&type=track&market=US`, {
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