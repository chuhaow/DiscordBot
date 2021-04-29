//Command formatt: !kick @User
module.exports = {
    name: 'kick',
    description: 'kick user',
    execute(bot,message,args){
       const member = message.mentions.users.first();
       console.log(member);
       if(member){
           
            const target = message.guild.members.cache.get(member.id);
            
            target.kick()
            message.channel.send("User has been kicked");
       }else{
           message.channel.send("Unable to kick");
       }
        
    }
}