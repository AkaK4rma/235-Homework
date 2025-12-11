 class Ship extends PIXI.Sprite{
    constructor(texture, x = 0, y = 0){
        super(texture);
        this.anchor.set(.5, .5);
        this.scale.set(.1);
        this.x = x;
        this.y = y;
    }
}

class ShipBox extends PIXI.Graphics{
    constructor(radius, x = 0, y = 0){
        super();
        this.circle(x, y, radius);
        this.fill(0xffff00, 0);
        this.radius = radius;
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
        super();
        this.circle(x, y, radius);
        this.fill(color);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = {x: 0, y: 1 };
        this.speed = 150;
        this.IsAlive = true;
        this.red = true;
    }

    move(deltaTime = 1 / 60) {
        this.x += this.fwd.x * this.speed * deltaTime;
        this.y += this.fwd.y * this.speed * deltaTime;
    }
}

class EvilCircle extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
        super();
        this.circle(x, y, radius);
        this.fill(color);
        this.x = x;
        this.y = y;
        this.moving = false;
        this.radius = radius;
        this.fwd = {x: 0, y: 1};
        this.fwd2 = {x: 0, y: 1};
        this.speed = 150;
        this.IsAlive = true;
        this.rotation = 0;
        this.color = color;
    }

    move(deltaTime = 1 / 60) {
        this.y += this.fwd2.y * this.speed * deltaTime;
    }

    rotate(deltaTime = 1 / 60, angle) {
        this.rotation += angle * deltaTime;
        this.updateForwardVector();
    }

    updateForwardVector() {
        this.fwd.x = Math.cos(this.rotation);
        this.fwd.y = Math.sin(this.rotation);
    }
}

class Boss extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
        super();
        this.circle(x, y, radius);
        this.fill(color); 
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.IsAlive = true;
        this.hp = 200;
    }

    decreaseHp(){
        this.hp--;
    }
}

class Grid extends PIXI.Graphics {
    constructor(color = 0xffffff, x = 0, y = 0) {
        super();
        this.rect(x, y, 80, 45);
        this.fill(color);
        this.tint;
        this.x = x;
        this.y = y;
        this.IsAttacking = false;
        this.PlayerOn = false;
        this.center = {x: (this.rect.x - this.rect.width/2), y:(this.rect.y - this.rect.height/2)};
    }

    setColor(color){
        this.tint = color;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xffffff, x = 0, y = 0) {
        super();
        this.rect(-2, -3, 4, 6);
        this.fill(color);
        this.x = x;
        this.y = y;
        this.fwd = {x: 0, y: -1 };
        this.speed = 400;
        this.IsAlive = true;
        Object.seal(this);
    }

    move(deltaTime = 1 / 60) {
        this.x += this.fwd.x * this.speed * deltaTime;
        this.y += this.fwd.y * this.speed * deltaTime;
    }
}