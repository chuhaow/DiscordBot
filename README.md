# DiscordBot
A small discord bot that is able to play youtube videos and host a game of blackjack between multiple players

## Commands
### Music
- `!play {URL}`: Add the youtube video with the specified URL to the queue
- `!play {Word Search}`: Adds the first video based on the word search to the queue
- `!skip`: skips current video
- `!stop`: Removes the bot from the voice channel
- `!pause`: pauses the current video
- `!resume`: resumes the current video
- `!songs`: Displays a list of all videos/songs in the queue
### Blackjack
- `!blackjack`: starts a blackjack lobby for players to join
- `!join`: Join the current game of blackjack
- `!start`: Start the blackjack game
- To `hit` or `stand` can be done through `reactions`

## Running
- Can be started by using the `start` script in the `package.json`
- Replace `process.env.DISCORD_BOT_TOKEN` with you own bot token
