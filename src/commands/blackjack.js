const gameList = new Map();
/*
TODO:
-Let multiple players join the game
*/
module.exports = {
    name: 'blackjack',
    aliases: ['hit','stand','leave','join','start'],
    description: 'Starts a game of black jack',
    async execute(bot,message,cmd,args,Discord){
        
        //suits = ['./src/assets/spade.png']
        const serverGame = gameList.get(message.guild.id);

        if(cmd === 'blackjack'){
            //console.log(serverGame);
            if(!serverGame){
                const game = {
                    textChannel: message.channel,
                    dealerHand:[],
                    players: new Map(),
                    count: 0,
                    end: false,
                    reacted: [],
                    notReacted: [],
                    inProgress: false,
                    owner: undefined
                }
                game.players.set(message.author.id,new Player(message.author.id));
                game.owner = message.author.id;
                gameList.set(message.guild.id,game);
                
                const startMessage = new Discord.MessageEmbed()
                    .setTitle(`A new blackjack game has been created by:`).addFields(

                    {name:'Commands:',value: `!join - To join the game \n !start - To start the game(Only owner)`}
                    

                    ).setDescription(`<@${message.author.id}>`)
                message.channel.send(startMessage);

                setTimeout(() => {
                    if(!game.inProgress){
                        gameList.delete(message.guild.id);
                        const endMessage = new Discord.MessageEmbed()
                        .setTitle(`Game did not start, Terminating`)
                        message.channel.send(endMessage);
                    }
                }, 25000);
                
                
            }else{
                return message.channel.send("Game already exists in this channel");
            }

        }else if(cmd === 'join'){
            if(!serverGame){
                return message.channel.send("No game in progress in this channel type !blackjack to start a new game");
            }else if(serverGame.players.get(message.author.id)){
                return message.channel.send("You are already in the game");
            }else if(serverGame.inProgress){
                return message.channel.send("Game currently in progess, unable to join");
            }
            serverGame.players.set(message.author.id,new Player(message.author.id));
            

        }else if( cmd === 'start'){
            if(!serverGame){
                return message.channel.send("No game in progress in this channel type !blackjack to start a new game");
            }else if(message.author.id !== serverGame.owner){
                return message.channel.send("Only the owner of the game can start");
            }else if(serverGame.inProgress){
                return message.channel.send("Game currently in progess, unable to join");
            }
            serverGame.inProgress = true;
            deal(serverGame,Discord,message);
        }

        
        



    }

    
}

function printDealerHand(dealerHand){
    let result = "";
    
    for(let i = 0; i <dealerHand.length;i++){
        result  += dealerHand[i].print() + "\n"
    }   
    
    return result;
}

async function displayPlayerHand(player,Discord,message){
    let text  = player.printHand();
    const playerShow = new Discord.MessageEmbed()
        .setTitle(`Player Hand`).addFields(

            {name:'Cards:',value: `${text}`}

        ).setDescription(`<@${player.id}>`)
    message.channel.send(playerShow);
}

const deal = async (game, Discord,message) =>{
    
    game.reacted = [];
    game.notReacted = [];
    for(let [k,v] of game.players){
        if(!v.isStand){
            game.notReacted.push(k);
        }
    }
    if(game.notReacted.length === 0){
        console.log("Game ended");
        gameList.delete(message.guild.id);
        return endGame(game,Discord,message);
    }
    if(game.count === 0){
        
        let dealerHiddenCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),true);
        let dealerCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false);
        game.dealerHand.push(dealerCard);
        game.dealerHand.push(dealerHiddenCard);
        for(let [k,v] of game.players){
            console.log(k)
            for(let i = 0; i < 2; i++){
                let playerCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false);
                v.addCard(playerCard);
            }
        }
        
    }else{
        game.dealerHand[1].isFaceDown = false;
        let dealerSum = sumHand(game.dealerHand);
        while(dealerSum < 17){ //Dealer Hits
            let dealerCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false);
            game.dealerHand.push(dealerCard);
            dealerSum += dealerCard.value+1;
        }
        dealerSum = sumHand(game.dealerHand);

        
    }
    for(let [k,v] of game.players){
        displayPlayerHand(v,Discord,message);
    }
            let dealerDisplay = printDealerHand(game.dealerHand);
            const dealerShow = new Discord.MessageEmbed()
            .setTitle("Dealer Hand").addFields(
                
                {name:'Cards:',value: `${dealerDisplay}`}
                
            )
            
            message.channel.send(dealerShow).then(async embedMessage =>{
                await embedMessage.react("🇭");
                await embedMessage.react("🇸");
                await embedMessage.react("❌");
                const filter = (reaction, player) =>{
                    let result = true;
                    if(!['🇭','🇸','❌'].includes(reaction.emoji.name)){
                        result = false;
                    }
                    //console.log(result);
                    for(let i = 0; i < game.notReacted.length;i++){
                        if(!game.notReacted.includes(player.id)){
                            result = false;
                            
                        }
                    }
                    console.log(result);
                    return result;
                }
                
                
                const collector = embedMessage.createReactionCollector(filter,{ time: 15000 });

                collector.on('collect',(reaction,user) =>{
                    let currPlayer = game.players.get(user.id);
                    

                    switch(reaction.emoji.name){
                        case '🇭':
                            console.log("Hit");
                            currPlayer.hand.push(new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false));
                            if(sumHand(currPlayer.hand) > 21){
                                currPlayer.isStand = true;
                            }
                            game.reacted.push(currPlayer.id);
                            break;
                        case '🇸':
                            console.log("Stand");
                            currPlayer.isStand = true;
                            //console.log(currPlayer.isStand);
                            game.reacted.push(currPlayer.id);
                            //console.log("Player:"+currPlayer.id);
                            break;
                        case '❌':
                            console.log("Leave");
                            game.players.delete(currPlayer.id);
                            game.reacted.push(currPlayer.id);
                            if(game.players.size === 0){
                                game.end = true;
                            }
                            break;
                    }
                    console.log(game.reacted.length);
                    console.log(game.notReacted.length);
                    if(game.reacted.length === game.notReacted.length){
                        collector.stop();
                    }
                })

                collector.on('end',async (user) =>{
                    console.log("Got all reactions")
                    for(let id of game.notReacted){         //Remove any players who did not react
                        if(!game.reacted.includes(id)){
                            game.players.delete(id);
                        }
                    }
                    await deal(game, Discord,message);
                    
                })
                
                game.count++
                
                
        
            });
}

