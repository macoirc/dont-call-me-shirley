"""
AWS Lambda function for scraping and queuing songs from SiriusXM channels to Spotify.
Parameters:
- event (dict): The event data passed to the Lambda function.
- context (object): The runtime information of the Lambda function.
Returns:
- dict: The response containing the status code, headers, and body.
"""
import boto3
import requests
import base64
import json
import time

BASE_URL = 'https://lookaround-cache-prod.streaming.siriusxm.com/playbackservices/v1/live/lookAround'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47'
ROSETTA = {
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
}

def get_search_token(table):
    try:
        client_id = table.get_item(
            Key={"name": "client_id"}
        )['Item']['value']
        client_secret = table.get_item(
            Key={"name": "client_secret"}
        )['Item']['value']
    except KeyError as e:
        raise Exception(f"Missing credentials in DynamoDB: {e}")
    
    auth_string = f'{client_id}:{client_secret}'
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes)
    auth_string = auth_b64.decode('ascii')
    headers = {'Content-Type': 'application/x-www-form-urlencoded',
               'Authorization': f'Basic {auth_string}', 'User-Agent': UA
    }
    body = 'grant_type=client_credentials&undefined='
    spotify_url = 'https://accounts.spotify.com/api/token'
    results = requests.post(headers=headers, data=body, url=spotify_url)
    if results.json()['access_token'] is not None:
        new_token = results.json()['access_token']
    if new_token is not None:
        table.update_item(
            Key={"name": "search_token"},
            UpdateExpression="set #v1 = :r",
            ExpressionAttributeNames={"#v1": "value"},
            ExpressionAttributeValues={":r": new_token}
        )
        return new_token
    else:
        print('Failed to renew search token.')

def scrape_song(station):
    headers = {"User-Agent": UA, 
               'Cache-Control': 'max-age=60'}
    response = requests.get(url=BASE_URL, headers=headers)
    try:
        json_data = response.json()
    except ValueError:
        json_data = None

    if json_data is not None:
        content = json_data.get('channels')
        if station in content.keys():
            playing = content[station].get('cuts')
            title = playing[-1].get('name')
            artist = playing[-1].get('artistName')
    if len(title) > 0 and len(artist) > 0:
        return title, artist
    else:
        print('Scraped values were empty.')
        return None, None

def song_search(title, artist, spotify_id = None):
    if artist is not None:
        artist = artist.split('/')[0] # some songs have multiple artists
    client = boto3.resource('dynamodb')
    table = client.Table('spotifyAPI')
    my_token = table.get_item(
        Key = {'name': 'search_token'},
        AttributesToGet=['value']
    )
    search_headers = {'Accept': 'application/json', 
                      'Content-Type': 'application/json', 
                      'Authorization': f'Bearer {my_token}', 
                      'User-Agent': UA}
    if spotify_id is not None:
        spotify_url = f'https://api.spotify.com/v1/tracks/{spotify_id}'
        try:
            print(f'Searching by id {spotify_id}')
            search = requests.get(url=spotify_url, headers=search_headers)
            if search.status_code == 400:
                my_token = get_search_token(table)
                search_headers = {'Accept': 'application/json', 
                        'Content-Type': 'application/json', 
                        'Authorization': f'Bearer {my_token}', 
                        'User-Agent': UA}
                search = requests.get(url=spotify_url, headers=search_headers)
            if search.json() is not None and search.json['id'] == spotify_id:
                return search.json()
            else:
                return {}
        except requests.ConnectionError as e:
            raise e
            return {}
    else:
        spotify_url = 'https://api.spotify.com/v1/search'
        query_string = f'{title} artist:{artist}'
        search_params = {"q": query_string,
                        "type": "track",
                        "market": "US",
                        "offset": 0,
                        "limit": 20,
                        "locale": "en-US,en;q=0.9"
                        }
        try:
            print(f'Searching {title} by {artist}')
            search = requests.get(url=spotify_url, headers=search_headers, params=search_params)
            if search.status_code == 400:
                my_token = get_search_token(table)
                search_headers = {'Accept': 'application/json', 
                        'Content-Type': 'application/json', 
                        'Authorization': f'Bearer {my_token}', 
                        'User-Agent': UA}
                search = requests.get(url=spotify_url, headers=search_headers, params=search_params)
        except requests.ConnectionError as e:
            raise e
            return {}
    if search.json()['tracks']['total'] > 0:
        song = None
        tracks = search.json()['tracks']['items']
        for t in tracks:
            if (artist.lower() == (t['artists'][0]['name']).lower() and title.lower() == (t['name']).lower()):
                song = t
                break
        if song is not None:
            return song
        else:
            return tracks[0]
    else:
        return {}

