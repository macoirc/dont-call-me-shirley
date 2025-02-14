import boto3
import requests
import base64
import json
import time

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edge/117.0.2045.47'
BASE_URI = 'YOUR AWS spotifyauth URI HERE'

def lambda_handler(event, context):
    if 'queryStringParameters' in event and\
      'code' in event['queryStringParameters'] and\
      'state' in event['queryStringParameters']:
        user = event['queryStringParameters']['state']
        auth_code = event['queryStringParameters']['code']
        client = boto3.resource('dynamodb')
        app_api = client.Table('spotifyAPI')
        user_api = client.Table('SpotifyState')
        client_id = app_api.get_item(
            Key={"name": "client_id"}
        )['Item']['value']
        client_secret = app_api.get_item(
            Key={"name": "client_secret"}
        )['Item']['value']
        auth_string = f'{client_id}:{client_secret}'
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes)
        auth_string = auth_b64.decode('ascii')
        headers = {'Content-Type': 'application/x-www-form-urlencoded',
                   'Authorization': f'Basic {auth_string}', 'User-Agent': UA}
        spotify_url = 'https://accounts.spotify.com/api/token'
        body = {'grant_type' : 'authorization_code',
                'code' : auth_code,
                'redirect_uri' : BASE_URI
                }
        results = requests.post(headers=headers, data=body, url=spotify_url)
        spotify_token = results.json()
        user_api.put_item(Item={'apiUser': user, 'expiresAt': int(time.time()) + 3200,
                                        'accessToken': spotify_token['access_token'],
                                        'refreshToken': spotify_token['refresh_token']
        })
        return {
            'statusCode': 200,
            'headers': {"Content-Type": "text/html"},
            'body': json.dumps({"Success": "Authenticated to Spotify."})
        }

    else:
        return {
            'statusCode': 400,
            'headers': {"Content-Type": "application/json"},
            'body': json.dumps({"Error": "Missing parameters."})
        }