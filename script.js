constants = {
    canvas:{
        width: window.innerWidth*3/4,
        height: window.innerHeight*3/4
    },
    numberOfRats: 100,
    numberOfBoys: 6,
    pavement: {
        startY: window.innerHeight*3/7,
        range: window.innerHeight/10
    },
    boy: {
        spriteSize: {
            width: 47,
            height: 71,
        },
        actualSize: {
            width: 47,
            height: 71,
        },
        animationSpeed: 0.2,
        startingState: 1,
        animationMod: 3,
        projectileFall: 0,
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
            x: window.innerWidth/8,
            y: window.innerHeight*3/7
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
        rageAnimationMod: 10,
        projectileFall: 0,
    },
}

let state = {
    scene: 0,
    initRats: false,
    followPiper: false,
    deadRats: false,
    enableBoySprites: 0,
    dontMove: false,
    deadBoys: false,
    playBgMusic: true,
    audio: {}
};

let isInsideCanvas = (position) => {
    /**
     * 0 - canvas size -> blank
     * canvas - canvas*2 -> castle
     * canvas*2 - canvas*3 -> houses
     * canvas*3 - canvas*4 -> cliff
     */
    return position >= 0 && position < 4*constants.canvas.width;
}

const [PIED_PIPER, RAT, BOY] = [0, 1, 2];

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
                (this.characterName == PIED_PIPER && this.x >= constants.canvas.width*0.54 && state.scene == 3)){
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
            this.x += 2*this.speed;
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
                console.log(dialogue);
                if(dialogue.name === "bitch betta have my money" && !state.deadRats){
                    return;
                }
                if(dialogue.name === "drowning boys" && !state.deadBoys) {
                    return;
                }
                if (dialogue.triggerScene == state.scene && Math.abs(this.x - dialogue.triggerPosition) < 20 && !dialogue.triggered) {
                    dialogue.trigger();
                    if(dialogue.name === "drowning boys"){
                        state.audio.playful.pause();
                    }
                    for (let direction in this.movingDirection) {
                        this.movingDirection[direction] = false;
                    }
                    state.dontMove = true;
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
    canvas.width = constants.canvas.width
    canvas.height = constants.canvas.height
    return ctx;
}

// direction 1 => left to right scene change; -1 => reverse
let updateRatOrBoyPositionForSceneChange = (rats, numberOfBoysOrRats, direction) => {
    if(direction == -1) {
        for(let i = 0; i < numberOfBoysOrRats; i++) {
            rats[i].x = constants.canvas.width - rats[i].x;
        }
    } else if (direction == 1) {
        for(let i = 0; i < numberOfBoysOrRats; i++) {
            rats[i].x = constants.piedPiper.startLocation.x - 130;
        }
    }
}


let sceneUpdate = (position, piedPiper, rats, boys) => {
    switch(state.scene) {
        case 0: {
            if (position >= constants.canvas.width && position < constants.canvas.width*4) {
                state.scene = 1;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatOrBoyPositionForSceneChange(rats, constants.numberOfRats, 1);
                if(state.enableBoySprites) {
                    updateRatOrBoyPositionForSceneChange(boys, constants.numberOfBoys, 1);
                }
            } 
            break;
        }
        case 1: {
            if (position >= constants.canvas.width && position < constants.canvas.width*4) {
                state.scene = 2;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatOrBoyPositionForSceneChange(rats, constants.numberOfRats, 1);
                if(state.enableBoySprites) {
                    updateRatOrBoyPositionForSceneChange(boys, constants.numberOfBoys, 1);
                }
            } else if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = constants.canvas.width;
                state.scene = 0;
                updateRatOrBoyPositionForSceneChange(rats, constants.numberOfRats, -1);
                if(state.enableBoySprites) {
                    updateRatOrBoyPositionForSceneChange(boys, constants.numberOfBoys, -1);
                }
            }
            break;
        }
        case 2: {
            if (position >= constants.canvas.width && position < constants.canvas.width*4) {
                state.scene = 3;
                piedPiper.x = constants.piedPiper.startLocation.x;
                updateRatOrBoyPositionForSceneChange(rats, constants.numberOfRats, 1);
                if(state.enableBoySprites) {
                    updateRatOrBoyPositionForSceneChange(boys, constants.numberOfBoys, 1);
                } 
            } else if(position <= constants.piedPiper.startLocation.x) {
                piedPiper.x = constants.canvas.width;
                state.scene = 1;
                updateRatOrBoyPositionForSceneChange(rats, constants.numberOfRats, -1);
                if(state.enableBoySprites) {
                    updateRatOrBoyPositionForSceneChange(boys, constants.numberOfBoys, -1);
                }
            }
            break;
        }
        case 3: {
            if(position <= constants.piedPiper.startLocation.x) {
                state.scene = 2;
                piedPiper.x = constants.canvas.width;
                updateRatOrBoyPositionForSceneChange(rats, constants.numberOfRats, -1);
                if(state.enableBoySprites) {
                    updateRatOrBoyPositionForSceneChange(boys, constants.numberOfBoys, -1);
                }
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
        let pos = Math.floor(rat.x/constants.canvas.width);
        let ratRange = {
            left: pos*constants.canvas.width,
            right: (pos+1)*constants.canvas.width
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
    if(state.scene == 3 && rat.x >= constants.canvas.width*0.52) {
        rat.projectileFall = 1;
        if(rat.characterName === BOY) {
            state.deadBoys = 1;
            // alert()
        }
        state.deadRats = 1;
    }
    rat.update();
}

let initAudio = () => {
    let audioSrc = ["playful","suspense1","suspense2"];
    for(let src of audioSrc){
        let audio = document.createElement('audio');
        audio.setAttribute('src', 'music/'+src+'.mp3');
        audio.addEventListener('ended', function() {
            this.play();
        }, false);
        state.audio[src] = audio;
    }
}

    
$(document).ready(async () => {
    let revealCurtain = (() => { 
        $(document).on("click", "#curtain-id", () => {
        $('#curtain-id').attr('class', 'curtain');
        $('.introduction-image').css('display', 'none');
        if(state.playBgMusic){
            state.audio.playful.play();
            state.playBgMusic = false;
        }
    })});


    let renderArrows = () => {
        switch (state.scene){
            case 0:{
                $('#leftArrow').css('display','none'); 
                $('#rightArrow').css('display','block'); 
                break;
            }
            case 1:{
                $('#leftArrow').css('display','none'); 
                $('#rightArrow').css('display','block'); 
                break;
            }
            case 2:{
                if(state.deadRats){    
                    if(state.enableBoySprites){
                        $('#leftArrow').css('display','none'); 
                        $('#rightArrow').css('display','block'); 
                    }
                    else{
                        $('#leftArrow').css('display','block'); 
                        $('#rightArrow').css('display','none'); 
                    }
                }
                else{
                    $('#leftArrow').css('display','none'); 
                    $('#rightArrow').css('display','block');
                }
                break;
            }
            case 3:{
                if(state.deadRats){
                    if(state.enableBoySprites){
                        $('#leftArrow').css('display','none'); 
                    }
                    else{
                        $('#leftArrow').css('display','block'); 
                    }
                }
                $('#rightArrow').css('display','none'); 
                break;
            }
            
        }
    }
    let animate = await (async() => {
        let ctx = initCanvas("canvas");
        let bgImage = await imageLoader("images/background.png");
        let cliffBgImage = await imageLoader("images/cliffBackground.png");
        let caveBgImage = await imageLoader("images/caveBackground.png");
        let bgImages = [bgImage, bgImage, caveBgImage, cliffBgImage];


        let castleBgImage = await imageLoader("images/castleSprite.png");
        let houseSprite = await imageLoader("images/houseSprites.png");
        let randompeople = await imageLoader("images/randomPeopleSprite.png");
        let king = await imageLoader("images/kingSprite.png");


        let dialogueBox = await imageLoader("images/dialogueBox.png")
        let piedPiperSprite = await imageLoader("images/piedPiperSprite.png");
        let piedPiperMusicSprite = await imageLoader("images/piedPiperMusicSprite.png");
        let ratSprite = await imageLoader("images/ratSprite.png");
        let rats = [];
        for(let i =0;i<constants.numberOfRats;i++){
            rats.push(new Character(
                Math.random()*constants.canvas.width,
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
                constants.canvas.width/3,
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
                constants.canvas.width/1.8,
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
                    "King: Surely, a small price to pay for salvation!",
                    "Hold the CTRL key to lure the rats",
                    "Release the CTRL key to leave the rats to themselves"
                ]
            ),
            new Dialog(
                "bitch betta have my money",
                constants.canvas.width/1.8,
                1,
                [
                    "Pied Piper: I have now wiped out every single rat in Hamlin.",
                    "Pied Piper: Now it's up to you to keep your end of the promise!",
                    "King: For the love of God! Wonders never cease! …",
                    "King: It was quite magical what you did there, wouldn't you agree?!",
                    "Pied Piper : Of course! It is said my music could lure the Lord himself!",
                    "King: Now what is to say that you didn't bring the rats yourself...",
                    "King: to pull this nasty little trick of yours?!",
                    "Pied Piper: Outrageous!",
                    "King: You will have no reward! You're henceforth banished!",
                    "Pied Piper: Oh my! Your greed will cost you dearly!",
                    "Hold the CTRL key to lure the kids",
                    "Release the CTRL key to leave the kids"

                ]
            ),
            new Dialog(
                "drowing rats",
                constants.canvas.width*0.54,
                3,
                [
                    "Pied Piper: Take that you filthy vermin!",
                    "Pied Piper: I better go collect my money now!" 
                ]
            ),
            new Dialog(
                "drowning boys",
                constants.canvas.width*0.54,
                3,
                [
                    "Narrator : When the king found out what had happened, he was enraged!",
                    "Narrator: He placed a bounty of 200 gold coins on the Pied Piper's head.", 
                    "Narrator: Yet he was never to be found!",
                ],
            ),
        ];

        
        let boys = [];
        let boySprites = [];
        for(let i=1;i<=constants.numberOfBoys;i++) {
            let boySprite = await imageLoader("images/boys/boySprites" + i.toString() + ".png");
            boySprites.push(boySprite);
            boys.push(new Character(
                Math.random()*constants.canvas.width,
                constants.pavement.startY+Math.random()*constants.pavement.range,
                boySprite,
                4+Math.random(),
                constants.rat.animationSpeed,
                1+Math.random(),
                constants.rat.animationMod,
                constants.rat.projectileFall,
                BOY, 
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
            dialogues
        );
        drawDialogue = text => {
            ctx.drawImage(dialogueBox, constants.canvas.width/8 , window.innerHeight/1.6, constants.canvas.width*3/4, 75);
            ctx.font = "1.5vw Comic Sans MS";
            ctx.fillText(text,constants.canvas.width/6 , window.innerHeight/1.6 + 50);
        }


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
                        state.dontMove = false;
                    }
                }
                if(piedPiper.dialogues.length == index) {
                    $('#curtain-ending').css('display', 'block');
                    $('#curtain-ending').attr('class', 'curtain-end');
                }
            });
        }
        changePiperSpriteAndAudio = text => {
            if(text === "play"){
                piedPiper.image = piedPiperMusicSprite;
                piedPiper.animationMod = 10;
                constants.piedPiper.actualSize.height = 69;
                constants.piedPiper.spriteSize.height = 69;
                constants.piedPiper.actualSize.width = 60.76;
                constants.piedPiper.spriteSize.width = 60.76;

                state.audio.playful.volume = 0;
                if(state.deadRats){
                    state.audio.suspense2.play();
                    
                } else {
                    state.audio.suspense1.play();
                    
                }
            }
            else if (text === "stop"){
                piedPiper.image = piedPiperSprite;
                piedPiper.animationMod = 4;
                constants.piedPiper.actualSize.height = 48;
                constants.piedPiper.spriteSize.height = 48;
                constants.piedPiper.actualSize.width = 32;
                constants.piedPiper.spriteSize.width = 32;

                state.audio.playful.volume = 1;
                state.audio.suspense2.pause();
                state.audio.suspense1.pause();
                
            }
        }

        window.addEventListener("keydown", (e) => {
            if (e.keyCode == 37) {
                piedPiper.movingDirection.left = true; 
            } else if (e.keyCode == 39) {
                piedPiper.movingDirection.right = true;
            } else if (e.keyCode == 17){
                state.followPiper = true;
                changePiperSpriteAndAudio("play");
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
                changePiperSpriteAndAudio("stop");
            } else if (e.keyCode == 32) {
                progressDialogue();
            }            
            return false;
        });

        initAudio();   
        return () => {
            ctx.clearRect(0, 0, constants.canvas.width, constants.canvas.height);
            ctx.drawImage(bgImages[sceneUpdate(piedPiper.x, piedPiper, rats, boys)], 0, 0, constants.canvas.width,constants.canvas.height);
            renderArrows();
            revealCurtain(); 
            if (state.scene==0){
                ctx.drawImage(houseSprite,0,350,350,350,constants.canvas.width/50,constants.canvas.height/2.3,100,90);
                ctx.drawImage(houseSprite,720,350,350,350,constants.canvas.width/5.5,constants.canvas.height/2.3,100,90);
                ctx.drawImage(houseSprite,0,350,350,350,constants.canvas.width/3.5,constants.canvas.height/2.3,100,90);
                ctx.drawImage(houseSprite,350,350,350,350,constants.canvas.width/2.7,constants.canvas.height/2.3,100,90);
                ctx.drawImage(houseSprite,0,0,350,350,constants.canvas.width/50,constants.canvas.height/1.4,100,90);
                ctx.drawImage(houseSprite,720,0,350,350,constants.canvas.width/7.5,constants.canvas.height/1.4,100,90);
                ctx.drawImage(houseSprite,0,350,350,350,constants.canvas.width/4,constants.canvas.height/1.38,100,90);
                ctx.drawImage(houseSprite,720,350,350,350,constants.canvas.width/2.5,constants.canvas.height/1.38,100,90);
                ctx.drawImage(houseSprite,0,0,350,350,constants.canvas.width/1.8,constants.canvas.height/1.42,100,90);
                ctx.drawImage(houseSprite,1040,0,350,350,constants.canvas.width/1.4,constants.canvas.height/1.42,100,90);
                ctx.drawImage(randompeople,200,0,350,350,constants.canvas.width/50,constants.canvas.height/1.8,230,220);
                ctx.drawImage(randompeople,100,0,350,350,constants.canvas.width/2,constants.canvas.height/1.5,230,220);
                ctx.drawImage(randompeople,150,0,350,350,constants.canvas.width/3,constants.canvas.height/1.8,230,220);
            }

            if (state.scene==1){
                ctx.drawImage(castleBgImage,constants.canvas.width/2,constants.canvas.height/3.8,200,160);
                ctx.drawImage(houseSprite,340,350,350,350,constants.canvas.width/12,constants.canvas.height/2.3,100,90);
                ctx.drawImage(houseSprite,1040,350,350,350,constants.canvas.width/4,constants.canvas.height/2.3,110,90);
                ctx.drawImage(houseSprite,0,0,350,350,constants.canvas.width/50,constants.canvas.height/1.42,100,90);
                ctx.drawImage(houseSprite,350,0,350,350,constants.canvas.width/10,constants.canvas.height/1.42,100,90);
                ctx.drawImage(houseSprite,1040,0,350,350,constants.canvas.width/4,constants.canvas.height/1.44,100,90);
                ctx.drawImage(houseSprite,0,350,350,350,constants.canvas.width/3.3,constants.canvas.height/1.4,100,90);
                ctx.drawImage(houseSprite,350,350,350,350,constants.canvas.width/2.6,constants.canvas.height/1.4,100,90);
                ctx.drawImage(houseSprite,1040,350,350,350,constants.canvas.width/1.8,constants.canvas.height/1.4,110,90);
                ctx.drawImage(houseSprite,350,0,350,350,constants.canvas.width/1.5,constants.canvas.height/1.44,100,90);
                ctx.drawImage(houseSprite,720,0,350,350,constants.canvas.width/1.35,constants.canvas.height/1.44,100,90);
                ctx.drawImage(houseSprite,1040,0,350,350,constants.canvas.width/1.23,constants.canvas.height/1.46,100,90);
                ctx.drawImage(randompeople,0,0,350,350,constants.canvas.width/4,constants.canvas.height/1.9,230,220);
                ctx.drawImage(randompeople,100,0,350,350,constants.canvas.width/7,constants.canvas.height/1.9,230,220);
                ctx.drawImage(randompeople,0,0,350,350,constants.canvas.width/1.4,constants.canvas.height/1.9,230,220);
                ctx.drawImage(king,constants.canvas.width/1.8,constants.canvas.height/1.9,50,50);
                if(state.deadRats) {
                    state.enableBoySprites = 1;
                }
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

            if(state.deadRats && state.enableBoySprites) {
                for(let i=0;i<constants.numberOfBoys;i++){
                    updateRat(boys[i], piedPiper);
                    ctx.drawImage(boySprites[i],
                        Math.floor(boys[i].animationStep) * constants.boy.spriteSize.width, // sprite offset
                        (boys[i].state -1 ) * constants.boy.spriteSize.height,
                        constants.boy.spriteSize.width,
                        constants.boy.spriteSize.height,
                        boys[i].x,
                        boys[i].y,
                        constants.boy.actualSize.width,
                        constants.boy.actualSize.height
                        );
                }
            }

            if(!state.dontMove){
                piedPiper.update();
            }

            ctx.drawImage(piedPiper.image,
                Math.floor(piedPiper.animationStep) * constants.piedPiper.spriteSize.width, // sprite offset
                (piedPiper.state -1) * constants.piedPiper.spriteSize.height,
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