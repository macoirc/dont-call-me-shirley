import os
from datetime import datetime
from urllib.request import Request, urlopen
import json

SITE = 'https://xmplaylist.com/api/station'  # URL of the site to check
EXPECTED = 'spotify'  # String expected to be on the page


def validate(res):
    #Return False if string is missing
    return EXPECTED in res


def lambda_handler(event, context):
    try:
        channel = event['queryStringParameters']['channel']
        req = Request(f'{SITE}/{channel}', headers={'User-Agent': 'AWS Lambda'})
        response = urlopen(req).read()
        if not validate(str(response)):
            raise Exception('Validation failed')
    except:
        return({'error': 'Check failed!'})
    else:
        return {'statusCode': 200,
                'headers': {"Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"},
                            'body': response}
    finally:
        print('Check complete at {}'.format(str(datetime.now())))
