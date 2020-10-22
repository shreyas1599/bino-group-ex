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
            y: 280
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

let state = {
    scene: 0,
    initRats: false,
    followPiper: false,
    deadRats: false,
};


let isInsideCanvas = (position) => {
    /**
     * 0 - canvas size -> blank
     * canvas - canvas*2 -> castle
     * canvas*2 - canvas*3 -> houses
     * canvas*3 - canvas*4 -> cliff
     */
    return position >= 0 && position < 5*window.innerWidth;
}

const [PIED_PIPER, RAT] = [0, 1];

class Character {
    constructor(x, y, image, speed, animationSpeed, state, animationMod, projectileFall, characterName, dialogues) {
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
        this.dialogues = dialogues;
    }

    update() {
        if(this.projectileFall == 0) {
            if (this.movingDirection.right) {
                this.x += this.speed;
                if(!isInsideCanvas(this.x+constants.piedPiper.actualSize.width/2) ||
                (this.characterName == PIED_PIPER && this.x >= window.innerWidth*0.40 && state.scene == 3)){
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
        // Dialogue Triggers
        if(this.characterName == PIED_PIPER){
            this.dialogues.forEach((dialogue, index, reference) => {
                if(dialogue.name === "bitch betta have my money" && !state.deadRats){
                    return;
                }
                if (dialogue.triggerScene == state.scene && Math.abs(this.x - dialogue.triggerPosition) < 20 && !dialogue.triggered) {
                    dialogue.trigger();
                    for (let direction in this.movingDirection) {
                        this.movingDirection[direction] = false;
                    }
                }
            });
        }
    }
}

class Dialog {
    constructor(name, triggerPosition, triggerScene, dialogues) {
        this.name = name;
        this.triggerPosition = triggerPosition;
        this.triggerScene = triggerScene;
        this.dialogues = dialogues;
        this.triggered = false;
        this.triggerIndex = 0;
    }

    trigger() {
        this.triggered = true;
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
    if(state.scene === 3 || state.scene == 2){
        for(let i=0;i< constants.numberOfRats; i++){
            if(!rats[i].projectileFall)
            rats[i].y = constants.piedPiper.startLocation.y - 10 + Math.random()*30;
        }
    }
}

let sceneUpdate = (position, piedPiper, rats) => {
    let windowWidth = window.innerWidth;
    switch(state.scene) {
        case 0: {
            if (position >= windowWidth*3/4 && position < windowWidth*5) {
                state.scene = 1;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatPositionForSceneChange(rats, 1);
            } 
            break;
        }
        case 1: {
            if (position >= windowWidth*3/4 && position < windowWidth*5) {
                state.scene = 2;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatPositionForSceneChange(rats, 1);
            } else if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = windowWidth*3/4;
                state.scene = 0;
                updateRatPositionForSceneChange(rats, -1);
            }
            break;
        }
        case 2: {
            if (position >= windowWidth*3/4 && position < windowWidth*5) {
                state.scene = 3;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatPositionForSceneChange(rats, 1);
            } else if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = windowWidth*3/4;
                state.scene = 1;
                updateRatPositionForSceneChange(rats, -1);
            }
            break;
        }
        case 3: {
            if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = windowWidth*3/4;
                
                state.scene = 2;
                updateRatPositionForSceneChange(rats, -1);
            }
            break;
        }
        
    }
    return state.scene;

}

let updateRat = (rat, piedPiper) => {

    if(state.followPiper){
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

    if(state.scene == 3 && rat.x >= window.innerWidth*0.40) {
        rat.projectileFall = 1;
    }
    rat.update();
}

$(document).ready(async () => {

    $('#followPiperBtn').click(() => {
        state.followPiper = !state.followPiper;
        if(state.followPiper)
        $('#followPiperBtn').text("Unfollow Piper");
        else
        $('#followPiperBtn').text("Follow Piper");
    });
    
    let animate = await (async() => {
        let ctx = initCanvas("canvas");
        let bgImage = await imageLoader("images/background.png");
        let cliffBgImage = await imageLoader("images/cliffBackground.png");
        let caveBgImage = await imageLoader("images/caveBackground.jpg");
        let bgImages = [bgImage, bgImage, caveBgImage, cliffBgImage];


        let castleBgImage = await imageLoader("images/castleSprite.png");
        let houseSprite = await imageLoader("images/houseSprites.png");
        let randompeople = await imageLoader("images/randomPeopleSprite.png");
        let king = await imageLoader("images/kingSprite.png");


        let dialogueBox = await imageLoader("images/dialogueBox.png")
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
        let dialogues = [
            new Dialog(
                "init",
                515,
                0,
                [
                    "Villager #1: They’re in my storeroom!",
                    "Villager #2: They’re in my cupboards!",
                    "Villager #3: They’re in my baby’s cot!",
                    "Villager #1: What can we do?",
                    "Villager #2: We’ve tried everything! Cats, poisons, rat catchers...",
                    "Villager #2: NOTHING works!"
                ]
            ),
            new Dialog(
                "king",
                550,
                1,
                [
                    "King: Does anyone have a new idea?",
                    "King: There must be something we can do.",
                    "Pied Piper: I am called the Pied Piper.",
                    "Pied Piper: What will you pay me if...",
                    "Pied Piper: I get rid of every single rat in Hamlin?",
                    "King: Impossible. It can’t be done.",
                    "Pied Piper: Try me. If I’m successful...",
                    "Pied Piper: I demand a hundred gold coins!",
                    "King: Surely, a small price to pay for salvation!"
                ]
            ),
            new Dialog(
                "bitch betta have my money",
                550,
                1,
                [
                    "Pied Piper: I have now wiped out every single rat in Hamlin.",
                    "Pied Piper: Now it's up to you to keep your end of the promise!",
                    "King: For the love of God! Wonders never cease! …",
                    "King: It was quite magical what you did there, wouldn't you agree?!",
                    "Pied Piper : Well, of course! It is said my music could lure the Lord himself!",
                    "King: Now what is to say that you didn't bring the rats yourself...",
                    "King: to pull this nasty little trick of yours?!",
                    "Pied Piper: Outrageous!",
                    "King: You will have no reward! You're henceforth banished!",
                    "Pied Piper: Oh my! Your greed will cost you dearly!"
                ]
            )
        ];

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
            dialogues
        );

        drawDialogue = text => {
            ctx.drawImage(dialogueBox, 200, 400, window.innerWidth/2, 75);
            ctx.font = "18px Comic Sans MS";
            ctx.fillText(text, 220, 450);
        }

        // hideScene = () => {
        //     $("#dialogue-container").hide();
        // }

        progressDialogue = () => {
            piedPiper.dialogues.forEach((dialogue, index, reference) => {
                if (dialogue.triggered) {
                    dialogue.triggerIndex++;
                    if (dialogue.triggerIndex === dialogue.dialogues.length) {                        
                        // The dialogue is done, destroy it
                        if(dialogue.name === "init"){
                            state.initRats = true;
                        }
                        reference.splice(index, 1);
                        // hideScene();
                    }
                }
            });
        }
        window.addEventListener("keydown", (e) => {
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = true; 
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = true;
            } else if (e.keyCode == 17){
                state.followPiper = true;
            }
            
            return false;
        });

        window.addEventListener("keyup", (e) => {
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = false;
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = false;
            } else if (e.keyCode == 17) { //
                state.followPiper = false;
            } else if (e.keyCode == 32) {
                progressDialogue();
            }            
            return false;
        });
        return () => {
            ctx.clearRect(0, 0, window.innerWidth*3/4, window.innerHeight*3/4);
            ctx.drawImage(bgImages[sceneUpdate(piedPiper.x, piedPiper, rats)], 0, 0, window.innerWidth*3/4, window.innerHeight*3/4);

            if (state.scene==0){
                ctx.drawImage(houseSprite,0,   350,350,350,0,  200, 100, 90);
                ctx.drawImage(houseSprite,720, 350,350,350,160,200, 100, 90); 
                ctx.drawImage(houseSprite,0,   350,350,350,310,  200, 100, 90);
                ctx.drawImage(houseSprite,350, 350,350,350,390, 200, 100, 90);
                ctx.drawImage(houseSprite,0,   0,350,350,0,  362, 100, 90);
                ctx.drawImage(houseSprite,720, 0,350,350,150,362, 100, 90);
                ctx.drawImage(houseSprite,0,   350,350,350,285,  375, 100, 90);
                ctx.drawImage(houseSprite,720, 350,350,350,465,375, 100, 90); 
                ctx.drawImage(houseSprite,0,   0,350,350,615,  362, 100, 90);
                ctx.drawImage(houseSprite,1040,0,350,350,825,362, 100, 90);
                ctx.drawImage(randompeople,100,0,350,350,315, 245, 230, 220);
                ctx.drawImage(randompeople,200,0,350,350,15, 245, 230, 220);
                ctx.drawImage(randompeople,150,0,350,350,515, 300, 230, 220);
            }

            if (state.scene==1){
                ctx.drawImage(castleBgImage, 510, 110, 210, 160);
                ctx.drawImage(houseSprite,340, 350,350,350,80, 200, 100, 90);
                ctx.drawImage(houseSprite,1040,350,350,350,240,200, 110, 90);
                ctx.drawImage(houseSprite,0,   0,350,350,0,  392, 100, 90);
                ctx.drawImage(houseSprite,350, 0,350,350,70, 392, 100, 90);
                ctx.drawImage(houseSprite,1040,0,350,350,230,392, 100, 90);
                ctx.drawImage(houseSprite,0,   350,350,350,285,  395, 100, 90);
                ctx.drawImage(houseSprite,350, 350,350,350,375, 395, 100, 90);
                ctx.drawImage(houseSprite,1040,350,350,350,545,395, 110, 90);
                ctx.drawImage(houseSprite,350, 0,350,350,685, 382, 100, 90);
                ctx.drawImage(houseSprite,720, 0,350,350,755,382, 100, 90);
                ctx.drawImage(houseSprite,1040,0,350,350,825,382, 100, 90);
                ctx.drawImage(randompeople,0,0,350,350,215, 245, 230, 220);
                ctx.drawImage(randompeople,100,0,350,350,115, 245, 230, 220);
                ctx.drawImage(randompeople,0,0,350,350,715, 245, 230, 220);
                ctx.drawImage(king,550, 260, 50, 50);
            }

            if(state.initRats){
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

            dialogues.forEach(dialogue => {
                if (dialogue.triggered) {
                    drawDialogue(dialogue.dialogues[dialogue.triggerIndex]);
                }
            });
            requestAnimationFrame(animate);
        }
    })();

    animate();
});






