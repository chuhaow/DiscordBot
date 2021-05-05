const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();//hold message.guild.id as Key  and queueConstructor Object as value
//queueConstructor holds text channel, voice channel, song queue, and connection

module.exports = {
    name: 'play',
    aliases: ['skip','stop','pause','resume','songs'],
    description: 'finds and plays a video from youtube',
    async execute(bot,message,cmd,args,Discord){
        const voiceChannel = message.member.voice.channel;
        
        if(!voiceChannel){  //Check if in voice channel
            return message.channel.send('Must be in voice channel');
        }

        const permissions = voiceChannel.permissionsFor(message.client.user); //grab permissions of user entering command
        
        if(!permissions.has('CONNECT')||!permissions.has('SPEAK')){    //Check permissions
            return message.channel.send('You do not have permission')
        }
        
        const serverQueue = queue.get(message.guild.id);    //Grab guild object
        console.log(serverQueue);
        if(cmd==='play'){       //Check command
            if(!args.length){   //not arugments sent
                return message.channel.send("You need to send arguments")
            }
            let song = {};

            if(ytdl.validateURL(args[0])){      //If is using validate youtube url
                console.log("URL:"+args[0]);
                const songInfo = await ytdl.getInfo(args[0]);
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url}; //KVP 
                console.log(song);
            }else{  //If not url use key word search
                const video = await videoFinder(args.join(' ')); 
                if(video){  //If we find a video, create a song KVP with key title and url
                    song = {title: video.title, url: video.url};
                }else{
                    message.channel.send('Error Cannot Find Video')
                }
            }

            if(!serverQueue){       //If didnt find a server queue, make a new one
                const queueConstructor ={   //Make a new queueConstructor object
                voiceChannel: voiceChannel,
                textChannel: message.channel,
                connection: null,
                songs:[]
            }

                queue.set(message.guild.id,queueConstructor); //put in gobal map
                
                queueConstructor.songs.push(song);  //Add song to song list

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild,queueConstructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send("Error connecting");
                    throw err;
                }
            }else{  //server queue already exits 
                serverQueue.songs.push(song);
                return message.channel.send(`${song.title} has been added to queue`)
            }
            

        }else if(cmd === 'skip'){
            skipSong(message,serverQueue);
        }else if(cmd === 'stop'){
            stopSong(message,serverQueue);
        }else if(cmd === 'pause'){
            pauseSong(message,serverQueue);
        }else if(cmd ==='resume'){
            resumeSong(message,serverQueue);
        }else if(cmd==='songs'){
            getSongList(message,serverQueue);
        }

        
    
        

    }
}

async function videoFinder(query){       //Function to help find first video from ytSearch
    const videoResult = await ytSearch(query); 
    if(videoResult.videos.length > 1){
        return videoResult.videos[0];
    }else{
        return null;
    }
}

async function videoPlayer(guild,song){
    const songQueue = queue.get(guild.id);
    if(!song){  //If we have not songs playing
        songQueue.voiceChannel.leave();     //leave
        queue.delete(guild.id);     //remove serverQueue from gobal queue
        return
    }
    const stream = ytdl(song.url,{filter: 'audioonly'});
    songQueue.connection.play(stream,{seek: 0, volume: 1})
    .on('finish',()=>{
        songQueue.songs.shift();
        videoPlayer(guild,songQueue.songs[0]); //Play the song, if it finished move on to the next
    });
    
    await songQueue.textChannel.send(`Now playing: ${song.title}`);
}

async function skipSong(message,serverQueue){
    if(!message.member.voice.channel){
        return message.channel.send('You need to be in a channel to skip');
    }
    if(!serverQueue){
        return message.channel.send("There are not songs in queue");
    }
    if(serverQueue.connection.dispatcher.paused){
        await serverQueue.connection.dispatcher.resume();   //Resume song before skipping *Important*
    }
    
    await serverQueue.connection.dispatcher.end();          //End song
    
    await message.channel.send(`Skiping ${serverQueue.songs[0].title}`);
    
}

async function stopSong(message,serverQueue){
    if(!message.member.voice.channel){
        return message.channel.send('You need to be in a channel to Stop music');
    }
    if(!serverQueue){
        return message.channel.send("There are no songs to stop");
    }
    serverQueue.songs = [];     //Clear song list
    serverQueue.connection.dispatcher.end(); // disconnect
    await message.channel.send("Stoping music, and getting outta here");
}

async function pauseSong(message,serverQueue){
    //edge case checks
    if(!message.member.voice.channel){
        return message.channel.send('You need to be in a channel to pause music');
    }
    if(!serverQueue){
        return message.channel.send("There are no songs to pause");
    }
    if(serverQueue.connection.dispatcher.paused){
        return message.channel.send("Song is already paused");
    }
    serverQueue.connection.dispatcher.pause(true); //pause
    
    await message.channel.send(`Pausing ${serverQueue.songs[0].title}`);
}

async function resumeSong(message,serverQueue){
    if(!message.member.voice.channel){
        return message.channel.send('You need to be in a channel to pause music');
    }
    if(!serverQueue){
        return message.channel.send("There are no songs to pause");
    }
    
    if(!serverQueue.connection.dispatcher.paused){
        return message.channel.send("Song is already playing");
    }
    serverQueue.connection.dispatcher.resume();
    await message.channel.send(`Resuming ${serverQueue.songs[0].title}`);
}

async function getSongList(message,serverQueue){
    if(!message.member.voice.channel){
        return message.channel.send('You need to be in a channel to get list of songs');
    }
    if(!serverQueue){
        return message.channel.send("There are no songs");
    }
    message.channel.send("Current List of Songs:");
    for( i = 0; i < serverQueue.songs.length;i++){
        await message.channel.send(`${serverQueue.songs[i].title}`);
    }
    
}