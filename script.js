constants = {
    numberOfRats: 100,
    pavement: {
        startY: 240,
        range: 100
    },
    rat: {
        spriteSize: {
            width: 37,
            height: 29
        },
        actualSize: {
            width: 37,
            height: 29
        },
        animationSpeed: 0.2,
        startingState: 1,
        animationMod: 3,
        projectileFall: 0,
    },
    piedPiper: {
        startLocation: {
            x: 130,
            y: 300
        },
        spriteSize: {
            width: 32,
            height: 48
        },
        actualSize: {
            width: 32,
            height: 48
        },
        speed: 7,
        animationSpeed: 0.2,
        startingState: 2,
        animationMod: 4,
        projectileFall: 0,
    },
}

let sceneState = 0;


let isInsideCanvas = (position) => {
    /**
     * 0 - canvas size -> blank
     * canvas - canvas*2 -> castle
     * canvas*2 - canvas*3 -> houses
     * canvas*3 - canvas*4 -> sea/ cave
     */
    return position >= 0 && position < 5*window.innerWidth;
}

const [PIED_PIPER, RAT] = [0, 1];

class Character {
    constructor(x, y, image, speed, animationSpeed, state, animationMod, projectileFall, characterName) {
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
        this.animationMod = animationMod;
        this.projectileFall = projectileFall;
        this.characterName = characterName;
    }

    update() {
        if(this.projectileFall == 0) {
            if (this.movingDirection.right) {
                if(this.characterName == PIED_PIPER && this.x >= window.innerWidth*0.40 && sceneState == 3) {
                    this.x -= this.speed;
                }
                this.x += this.speed;
                if(!isInsideCanvas(this.x+constants.piedPiper.actualSize.width/2)){
                    this.x-=this.speed;
                }
                this.state = 2;
                this.animationStep = (this.animationStep + this.animationSpeed) % this.animationMod;    
            } else if (this.movingDirection.left) {
                this.x -= this.speed;
                if(!isInsideCanvas(this.x+constants.piedPiper.actualSize.width/2)){
                    this.x+=this.speed;
                }
                this.state = 1;
                this.animationStep = (this.animationStep + this.animationSpeed) % this.animationMod;
            }
        } else {
            this.x += this.speed;
            if(!isInsideCanvas(this.x+constants.piedPiper.actualSize.width/2)){
                this.x-=this.speed;
            }
            this.y = this.y + Math.sqrt(0.089*this.x);
            this.state = 2;
            this.animationStep = (this.animationStep + this.animationSpeed) % this.animationMod;   
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

// direction 1 => left to right scene change; -1 => reverse
let updateRatPositionForSceneChange = (rats, direction) => {
    if(direction == -1) {
        for(let i = 0; i < constants.numberOfRats; i++) {
            rats[i].x = window.innerWidth - rats[i].x;
        }
    } else if (direction == 1) {
        for(let i = 0; i < constants.numberOfRats; i++) {
            rats[i].x = constants.piedPiper.startLocation.x - 130;
        }
    }
}

let sceneUpdate = (position, piedPiper, rats) => {
    let windowWidth = window.innerWidth;
    // if (position <= constants.piedPiper.startLocation.x) {
    //     if(sceneState === 1) {
    //         piedPiper.x = windowWidth*3/4;
    //         sceneState = 0;
    //         updateRatPositionForSceneChange(rats, -1);
    //     }
    //     return sceneState;
    // }
    // else if(position < windowWidth*3/4) {
    //     return sceneState;
    // }
    // else if (position >= windowWidth*3/4 && position < windowWidth*5){
    //     if(sceneState == 0) {
    //         sceneState = 1;
    //         piedPiper.x = constants.piedPiper.startLocation.x;
    //         updateRatPositionForSceneChange(rats, 1);
    //     }
    //     if (sceneState === 1) {
    //         // fill dialogue
    //     }
    //     return sceneState;
    // }

    switch(sceneState) {
        case 0: {
            if (position >= windowWidth*3/4 && position < windowWidth*5) {
                sceneState = 1;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatPositionForSceneChange(rats, 1);
            } 
            break;
        }
        case 1: {
            if (position >= windowWidth*3/4 && position < windowWidth*5) {
                sceneState = 2;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatPositionForSceneChange(rats, 1);
            } else if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = windowWidth*3/4;
                sceneState = 0;
                updateRatPositionForSceneChange(rats, -1);
            }
            break;
        }
        case 2: {
            if (position >= windowWidth*3/4 && position < windowWidth*5) {
                sceneState = 3;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatPositionForSceneChange(rats, 1);
            } else if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = windowWidth*3/4;
                sceneState = 1;
                updateRatPositionForSceneChange(rats, -1);
            }
            break;
        }
        case 3: {
            if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = windowWidth*3/4;
                sceneState = 2;
                updateRatPositionForSceneChange(rats, -1);
            }
            break;
        }
        
    }
    return sceneState;

}

