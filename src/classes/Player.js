const Card = require('./Card.js');
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

    addCard(card){
        this.#hand.push(card);
    }
    
}
module.exports = Player;