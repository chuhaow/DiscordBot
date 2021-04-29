module.exports = (Discord, bot, message) =>{
    
    const PREFIX = '!';
    if(!message.content.startsWith(PREFIX)||message.author.bot){
        return;
    }
    

    const args = message.content.slice(PREFIX.length).split(/\s+/);
    const cmd = args.shift().toLowerCase();
    const command = bot.commands.get(cmd)||bot.commands.find(a=> a.aliases && a.aliases.includes(cmd));

    if(command){
        command.execute(bot,message,cmd,args,Discord);
    }
    
}