def get_user_token(api_key):
    client = boto3.resource('dynamodb')
    user_api = client.Table('SpotifyState')
    user_token = user_api.get_item(
        Key = {'apiUser': api_key}
    )
    if user_token['Item']['expiresAt'] < int(time.time()):
        # refresh the expired token
        new_token = refresh_user_token(client, api_key, user_token)
        user_token = new_token['access_token']
    else:
        user_token = user_token['Item']['accessToken']
    return  user_token

def refresh_user_token(client, api_key, user_token):
    client_id = client.Table('spotifyAPI').get_item(
        Key={"name": "client_id"})['Item']['value']
    client_secret = client.Table('spotifyAPI').get_item(
        Key={"name": "client_secret"})['Item']['value']
    auth_string = f'{client_id}:{client_secret}'
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes)
    auth_string = auth_b64.decode('ascii')
    headers = {'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': f'Basic {auth_string}', 'User-Agent': UA}
    spotify_url = 'https://accounts.spotify.com/api/token'
    body = {'grant_type' : 'refresh_token',
            'refresh_token' : user_token['Item']['refreshToken']
            }
    results = requests.post(headers=headers, data=body, url=spotify_url)
    spotify_token = results.json()
    if spotify_token['access_token'] is not None:
        user_api = client.Table('SpotifyState')
        user_api.update_item(
            Key={"apiUser": api_key},
            UpdateExpression="set #v1 = :r, #v2 = :e",
            ExpressionAttributeNames={"#v1": "accessToken", "#v2": "expiresAt"},
            ExpressionAttributeValues={":r": spotify_token['access_token'], ":e": int(time.time()) + 3200}
        )
        return spotify_token
    else:
        print('Failed to renew user token.')

def queue_song(uri, api_key):
    client = boto3.resource('dynamodb')
    user_api = client.Table('SpotifyState')
    user_token = user_api.get_item(
        Key = {'apiUser': api_key}
    )
    if user_token['Item']['expiresAt'] < int(time.time()):
        # refresh the expired token
        new_token = refresh_user_token(client, api_key, user_token)
        user_token = new_token['access_token']
    else:
        user_token = user_token['Item']['accessToken']
    spotify_url = 'https://api.spotify.com/v1/me/player/queue'
    queue_headers = {'Accept': 'application/json', 
                      'Content-Type': 'application/json', 
                      'Authorization': f'Bearer {user_token}', 
                      'User-Agent': UA}
    queue_params = {"uri": uri}
    try:
        print(f'Queuing {uri}')
        queue = requests.post(url=spotify_url, headers=queue_headers, params=queue_params)
        if queue.status_code == 400:
            # token should already be refreshed, but just in case
            new_token = refresh_user_token(client, api_key, user_token)
            user_token = new_token['access_token']
            queue_headers = {'Accept': 'application/json', 
                      'Content-Type': 'application/json', 
                      'Authorization': f'Bearer {user_token}', 
                      'User-Agent': UA}
            queue = requests.post(url=spotify_url, headers=queue_headers, params=queue_params)
    except requests.ConnectionError as e:
        raise e

def skip(api_key):
    client = boto3.resource('dynamodb')
    user_api = client.Table('SpotifyState')
    user_token = user_api.get_item(
        Key = {'apiUser': api_key}
    )
    if user_token['Item']['expiresAt'] < int(time.time()):
        # refresh the expired token
        new_token = refresh_user_token(client, api_key, user_token)
        user_token = new_token['access_token']
    else:
        user_token = user_token['Item']['accessToken']
    spotify_url = 'https://api.spotify.com/v1/me/player/next'
    skip_headers = {'Accept': 'application/json', 
                      'Content-Type': 'application/json', 
                      'Authorization': f'Bearer {user_token}', 
                      'User-Agent': UA}
    try:
        # Attempt to send a POST request to the Spotify API to skip to the next track
        skip = requests.post(url=spotify_url, headers=skip_headers)
        if skip.status_code == 400:
            # If the request fails with a 400 status code, refresh the user token
            new_token = refresh_user_token(client, api_key, user_token)
            user_token = new_token['access_token']
            
            # Update headers with the new token
            skip_headers = {'Accept': 'application/json', 
                      'Content-Type': 'application/json', 
                      'Authorization': f'Bearer {user_token}', 
                      'User-Agent': UA
                      }
            # Retry the POST request with the new token
            skip = requests.post(url=spotify_url, headers=skip_headers)
    except requests.ConnectionError as e:
        raise e

