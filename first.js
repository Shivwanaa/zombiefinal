let blockDisappearing=false;
let contactStartTime = null;
let contactTimes = new Map();
let pausedZombieVelocities=[];
const maxZombies=10;
let totalZombiesKilled = 0;
let jetpackAvailable = false;
let b=false;
let vanr=false;
let vanl=false;
const gravity = 0.98;
const airResistance = 0.01;
const namePopup = document.getElementById('namePopup');
let playerName = '';
let existAldready=false;
const zombieSpriteSheetl = new Image();
zombieSpriteSheetl.src = './images/Walk1.png';
const zombieSpriteSheetr = new Image();
zombieSpriteSheetr.src = './images/Walk2.png';
let numberOfFrames=6;
function clearLocalStorage() {
  localStorage.clear();
  alert('Local storage has been cleared!');
}
const blockImage = new Image();
blockImage.src = './images/box.png'; 
const blockImageAlternate = new Image();
blockImageAlternate.src = './images/wooden-box.png'; // Replace with the path to your alternate image
function allBlocksMinesTrapsFixed() {
  return stat.blocks.every(block => block.fixed)  
        //  stat.mines.every(mine => mine.fixed) &&
        //  stat.traps.every(trap => trap.fixed);
}
function startPreparation() {
  if (!playerName) {
    playerName = document.getElementById('playerName').value;
    Password=document.getElementById('password').value;
    if (playerName.trim()) {
      let players = JSON.parse(localStorage.getItem('players')) || [];
      let existingPlayer = players.find(player => player.name === playerName);
      if (!existingPlayer) {
        players.push({ name: playerName, score: state.totalZombiesKilled,password:Password });
      } else {
        let pswd = players.find(player => player.password === Password);
        if(pswd){
        existAldready=true;
        }
        else{
          alert("wrong");
          return;
        }
      }
      localStorage.setItem('players', JSON.stringify(players));
      
      console.log(localStorage);
      namePopup.style.display = 'none';
      playScreen.style.display = 'block';
      canvas.style.display='block';
      drawPlayScreen();
    } else {
      alert('Please enter your name.');
    }
  } else {
    namePopup.style.display = 'none';
    playScreen.style.display = 'block';
    canvas.style.display='block';
    drawPlayScreen();
  }
}
if (!playerName) {
  namePopup.style.display = 'block';
} else {
  startPreparation();
}
const balls = [];
const stat = {
  replay: false,
  draggingBlock: null,
  offsetX: 0,
  offsetY: 0,
  blocks: [
    { label: "rblock", x: 100, y: 100, width: 90, height: 90, fixed: false},
    { label: "lblock",x: 200, y: 100, width: 90, height: 90, fixed: false},
    { label: "rblocka", x: 300, y: 100, width: 90, height: 90, fixed: false },
    { label: "rblockb", x: 400, y: 100, width: 90, height: 90, fixed: false },
    { label: "lblocka", x: 500, y: 100, width: 90, height: 90, fixed: false },
    { label: "lblockb", x: 600, y: 100, width: 90, height: 90, fixed: false }
  ],
  mines:[
    {label:"mine1",x:100,y:200,width:20,height:20,fixed:false},
    {label:"mine2",x:200,y:200,width:20,height:20,fixed:false}

  ],
  traps:[
    {label:"trap1",x:100,y:300,width:20,height:20,fixed:false},
    {label:"trap2",x:200,y:300,width:20,height:20,fixed:false}
  ]
};
function drawZombies(context, zombie) {
  
  const frameX = zombie.currentFrame % 3 * zombie.frameWidth; 
  const frameY = Math.floor(zombie.currentFrame / 3) * zombie.frameHeight;
  // const spriteSheet = zombie.direction === 1 ? zombie.rightSpriteSheet : zombie.leftSpriteSheet;

  context.drawImage(
    zombie.spriteSheet,      
    frameX, frameY,          
    zombie.frameWidth,       
    zombie.frameHeight,      
    zombie.x, zombie.y,      
    zombie.width, zombie.height 
  );
}
function generateLeftZombie() {
  const gap = 100;
  const lastZombie = state.zombies.left[state.zombies.left.length - 1];
  const newX = lastZombie ? lastZombie.x - lastZombie.width - gap : -20;

  const newZombie = {
    x: newX,  // Ensure gap
    y: 650,
    velocityX: 1,
    width: 100,
    height: 150,
    zbool: true,
    direction:-1,
    currentFrame: 0, 
    frameCount: 6, 
    frameWidth: 242,
    frameHeight: 424,
    spriteSheet: zombieSpriteSheetl 
  };
  state.zombies.left.push(newZombie);
}
function generateRightZombie() {
  const gap = 100;
  const lastZombie = state.zombies.right[state.zombies.right.length - 1];
  const newX =  lastZombie ? lastZombie.x + lastZombie.width + gap: 1400;
  const newZombie = {
    x: newX,  
    y: 650,
    velocityX: -1,
    width: 100,
    height: 150,
    zbool: true,
    direction:1,
    climbed:false,
    currentFrame: 0, 
    frameCount: 6, 
    frameWidth: 242,
    frameHeight: 424,
    spriteSheet: zombieSpriteSheetr, 
  };
  
  state.zombies.right.push(newZombie);
}
let lastUpdateTime = 0; // Store the last time the image was updated
const frameInterval = 100; // Time between frame changes in milliseconds (100ms = 10 frames per second)

// Function to update the zombie image
function updateZombieImage(timestamp) {
  if (!lastUpdateTime) lastUpdateTime = timestamp;
  
  const elapsed = timestamp - lastUpdateTime;
  
  if (elapsed >= frameInterval) {
    lastUpdateTime = timestamp; // Update the lastUpdateTime
    
    // Update the current frame
    state.zombies.left.forEach(zombie => {
      zombie.currentFrame = (zombie.currentFrame + 1) % numberOfFrames; // Increment frame and loop around
    });
    
    state.zombies.right.forEach(zombie => {
      zombie.currentFrame = (zombie.currentFrame + 1) % numberOfFrames; // Increment frame and loop around
    });
  }
}
function generateClimberZombieLeft() {
  
  const gap = 100; 
  const lastClimber = state.climbers.left[state.climbers.left.length - 1];
  const newX = lastClimber ? lastClimber.x - lastClimber.width - gap : 0;

  const newClimberZombie = {
    x: newX,      
    y: 650,       
    velocityX: 2,
    velocityY:1, 
    width: 20,    
    height: 90,   
    zbool: true, 
    direction: -1 ,
    climbed:false,
  };

  state.climbers.left.push(newClimberZombie); 
}
function generateClimberZombieRight() {
 

  const gap = 100; 
  const lastClimber = state.climbers.right[state.climbers.right.length - 1];
  const newX = lastClimber ? lastClimber.x + lastClimber.width + gap : 1300;

  const newClimberZombie = {
    x: newX,      
    y: 650,        
    velocityX: -2, 
    velocityY:-1,
    width: 20,    
    height: 90,    
    zbool: true,   
    direction: 1   
  };

  state.climbers.right.push(newClimberZombie); 
}
function generateBalls() {
  const randomX = Math.floor(Math.random() * canvas.width);
    const ball = {

      x: randomX,       
      y: 40,        
      velocityY:1,
      radius:10,
      bbool: true,

    };
  
    state.balls.push(ball); 
  }
