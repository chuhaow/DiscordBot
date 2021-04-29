const fs = require('fs');
const {join} = require('path');
module.exports= (bot,Discord)=>{
    const load_dir = (dirs)=>{
        const event_files = fs.readdirSync(join(__dirname,`../events/${dirs}`)).filter(file=>file.endsWith('.js'));

        for(const file of event_files){
            const event = require(join(__dirname,`../events/${dirs}`,`${file}`));
            const event_name = file.split('.')[0];
            bot.on(event_name,event.bind(null,Discord,bot));
        }
    }
    ['client','guild'].forEach(e => load_dir(e));
    
}