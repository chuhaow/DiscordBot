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
                    count: 0
                }
                game.players.push(new Player(message.author));
                gameList.set(message.guild.id,game);
                deal(game);
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
                });

                
                
                
            }

        }else if(cmd === 'hit'){
            serverGame.count++;
            console.log(serverGame.count);
        }else if(cmd === 'stand'){
            console.log('stand');
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

const deal = async (game) =>{
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

    get suitName(){
        return this.#suitList[this.#suit];
    }

    get cardSymbol(){
        return this.#cardSymbol[this.#value];
    }

    
}