function drawPlayScreen() {
  playScreenCtx.clearRect(0, 0, playScreenCanvas.width, playScreenCanvas.height);

  playScreenCtx.fillStyle = "white";
  playScreenCtx.font = "24px Arial";
  playScreenCtx.fillText("Inventory", playScreenCanvas.width / 2 - 50, 50);

  // Draw blocks in inventory
  stat.blocks.forEach(block => {
    drawBlock(playScreenCtx, block.x, block.y, block.label, block.fixed); 
  });
  stat.mines.forEach(mine => {
    drawBlock(playScreenCtx, mine.x, mine.y, mine.label, mine.fixed); 
  });
  stat.traps.forEach(mine => {
    drawBlock(playScreenCtx, mine.x, mine.y, mine.label, mine.fixed); 
  });

  // Draw Play button
  playScreenCtx.fillStyle = "#007BFF";
  playScreenCtx.fillRect(playScreenCanvas.width / 2 - 100, playScreenCanvas.height / 2, 200, 50);
  playScreenCtx.fillStyle = "white";
  playScreenCtx.font = "24px Arial";
  playScreenCtx.fillText("Play", playScreenCanvas.width / 2 - 30, playScreenCanvas.height / 2 + 30);
}
function drawBlock(ctx, x, y, label, fixed) {
  ctx.fillStyle = fixed ? "#888" : "#555"; // Different color for fixed blocks
  ctx.fillRect(x, y, 90, 90);
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(label, x + 20, y + 45);
}
function handlePlayScreenClick(event) {
  const rect = playScreenCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (
    mouseX > playScreenCanvas.width / 2 - 100 &&
    mouseX < playScreenCanvas.width / 2 + 100 &&
    mouseY > playScreenCanvas.height / 2 &&
    mouseY < playScreenCanvas.height / 2 + 50&&
    allBlocksMinesTrapsFixed()
  ) {
    // if(allBlocksMinesTrapsFixed){

    playScreen.style.display = 'none'; // Hide the play screen
    canvas.style.display = 'block';
    stat.blocks.forEach(block => {
      state.blocks[block.label].x = block.x;
      state.blocks[block.label].y = block.y;
    }); // Show the game canvas
    startGameLoop(); // Start the game loop
  
}
   else {
    handleBlockClick(mouseX, mouseY); // Handle block click if not Play button
  
}
}
// function handleBlockClick(mouseX, mouseY) {
//   // Check if clicked on any block in inventory
//   stat.blocks.forEach(block => {
//     if (
//       mouseX > block.x &&
//       mouseX < block.x + block.width &&
//       mouseY <650 &&  // Adjusted y position based on drawBlock call
//       mouseY < 650 + block.height
//     ) {
//       // Set the block as dragging
//       stat.draggingBlock = block;
//       stat.offsetX = mouseX - block.x;
//       stat.offsetY = mouseY - block.y; // Adjusted y position based on drawBlock call
//       playScreenCanvas.addEventListener('mousemove', handleMouseMove);
//       playScreenCanvas.addEventListener('mouseup', handleMouseUp);
//     }
//   });
//   stat.mines.forEach(block => {
//     if (
//       mouseX > block.x &&
//       mouseX < block.x + block.width &&
//       mouseY <650 &&  // Adjusted y position based on drawBlock call
//       mouseY < 650 + block.height
//     ) {
//       // Set the block as dragging
//       stat.draggingBlock = block;
//       stat.offsetX = mouseX - block.x;
//       stat.offsetY = mouseY - block.y; // Adjusted y position based on drawBlock call
//       playScreenCanvas.addEventListener('mousemove', handleMouseMove);
//       playScreenCanvas.addEventListener('mouseup', handleMouseUp);
//     }
//   });
//   stat.traps.forEach(block => {
//     if (
//       mouseX > block.x &&
//       mouseX < block.x + block.width &&
//       mouseY <650 &&  // Adjusted y position based on drawBlock call
//       mouseY < 650 + block.height
//     ) {
//       // Set the block as dragging
//       stat.draggingBlock = block;
//       stat.offsetX = mouseX - block.x;
//       stat.offsetY = mouseY - block.y; // Adjusted y position based on drawBlock call
//       playScreenCanvas.addEventListener('mousemove', handleMouseMove);
//       playScreenCanvas.addEventListener('mouseup', handleMouseUp);
//     }
//   });
// }
function handleMouseMove(event) {
  if (stat.draggingBlock) {
    const rect = playScreenCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    stat.draggingBlock.x = mouseX - stat.offsetX;

    // Limits for blocks starting with "l"
    if (stat.draggingBlock.label.startsWith('l')) {
      const minX = 60;
      const maxX = 600;
      if (stat.draggingBlock.x < minX) {
        stat.draggingBlock.x = minX;
      } else if (stat.draggingBlock.x > maxX) {
        stat.draggingBlock.x = maxX;
      }
    }

    // Limits for blocks starting with "r"
    if (stat.draggingBlock.label.startsWith('r')) {
      const minX = 800;
      const maxX = 1300;
      if (stat.draggingBlock.x < minX) {
        stat.draggingBlock.x = minX;
      } else if (stat.draggingBlock.x > maxX) {
        stat.draggingBlock.x = maxX;
      }
    }

    // Specific constraints for "lblockb"
    if (stat.draggingBlock.label === 'lblockb') {
      const lblocka = stat.blocks.find(block => block.label === 'lblocka');
      const minX = lblocka.x;
      const maxX = lblocka.x + lblocka.width;
      if (stat.draggingBlock.x < minX) {
        stat.draggingBlock.x = minX;
      } else if (stat.draggingBlock.x > maxX) {
        stat.draggingBlock.x = maxX;
      }
    }

    // Specific constraints for "rblockb"
    if (stat.draggingBlock.label === 'rblockb') {
      const rblocka = stat.blocks.find(block => block.label === 'rblocka');
      const minX = rblocka.x - 90;
      const maxX = rblocka.x;
      if (stat.draggingBlock.x < minX) {
        stat.draggingBlock.x = minX;
      } else if (stat.draggingBlock.x > maxX) {
        stat.draggingBlock.x = maxX;
      }
    }
// Set y position based on block type
if (['rblock', 'lblock', 'rblocka', 'lblocka'].includes(stat.draggingBlock.label)) {
  stat.draggingBlock.y = 650;
} else if (['rblockb', 'lblockb'].includes(stat.draggingBlock.label)) {
  stat.draggingBlock.y = 560;
}

drawPlayScreen(); // Redraw play screen with updated block positions
}
}
function handleBlockClick(mouseX, mouseY) {
  // Check if clicked on any block in inventory
  stat.blocks.forEach(block => {
    if (!block.fixed) {  // Only allow dragging if block is not fixed
      let blockY = 100; // Default y position
      if (['rblock', 'lblock', 'rblocka', 'lblocka'].includes(block.label) && block.y > 100) {
        blockY = 650;
      } else if (['rblockb', 'lblockb'].includes(block.label) && block.y > 100) {
        blockY = 560;
      }
      if (
        mouseX > block.x &&
        mouseX < block.x + block.width &&
        mouseY > blockY &&
        mouseY < blockY + block.height
      ) {
        // Set the block as dragging
        stat.draggingBlock = block;
        block.fixed=true
        stat.offsetX = mouseX - block.x;
        stat.offsetY = mouseY - blockY; // Adjusted y position based on blockY
        playScreenCanvas.addEventListener('mousemove', handleMouseMove);
        playScreenCanvas.addEventListener('mouseup', handleMouseUp);
      }
    }
  });
  stat.mines.forEach(mine => {
    if (!mine.fixed) {  // Only allow dragging if block is not fixed
      let mineY = 200; // Default y position
      if (['mine1', 'mine2'].includes(mine.label) && mine.y > 100) {
        mineY = 650;
      } 
      if (
        mouseX > mine.x &&
        mouseX < mine.x + mine.width &&
        mouseY > mineY &&
        mouseY < mineY + mine.height
      ) {
        // Set the block as dragging
        stat.draggingBlock = mine;
        stat.offsetX = mouseX - mine.x;
        stat.offsetY = mouseY - mineY; // Adjusted y position based on blockY
        playScreenCanvas.addEventListener('mousemove', handleMouseMove);
        playScreenCanvas.addEventListener('mouseup', handleMouseUp);
      }
    }
  });
}
function handleMouseUp() {
  stat.draggingBlock = null;
  playScreenCanvas.removeEventListener('mousemove', handleMouseMove);
  playScreenCanvas.removeEventListener('mouseup', handleMouseUp);
}
document.addEventListener('keydown', function(event) {
  if (event.code === 'Space' && stat.draggingBlock) {
    // stat.draggingBlock=null;
    stat.draggingBlock.fixed = true; // Toggle fixed state of dragging block
    drawPlayScreen(); // Redraw play screen to reflect fixed block
  }
});
const playScreen = document.getElementById('playScreen');
const playScreenCanvas = document.getElementById('playScreenCanvas');
const playScreenCtx = playScreenCanvas.getContext('2d');
playScreenCanvas.width = 1400;
playScreenCanvas.height = 750;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1500;
canvas.height = 830;
var lives = 10;
const bkGround = new Image();
bkGround.src = './images/Back.png';
bkGround.onload = function() {
  console.log('Image loaded successfully');
  ctx.drawImage(bkGround, 0, 0, canvas.width, canvas.height);
  console.log(state.replay);
  if(!state.paused){

    // drawPlayScreen();
    playScreen.addEventListener('click', handlePlayScreenClick);
  }
  else{
    canvas.style.display = 'block';
     startGameLoop();
  }
  
};

