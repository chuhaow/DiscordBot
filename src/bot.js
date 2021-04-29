require("dotenv").config();

const Discord = require('discord.js');
const fs = require('fs');
const {join} = require('path');
const bot = new Discord.Client();
const PREFIX = "!";

bot.commands = new Discord.Collection();
bot.events = new Discord.Collection();

['command_handler.js','event_handler.js'].forEach(handler=>{
    require(join(__dirname,`./handlers/${handler}`))(bot,Discord);
})

bot.login(process.env.DISCORD_BOT_TOKEN);




