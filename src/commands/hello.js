

module.exports = {
    name: 'hello',
    description: 'says hello',
    execute(bot,message,args){
       console.log(message);
        message.reply("Hello")
        .then( () => console.log(`replied to ${message.author.username}`))
        .catch(console.error);
        
    }
}