let state = {
  replay:false,
  blocks: {
    rblock: {
      x: 0,
      y: 0,
      width: 90,
      direction: 1,
      blockpresent:true,
    },
    lblock: {
      x: 0,
      y: 0,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:false,
    },
    lblocka:{
      x:0,
      y:0,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:true,
      climbedA:false,


    },
    lblockb:{
      x:0,
      y:0,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:true,
      climbedB:false,


    },
    rblocka:{
      x:0,
      y:0,
      width: 90,
      direction: 1,
      blockpresent:true,
      unbreakable:true,
      climbedA:false,
    },
    rblockb:{
      x:0,
      y:0,
      width: 90,
      direction: 1,
      blockpresent:true,
      unbreakable:true,
      climbedB:false,
    }
  },
  box: {
    x: canvas.width / 2 - 50,
    y: canvas.height - 300,
    initialY: canvas.height - 300,
    velocityY: 0,
    jumping: false
  },
  balls:[],
  zombies: {
    left: [],
    right: [],
    // climbers: {
    //   left: null,
    //   right: null
    // },
    // immunity:{
    //   left:null,
    //   right:null,
    // }
  },
  climbers:{
    left:[],
    right:[]
  },
  weapons:{
  piston: {
    x: 0,
    y: 0,
    rotation: 0,
    recoil: 0,          // Recoil amount
    recoilRecovery: 4 ,
    originalX: 0,       // Original position to return to after recoil
    originalY: 0,
    use:false,// Recoil recovery speed
  },
  straight:{
    x: 0,
    y: 0,
    rotation: 0,
    recoil: 0,          // Recoil amount
    recoilRecovery: 4 ,
    originalX: 0,       // Original position to return to after recoil
    originalY: 0,
    use:false,

  },
  bomb:{
    x: 0,
    y: 0,
    radius: 10, // Adjusted for bomb size
    velocityX: 0,
    velocityY: 0,
    gravity: 0,
    active: false,
    use:false,
    balls:[],
    recoil: 0,
    recoilRecovery: 4,
    originalX: 0,
    originalY: 0
  },

  },
  mouse: {
    x: 0,
    y: 0,
  },
  rotating: false,
  playerMoving: {
    left: false,
    right: false,
  },
  bullet: {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    active: false,
  },
  blockbullet: {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    active: false,
  },
  sblockbullet: {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    active: false,
  },
  camera : {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    followRangeX: canvas.width / 4, // Horizontal range within which the camera follows the player
    followRangeY: canvas.height / 4, // Vertical range within which the camera follows the player
  },
  straightBullet: { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 },
  gravity: 0.5,
  totalZombiesKilled:0,
  paused:false,
  lblockbBullet : { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 },
  rblockbBullet : { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 },
  worldWidth:100,
  worldHeight:100,

};
function generateZombies() {
  for (let i = 0; i < 5; i++) {
    generateLeftZombie();
    generateRightZombie();
  }
  for (let i = 0; i < 2; i++) {
   generateClimberZombieLeft();
    generateClimberZombieRight();
  }
}
function generate(){
  for(let i=0;i<1;i++){
  setInterval(generateBalls, 15000);
  }
}
function allZombiesDead() {
  return state.zombies.left.every(zombie => !zombie.zbool) && state.zombies.right.every(zombie => !zombie.zbool);
}
function manageZombieGeneration() {
  // setInterval(generateBalls, 5000);
  if(allZombiesDead()){
    state.zombies.left=[];
    state.zombies.right=[];
    blockDisappearing=true;


    // state.climber.left = false;
    // state.climber.right = false;
    // state.zombies.climbers.left=false;
    // state.zombies.climbers.right=false;
    // state.zombies.immunity.right=false;
    // state.zombies.immunity.left=false;

    generateZombies();
  }  
}
generateZombies();
// generate();
function startGameLoop() {
  playScreen.style.display = 'none';
  requestAnimationFrame(gameLoop);
}
function draw({ ctx, state }) {
  // updateCamera(state);
  // const cameraOffsetX = state.camera.x;
  // const cameraOffsetY = state.camera.y;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bkGround,0,0, canvas.width, canvas.height);

  

  
  ctx.fillStyle = "blue";
  ctx.fillRect(state.box.x, state.box.y, 70, 200);
  // updateZombieImage(timestamp); 

  // drawZombies(ctx, state);
  

  
  // Draw the zombies
  state.climbers.left.forEach(climber => {
    ctx.fillStyle = 'brown';
    ctx.fillRect(climber.x, climber.y, climber.width, climber.height);
  });

  // Draw right climbers
  state.climbers.right.forEach(climber => {
    ctx.fillStyle = 'brown';
    ctx.fillRect(climber.x, climber.y, climber.width, climber.height);
  });

  state.zombies.left.forEach(zombie => {
    if (zombie.zbool) {
      drawZombies(ctx,zombie);
      
      // ctx.fillStyle = "green";
      // ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
      // }
    }
  });
  state.zombies.right.forEach(zombie => {
    if (zombie.zbool) {
      drawZombies(ctx,zombie);
      // ctx.fillStyle = "green";
      // ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
    }
  });
  state.balls.forEach(ball => {
    if (ball.bbool) { 
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); 
      ctx.fillStyle = 'yellow'; 
      ctx.fill();
      ctx.closePath();
    }  
  });
  //  drawBalls();
  weapons();
drawPauseButton();

  
ctx.drawImage(blockImageAlternate, state.blocks.lblock.x, state.blocks.lblock.y, state.blocks.lblock.width, 90);
ctx.drawImage(blockImageAlternate, state.blocks.rblock.x, state.blocks.rblock.y, state.blocks.rblock.width, 90)

  // the pistons (brown boxes)
  // ctx.fillStyle = "rgb(200 55 0)";
  // ctx.fillRect(state.blocks.lblock.x, state.blocks.lblock.y, state.blocks.lblock.width, 90);
  // ctx.fillRect(state.blocks.rblock.x, state.blocks.rblock.y, state.blocks.rblock.width, 90);
  if(state.blocks.lblocka.blockpresent){
    ctx.drawImage(blockImage, state.blocks.lblocka.x, state.blocks.lblocka.y, state.blocks.lblocka.width, 90);
  // ctx.fillStyle = "rgb(180 40 25)";
  // ctx.fillRect(state.blocks.lblocka.x, state.blocks.lblocka.y, state.blocks.lblocka.width, 90);
  }
  if(state.blocks.lblockb.blockpresent){
    ctx.drawImage(blockImage, state.blocks.lblockb.x, state.blocks.lblockb.y, state.blocks.lblockb.width, 90)
  // ctx.fillStyle = "rgb(180 40 25)";
  // ctx.fillRect(state.blocks.lblockb.x, state.blocks.lblockb.y, state.blocks.lblockb.width, 90);
  
  }
  
 if(state.blocks.rblocka.blockpresent){
  ctx.drawImage(blockImage, state.blocks.rblocka.x, state.blocks.rblocka.y, state.blocks.rblocka.width, 90)
  // ctx.fillStyle = "rgb(180 40 25)";
  // ctx.fillRect(state.blocks.rblocka.x, state.blocks.rblocka.y, state.blocks.rblocka.width, 90);
 }
 if(state.blocks.rblockb.blockpresent){
  ctx.drawImage(blockImage, state.blocks.rblockb.x, state.blocks.rblockb.y, state.blocks.rblockb.width, 90)
  // ctx.fillStyle = "rgb(180 40 25)";
  // ctx.fillRect(state.blocks.rblockb.x, state.blocks.rblockb.y, state.blocks.rblockb.width, 90);
 }

  ctx.save();

  
  if(state.weapons.piston.use){
              ctx.save();
              ctx.translate(state.weapons.piston.x, state.weapons.piston.y);
              ctx.rotate(state.weapons.piston.rotation);
              ctx.fillStyle = "rgb(0, 255, 0)";
              ctx.fillRect(-50, -10, 100, 20);
              ctx.restore();
}
else if(state.weapons.bomb.use){
    ctx.save();
    ctx.translate(state.weapons.bomb.x, state.weapons.bomb.y);
    ctx.rotate(state.weapons.bomb.rotation);
    ctx.fillStyle = "black";
    ctx.fillRect(-50, -10, 100, 20); 
    ctx.restore();

    state.weapons.bomb.balls.forEach(ball => {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 10, 0, Math.PI*2);
        ctx.fill();
    });



}
else if(state.weapons.straight.use){
  ctx.save();
  ctx.translate(state.weapons.straight.x, state.weapons.straight.y);
  ctx.rotate(state.weapons.straight.rotation);
  ctx.fillStyle = 'yellow'
  ctx.fillRect(-50, -10, 100, 20);
  ctx.restore();

}