def check_dupes(title, api_key):
    # check if the currently listed song is the same as the last played song
    client = boto3.resource('dynamodb')
    user_api = client.Table('SpotifyState')

    # Retrieve the last played song from the DynamoDB table
    last_played = user_api.get_item(
        Key = {'apiUser': api_key})['Item']['lastPlayed']
    if title in last_played:
        return True
    else:
        # Update the last played song in the DynamoDB table
        user_api.update_item(
            Key={"apiUser": api_key},
            UpdateExpression="set #v1 = :r",
            ExpressionAttributeNames={"#v1": "lastPlayed"},
            ExpressionAttributeValues={":r": title}
        )
        return False

def backup_api(station):
    headers = {"User-Agent": UA, 
               'Cache-Control': 'max-age=60',
                'Accept': 'application/json'
               }
    channelMap = {
        # To Do: Translate the rest of the channels
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
    channel = channelMap[station]
    response = requests.get(url=f'https://xmplaylist.com/api/station/{channel}', headers=headers)
    try:
        json_data = response.json()
    except ValueError:
        json_data = None

    if json_data is not None:
        if json_data.get('results') is not None:
            song_list = json_data.get('results')
            backup_song = song_list[len(song_list - 1)] # get the last song
            title = backup_song.get('track').get('title')
            artist = backup_song.get('track').get('artists')[0]
            spotify_id = backup_song.get('spotify').get('id')
            return title, artist, spotify_id
    return None, None, None

def handler(event, context):
    if 'queryStringParameters' in event and\
      'channel' in event['queryStringParameters']:
        api_key = event['headers']['x-api-key']
        choice = event['queryStringParameters']['channel']
        if choice in ROSETTA:
            station = ROSETTA[choice]
            dupe = True
            while dupe: # keep trying until a new song is playing
                for _ in range(2):
                    title, artist = scrape_song(station)
                    if title is None:
                        print("Scrape failed, trying again after 5 seconds.")
                        time.sleep(5) # wait 5 seconds before trying again
                    else:
                        break
                if title is None:
                    print("Multiple scrape failures, trying xmplaylist.com api.")
                    title, artist, spotify_id = backup_api(choice)
                    if title is None:
                        print("xmplaylist.com api failed, returning 503.")
                        return {
                            'statusCode': 503,
                            'headers': {"Content-Type": "application/json",
                                        "Retry-After": 10,
                                        "Access-Control-Allow-Origin": "*"},
                            'body': json.dumps({"status": "Please try again later."})
                        }
                # some songs have the year at the end and Spotify no likey
                if title[-4:-3] == '(' and title[-1] == ')':
                    title = title[:-4]
                dupe = check_dupes(title, api_key)
                if dupe:
                    time.sleep(5) # wait 5 seconds before trying again
            song = song_search(title, artist)
            if song == {}:
                if 'spotify_id' in locals():
                    song = song_search(title=None, artist=None, id=spotify_id)
                else:
                    title, artist, spotify_id = backup_api(choice)
                    if spotify_id is not None:
                        song = song_search(title=None, artist=None, id=spotify_id)
                if song != {}:
                    # reset the last played song title
                    client = boto3.resource('dynamodb')
                    user_api = client.Table('SpotifyState')
                    user_api.update_item(
                        Key={"apiUser": api_key},
                        UpdateExpression="set #v1 = :r",
                        ExpressionAttributeNames={"#v1": "lastPlayed"},
                        ExpressionAttributeValues={":r": song['name']}
                    )
                else:
                    # return a retry to the client if a song still has not been found after all that
                    print("Song not found at Spotify, returning 503.")
                    return {
                        'statusCode': 503,
                        'headers': {"Content-Type": "application/json",
                                    "Retry-After": 10,
                                    "Access-Control-Allow-Origin": "*"},
                        'body': json.dumps({"status": "Please try again later."})
                    }
            user_token = get_user_token(api_key)
            song['token'] = user_token
            return {
                'statusCode': 200,
                'headers': {"Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"},
                'body': json.dumps(song)
            }
        else:
            return {
            'statusCode': 404,
            'headers': {"Content-Type": "application/json"},
            'body': json.dumps({"Wrong parameter": "unknown channel"})
        }
    elif 'queryStringParameters' in event and\
        'getToken' in event['queryStringParameters'] and\
            event['queryStringParameters']['getToken'] == 'true':
        api_key = event['headers']['x-api-key']
        user_token = get_user_token(api_key)
        return {
            'statusCode': 200,
            'headers': {"Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"},
            'body': json.dumps({"spotifyToken": user_token})
        }
    else:
        return {
            'statusCode': 400,
            'headers': {"Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"},
            'body': json.dumps({"Missing parameter": "channel"})
        }