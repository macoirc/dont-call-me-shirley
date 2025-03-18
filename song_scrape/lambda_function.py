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

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47'
SXM_URL = 'https://lookaround-cache-prod.streaming.siriusxm.com/playbackservices/v1/live/lookAround'

ROSETTA = {
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
    "the10sspot": "038e9a9a-4878-7561-521b-5d432a0798a0",
    "1stwave": "65f04311-3581-256c-97b9-279838d6ff5e",
    "90stonow": "212e2e23-06e3-3a86-5f89-6ce7a26c35c3",
    "accousticrock": "dd042955-b3fa-bf2b-6b64-6f08236ed48f",
    "bluegrass": "9e545d10-7c21-9707-1d34-3d503b7365bc",
    "bobmarleystuffgongradio": "881c9b1f-e7fd-4637-b87a-0dd06f1831a5",
    "bonjovi": "3adfcd26-b336-23cb-f40d-8e4f1a40e1de",
    "carriescountry": "75301b34-2f01-2c17-0b52-028bec0d271c",
    "coffeehouse": "41f8b174-fb06-1707-aaa7-e74e109c2ee9",
    "davematthewsbandradio": "69e5185d-d218-8fbc-082f-6ea5a16ca4db",
    "estreetradio": "727fa612-6e53-458e-720d-b662dc974e5d",
    "gratefuldead": "067801cb-bb3f-1707-dd21-d77e06bb27c0",
    "classicrockhits": "aff703b3-1492-c8d7-55de-80a6612c08a3",
    "mosaic": "d0759ae0-eeef-48e4-c4b9-526217aac33d",
    "countrytop1000": "451bf902-005b-da8b-08bf-e24d34df486e",
    "onbroadway": "adc27a20-6fc4-7269-5ca6-4a492f7dfa55",
    "outlawcountry": "176daca5-6810-3a1c-49e9-39b69055e811",
    "pandoranow": "02394c8d-7afe-6ba2-3791-fce63b1e4d85",
    "pearljam": "cdc9bee8-9317-37fa-ec8e-464096670c60",
    "poprocks": "44f9129f-579a-3d23-218f-3c3518036fc6",
    "radiomargaritaville": "c636d008-7cb0-99eb-7fb7-7c489f862a26",
    "redwhitebooze": "5b537ac7-2357-55f9-a81c-1229382feffb",
    "deeptracks": "e3041d19-daa5-6517-8c73-41976582d1f9",
    "rockpopmix": "175161c2-7224-8d31-b4dc-88ec5d625ce2",
    "phish": "0b5b5f60-dfcf-eba9-1dc6-ec3c909f4541",
    "popmixupbeat": "2243f789-5662-2ab7-c51e-04dc8e6fe08d",
    "spectrum": "804a5411-b234-1188-27da-f01197103886",
    "siriusxmu": "f49737db-bea3-0c13-9834-b879fb1894c4",
    "thebeatleschannel": "20801778-3df2-d607-eab5-e03de0ca7815",
    "theblend": "bda81f03-f231-d4db-56ad-40cb132c5663",
    "thebridge": "1898923d-071d-0abd-1a62-ed0d2702d4f1",
    "tiktok": "6e59f0fe-6fcc-ef8f-0ba7-72eb77385eb0",
    "top40hits": "c4c36606-49ca-b948-c7ba-019f13a451a2",
    "tompetty": "60b0ea2e-dec7-1d4a-da2a-6de09f273fe7",
    "u2xradio": "a4b7a4f7-af96-3ae6-53df-f78ff9ac9aab",
    "undergroundgarage": "3b83dc80-5987-6898-e98d-a98012f700c1",
    "topofthecountry": "60035cea-1181-5b91-4c33-ba63663a37e2",
    "williesroadhouse": "0aee72ed-5dd8-2848-3567-d8809e123cd1",
	"holidaytraditions":"33794a0f-2a24-08bb-492e-12e441fab2f0",
    "holly": "ba107a8d-fb2d-571e-1894-f6ea03ed318a",
    "hallmarkradio": "acf8556b-03f4-e739-554f-464d50ba738d",
    "countrychristmas": "71dbb5a0-8995-958b-e139-b63b2864cabb"
}

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
        return {}


#serverless function to scrape song title and artist
def scrape_song(station):
    headers = {"User-Agent": UA, 
               'Cache-Control': 'max-age=60'}
    response = requests.get(url=SXM_URL, headers=headers)
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
        if title[-4:-3] == '(' and title[-1] == ')': #2 digit year
            title = title[:-4].strip()
        if title[-6:-5] == '(' and title[-1] == ')': #4 digit year
            title = title[:-6].strip()
        return title, artist
    else:
        print('Scraped values were empty.')
        return None, None

def handler(event, context):
    api_key = event['headers']['x-api-key']

    #universal implementation to get Spotify user token
    if event['path'] == '/spotifytoken':
        user_token = get_user_token(api_key)
        return {
            'statusCode': 200,
            'headers': {"Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"},
            'body': json.dumps({"spotifyToken": user_token})
        }

    #serverless implementation to get song title and artist
    if event['path'] == '/getsong':
        if 'channel' in event['queryStringParameters']:
            choice = event['queryStringParameters']['channel']
            if choice in ROSETTA:
                station = ROSETTA[choice]
            else:
                return {
                    'statusCode': 400,
                    'headers': {"Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*"},
                    'body': json.dumps({"error": "Invalid channel specified."})
                }
            title, artist = scrape_song(station)
            return {
                'statusCode': 200,
                'headers': {"Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"},
                'body': json.dumps({"title": title, "artist": artist})
            }
        else:        
            return {
                'statusCode': 400,
                'headers': {"Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"},
                'body': json.dumps({"error": "No channel specified."})
            }
    