plugmap.com
===========

A site for finding power outlets.

## Config variables

In addition to the envigor configurations for mongodb, s3, smtp, and facebook:

- MAPBOX_TILES: The ID of the tiles used by MapBox (passed to the JS API constructor).
- BCRYPT_ROUNDS: Rounds to generate bcrypt hashes with (defaults to 10).
- EMAIL_TOKEN_SENDER: Address for account emails to come from.

## Setup

1. Set up all the things you'll need for this app:
  
  - S3: I don't know, I'm using DreamObjects.
  - MapBox: Go to Mapbox, make an account, make a tileset.
  - Facebook: Go to developers.facebook.com, make a new app, copy the variables to the env via `heroku config:set`.
  - MongoDB: On Heroku, `heroku addons:add mongolab` (or mongohq).
  - SMTP: On Heroku, install one of https://addons.heroku.com/#email-sms (the ones this app recognizes are listed above).
  - EMAIL_TOKEN_SENDER: I'm going with `tokens@plugmap.com`.
  - DNS: On Heroku, `heroku addons:add zerigo_dns` (note you'll need to go to the web console if you want to set up an MX record).