if(state.weapons.piston.use){
  if (state.bullet.active) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(state.bullet.x, state.bullet.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}

if(state.weapons.straight.use){
  if (state.straightBullet.active) {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(state.straightBullet.x, state.straightBullet.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}
if(state.blockbullet.active){
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(state.blockbullet.x, state.blockbullet.y, 10, 0, 2 * Math.PI);
  ctx.fill();

}
if (state.sblockbullet.active) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(state.sblockbullet.x, state.sblockbullet.y, 10, 0, Math.PI * 2);
  ctx.fill();
}
}
function updateZombieFrames(state) {
  state.zombies.left.forEach(zombie => {
    zombie.currentFrame = (zombie.currentFrame + 1) % (numberOfFrames); // Increment frame and loop around
  });
  
  state.zombies.right.forEach(zombie => {
    zombie.currentFrame = (zombie.currentFrame + 1) % (numberOfFrames); // Increment frame and loop around
  });
}
function updateWeaponPosition(weapon) {
  weapon.x = state.box.x + 55;
  weapon.y = state.box.y + 50;
}
function updateWeaponRotation(weapon) {
  if (state.rotating) {
      const deltaX = state.mouse.x - weapon.x;
      const deltaY = state.mouse.y - weapon.y;
      weapon.rotation = Math.atan2(deltaY, deltaX);
  }
}
function createBall() {
  const ball = {
    x: Math.random() * canvas.width,
    y: 0,
    radius: 10,
    velocityX: (Math.random() - 0.5) * 2,
    velocityY: Math.random() * 5
  };
  balls.push(ball);
}
function updateBalls() {
  balls.forEach(ball => {
    ball.velocityY += gravity;
    ball.velocityY *= 1 - airResistance;
    
    ball.y += ball.velocityY;
    ball.x += ball.velocityX;

    
    if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.velocityY *= -0.7; 
    }

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.velocityX *= -1; 
    }
  });
}
function drawBalls() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
  });
}
function update({ progress }) {
  manageZombieGeneration();
  const speed = progress * 0.1;
  updatePlayerPosition(speed);
  if(state.weapons.piston.use){
    updatePistonPosition(state.weapons.piston);
    updateWeaponRotation(state.weapons.piston);
    updatePistonRotation(state.weapons.piston);
    updateBulletPosition(speed);
    updateWeaponRecoil(state.weapons.piston);
  }
  state.balls.forEach(ball => {
    if (ball.bbool) {
      // lives=10;
      ball.y += ball.velocityY; 
      if (ball.y > canvas.height) {
        ball.bbool = false;
        
      }
    }
    
    else if(!ball.bbool){
      state.balls = state.balls.filter(ball => ball.bbool);
    }
    if (isColliding(state.box, ball)) {
      console.log("yes life");

      let a=lives+2; 
      if(a>10){
        lives=10;
      }

      ball.bbool = false; // Deactivate ball on collision
    }
  });
  if(state.weapons.straight.use){
    updatePistonPosition(state.weapons.straight);
    updateWeaponRotation(state.weapons.straight);
    updateStraight();
    updateWeaponRecoil(state.weapons.straight)
  }
  if(state.weapons.bomb.use){
    updatePistonPosition(state.weapons.bomb);
  updateWeaponRotation(state.weapons.bomb);
  updateBombs();
  updateWeaponRecoil(state.weapons.bomb);
  }
  if (state.blockbullet.active) {
    state.blockbullet.x += state.blockbullet.velocityX;
    state.blockbullet.y += state.blockbullet.velocityY;

    // Check for bullet leaving the canvas
    if (state.blockbullet.x < 0 || state.blockbullet.x > canvas.width) {
      state.blockbullet.active = false; // Deactivate the bullet
    }
  }

  if (state.sblockbullet.active) {
    state.sblockbullet.x += state.sblockbullet.velocityX;
    state.sblockbullet.y += state.sblockbullet.velocityY;

    // Check for bullet leaving the canvas
    if (state.sblockbullet.x < 0 || state.sblockbullet.x > canvas.width) {
      state.sblockbullet.active = false; // Deactivate the bullet
    }
  }

  forClimbers();

  let prevZombieLeft = null;
  state.zombies.left.forEach(zombie => {
    if (zombie.zbool && !state.paused) {
      zombie.x += zombie.velocityX;
      if (prevZombieLeft && (zombie.x + zombie.width >= prevZombieLeft.x - 5) && !(zombie.isClimber)) {
        zombie.velocityX = 0;
      } else if (prevZombieLeft && prevZombieLeft.velocityX === 0.5) {
       
        zombie.velocityX = 0.5;
      } else {
        zombie.velocityX = 1;
      }
      prevZombieLeft = zombie;
      
    }
  });
  let prevZombieRight = null;
  state.zombies.right.forEach(zombie => {
    
    if (zombie.zbool && !state.paused) {
      zombie.x += zombie.velocityX;
      // console.log(climberInFront);
      if (prevZombieRight && (zombie.x <= prevZombieRight.x + prevZombieRight.width + 5) && !(zombie.isClimber)) {
        zombie.velocityX = 0;
      } 
      
      else if (prevZombieRight && prevZombieRight.velocityX === -0.5) {
       
        zombie.velocityX = -0.5;
      } 
      else {
        zombie.velocityX = -1;
      }
      prevZombieRight = zombie;
    }
  });

  state.zombies.left.concat(state.zombies.right).forEach((zombie, index) => {
    if (zombie.direction === 1 && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
      if (zombie === state.zombies.right[0]) {
        zombie.velocityX = 0;
        zombie.x = state.box.x + 70;
        state.zombies.right.forEach((z, index) => {
          if (index !== 0) {
            const previousZombie = state.zombies.right[index - 1];
            const distance = z.x - (previousZombie.x + previousZombie.width);
            console.log(`Distance between zombie ${index - 1} and zombie ${index}: ${distance}`);
            if ( distance <= 5) {
              z.x = previousZombie.x + previousZombie.width + 5;
            }
          }
        });
        
      }
      handleHitZombies(state.bullet);
      handleHitZombies(state.weapons.bomb);
      if (!jetpackAvailable) {
        livess(zombie);
      }
    }
    //wrong little bit
    if (zombie.direction === -1 && (zombie.x+zombie.width > state.box.x && zombie.x  < state.box.x)) {
      if (zombie === state.zombies.left[0]) {
        zombie.velocityX = 0;
        zombie.x = state.box.x - zombie.width;
        state.zombies.left.forEach((z, index) => {
          if (index !== 0) {
            const previousZombie = state.zombies.left[index - 1];
            const distance = (previousZombie.x) - (z.x + z.width);
            console.log(`Distance between zombie ${index - 1} and zombie ${index}: ${distance}`);
            if (distance <= 5) {
              z.x = previousZombie.x - z.width - 5;
            }
          }
        });
      }
      handleHitZombies(state.bullet);
      handleHitZombies(state.weapons.bomb);
      if (!jetpackAvailable) {
        livess(zombie);
      }
    }
    
    
    if (index < state.zombies.left.length) {
      if (state.blocks.lblocka.x <= zombie.x + zombie.width && state.blocks.lblocka.blockpresent) {
        zombie.velocityX = 0;
        // if (index === 0) {
        //   zombie.x = state.blocks.lblocka.x - zombie.width;
        // }
      }
    }

    if (index >= state.zombies.left.length && state.blocks.rblocka.blockpresent) {
      if (state.blocks.rblocka.x + 90 >= zombie.x) {
        zombie.velocityX = 0;
      }
    }


    if ((zombie === state.zombies.left[0] && state.blocks.lblock.blockpresent && zombie.zbool && zombie.x + zombie.width === state.blocks.lblock.x) ||
      (zombie === state.zombies.right[0] && state.blocks.rblock.blockpresent && zombie.zbool && zombie.x === state.blocks.rblock.x + state.blocks.rblock.width)) {
      
    zombie.velocityX = 0;

    if (!blockDisappearing && (zombie.x === state.blocks.rblock.x + state.blocks.rblock.width )&& state.blocks.rblock.blockpresent && !state.paused) {
     
    // zombie.velocityX = 0;
      let intervalId = setInterval(() => {
        console.log("shivu");
        vanish(state.blocks.rblock, intervalId, zombie);
      }, 400);
      if ((zombie.direction === 1) && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
        zombie.velocityX = 0;
        zombie.x = state.box.x + 70;
        handleHitZombies(state.bullet);
      handleHitZombies(state.weapons.bomb);
        if (!jetpackAvailable && !state.paused) {
          livess(zombie);
        }
      }
    }
    // zombie.velocityX = 0; 

    if (!blockDisappearing && (zombie.x + zombie.width === state.blocks.lblock.x) && state.blocks.lblock.blockpresent && !state.paused) {
      // zombie.velocityX = 0; 
      console.log("shivu");

      let intervalId = setInterval(() => {
        vanish(state.blocks.lblock, intervalId, zombie);
      }, 400);
    // if (!blockDisappearing && 
    //   (zombie.x + zombie.width > state.blocks.rblock.x && 
    //   zombie.x < state.blocks.rblock.x + state.blocks.rblock.width) &&
    //   state.blocks.rblock.blockpresent && !state.paused) {
      if ((zombie.direction === -1) && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {

        zombie.velocityX = 0;
        zombie.x = state.box.x - zombie.width;
        // handleHitZombies();
        handleHitZombies(state.bullet);
        handleHitZombies(state.weapons.bomb);
        if (!jetpackAvailable && !state.paused) {
          livess(zombie);
        }
      }
    }

  }

  });


 state.climbers.right.concat(state.climbers.left).forEach((z,i)=>{
    
  if(z.direction===1){
      if (z.direction === 1) {
        if (z.x <= state.blocks.rblocka.x + state.blocks.rblocka.width+20 && state.blocks.rblocka.blockpresent) {
          z.velocityX = 0;
          if (!z.climbedA) {
            climberzombie(z, 90);
            z.climbedA = true;
            if (z.climbedA) {
              z.velocityX = -1;
              z.x += z.velocityX;
              console.log("Right climber climbed block A and moving left");
            }
          }
        }
        // handleHitZombies(state.bullet);
      }
        if (z.direction===1&&z.climbedA && z.x <= state.blocks.rblockb.x + state.blocks.rblockb.width+20&& state.blocks.rblockb.blockpresent) {
          setTimeout(() => {
            vanisher(state.blocks.rblocka, 1);
          }, 3000); 
          z.velocityX = 0;
          if (!z.climbedB) {
            climberzombie(z, 180);
            z.climbedB = true;
            z.velocityX = -1;
            z.x += z.velocityX;
            console.log("Right climber climbed block B and moving left");
          }
          // handleHitZombies(state.bullet);
        }
        if (z.climbedB && z.x <= state.blocks.rblockb.x - z.width&& z.direction===1) {
          
          z.y = 650;
          
          setTimeout(() => {
            vanisher(state.blocks.rblockb, 1);
          }, 3000); 
          // handleHitZombies(state.bullet);
    
          console.log("Right climber finishe");
            if(z.x<=state.box.x+state.box.width){
              z.velocityX=0;
              z.x=state.box.x+state.box.width;

            }

      }
      if(z.x<=state.box.x+state.box.width){
        z.velocityX=0;
        z.x=state.box.x+state.box.width;

      }
    }
      
    if(z.direction===-1){
    if(z.direction===-1 &&z.x+z.width>=state.blocks.lblocka.x && state.blocks.lblocka.blockpresent){
      z.velocityX=0;
     
      
      if(!z.climbedA){
        // z.x=state.blocks.lblocka.x-z.width;

        climberzombie(z,90);
        // if(z.climbed){
          z.climbedA=true;
          if(z.climbedA){
            z.velocityX=1;
            z.x+=z.velocityX;
          }
          console.log("climbed");
          // z.velocityX=1;
          // z.x+=z.velocityX;
         
        // }
      }
    

    }
     if(z.climbedA&&z.direction===-1&&z.x+z.width>=state.blocks.lblockb.x){
      setTimeout(() => {
        vanisher(state.blocks.lblocka, -1);
      }, 3000); 
      z.velocityX=0;
      if(!z.climbedB){
        climberzombie(z,180);
        z.climbedB=true;
        z.velocityX = 1; 
        z.x += z.velocityX;
    //   z.velocityX=1;
    // z.x+=z.velocityX;
    // if(z.x>=state.blocks.lblockb.x+state.blocks.lblockb.width ){
      // z.y=650;
    // }
      }
    }
    if(z.climbedB && z.x>=state.blocks.lblockb.x+state.blocks.lblockb.width && z.direction===-1){
     
      z.y=650;
      
      setTimeout(() => {
        vanisher(state.blocks.lblockb, -1);
      }, 3000); 

    }
    if(z.x>=state.box.x-z.width){
      z.velocityX=0;
      z.x=state.box.x-z.width;

    }
  }
  });
}
 

  // state.climbers.right.concat(state.climbers.left).forEach((z, i) => {
  //   if (z.direction === 1) {
  //     if (z.x <= state.blocks.rblocka.x + state.blocks.rblocka.width  && state.blocks.rblocka.blockpresent) {
  //       z.velocityX = 0;
  //       if (!z.climbedA) {
  //         climberzombie(z, 90);
  //         z.climbedA = true;
  //         if (z.climbedA) {
  //           z.velocityX = -1;
  //           z.x += z.velocityX;
  //           console.log("Right climber climbed block A and moving left");
  //         }
  //       }
  //     }
  //     if (z.direction === 1 && z.climbedA && z.x <= state.blocks.rblockb.x + state.blocks.rblockb.width  && state.blocks.rblockb.blockpresent) {
  //       setTimeout(() => {
  //         vanisher(state.blocks.rblocka, 1);
  //       }, 3000); 
  //       z.velocityX = 0;
  //       if (!z.climbedB) {
  //         climberzombie(z, 180);
  //         z.climbedB = true;
  //         z.velocityX = -1;
  //         z.x += z.velocityX;
  //         console.log("Right climber climbed block B and moving left");
  //       }
  //     }
  //     if (z.climbedB && z.x <= state.blocks.rblockb.x - z.width && z.direction === 1) {
  //       z.y = 650;
  //       setTimeout(() => {
  //         vanisher(state.blocks.rblockb, 1);
  //       }, 3000); 
  //       console.log("Right climber finished climbing and moving to final position");
  //     }
  //   //   if (z.x <= state.box.x + state.box.width) {
  //   //     z.velocityX = 0;
  //   //     z.x=state.box.x+state.box.width;
  //   //     console.log("Right climber stopped at the box");
  //   //   }
  //   //
  //  }
  
  //   if (z.direction === -1 && z.x + z.width >= state.blocks.lblocka.x && state.blocks.lblocka.blockpresent) {
  //     z.velocityX = 0;
  //     if (!z.climbedA) {
  //       climberzombie(z, 90);
  //       z.climbedA = true;
  //       if (z.climbedA) {
  //         z.velocityX = 1;
  //         z.x += z.velocityX;
  //       }
  //       console.log("Left climber climbed block A and moving right");
  //     }
  //   }
  //   if (z.climbedA && z.direction === -1 && z.x + z.width >= state.blocks.lblockb.x) {
  //     setTimeout(() => {
  //       vanisher(state.blocks.lblocka, -1);
  //     }, 3000); 
  //     z.velocityX = 0;
  //     if (!z.climbedB) {
  //       climberzombie(z, 180);
  //       z.climbedB = true;
  //       z.velocityX = 1;
  //       z.x += z.velocityX;
  //     }
  //   }
  //   if (z.climbedB && z.x >= state.blocks.lblockb.x + state.blocks.lblockb.width && z.direction === -1) {
  //     z.y = 650;
  //     setTimeout(() => {
  //       vanisher(state.blocks.lblockb, -1);
  //     }, 3000); 
  //   }
  //   if (z.x >= state.box.x-z.width) {
  //     z.velocityX = 0;
  //     z.x=state.box.x-z.width;
  //     console.log("Left climber stopped at the box");
  //   }
  // });
  
function updatePlayerPosition(speed) {
  
  if(!state.paused){
  if (state.playerMoving.left) {
    state.box.x -= speed;
  }
  if (state.playerMoving.right) {
    state.box.x += speed;
  }
}

  
  // const minBoxX = canvas.width / - 200;
  // const maxBoxX = canvas.width / 2 + 200 - 100;
  // state.box.x = Math.max(minBoxX, Math.min(maxBoxX, state.box.x));
  if (state.box.x < -state.box.width) {
    state.box.x = canvas.width; // Wrap around to the right edge
  }
  if (state.box.x > canvas.width) {
    state.box.x = -state.box.width; // Wrap around to the left edge
  }

  updateBoxJump(speed);
}
function updateBoxJump(speed) {
  if(!state.paused){
  if (state.box.jumping) {
    state.box.velocityY -= speed;
    state.box.y += state.box.velocityY;

    if (state.box.initialY - state.box.y >= 30) {
      state.box.jumping = false;
    }
  } else if (b) {
    if (state.box.y < state.box.initialY) {
      state.box.velocityY += speed;
      state.box.y += state.box.velocityY;

      if (state.box.y >= state.box.initialY) {
        state.box.y = state.box.initialY;
        state.box.velocityY = 0;
        b = false;
      }
    }
  }
}
}
function isColliding(rect, circle) {
  const rectTop = rect.y;
  const rectLeft = rect.x;

  const rectRight = rect.x + 70;
  console.log(rectLeft);
  console.log(rectRight);
  const circleBottom = circle.y + 10;
  console.log(circleBottom);

  return (
    rectTop <= circleBottom &&
    rectLeft <= circle.x + circle.radius &&
    rectRight >= circle.x - circle.radius
  );
}
function updatePistonPosition(a) {
  a.x = state.box.x + 55;
  a.y = state.box.y + 50;
}
function updatePistonRotation(a) {
  if (state.rotating && !state.paused) {
    const deltaX = state.mouse.x - a.x;
    const deltaY = state.mouse.y - a.y;
    a.rotation = Math.atan2(deltaY, deltaX);
  }
}
function updateBulletPosition(speed) {
  if (state.bullet.active && !state.paused) {
    state.bullet.x += state.bullet.velocityX;
    state.bullet.y += state.bullet.velocityY;
    state.bullet.velocityY += state.gravity;

    if (state.bullet.x < 0 || state.bullet.x > canvas.width || state.bullet.y > canvas.height) {
      state.bullet.active = false;
    }

    
    handleHitZombies(state.bullet);
    handleHitZombies(state.weapons.bomb);
  // 
}
}
function updateStraight() {
  if (state.straightBullet.active && !state.paused) {
      state.straightBullet.x += state.straightBullet.velocityX;
      state.straightBullet.y += state.straightBullet.velocityY;

      if (state.straightBullet.x < 0 || state.straightBullet.x > canvas.width || state.straightBullet.y < 0 || state.straightBullet.y > canvas.height) {
          state.straightBullet.active = false;
      }

      handleHitZombies(state.straightBullet); // Check for bullet hitting zombies
  }
}
function updateBombs() {
  if (state.weapons.bomb.use && !state.paused) {
      state.weapons.bomb.balls.forEach(ball => {
          ball.x += ball.velocityX;
          ball.y += ball.velocityY;
          ball.velocityY += state.gravity;
      });
      

      state.weapons.bomb.balls = state.weapons.bomb.balls.filter(ball => ball.x < canvas.width && ball.y < canvas.height);
  }
}
let frameCount = 0; // Initialize frame count for periodic acceleration
function shootBombs() {
    const numBombs = 5;
    const baseAngleIncrement = Math.PI / 8; // Base angle increment

    // Create 5 bomb balls with the same initial position and rotation
    for (let i = 0; i < numBombs; i++) {
        // Calculate periodic angle variation
        const angleVariation = (i - 2) * baseAngleIncrement * (1 + 0.5 * Math.sin(frameCount / 10)); // Sinusoidal modulation
        const speed = 7; // Set a consistent speed for all bombs

        state.weapons.bomb.balls.push({
            x: state.weapons.bomb.x,
            y: state.weapons.bomb.y,
            velocityX: speed * Math.cos(state.weapons.bomb.rotation + angleVariation),
            velocityY: speed * Math.sin(state.weapons.bomb.rotation + angleVariation)
        });
    }
    frameCount++; // Increment frame count for next call
    // No need to call handleHitZombies here, it should be called in the game loop when bombs are updated
}
let lastFrameUpdate = 0; 
const frameRate = 120; 
function updateZombieFrames(state, timestamp) {
  if (!lastFrameUpdate) lastFrameUpdate = timestamp;
  
  const elapsed = timestamp - lastFrameUpdate;
  
  if (elapsed >= frameRate) {
    lastFrameUpdate = timestamp; 

    state.zombies.left.forEach(zombie => {
      zombie.currentFrame = (zombie.currentFrame + 1) % numberOfFrames; 
    });

    state.zombies.right.forEach(zombie => {
      zombie.currentFrame = (zombie.currentFrame + 1) % numberOfFrames; 
    });
  }
}
let lastRender=0;
function gameLoop(timestamp) {
  const progress = timestamp - lastRender;
  
  // drawBalls();
  // updateBalls();
  
  // updateZombieFrames(state);
  // updateZombieImage(timestamp); 
  
  updateZombieFrames(state, timestamp);

  update({ progress });
// generate()
  // updateClimbers();
  
  if (lives > 0) {
    draw({ ctx, state });
      setInterval(() => {
        blockShooting(state.blocks.rblockb, state.blockbullet);
        blockShooting(state.blocks.lblockb, state.sblockbullet);
      }, 10000);
    // }, 10000); // 10000 milliseconds = 10 seconds
    

    updateScoreAndDraw();
    drawLifeBar();
    // blockShooting();
    lastRender = timestamp;
    requestAnimationFrame(gameLoop);
  }
}
function vanish(block, intervalId, zombie) {
  let a;

  
  if (block.direction === 1) {
    a = 1;
  } else if (block.direction === -1) {
    a = -1;
  }

  
  if (block.width > 0) {
    if (a === 1) {
      block.width -= 0.5; // 
      ctx.clearRect(block.x, block.y, block.width + 0.5, 90); 
      ctx.fillStyle = "red"; 
      ctx.fillRect(block.x, block.y, block.width, 90);
      state.zombies.right.forEach(z => {
        if (z.zbool) {
          z.velocityX = -0.5;
        }
      });

    } else if (a === -1) {
      block.width -= 0.5; 
      block.x += 0.5; 
      ctx.clearRect(block.x - 0.5, block.y, 0.5, 90); 
      ctx.fillStyle = "red"; 
      ctx.fillRect(block.x, block.y, block.width, 90);

     
      state.zombies.left.forEach(z => {
        if (z.zbool) {
          z.velocityX = 0.5;
        }
      });
    }
    blockDisappearing = true;

  } if(block.width===0) {
    block.blockpresent=false;
    
    clearInterval(intervalId);
    blockDisappearing = false;

    
    if (a === 1) {
      state.zombies.right.forEach(z => {
        if (z.zbool) {
          z.velocityX = -1;
        }
      });
    } else if (a === -1) {
      state.zombies.left.forEach(z => {
        if (z.zbool) {
          z.velocityX = 1;
        }
      });
    }
  }
}
window.addEventListener('mousemove', (event) => { 
  state.mouse.x = event.clientX;
  state.mouse.y = event.clientY;
  });
  
window.addEventListener('keydown', (event) => {
  if(!state.paused){
  if (event.code === 'KeyS') {
  state.rotating = !state.rotating; 
  }
  if (event.code === 'ArrowRight') {
  state.playerMoving.right = true;
  }
  if (event.code === 'ArrowLeft') {
  state.playerMoving.left = true;
  }
  if (event.code === 'ArrowUp' && state.box.y === state.box.initialY) {
  state.box.jumping = true; 
  b=true;
  state.box.velocityY = -10; 
  }
  if (event.code === 'KeyV') {
    // Shoot the bullet
    state.weapons.piston.recoil = 105;
    updateWeaponRecoil(state.weapons.piston);
    state.bullet.active = true;
    const bulletSpeed = 10; // Initial speed of the bullet
    state.bullet.x = state.weapons.piston.x - 50 * Math.cos(state.weapons.piston.rotation); // Starting from the left end of the piston
    state.bullet.y = state.weapons.piston.y - 50 * Math.sin(state.weapons.piston.rotation); // Starting from the left end of the piston
    state.bullet.velocityX = -bulletSpeed * Math.cos(state.weapons.piston.rotation); // Bullet velocity in X direction
    state.bullet.velocityY = -bulletSpeed * Math.sin(state.weapons.piston.rotation);
    
    // state.piston.recoil = -5; // Recoil amount // Bullet velocity in Y direction
   
  }
  if (event.code === 'KeyC') {
    // Shoot the bullet from the straight weapon
    state.weapons.straight.recoil = 20;
    if (state.weapons.straight.use) {
      updateWeaponRecoil(state.weapons.straight);
        state.straightBullet.active = true;
        const bulletSpeed = 10; // Initial speed of the bullet
        state.straightBullet.x = state.weapons.straight.x - 50 * Math.cos(state.weapons.straight.rotation); // Starting from the left end of the straight weapon
        state.straightBullet.y = state.weapons.straight.y - 50 * Math.sin(state.weapons.straight.rotation); // Starting from the left end of the straight weapon
        state.straightBullet.velocityX = -bulletSpeed * Math.cos(state.weapons.straight.rotation); // Bullet velocity in X direction
        state.straightBullet.velocityY = -bulletSpeed * Math.sin(state.weapons.straight.rotation); // Bullet velocity in Y direction
        
    }
}
  
    if (event.key === 'b' || event.key === 'B') {
      state.weapons.bomb.recoil = 30;
      updateWeaponRecoil(state.weapons.bomb);
      state.bullet.active = true;
      shootBombs();
    
      // throwBomb(state.box.x + 35, state.box.y + 35); // Example: throw bomb near the player's box
    }
  }
  });
  
window.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowRight') {
  state.playerMoving.right = false;
  }
  if (event.code === 'ArrowLeft') {
  state.playerMoving.left = false;
  }
  });