let followPiper = false;
let updateRat = (rat, piedPiper) => {

    if(followPiper){
        if(Math.floor(rat.x) < piedPiper.x  ){
            rat.movingDirection.right = true;
            rat.movingDirection.left = false
        }
        else if(Math.floor(rat.x) > piedPiper.x){
            rat.movingDirection.left = true;
            rat.movingDirection.right = false
        }
        else{
            rat.movingDirection.left = false;
            rat.movingDirection.right = false
        }
    }
    else{
        let pos = Math.floor(rat.x/window.innerWidth);
        let ratRange = {
            left: pos*window.innerWidth,
            right: (pos+1)*window.innerWidth
        } 
        console.log(ratRange, rat.x)
        if(Math.abs(rat.x - ratRange.left) < constants.rat.spriteSize.width)
            rat.state = 2;
        else if (Math.abs(rat.x - ratRange.right) < constants.rat.spriteSize.width ){
            rat.state = 1;
        }
        if(rat.state == 1){
            rat.movingDirection.left = true;
            rat.movingDirection.right = false;
        }
        else {
            rat.movingDirection.right = true;
            rat.movingDirection.left = false;
        }
    }

    if(sceneState == 3 && rat.x >= window.innerWidth*0.40) {
        rat.projectileFall = 1;
    }
    rat.update();
}

$(document).ready(async () => {

    $('#followPiperBtn').click(() => {
        followPiper = !followPiper;
        if(followPiper)
        $('#followPiperBtn').text("Unfollow Piper");
        else
        $('#followPiperBtn').text("Follow Piper");
    });
    
    let animate = await (async() => {
        let ctx = initCanvas("canvas");
        let bgImage = await imageLoader("images/background.png");
        let cliffBgImage = await imageLoader("images/cliffBackground.png");
        let bgImages = [bgImage, bgImage, bgImage, cliffBgImage];

        let piedPiperSprite = await imageLoader("images/piedPiperSprite.png");
        let ratSprite = await imageLoader("images/ratSprite.png");
        
        let rats = [];
        for(let i =0;i<constants.numberOfRats;i++){
            rats.push(new Character(
                Math.random()*window.innerWidth,
                constants.pavement.startY+Math.random()*constants.pavement.range,
                ratSprite,
                4+Math.random(),
                constants.rat.animationSpeed,
                1+Math.random(),
                constants.rat.animationMod,
                constants.rat.projectileFall,
                RAT,
            ));
        }
        let piedPiper = new Character(
            constants.piedPiper.startLocation.x,
            constants.piedPiper.startLocation.y,
            piedPiperSprite,
            constants.piedPiper.speed,
            constants.piedPiper.animationSpeed,
            constants.piedPiper.startingState,
            constants.piedPiper.animationMod,
            constants.piedPiper.projectileFall,
            PIED_PIPER,
        );
        window.addEventListener("keydown", (e) => {
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = true; 
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = true;
            }
            return false;
        });

        window.addEventListener("keyup", (e) => {
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = false;
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = false;
            }
            return false;
        });
        return () => {
            ctx.clearRect(0, 0, window.innerWidth*3/4, window.innerHeight*3/4);
            ctx.drawImage(bgImages[sceneUpdate(piedPiper.x, piedPiper, rats)], 0, 0, window.innerWidth*3/4, window.innerHeight*3/4);
            for(let i=0;i<constants.numberOfRats;i++){
                updateRat(rats[i], piedPiper);
                ctx.drawImage(ratSprite,
                    Math.floor(rats[i].animationStep) * constants.rat.spriteSize.width, // sprite offset
                    (rats[i].state -1 ) * constants.rat.spriteSize.height,
                    constants.rat.spriteSize.width,
                    constants.rat.spriteSize.height,
                    rats[i].x,
                    rats[i].y,
                    constants.rat.actualSize.width,
                    constants.rat.actualSize.height
                    );
                }
            piedPiper.update();
            ctx.drawImage(piedPiperSprite,
                Math.floor(piedPiper.animationStep) * constants.piedPiper.spriteSize.width, // sprite offset
                piedPiper.state * constants.piedPiper.spriteSize.height,
                constants.piedPiper.spriteSize.width,
                constants.piedPiper.spriteSize.height,
                piedPiper.x % window.innerWidth,
                piedPiper.y,
                constants.piedPiper.actualSize.width,
                constants.piedPiper.actualSize.height
            );
            requestAnimationFrame(animate);
        }
    })();

    animate();
});






