module.exports = {
    name: 'help',
    description: 'display a list of all commands',
    execute(bot,message,args){
       
        message.reply("Hello")
        .then( () => console.log(`replied to ${message.author.username}`))
        .catch(console.error);
        
    }
}