function showGameoverScreen() {
  repla=true;
  const maxScore = getMaxValueInLocalStorage();
  console.log(`Maximum score in localStorage: ${maxScore}`);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2 - 50);
  
    // Create and style replay button
    ctx.fillStyle = "blue";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2, 200, 50);
  
    // Text on the button
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Replay", canvas.width / 2 - 40, canvas.height / 2 + 35);
  
    // Add event listener for replay button
    canvas.addEventListener('click', replayButtonClick);
  }
function replayButtonClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    // Check if the click was inside the replay button
    if (
      mouseX > canvas.width / 2 - 100 &&
      mouseX < canvas.width / 2 + 100 &&
      mouseY > canvas.height / 2 &&
      mouseY < canvas.height / 2 + 50
    ) {
      // Reload the page to restart the game
      window.location.reload(state.replay=true);
    }
  }
function drawLifeBar() {
    const maxLives = 10; // Adjust this to your game's maximum lives
    const barWidth = 100; // Width of the life bar
    const barHeight = 10; // Height of the life bar
    const lifePercentage = lives / maxLives; // Percentage of lives remaining
  
    const barX = state.box.x-15 // Center the bar above the player
    const barY = state.box.y - barHeight - 20; // Position the bar above the player
  
    // Draw the background of the life bar (gray)
    ctx.fillStyle = "gray";
    ctx.fillRect(barX, barY, barWidth, barHeight);
  
    // Draw the foreground of the life bar (green), based on life percentage
    ctx.fillStyle = "rgb(0 255 0)";
    ctx.fillRect(barX, barY, barWidth * lifePercentage, barHeight);
  }
