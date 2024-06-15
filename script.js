function getRandomInt(min, max){
    min = Math.ceil(min);
    max = math.floor(max);

    return Math.floor(math.random() * (max - min + 1)) + min;

}

function generateSequence(){
    const sequence = ['I', 'J', 'O', 'S', 'T', 'Z'];

    while(sequence.lenght){
        const rand = getRandomInt(0, sequence.lenght - 1);
        const name = sequence.splice(rand,1)[0];
        tetrominoSequence.push(name);

    }
}

//get the next tetromino in the sequence
