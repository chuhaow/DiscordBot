const gameList = new Map();
module.exports = {
    name: 'blackjack',
    aliases: ['hit','stand','leave'],
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
                    players:[],
                    count: 0,
                    end: false,
                    reacted: 0
                }
                game.players.push(new Player(message.author.id));
                gameList.set(message.guild.id,game);
                deal(game,Discord,message);
                

                
                
                
            }else{

            }

        }else if(cmd === 'hit'){
            serverGame.count++;
            console.log(serverGame.count);

            

        }

        
        



    }

    
}

async function displayPlayerHand(player,Discord,message){
    let text  = player.printHand();
    const playerShow = new Discord.MessageEmbed()
        .setTitle(`Player Hand`).addFields(

            {name:'Cards:',value: `${text}`}

        ).setDescription(`${player.id}`)
    message.channel.send(playerShow);
}

const deal = async (game, Discord,message) =>{
    if(game.end === true){
        console.log("Game ended");
        return;
    }
    game.reacted = 0;
    if(game.count === 0){
        
        let dealerHiddenCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),true);
        let dealerCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false);
        game.dealerHand.push(dealerCard);
        game.dealerHand.push(dealerHiddenCard);
        for(const p of game.players){
            for(let i = 0; i < 2; i++){
                let playerCard = new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false);
                p.addCard(playerCard);
            }
        }
        
    }else{
        game.dealerHand[1].isFaceDown = false;
    }
    displayPlayerHand(game.players[0],Discord,message);
            const dealerShow = new Discord.MessageEmbed()
            .setTitle("Dealer Hand").addFields(
                
                {name:'Cards:',value: `${game.dealerHand[0].print()} \n
                ${game.dealerHand[1].print()}`}
                
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
                    console.log(result);
                    for(let i = 0; i < game.players.length;i++){
                        if(game.players[i].id !== player.id){
                            result = false;
                            
                        }
                        console.log(game.players[i].id);
                            console.log(player.id);
                    }
                    
                    return result;
                }
                
                const collector = embedMessage.createReactionCollector(filter,{ time: 15000 });

                collector.on('collect',(reaction,user) =>{
                    let currPlayer;
                    for(let p of game.players){
                        if(p.id === user.id){
                            currPlayer = p;
                        }
                    }

                    switch(reaction.emoji.name){
                        case '🇭':
                            console.log("Hit");
                            currPlayer.hand.push(new Card(Math.floor(Math.random()*4),Math.floor(Math.random()*13),false));
                            
                            break;
                        case '🇸':
                            console.log("Stand");
                            game.reacted++;
                            break;
                        case '❌':
                            console.log("Leave");
                            
                            break;
                    }
                    if(game.reacted === game.players.length){
                        collector.stop();
                    }
                })

                collector.on('end',async (user) =>{
                    if(game.count !== 0){
                        await deal(game, Discord,message);
                    }
                })
                
                game.count++
                
                

                
                /*
                embedMessage.awaitReactions(filter,{max: 1, time: 15000, errors:['time']})
                .then(collected =>{
                    const reaction = collected.first(); //grab first reaction
                    console.log(reaction.emoji.name);
                    console.log(collected);
                }).catch(collected =>{
                    console.log("Something wrong");
                })
                */
                
        
            });

    
}

const sumHand= async (hand)=>{
    let sum = 0;
    for(let i = 0; i < hand.length;i++){
        sum += hand[i].value()+1;
    }
    return sum
}

class Player{
    #id;
    #hand = [];
    constructor(id){
        this.#id = id;
    }

    get hand(){
        return this.#hand;
    }

    get id(){
        return this.#id;
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

