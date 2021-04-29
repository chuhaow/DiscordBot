const { execute } = require("./play");

/*
module.exports = {
    name:'leave',
    description: 'stop the bot and leave teh channel',
    async execute(bot,message,args){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.channel.sends("Must be in voice channel");
        }
        await voiceChannel.leave();
        await message.channel.send('Leaving Channel...');
    }
}
*/