async function endGame(game,Discord,message){
    let dealerSum = sumHand(game.dealerHand);
    while(dealerSum < 17){ //  In case the dealer hand is still less than 17
        let dealerCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false);
        game.dealerHand.push(dealerCard);
        dealerSum += dealerCard.value+1;
    }
    game.dealerHand[1].isFaceDown = false;
    let dealerDisplay = printDealerHand(game.dealerHand);
        const dealerShow = new Discord.MessageEmbed()
        .setTitle("Final Dealer Hand").addFields(
            
            {name:'Cards:',value: `${dealerDisplay}`}
            
        )
    message.channel.send(dealerShow)

    
     for(let [id,player] of game.players){
            let playerSum = sumHand(player.hand);
            console.log("Sum:"+playerSum);
            console.log("Dealer:"+dealerSum);
            console.log("Stand:"+game.players.get(id).isStand);
            if(playerSum > 21 || (playerSum < dealerSum && dealerSum <= 21)){
                //v.hasLost = true
                await printPlayerResult(Discord,message,player,"Loser");

                console.log("Player Bust");
            }else if( playerSum <= 21 && dealerSum > 21 || (playerSum > dealerSum && playerSum <= 21)){
                //v.hasWon = true;
                await printPlayerResult(Discord,message,player,"Winner");

                game.players.delete(id)
                console.log("Player Blackjack");
            }else if( playerSum === dealerSum){
                await printPlayerResult(Discord,message,player, "Tie");
                console.log("Tie")
            }
        }
}

async function printPlayerResult(Discord,message,player,result){
    let text  = player.printHand();
    const playerShow = new Discord.MessageEmbed()
        .setTitle(result)
        .addFields({name:'Final Hand:',value: `${text}`})
        .setDescription(`<@${player.id}>`)
    return message.channel.send(playerShow);
}



const sumHand = (hand)=>{
    let sum = 0;
    let hasOneAce = false
    for(let i = 0; i < hand.length;i++){
        if(hand[i].value+1 > 10){
            sum+= 10;
        }else if(hand[i].value+1 === 1) {
            if(!hasOneAce){
                hasOneAce = true;
            }else{
                sum ++;
            }
        }else{
            sum += hand[i].value+1;
        }
        
    }
    if(hasOneAce && sum <= 10){     //Only care if 1 of the aces is 11 or 1, all others will just be 1
        sum+= 11;
    }else{
        sum++;
    }
    return sum
}

class Player{
    #id;
    #hand = [];
    #hasLost = false;
    #hasWon = false;
    #isStand = false;
    constructor(id){
        this.#id = id;
    }

    get hand(){
        return this.#hand;
    }

    get id(){
        return this.#id;
    }

    get isStand(){
        return this.#isStand;
    }

    set isStand(stand){
        this.#isStand = stand;
    }

    set hasWon(won){
        this.#hasWon = won;
    }

    set hasLost(lost){
        this.#hasLost = lost;
    }

    printHand(){
        let result = "";
        
        for(let i = 0; i <this.#hand.length;i++){

            result  += this.#hand[i].print() + "\n"
        }   
        console.log(result);
        return result;
    }

    addCard(card){
        this.#hand.push(card);
    }
    
}

class Card{
    #suit;
    #value;
    #suitList = {0:'♤',1:'♤',2:"♥",3:"♦"};
    #cardSymbol = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    #isFaceDown;
    constructor(suit,value,isFaceDown){
        this.#suit = suit;
        this.#value = value
        this.#isFaceDown = isFaceDown;
    }

    get suit(){
        return this.#suit
    }

    get value(){
        return this.#value;
    }

    print(){
        let result = "";
        if(!this.#isFaceDown){
            result += this.#cardSymbol[this.#value] +" "+ this.#suitList[this.#suit];
        }else{
            result += "FACEDOWN";
        }
        return result;
    }

    get isFaceDown(){
        return this.#isFaceDown;
    }

    set isFaceDown(isDown){
        this.#isFaceDown = isDown;
    }

    get suitName(){
        return this.#suitList[this.#suit];
    }

    get cardSymbol(){
        return this.#cardSymbol[this.#value];
    }

    
}

