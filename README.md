# Don't Call Me Shirley!

This repository contains an AWS Lambda function, song_scrape, designed to scrape and queue songs from SiriusXM channels to Spotify. 
There is a second helper function, spotifyauth, to handle authenticating the user with Spotify, as well as the xmplaylist function to use as a backup in case something goes wrong with song_scrape.
Configuring this is not for the faint of heart. I used it as a learning exercise for AWS services, so this documentation will be lacking (significantly).
Assistance with making the documentation better is welcomed!

## Table of Contents

- Introduction
- Features
- Setup
- Usage
- Configuration
- Contributing
- License

## Introduction

This AWS Lambda function scrapes song data from SiriusXM channels and plays hem in a browser. It uses the Spotify Web Player SDK to manage the player and the SiriusXM API to fetch the currently playing songs.
For a small group of users this will all run within the AWS free tier.

## Features

- Scrapes song data from SiriusXM channels.
- Plays songs in a Spotify web player.
- Handles token refresh for Spotify API.
- Uses AWS DynamoDB to store state information.
- AWS API Gateway makes calling the lambdas easier
- HTML/JS can be placed anywhere static web sites are supported

## Setup

### Prerequisites

- AWS account with Lambda, API and DynamoDB access. Free tier is fine.
- Spotify Developer account with a configured app.
  - Scopes: user-read-playback-state, user-modify-playback-state, user-read-currently-playing.
- SiriusXM premium account.

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/macoirc/dont-call-me-shirley.git
    cd dont-call-me-shirley
    ```

2. Install dependencies:
    AWS Python Lambdas do not come with the 'requests' package pre-installed. You'll need to upload requests.zip as a layer for your Lambda.
    Note: urllib.request can be used instead of requests, with minor tweaks to the code

4. Deploy the Lambda function using AWS CLI or AWS Management Console.

5. Configure 2 DynamoDB tables:
    - spotifyAPI to hold app secrets
    - SpotifyState to hold user secrets/configuration

6. Configure AWS API Gateway to handle requests and trigger the functions.
    - GET /getsong
    - GET /spotifyauth
    - GET /spotifytoken
    - GET /xmplaylist

## Usage

1. Configure the DynamoDB tables for the necessary variables (see Configuration section).
2. I strongly recommend setting up an API Gateway configuration to handle requests.
3. Trigger the Lambda function with an appropriate event to start scraping and queuing songs. The /client folder contains a static web app to do just that. 

## Configuration

The Lambda function requires the following information, stored in DynamoDB:

spotifyAPI table - 3 items with 2 attributes (name and value):
- name: client_id, value: Your Spotify app's client ID.
- name: client_secret, value: Your Spotify app's client secret.
- name: search_token, value: Your Spotify app's search API key (retrieved and stored by the get_search_token routine).

SpotifyState table - 1 item for each user with 5 attributes:
- apiUser: The API key for your AWS API Gateway user.
- accessToken: the user's Spotify access token, configured by the spotifyauth function and refreshed automatically.
- expiresAt: expiration of the user's Spotify access token, configured by the spotifyauth function and refreshed automatically.
- lastPlayed: the last song the user played, used to prevent repeats.
- refreshToken: the user's Spotify refresh token, configured by the spotifyauth function and refreshed automatically.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.
Assistance with making this documentation better is welcomed!

## License

This project is licensed under the GPL-3.0. See the LICENSE file for details.

---
