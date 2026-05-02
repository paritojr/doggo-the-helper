<div align="center">
<h1>doggo the helper</h1>
<p>🐶 a discord bot, useful for anything</p>
</div>
it's easy to set up and simple to use
<br>
you can do anything with the source code, i've provided a few commands (more coming in the future)
<br>
<br>

## Usage
### slash commands
* `/hello` - says hello to the user
* `/ping` - pings the discord bot
* `/random cat` - shows you a random cat
* `/random dog` - shows you a random dog
* `/embed <title> <description> <color> [footer] [timestamp] [image]` - makes an embed based on the user's inputs (footer, timestamp and image are optional)
* `/giveaway start <prize> <time>` - starts a giveaway with the specific prize and time chosen by the user, the id is told to the user who ran the command
* `/giveaway stop <id>` - stops a giveaway that has the id specified by the user
* `/serverinfo` - shows the server info (members, bots, humans, channels, roles and server owner)
* `/userinfo [user]` - shows user info (date joined, date created, user type, and if they boosted the server)
* `/8ball` - makes a question to the magic 8 ball
* `/flip` - flips a coin
* `/base64 encode <text>` - encode a string with base64
* `/base64 decode <text>` - decode a string with base64
* `/dailycoinz` - claim your daily reward of coinz (once every 24 hours)
* `/balance [user]` - check your (or another user's) coinz balance (virtual currency)
* `/slots <amount>` - plays the slots game with a selected amount of coinz to gamble
* `/qrcode <data>` - makes a qrcode with the inputted data
* `/postboard <channel>` - toggles postboard mode in a channel (auto-creates threads for messages)
* `/pay <user> <amount>` - transfers coinz to another user

### text commands
* `!ban <user>` - bans an user and sends them a DM explaining why
* `!kick <user>` - kicks an user and sends them a DM explaining why
* `!exec <command>` (owner-only) - executes shell commands on the bot's host machine

## Installation/Setup

**step 1**: clone this repo:
```bash
git clone https://github.com/paritojr/doggo-the-helper.git
cd doggo-the-helper
```

**step 2**: install node.js [here](https://nodejs.org/en/download), if you haven't, go do that, otherwise, go to the next step
<br>
<br>
**step 3**: create a new bot in the [Discord Developer Portal](https://discord.dev) and copy its token.
<br>
then create a `.env` file in the project root and follow the `.env.example` template
<br>
to get your Discord ID (for OWNER_ID variable), enable Developer Mode in Discord (Settings → Advanced), then right-click your profile and click **Copy User ID**.
<br><br>
**step 4**: create a folder named "db" in the root directory
<br>
<br>
**step 5**: run `npm install`
<br>
(this will install every library the bot uses)
<br>
<br>
**step 6**: run `node bot.js`
<br>
<br>
as a bonus, if you want to invite your bot to other servers, you can make an bot invite link

## License

This bot is licensed under the MIT License, for more information, check the LICENSE file


anyways, that should be it, pls use it, ty
<br>
also, if you're asking for the invite link, no