const interval=10/60;
const maxHoverDuration = 20 * 1000; // Maximum hover duration in milliseconds (20 seconds)

function climberzombie(zombie,y) {
  const climbSpeed = 2;
  let targetY = 650-y;
  console.log(targetY); // Target height for climbing

  // Climbing logic for the zombie
  function climb() {
    if (zombie.y > targetY) {
      zombie.y -= climbSpeed;
    } else {
      zombie.y = targetY;
      // zombie.velocityX=1;
      zombie.climbed=true;
      clearInterval(climbInterval);
    }
  }

  // Set an interval to move the zombie up
  const climbInterval = setInterval(climb, 1000 / 60);
}
let sidebar=[];
function livess(zombie){
  console.log("shivu");
  // if (zombie.zbool && zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70) {
    console.log("shivu");
  if (!contactTimes.has(zombie)) {
    contactTimes.set(zombie, Date.now());
  } else {
    const contactDuration = Date.now() - contactTimes.get(zombie);
    if (contactDuration > 3000) {
      console.log("Zombie contact duration exceeded 3 seconds. Lives left: " + lives);
      lives--;
      contactTimes.set(zombie, Date.now());
      // contactTimes.delete(zombie);
      if (lives === 0) {
        let players = JSON.parse(localStorage.getItem('players')) || [];

        // Find the current player
        let playerIndex = players.findIndex(player => player.name === playerName);
        if (playerIndex !== -1) {
          // Update the player's score
          // players[playerIndex].score = state.totalZombiesKilled;
          players[playerIndex].score = Math.max(players[playerIndex].score, state.totalZombiesKilled);
        } else {
          players.push({ name: playerName, score: state.totalZombiesKilled });
        }
        localStorage.setItem('players', JSON.stringify(players));
        console.log(localStorage);
        console.log('Game Over! Score saved in localStorage.');
        console.log("Game Over!");
        cancelAnimationFrame(gameLoop);
        showGameoverScreen();
        return;
      }
    }
  }
}
let a;
// function handleHitZombies(projectile) {
  
