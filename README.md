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
* `/embed <title> <description> <color> [footer] [timestamp] [image]` - makes an embed based on the user's inputs (footer, timestamp and image are optional)
* `/giveaway start <prize> <time>` - starts a giveaway with the specific prize and time chosen by the user, the id is told to the user who ran the command
* `/giveaway stop <id>` - stops a giveaway that has the id specified by the user
* `/stats` - shows the server stats (members, bots, humans, channels, roles and server owner)
* `/userstats [user]` - shows stats of an user (date joined, date created, user type, and if they boosted the server), if the user parameter is empty, the user stats will be from the user who initiated the command
* `/8ball` - makes a question to the magic 8 ball
* `/flip` - flips a coin
* `/random` - shows you a random dog or a random cat
* `/balance [user]` - check your (or another user's) coinz balance (virtual currency)
* `/slots <amount>` - plays the slots game with a selected amount of coinz to gamble
* `/qrcode <data>` - makes a qrcode with the inputted data
* `/postboard <channel>` - toggles postboard mode in a channel (auto-creates threads for messages)

### text commands
* `!ban` - bans an user and sends them a DM explaining why
* `!kick` - kicks an user and sends them a DM explaining why

## Installation/Setup

**step 1**: clone this repo:
```bash
git clone https://github.com/paritojr/doggo-the-helper.git
cd doggo-the-helper
```

**step 2**: install node.js [here](https://nodejs.org/en/download), if you haven't, go do that, otherwise, go to the next step
<br>
<br>
**step 3**: get a discord bot token, if you don't have one, go to the [Discord Developer Portal](https://discord.dev) and create a new discord app
<br>
after that, make a .env file and then put on it "TOKEN=YOUR_BOT_TOKEN" (replace YOUR_BOT_TOKEN with your actual token)
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
