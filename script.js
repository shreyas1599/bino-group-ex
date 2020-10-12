constants = {
    piedPiper: {
        startLocation: {
            x: 130,
            y: 350
        },
        spriteSize: {
            width: 32,
            height: 48
        },
        actualSize: {
            width: 32,
            height: 48
        },
        speed: 2.25,
        animationSpeed: 0.2,
        startingState: 1
    }
}

class Character {
    constructor(x, y, image, speed, animationSpeed, state) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.speed = speed
        this.animationSpeed = animationSpeed
        /**
         * State is the direction map
         * Left -> 1
         * Right -> 2
         */
        this.state = state;
        this.movingDirection = {
            left: false,
            right: false
        };
        this.animationStep = 0;
    }

    update() {
        if (this.movingDirection.right) {
            this.x += this.speed;
            this.state = 2;
            this.animationStep = (this.animationStep + this.animationSpeed) % 4;    
        } else if (this.movingDirection.left) {
            this.x -= this.speed;
            this.state = 1;
            this.animationStep = (this.animationStep + this.animationSpeed) % 4;
        }
    }
}

let imageLoader = (imagePath) => {
    return new Promise((resolve, reject) => {
        try {
            let img = new Image();
            img.src = imagePath;
            img.onload = () => {
                resolve(img);
            };
        } catch (e) {
            reject(e);
        }
    })
}

let initCanvas = (canvasId) => {
    let canvas = $("#" + canvasId).get(0);
    let ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth*3/4;
    canvas.height = window.innerHeight*3/4;
    
    return ctx;
}

$(document).ready(async () => {
    let animate = await (async() => {
        let ctx = initCanvas("canvas");
        let bgImage = await imageLoader("images/background.jpg");
        let piedPiperSprite = await imageLoader("images/piedPiperSprite.png");
        
        ctx.drawImage(bgImage, 0, 0, window.innerWidth*3/4, window.innerHeight*3/4);
        
        let piedPiper = new Character(
            constants.piedPiper.startLocation.x,
            constants.piedPiper.startLocation.y,
            piedPiperSprite,
            constants.piedPiper.speed,
            constants.piedPiper.animationSpeed,
            constants.piedPiper.startingState,
        );
        ctx.drawImage(piedPiperSprite,
            Math.floor(piedPiper.animationStep) * constants.piedPiper.spriteSize.width, // sprite offset
            piedPiper.state * constants.piedPiper.spriteSize.height,
            constants.piedPiper.spriteSize.width,
            constants.piedPiper.spriteSize.height,
            piedPiper.x,
            piedPiper.y,
            constants.piedPiper.actualSize.width,
            constants.piedPiper.actualSize.height
        );
        window.addEventListener("keydown", (e) => {
            console.log("jeywv");
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = true;
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = true;
            }
            return false;
        });

        window.addEventListener("keyup", (e) => {
            console.log("jeywv");
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = false;
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = false;
            } else if (e.keyCode == 32) {
                progressCutscene();
            }
            return false;
        });

        return () => {
            console.log("why");
            ctx.clearRect(0, 0, window.innerWidth*3/4, window.innerHeight*3/4);
            ctx.drawImage(bgImage, 0, 0, window.innerWidth*3/4, window.innerHeight*3/4);
            piedPiper.update();
            ctx.drawImage(piedPiperSprite,
                Math.floor(piedPiper.animationStep) * constants.piedPiper.spriteSize.width, // sprite offset
                piedPiper.state * constants.piedPiper.spriteSize.height,
                constants.piedPiper.spriteSize.width,
                constants.piedPiper.spriteSize.height,
                piedPiper.x,
                piedPiper.y,
                constants.piedPiper.actualSize.width,
                constants.piedPiper.actualSize.height
            );
            requestAnimationFrame(animate);
        }
    })();

    animate();
});






