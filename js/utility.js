function randomBetween(min, max){
    return Math.random() * (max - min) + min
}

function createScoreLabel({score, object}){
    const scorelabel = document.createElement('label');
    scorelabel.innerHTML = score;
    scorelabel.style.position = 'absolute';
    scorelabel.style.color = 'white';
    scorelabel.style.top = object.position.y + 'px';
    scorelabel.style.left = object.position.x + 'px';
    scorelabel.style.userSelect = 'none';

    document.querySelector('#parentDiv').appendChild(scorelabel);

    gsap.to(scorelabel, {
        opacity: 0,
        y: -30,
        duration: 0.75,
        onComplete: () => {
            document.querySelector('#parentDiv').removeChild(scorelabel);
        }
    })
}

function rectangularCollision({
    rectangle1,
    rectangle2
}) {
    return (rectangle1.position.y + rectangle1.height >= rectangle2.position.y && rectangle1.position.x + rectangle1.width >= rectangle2.position.x && rectangle1.position.x <= rectangle2.position.x + rectangle2.width)

}

function createParticles({object, color, fades}){
    for(let i = 0; i < 15; i++){

        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
            },
            radius: Math.random() * 3,
            color: color || '#BAA0DE',
            fades

        }));
    }
}