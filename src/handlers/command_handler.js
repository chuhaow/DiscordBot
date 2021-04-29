const fs = require('fs');
const {join} = require('path');
module.exports = (bot,Discord)=>{
    //find all command files
    const commandFiles = fs.readdirSync(join(__dirname,'../commands')).filter(file => file.endsWith('.js'));
    for(const file of commandFiles){
        
        const command = require(join(__dirname,'../commands',`${file}`));
        if(command.name){
            bot.commands.set(command.name,command); //initlize the list of commands
        }
    }
    
}