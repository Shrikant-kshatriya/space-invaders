const scoreEl = document.querySelector('#scoreEL');
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;


let player = new Player();
let projectiles = [];
let grids = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerups = [];

let keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    sapce: {
        pressed: false
    }
}

let frames = 0;
let randomInterval = Math.floor((Math.random() * 500) + 500);
let game = {
    over: false,
    active: true
}
let score = 0;

function init(){
    player = new Player();
    projectiles = [];
    grids = [];
    invaderProjectiles = [];
    particles = [];
    bombs = [];
    powerups = [];

    keys = {
        a: {
            pressed: false
        },
        d: {
            pressed: false
        },
        sapce: {
            pressed: false
        }
    }
    
    frames = 0;
    randomInterval = Math.floor((Math.random() * 500) + 500);
    game = {
        over: false,
        active: true
    }
    score = 0;
    for(let i = 0; i < 100; i++){

        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 0,
                y: 0.3,
            },
            radius: Math.random() * 2,
            color: 'white'
    
        }));
    }
}

function endGame(){
    // makes player disappear
    audio.gameOver.play();
    setTimeout(() => {
        player.opacity = 0;
        game.over = true;
    }, 0);
    // makes game end altogether
    setTimeout(() => {
        game.active = false
        document.querySelector('#restartScreen').style.display = 'flex';
        document.querySelector('#finalScore').innerHTML = score;
    }, 2000);
    createParticles({object: player, color: 'white', fades: true});
}

