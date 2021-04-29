//Command formatt: !ban @User
module.exports = {
    name: 'ban',
    description: 'ban user',
    execute(bot,message,args){
       const member = message.mentions.users.first();
       console.log(member);
       if(member){
           
            const target = message.guild.members.cache.get(member.id);
            
            target.ban()
            message.channel.send("User has been banned");
       }else{
           message.channel.send("Unable to ban");
       }
        
    }
}