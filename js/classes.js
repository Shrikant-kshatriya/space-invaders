class Player {
    constructor(){
        this.velocity = {
            x: 0,
            y: 0
        };

        this.rotation = 0;
        this.opacity = 1;

        const image = new Image();
        image.src = './img/spaceship.png'
        image.onload = () => {
            this.scale = 0.15;
            this.image = image;
            this.width = image.width * this.scale;
            this.height = image.height * this.scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height -20
            };
        }
        this.particles = [];
        this.frames = 0;

    }

    draw(){
        // c.fillStyle = 'red';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);

        c.save();
        c.globalAlpha = this.opacity;
        c.translate(player.position.x + player.width / 2 , player.position.y + player.height / 2);

        c.rotate(this.rotation);
        c.translate(-player.position.x - player.width / 2 , -player.position.y - player.height / 2);        

        
        c.drawImage(this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
            );

        c.restore();
    }

    update(){
        if(!this.image) return;
            this.draw();
            this.position.x += this.velocity.x;

        if(this.opacity !== 1) return;

        this.frames++;
        if(this.frames % 2 === 0){ 
            this.particles.push(new Particle({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity: {
                    x: (Math.random() - 0.5) * 1.5 ,
                    y: 1.4,
                },
                radius: Math.random() * 2,
                color: 'white',
                fades: true
                
            }))
        }
    }
}

class Projectile {
    constructor({position, velocity, color = 'red'}){
        this.position = position;
        this.velocity = velocity;

        this.radius = 3;
        this.color = color;
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({position, velocity, radius, color, fades}){
        this.position = position;
        this.velocity = velocity;

        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw(){
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if(this.fades){
            this.opacity -= 0.01;
        }
    }
}

class InvaderProjectile {
    constructor({position, velocity}){
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    draw(){
        c.fillStyle = "white";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({position}){
        this.velocity = {
            x: 0,
            y: 0
        };

        const image = new Image();
        image.src = './img/invader.png'
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x,
                y: position.y
            };
        }
        

    }

    draw(){       
        c.drawImage(this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
            );

    }

    update({velocity}){
        if(this.image){
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles){
        audio.enemyShoot.play();
        invaderProjectiles.push(new InvaderProjectile(
            {
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity: {
                    x: 0,
                    y: 5
                }
            }
        ))
    }
}

class Grid{
    constructor(){
        this.position = {
            x: 0,
            y: 0
        };
        this.velocity = {
            x: 3,
            y: 0
        };
        this.invaders = [];
        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);
        this.width = columns * 30;
        for (let x = 0; x < columns; x++){
            for (let y = 0; y < rows; y++){
                this.invaders.push(new Invader({
                    position: {
                        x: x * 30,
                        y: y * 30
                    }
                }));
            }
        }
    }

    update(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;

        if(this.position.x + this.width >= canvas.width || this.position.x <= 0){
            this.velocity.x = -this.velocity.x * 1.11;
            this.velocity.y = 30;
        }
    }
}

class Bomb{
    static radius = 30;
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 0;
        this.color = 'red';
        this.opacity = 1;
        this.active = false;    
        
        gsap.to(this, {
            radius: 30
        });
    }
    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.closePath();
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.position.x + this.radius + this.velocity.x >= canvas.width || this.position.x - this.radius + this.velocity.x <= 0){
            this.velocity.x = -this.velocity.x;
        }else if(this.position.y + this.radius + this.velocity.y >= canvas.height || this.position.y - this.radius + this.velocity.y <= 0){
            this.velocity.y = -this.velocity.y;
        }
    }

    explode() {
        audio.bomb.play();
        this.active = true;
        this.velocity.x = 0;
        this.velocity.y = 0;
        gsap.to(this, {
            radius: 150,
            color: 'white'
        });
        gsap.to(this, {
            delay: 0.1,
            opacity: 0,
            duration: 0.15
        });
    }
}

class Powerup {
    constructor({position, velocity}){
        this.position = position;
        this.velocity = velocity;

        this.radius = 15;
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}