let spawnTimer = 500;
let msPrev = window.performance.now();
let fps = 60;
let fpsInterval = 1000 / fps;
function animate(){
    if(!game.active) return;
    requestAnimationFrame(animate);

    const msNow = window.performance.now(); 
    const elapsed = msNow - msPrev; 

    if(elapsed < fpsInterval) return;
    msPrev = msNow - (elapsed % fpsInterval) //3.34

    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = powerups.length - 1; i >= 0; i--){
        const powerup = powerups[i];

        if(powerup.position.x - powerup.radius >= canvas.width){
            powerups.splice(i, 1);
        }else {

            powerup.update();
        }
    }

    // spawn powerups
    if(frames % 500 === 0 && powerups.length < 3){
        powerups.push(new Powerup({
            position:{
                x:0,
                y:Math.random() * 300 + 15
            },
            velocity:{
                x:5,
                y:0
            }}));
    }

    // spawn bombs
    if(frames % 500 === 0 && bombs.length < 3){
        bombs.push(new Bomb({
            position: {
                x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
            },
            velocity: {
                x:(Math.random() - 0.5) * 6,y:(Math.random() - 0.5) * 6
            }
        }));
    }

    for(let i = bombs.length - 1; i >= 0; i--){
        const bomb = bombs[i];
        if(bomb.opacity <= 0){
            bombs.splice(i, 1);
        }else {bomb.update();}
    }

    player.update();

    for(let i = player.particles.length - 1; i >= 0; i--){
        const particle = player.particles[i];
        particle.update();

        if(particle.opacity === 0){
            player.particles[i].splice(i, 1);
        }
    }

    particles.forEach((particle, i) => {
        if(particle.position.y - particle.radius >= canvas.height){
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }

        if(particle.opacity <= 0){
            setTimeout(() => {
                particles.splice(i, 1);
            }, 0);
        }else{
            particle.update();

        }
    });

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        }else {

            invaderProjectile.update();
        }

        // projectile hits player
        if(rectangularCollision({rectangle1: invaderProjectile,rectangle2: player})){
            invaderProjectiles.splice(index, 1);
            endGame();
        }
    });


    for(let i = projectiles.length - 1; i >= 0; i--){
        const projectile = projectiles[i];
        // if bomb hit remove projectile
        for(let j = bombs.length - 1; j >= 0; j--){
            const bomb = bombs[j];
            if(Math.hypot(projectile.position.x - bomb.position.x, projectile.position.y - bomb.position.y) < projectile.radius + bomb.radius && !bomb.active){
                projectiles.splice(i, 1);
                bomb.explode();
            }
        }
        for(let j = powerups.length - 1; j >= 0; j--){
            const powerup = powerups[j];
            if(Math.hypot(projectile.position.x - powerup.position.x, projectile.position.y - powerup.position.y) < projectile.radius + powerup.radius){
                projectiles.splice(i, 1);
                powerups.splice(j, 1);
                player.powerup = 'MachineGun';
                audio.bonus.play();

                setTimeout(() => {
                    player.powerup = null;
                }, 3500);
            }
        }
        if(projectile.position.y + projectile.radius <= 0){
            projectiles.splice(i, 1);
            
        }else{
            projectile.update();
        }
    }

    grids.forEach((grid, gridIndex) => {
        grid.update();
        
        // spawning ememy projectile
        if(frames % 100 === 0 && grid.invaders.length > 0){
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }

        for(let i = grid.invaders.length - 1; i >= 0; i--){
            const invader = grid.invaders[i];
            invader.update({velocity: grid.velocity});
            // if bomb touches invader, remove invader
            for(let j = bombs.length - 1; j >= 0; j--){
                const bomb = bombs[j];
                const invaderRadius = 15;
                if(Math.hypot(invader.position.x - bomb.position.x, invader.position.y - bomb.position.y) < invaderRadius + bomb.radius && bomb.active){
                    score += 50;
                    scoreEl.innerHTML = score;
                    grid.invaders.splice(i, 1);
                    createScoreLabel({score: 50, object: invader});
                    createParticles({object: invader, fades: true})
                    
                }
            }
            // projectiles hit enemy
            projectiles.forEach((projectile, j) => {
                if(projectile.position.y - projectile.radius <= invader.position.y + invader.height && projectile.position.x + projectile.radius >= invader.position.x && projectile.position.x - projectile.radius <= invader.position.x + invader.width && projectile.position.y + projectile.radius >= invader.position.y){
                    

                    setTimeout(() => {

                        const invaderFound = grid.invaders.find(invader2 => {
                            return invader2 === invader;
                        });

                        const projectileFound = projectiles.find(projectile2 => {
                            return projectile2 === projectile;
                        })

                        // remove invader and projectile here
                        if(invaderFound && projectileFound){

                            score += 100;
                            scoreEl.innerHTML = score;


                            // dynamic score lable
                            createScoreLabel({score: 100, object: invader});

                            createParticles({object: invader, fades: true});

                            audio.explode.play();
                            grid.invaders.splice(i, 1);   
                            projectiles.splice(j, 1);  
                            
                            if(grid.invaders.length > 0){
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];
                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            }else {
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0);
                }
            });
            // remove player if invader touches it
            if(rectangularCollision({
                rectangle1: invader,
                rectangle2: player
            }) && !game.over){
                endGame();
            }
        } // end looping over grid.invaders
        
    });

    if(keys.a.pressed && player.position.x >= 0){
        player.velocity.x = -5;
        player.rotation = -.15;
    }else if(keys.d.pressed && player.position.x + player.width <= canvas.width){
        player.velocity.x = 5;
        player.rotation = .15;
    }else {
        player.velocity.x = 0;
        player.rotation = 0
    } 

    // spawning enemies
    if(frames % randomInterval === 0){
        spawnTimer = spawnTimer < 200 ? 0 : spawnTimer;
        grids.push(new Grid());
        randomInterval = Math.floor((Math.random() * 500) + spawnTimer);
        frames = 0;
        spawnTimer -= 100;
    }

    if(keys.sapce.pressed && player.powerup === 'MachineGun' && frames % 3 === 0 && !game.over){
        if(frames % 6 === 0){
            audio.shoot.play();

        }
        projectiles.push(new Projectile({
            position:{
                x:player.position.x + player.width / 2,
                y: player.position.y
            },
            velocity: {x:0,y:-10},
            color: 'yellow'
        }));

    }

    frames++;
}
// animate();
document.querySelector('#startButton').addEventListener('click', () => {
    audio.backgroundMusic.play();
    audio.start.play();
    document.querySelector('#startScreen').style.display = 'none';
    document.querySelector('#scoreContainer').style.display = 'block';
    init();
    animate();
});
document.querySelector('#restartButton').addEventListener('click', () => {
    audio.select.play();
    document.querySelector('#restartScreen').style.display = 'none';
    scoreEl.innerHTML = 0;
    init();
    animate();
});

addEventListener('keydown', ({key}) => {
    if(game.over) return;
    switch(key){
        case 'a': 
            keys.a.pressed = true;
        break;
        case 'd':
            keys.d.pressed = true;
        break;
        case ' ': 
            keys.sapce.pressed = true;

            if(player.powerup === 'MachineGun') return;
                audio.shoot.play();
                projectiles.push(new Projectile({
                    position:{
                        x:player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    velocity: {x:0,y:-10}
                }));

        break;
    }
});
addEventListener('keyup', ({key}) => {
    switch(key){
        case 'a': 
            keys.a.pressed = false;
        break;
        case 'd': 
            keys.d.pressed = false;
        break;
        case ' ': 
            keys.sapce.pressed = false;
        break;
    }
});