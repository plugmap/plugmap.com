plugmap.com
===========

![PlugMap](https://raw.github.com/stuartpb/plugmap.com/master/www/favicon@16x.png)

A site for finding power outlets.

## Config variables

In addition to the envigor configurations for mongodb, s3, smtp, and facebook:

- MAPBOX_TILES: The ID of the tiles used by MapBox (passed to the JS API constructor).
- BCRYPT_ROUNDS: Rounds to generate bcrypt hashes with (defaults to 10).
- EMAIL_TOKEN_SENDER: Address for account emails to come from.

**Note: Actually, all these things are currently hard-coded. This is more of a wishlist.**

- SESSION_SECRET: A secret string to authenticate session tokens (for some
  reason). Recommended to use output from `pwgen -sB 64 1`.

## Setup

1. Set up all the things you'll need for this app:

  - S3: I don't know, I'm using DreamObjects.
  - MapBox: Go to Mapbox, make an account, make a tileset.
  - Facebook: Go to developers.facebook.com, make a new app, copy the variables to the env via `heroku config:set`.
  - MongoDB: On Heroku, `heroku addons:add mongolab` (or mongohq).
  - SMTP: On Heroku, install one of https://addons.heroku.com/#email-sms (the ones this app recognizes are listed above).
  - DNS: On Heroku, `heroku addons:add zerigo_dns` (note you'll need to go to the web console if you want to set up an MX record).

## Contributing

The structure of this app is currently a little unusual:

- app.js ties all the app functionality together, and handles setting the locals common to all requests.
- API functions are in routes/api.js, which are implemented under the '/api/v0' subroute by app.js.
- User-related routes are tied together as an app by routes/userRoutes.js.
- Plug-related routes are tied together as an app by routes/plugRoutes.js.
