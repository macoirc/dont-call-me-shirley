const your_app_id = '';
const your_api_url = '';
const your_redirect = '';
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
        document.getElementById('main-container').style.display = 'flex';
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
        document.getElementById('togglePlay').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('album-art').src = "https://store-images.s-microsoft.com/image/apps.10546.13571498826857201.6603a5e2-631f-4f29-9b08-f96589723808.dc893fe0-ecbc-4846-9ac6-b13886604095?h=380";
        document.querySelector('.card-artist').style.display = 'none';
        document.querySelector('.card-title').style.display = 'none';
    } else {
        isPlaying = true;
        console.log('Play button pressed.');
        document.getElementById('togglePlay').innerHTML = '<i class="fas fa-stop"></i>';
        do {
            newTrack = await getTrack('loading new track.');
            if (newTrack.error) {
                console.error('Error from getTrack():', newTrack.error);
                isPlaying = false;
                alert('An error occurred. Please try again later.');
                document.getElementById('togglePlay').innerHTML = '<i class="fas fa-play"></i>';
                break;
            }
            duration = newTrack.duration_ms;
            token = newTrack.token;
            await playTrack(newTrack);
            console.log(`Successfully loaded track: ${newTrack.name}. Waiting ${duration}ms.`);
            await delay(duration);
            console.log('Delay expired. Getting new track.');
        } while (isPlaying);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playTrack(current_track) {
    // Play the track
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${player_id}`, {
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
    await player.resume();
    let currentTrackName = current_track.name;
    let artist = current_track.artists[0].name
    current_track.album.images.forEach(image => {
        if (image.height === 300 && document.getElementById('album-art').src != image.url) {
            document.getElementById('album-art').src = image.url;
        }
    });
    var setArtist = document.querySelector('.card-artist');
    var setTitle = document.querySelector('.card-title');
    setArtist.innerHTML = artist;
    setTitle.innerHTML = currentTrackName;
    setArtist.style.display = 'block';
    setTitle.style.display = 'block';
    if (artist.length > 44) {
        setArtist.className = 'card-artist marquee';
    } else {
        setArtist.className = 'card-artist';
    }
    if (currentTrackName.length > 44) {
        setTitle.className = 'card-title marquee';
    } else {
        setTitle.className = 'card-title';
    }
};

async function getTrack(message = '', retries = 0) {
    console.log(`getTrack() called: ${message}`);
    try {
        const response = await fetch(`${your_api_url}/v1/getsong?channel=${station}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': apiKey
            }
        });

        if ((response.headers.get('content-type')?.includes('text/html')) || (response.status == 503) || (response.status == 504)) {
            console.error(await response.text());
            if (retries < 3) {
                return await getTrack('Did not retrieve track...retrying.', retries + 1);
            } else {
                console.log('Max retries reached. Trying backup API.');
                backup = await backupMusic(station);
                if (backup.error) {
                    console.error('Error from backup API:', backup.error);
                    return { error: 'Max retries reached' };
                } else {
                    return backup;
                }
            }
        } else {
            const data = await response.json();
            if (data.error) {
                console.error(`Error from getTrack(): ${data.error}`);
                return data.error;
            } else if (!data.uri) {
                console.error('No URI found in getTrack()');
                return { error: 'No URI found in getTrack()' };
            } else {
                return data;
            }
        }
    } catch (error) {
        console.error('Network error:', error);
        return { error: 'Network error' };
    }
}

window.onbeforeunload = async function() {
    await player.disconnect();
};

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/spotify-player;samesite=strict;secure=true";
}

function getCookie(cname) {
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
    let user = getCookie("shirley-api");
    if (user != "") {
        return user;
    } else {
        return false;
    }
}

async function spotifyToken(apiKey) {
    response = await fetch(`${your_api_url}/v1/getsong?getToken=true`, {
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

async function backupMusic(channel) {
    const channelMap = {
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
    }
    if (channelMap[channel]) {
        channel = channelMap[channel];
    } else {
        console.error('Invalid channel selected for backup.');
        return { error: 'Invalid channel selected for backup.' };
    }
    
    const track = await fetch(`https://xmplaylist.com/api/station/${channel}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47'
        }
    });
    if (!track.ok) {
        console.error('Error fetching backup track:', track.status);
        return { error: 'Error fetching backup track' };
    } else {
        const data = await track.json();
        if (data.results) {
            const song = data.results[data.results.length - 1];
            result = await fetch(`https://api.spotify.com/v1/tracks/${song.spotify.id}`, {
                method: 'GET',
                redirect: 'manual',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (result.error) {
                console.error('Error fetching backup track from Spotify:', result.status);
                return { error: 'Error fetching backup track from Spotify' };
            }
            return result;
        } else {
            console.error('No song found in backup API response.');
            return { error: 'No song found in backup API response.' };
        }
    }
}