//   // Determine if the projectile is a bomb ball or a bullet
//   let projectiles = [];
//   if (projectile === state.weapons.bomb) {
//       projectiles = state.weapons.bomb.balls;
//   } else {
//       projectiles = [projectile];
//   }

//   projectiles.forEach(proj => {
//       // let hitZombies = state.zombies.left.concat(state.zombies.right).filter(zombie => {
//       //     return proj.x > zombie.x &&
//       //            proj.x < zombie.x + zombie.width &&
//       //            proj.y > zombie.y &&
//       //            proj.y < zombie.y + zombie.height &&
//       //            zombie.zbool;
//       // });
//       let hitZombies = state.zombies.left
//   .concat(state.zombies.right, state.climbers.left, state.climbers.right)
//   .filter(zombie => {
//     return proj.x > zombie.x &&
//            proj.x < zombie.x + zombie.width &&
//            proj.y > zombie.y &&
//            proj.y < zombie.y + zombie.height &&
//            zombie.zbool;
//   });


//       if (hitZombies.length > 0) {
//           console.log("Zombie hit!");

//           hitZombies.forEach(zombie => {
//               zombie.zbool = false; // Mark the zombie as dead
//           });
//           state.totalZombiesKilled += hitZombies.length;
//           console.log(state.totalZombiesKilled);
          

//           // Check if immunity zombie was hit
//           const hitImmunityZombie = hitZombies.some(zombie => zombie.immune);

//           if (hitImmunityZombie) {
//               console.log("Immunity zombie hit!");
//               state.lives = 10; // Restore lives to 10
//           }

//           // Remove hit zombies from the arrays
//           state.zombies.left = state.zombies.left.filter(zombie => !hitZombies.includes(zombie));
//           state.zombies.right = state.zombies.right.filter(zombie => !hitZombies.includes(zombie));
//           state.climbers.left = state.climbers.left.filter(zombie => !hitZombies.includes(zombie));
//           state.climbers.right = state.climbers.right.filter(zombie => !hitZombies.includes(zombie));

//           // Remove the projectile after hitting a zombie
//           if (projectile !== state.bullet) {
//               state.weapons.bomb.balls = state.weapons.bomb.balls.filter(ball => ball !== proj);
//           }
//       }
//   });

//   // Additional logic for updating UI or other game state
//   if (state.totalZombiesKilled >= 5) {
//       state.jetpackAvailable = true;
//       document.getElementById('jetpackButton').style.display = 'block'; // Show the jetpack button
//   }
// }
function handleHitZombies(projectile) {
  let projectiles = projectile === state.weapons.bomb ? state.weapons.bomb.balls : [projectile];

  projectiles.forEach(proj => {
    let hitZombies = state.zombies.left
      .concat(state.zombies.right, state.climbers.left, state.climbers.right)
      .filter(zombie => {
        return proj.x > zombie.x &&
          proj.x < zombie.x + zombie.width &&
          proj.y > zombie.y &&
          proj.y < zombie.y + zombie.height &&
          zombie.zbool;
      });

    if (hitZombies.length > 0) {
      console.log("Zombie hit!");

      // Only mark the first zombie as dead
      hitZombies[0].zbool = false;
      state.totalZombiesKilled += 1;

      console.log(state.totalZombiesKilled);

      // Check if immunity zombie was hit
      if (hitZombies[0].immune) {
        console.log("Immunity zombie hit!");
        state.lives = 10; // Restore lives to 10
      }

      // Remove hit zombie from the arrays
      state.zombies.left = state.zombies.left.filter(zombie => zombie !== hitZombies[0]);
      state.zombies.right = state.zombies.right.filter(zombie => zombie !== hitZombies[0]);
      state.climbers.left = state.climbers.left.filter(zombie => zombie !== hitZombies[0]);
      state.climbers.right = state.climbers.right.filter(zombie => zombie !== hitZombies[0]);

      // Remove the projectile after hitting a zombie
      if(projectile===state.bullet){
        state.bullet.active=false;
      }
      // if(projectile===state.weapons.bomb.balls){
      //   state.weapons.bomb.balls.active=false;
        
      // }
      if(projectile===state.straightBullet){
        state.straightBullet.active=false;
        
      }
      if (projectile !== state.bullet) {
        state.weapons.bomb.balls = state.weapons.bomb.balls.filter(ball => ball !== proj);
      }
    }
  });

  // Additional logic for updating UI or other game state
  if (state.totalZombiesKilled >= 5) {
    state.jetpackAvailable = true;
    document.getElementById('jetpackButton').style.display = 'block'; // Show the jetpack button
  }
}

document.getElementById('jetpackButton').addEventListener('click', function() {
  jetpackAvailable=true;
  console.log("Jetpack button clicked");
  lives=10;

  // Function to activate the jetpack
  function activateJetpack() {
    state.box.y = 100; // Set box to y = 100
    lives=10;
    const jetpackDuration = 20000; // 20 seconds in milliseconds
    let remainingTime = jetpackDuration; // Initialize remaining time

    // Update remaining time every second
    const countdownInterval = setInterval(() => {
      remainingTime -= 1000; // Decrease remaining time by 1 second (1000 milliseconds)
      lives=10;

      // Update button text to show remaining time
      updateButton(remainingTime / 1000);

      if (remainingTime <= 0) {
        clearInterval(countdownInterval); // Stop countdown when time is up
        state.box.y = originalPositionY; // Return to original position
        console.log("Jetpack time is up!");
        // Optionally, you can reset the button text here if needed
        // updateButton("Activate Jetpack");
        jetpackAvailable=false;
      }
    }, 1000);

    // Set a timeout to ensure the countdown stops after jetpack duration
    setTimeout(() => {
      clearInterval(countdownInterval); // Stop countdown if not already stopped
      state.box.y = originalPositionY; // Return to original position
      console.log("Jetpack time is up!");
      jetpackAvailable=false;
      // Optionally, you can reset the button text here if needed
      // updateButton("Activate Jetpack");
    }, jetpackDuration);

    // Update button text to show initial remaining time
    updateButton(remainingTime / 1000);
  }

  // Function to update the button text with remaining time
  function updateButton(seconds) {

    const button = document.getElementById('jetpackButton');
    button.textContent = `Activate Jetpack (${seconds.toFixed(0)}s)`;
  }

  // Store the original position
  const originalPositionY = state.box.y;

  // Call the function to activate the jetpack
  activateJetpack();
});
function vanisher(block,a) {
  if (block) {
    block.blockpresent = false;  // Mark the block as not present
    // Additional logic to visually remove the block if needed

  }
//   if(a===1){
//     // state.zombies.right.forEach(z=>{
//       // z.velocityX=-1;
    
//       // if ((z.x + z.width > state.box.x && z.x < state.box.x + 70)) {
//         // z.velocityX = 0;
//         // z.x = state.box.x + 70;
//         handleHitZombies(state.bullet);
//         handleHitZombies(state.weapons.bomb);
//         console.log("Climber zombie collided with the box and stopped.");
//         console.log(jetpackAvailable);
//         if (!jetpackAvailable) {
//           livess(z);
//          }
//       // }
// // });
//   }
//   if(a===-1){
//     state.zombies.left.forEach(z=>{
//       z.velocityX=1;
    
//     if ((z.x + z.width > state.box.x && z.x < state.box.x + 70)) {
//     z.velocityX=0;
//     z.x = state.box.x - z.width;
//     handleHitZombies(state.bullet);
//     handleHitZombies(state.weapons.bomb);
//         console.log(jetpackAvailable);
//         if (!jetpackAvailable) {
//           lives(z);
//         }
//     }
//   });
// }
} 
function weapons() {
      
          const weaponNames = ["bomb", "straight", "piston"];
          const buttonWidth = 150;
          const buttonHeight = 50;
          const buttonX = canvas.width / 2 - buttonWidth / 2;
         
          weaponNames.forEach((weapon, index) => {
              const buttonY = 100 + (index * (buttonHeight + 20));
             
              // Draw button
              ctx.fillStyle = "blue";
              ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
              // Draw text on button
              ctx.fillStyle = "white";
              ctx.font = "24px Arial";
              ctx.fillText(weapon, buttonX + 20, buttonY + 30);
      
              // Add event listener for each button
              canvas.addEventListener('click', (event) => {
                  const rect = canvas.getBoundingClientRect();
                  const x = event.clientX - rect.left;
                  const y = event.clientY - rect.top;
      
                  if (x > buttonX && x < buttonX + buttonWidth && y > buttonY && y < buttonY + buttonHeight && !state.paused) {
                      // Deactivate all weapons
                      for (let key in state.weapons) {
                          state.weapons[key].use = false;
                      }
      
                      // Activate the selected weapon
                      state.weapons[weapon].use = true;
                     
      
                      updateWeaponPosition(state.weapons[weapon]);
                      updateWeaponRotation(state.weapons[weapon]);
                  }
              });
          });
  }
  function updateScoreAndDraw() {
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${state.totalZombiesKilled}`, canvas.width - 90, 20);
  }
  function getMaxValueInLocalStorage() {
    let maxValue = -Infinity; // Initialize with a very small number

    // Iterate through localStorage items
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        // Convert value to number (if applicable)
        const numericValue = parseInt(value, 10); // Assuming stored values are numeric

        // Check if numericValue is greater than current maxValue
        if (!isNaN(numericValue) && numericValue > maxValue) {
            maxValue = numericValue;
        }
    }

    return maxValue;
}
function drawPauseButton() {
  const buttonWidth = 100;
  const buttonHeight = 40;
  const buttonX = 20;
  const buttonY = 20;

  // Draw button
  ctx.fillStyle = "green";
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  // Draw text on button
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Pause", buttonX + 25, buttonY + 25);

  // Add event listener for pause button
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x > buttonX && x < buttonX + buttonWidth && y > buttonY && y < buttonY + buttonHeight) {
      togglePause(); // Call your pause function
    }
  });
}
function togglePause(){
  if(!state.paused){
    console.log(state.paused);
    state.paused=true;
    console.log(state.paused);

  }
  else{
    state.paused=false;
  }

};

function updateWeaponRecoil(weapon) {
  if (weapon.recoil > 0) {
    console.log("applyong");
    console.log(weapon.x);
    // Apply recoil effect
    weapon.recoil -= weapon.recoilRecovery;
    weapon.x -= weapon.recoilRecovery; // Move weapon backward
    console.log(weapon.x);
    if (weapon.x < weapon.originalX - weapon.recoil) {
      weapon.x = weapon.originalX - weapon.recoil;
    }
  } else {
    // Return to original position
    if (weapon.x < weapon.originalX) {
      weapon.x += weapon.recoilRecovery;
      if (weapon.x > weapon.originalX) {
        weapon.x = weapon.originalX;
      }
    }
  }
}
function blockShooting(block, bullet) {
  if (block && block.blockpresent && !bullet.active) {
    bullet.active = true;
    bullet.x = block.x + block.width / 2; // Center of the block
    bullet.y = block.y + 45; // Adjust y position as needed
    bullet.velocityX = block.direction === 1 ? 5 : -5; // Bullet direction based on block
    bullet.velocityY = 0;
    if(bullet=state.blockbullet){
    handleHitZombies(state.blockbullet);
    }
    if(bullet=state.sblockbullet){
      handleHitZombies(state.sblockbullet);
      }
  }
}
function moveToZeroIndex(zombie, zombiesArray) {
  const index = zombiesArray.indexOf(zombie);
  if (index > -1) {
    zombiesArray.splice(index, 1); // Remove the zombie from its current position
    zombiesArray.unshift(zombie); // Add the zombie to the 0th index
  }
}

function forClimbers(){
  state.climbers.right.forEach((z,i)=>{
    z.velocityX=-1;
    z.x=z.x+z.velocityX;
    // if(z.x===state.blocks.rblocka+state.blocks.rblocka.width|| z.x>state.blocks.rblock.x+state.blocks.rblock.width){
    //   z.velocityX=0;
    // }
    if(z.x<=state.box.x+70){
      z.velocityX=0;
      z.x=state.box.x+70;
    }
  })
  state.climbers.left.forEach((z,i)=>{
    z.velocityX=1;
    z.x=z.x+z.velocityX;
  })
  
}
document.getElementById('leaderboardButton').addEventListener('click', function() {
  const leaderboard = document.getElementById('leaderboard');
  const leaderboardList = document.getElementById('leaderboardList');

  if (leaderboard.style.display === 'none' || leaderboard.style.display === '') {
    let players = JSON.parse(localStorage.getItem('players')) || [];
    players.sort((a, b) => b.score - a.score);
    leaderboardList.innerHTML = '';

    players.forEach(player => {
      const listItem = document.createElement('li');
      
      if (player.score !== 0 && !existAldready) {
        listItem.textContent = `${player.name}: ${player.score}`;
        leaderboardList.appendChild(listItem);
      }

      if (player.score !== 0 && existAldready) {
        listItem.textContent = `${player.name}: ${player.score}`;
        leaderboardList.appendChild(listItem);
      }
    });

    leaderboard.style.display = 'block';
    this.textContent = 'Hide Leaderboard';
  } else {
    leaderboard.style.display = 'none';
    this.textContent = 'Show Leaderboard';
  }
});




