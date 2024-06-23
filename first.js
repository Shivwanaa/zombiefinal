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
  ]
};
function generateLeftZombie() {
  const gap = 100;
  const lastZombie = state.zombies.left[state.zombies.left.length - 1];
  const newX = lastZombie ? lastZombie.x - lastZombie.width - gap : -20;

  const newZombie = {
    x: newX,  // Ensure gap
    y: 650,
    velocityX: 1,
    width: 20,
    height: 90,
    zbool: true,
    direction:-1
  };
  state.zombies.left.push(newZombie);
}
function generateRightZombie() {
  const gap = 100;
  const lastZombie = state.zombies.right[state.zombies.right.length - 1];
  const newX =  lastZombie ? lastZombie.x + lastZombie.width + gap: 1400;
  const newZombie = {
    x: newX,  // Ensure gap
    y: 650,
    velocityX: -1,
    width: 20,
    height: 90,
    zbool: true,
    direction:1
  };
  
  state.zombies.right.push(newZombie);
}
function generateClimberZombie(side) {
  const gap = 100;
  if (side === 'left' && !state.zombies.climbers.left) {
    const lastZombie = state.zombies.left[state.zombies.left.length - 2];
    const newX = lastZombie ? lastZombie.x - lastZombie.width - gap : -20;

    const newZombie = {
      x: newX,  // Ensure gap
      y: 650,
      velocityX: 1,
      velocitY:0,
      width: 30,
      height: 90,
      zbool: true,
      isClimber: true,
      direction:-1,
      finishedclimbing:false,
      
    };
    state.zombies.left.push(newZombie);
    state.zombies.climbers.left = newZombie;
  } else if (side === 'right' && !state.zombies.climbers.right) {
    const lastZombie = state.zombies.right[state.zombies.right.length - 2];
    const newX = lastZombie ? lastZombie.x + lastZombie.width + gap : 1400;

    const newZombie = {
      x: newX,  // Ensure gap
      y: 650,
      velocityX: -1,
      velocitY:0,
      width: 30,
      height: 90,
      zbool: true,
      isClimber: true,
      direction:1,
      finishedclimbing:false,
      
    };
    state.zombies.right.push(newZombie);
    state.zombies.climbers.right = newZombie;
  }
}
function generateImmunityZombies() {
  const gap = 100;
  if (!state.zombies.immunity) {
    state.zombies.immunity = { left: false, right: false };
  }

  if (!state.zombies.immunity.left) {
    const lastZombie = state.zombies.left[state.zombies.left.length - 2];
    const newX = lastZombie ? lastZombie.x - lastZombie.width - gap : -20;

    const newZombie = {
      x: newX,  // Ensure gap
      y: 650,
      velocityX: 1,
      velocityY: 0,
      width: 40,
      height: 90,
      zbool: true,
      immune: true,
      direction: -1
    };
    state.zombies.left.push(newZombie);
    state.zombies.immunity.left = newZombie;
  }

  if (!state.zombies.immunity.right) {
    const lastZombie = state.zombies.right[state.zombies.right.length - 2];
    const newX = lastZombie ? lastZombie.x + lastZombie.width + gap : 1400;

    const newZombie = {
      x: newX,  // Ensure gap
      y: 650,
      velocityX: -1,
      velocityY: 0,
      width: 40,
      height: 90,
      zbool: true,
      immune: true,
      direction: 1
    };
    state.zombies.right.push(newZombie);
    state.zombies.immunity.right = newZombie;
  }
}`  `
function drawPlayScreen() {
  playScreenCtx.clearRect(0, 0, playScreenCanvas.width, playScreenCanvas.height);

  playScreenCtx.fillStyle = "white";
  playScreenCtx.font = "24px Arial";
  playScreenCtx.fillText("Inventory", playScreenCanvas.width / 2 - 50, 50);

  // Draw blocks in inventory
  stat.blocks.forEach(block => {
    drawBlock(playScreenCtx, block.x, block.y, block.label, block.fixed); // Adjusted y position as needed
  });

  // Draw Play button
  playScreenCtx.fillStyle = "#007BFF";
  playScreenCtx.fillRect(playScreenCanvas.width / 2 - 100, playScreenCanvas.height / 2, 200, 50);
  playScreenCtx.fillStyle = "white";
  playScreenCtx.font = "24px Arial";
  playScreenCtx.fillText("Play", playScreenCanvas.width / 2 - 30, playScreenCanvas.height / 2 + 30);
}
// Function to draw a block
function drawBlock(ctx, x, y, label, fixed) {
  ctx.fillStyle = fixed ? "#888" : "#555"; // Different color for fixed blocks
  ctx.fillRect(x, y, 90, 90);
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(label, x + 20, y + 45);
}
// Event handler for clicks on the play screen canvas
function handlePlayScreenClick(event) {
  const rect = playScreenCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (
    mouseX > playScreenCanvas.width / 2 - 100 &&
    mouseX < playScreenCanvas.width / 2 + 100 &&
    mouseY > playScreenCanvas.height / 2 &&
    mouseY < playScreenCanvas.height / 2 + 50
  ) {
    playScreen.style.display = 'none'; // Hide the play screen
    canvas.style.display = 'block';
    stat.blocks.forEach(block => {
      state.blocks[block.label].x = block.x;
      state.blocks[block.label].y = block.y;
    }); // Show the game canvas
    startGameLoop(); // Start the game loop
  } else {
    handleBlockClick(mouseX, mouseY); // Handle block click if not Play button
  }
}
// Event handler for block click in the inventory
function handleBlockClick(mouseX, mouseY) {
  // Check if clicked on any block in inventory
  stat.blocks.forEach(block => {
    if (
      mouseX > block.x &&
      mouseX < block.x + block.width &&
      mouseY <650 &&  // Adjusted y position based on drawBlock call
      mouseY < 650 + block.height
    ) {
      // Set the block as dragging
      stat.draggingBlock = block;
      stat.offsetX = mouseX - block.x;
      stat.offsetY = mouseY - block.y; // Adjusted y position based on drawBlock call
      playScreenCanvas.addEventListener('mousemove', handleMouseMove);
      playScreenCanvas.addEventListener('mouseup', handleMouseUp);
    }
  });
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
        stat.offsetX = mouseX - block.x;
        stat.offsetY = mouseY - blockY; // Adjusted y position based on blockY
        playScreenCanvas.addEventListener('mousemove', handleMouseMove);
        playScreenCanvas.addEventListener('mouseup', handleMouseUp);
      }
    }
  });
}
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
// Event handler for mouse up (end of block dragging)
function handleMouseUp() {
  stat.draggingBlock = null;
  playScreenCanvas.removeEventListener('mousemove', handleMouseMove);
  playScreenCanvas.removeEventListener('mouseup', handleMouseUp);
}
// Event handler for space bar key press
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
canvas.width = 1400;
canvas.height = 750;
var lives = 10;
const bkGround = new Image();
bkGround.src = './images/zombie.png';
bkGround.onload = function() {
  console.log('Image loaded successfully');
  ctx.drawImage(bkGround, 0, 0, canvas.width, canvas.height);
  // playScreen.addEventListener('click', startGameLoop);
  console.log(state.replay);
  if(!state.paused){

    drawPlayScreen();
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


    },
    lblockb:{
      x:0,
      y:0,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:true,


    },
    rblocka:{
      x:0,
      y:0,
      width: 90,
      direction: 1,
      blockpresent:true,
      unbreakable:true,
    },
    rblockb:{
      x:0,
      y:0,
      width: 90,
      direction: 1,
      blockpresent:true,
      unbreakable:true,
    }
  },
  box: {
    x: canvas.width / 2 - 50,
    y: canvas.height - 300,
    initialY: canvas.height - 300,
    velocityY: 0,
    jumping: false
  },
  zombies: {
    left: [],
    right: [],
    climbers: {
      left: null,
      right: null
    },
    immunity:{
      left:null,
      right:null,
    }
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
  straightBullet: { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 },
  gravity: 0.5,
  totalZombiesKilled:0,
  paused:false,
  lblockbBullet : { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 },
  rblockbBullet : { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 },
};

function generateZombies() {
  for (let i = 0; i < 5; i++) {
    generateLeftZombie();
    generateRightZombie();
  }
}
// Function to check if all current zombies are dead
function allZombiesDead() {
  
  return state.zombies.left.every(zombie => !zombie.zbool) && state.zombies.right.every(zombie => !zombie.zbool);
}
// Function to manage zombie generation
function manageZombieGeneration() {
  if (!state.zombies.climbers.left) {
    generateClimberZombie('left');
    // state.zombies.climbers.left=null;
  }
  if (!state.zombies.climbers.right) {
    generateClimberZombie('right');
    
  }
  if (!state.zombies.immunity || !state.zombies.immunity.right) {
    generateImmunityZombies('right');
  }
  if (!state.zombies.immunity || !state.zombies.immunity.left) {
    generateImmunityZombies('left');
  }
  if(allZombiesDead()){
    state.zombies.left=[];
    state.zombies.right=[];
    blockDisappearing=true;
    state.zombies.climbers.left=false;
    state.zombies.climbers.right=false;
    state.zombies.immunity.right=false;
    state.zombies.immunity.left=false;

    generateZombies();
  }  
}
// Generate initial batch of zombies
generateZombies();
function startGameLoop() {
  playScreen.style.display = 'none';
  requestAnimationFrame(gameLoop);
}
function draw({ ctx, state }) {

// Start the game loop
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background image
  ctx.drawImage(bkGround, 0, 0, canvas.width, canvas.height);

  // Draw the box
  ctx.fillStyle = "blue";
  ctx.fillRect(state.box.x, state.box.y, 70, 200);
  

  
  // Draw the zombies
  
  state.zombies.left.forEach(zombie => {
    if (zombie.zbool) {
      if(zombie.isClimber){
        ctx.fillStyle = "brown";
        ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);

      }
      else if(!zombie.isClimber){
      ctx.fillStyle = "green";
      ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
      }
    }
  });
  state.zombies.right.forEach(zombie => {
    if (zombie.zbool) {
      if(zombie.isClimber){
        ctx.fillStyle = "brown";
        ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);

      }
      else if(!zombie.isClimber){
      ctx.fillStyle = "green";
      ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
      }
      // ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
    }
  });
  
  weapons();
  drawPauseButton();

  


  // Draw the pistons (brown boxes)
  ctx.fillStyle = "rgb(200 55 0)";
  ctx.fillRect(state.blocks.lblock.x, state.blocks.lblock.y, state.blocks.lblock.width, 90);
  ctx.fillRect(state.blocks.rblock.x, state.blocks.rblock.y, state.blocks.rblock.width, 90);
  if(state.blocks.lblocka.blockpresent){
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.lblocka.x, state.blocks.lblocka.y, state.blocks.lblocka.width, 90);
  }
  if(state.blocks.lblockb.blockpresent){
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.lblockb.x, state.blocks.lblockb.y, state.blocks.lblockb.width, 90);
  
  }
  
  
 if(state.blocks.rblocka.blockpresent){
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.rblocka.x, state.blocks.rblocka.y, state.blocks.rblocka.width, 90);
 }
 if(state.blocks.rblockb.blockpresent){
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.rblockb.x, state.blocks.rblockb.y, state.blocks.rblockb.width, 90);
 }
  
  // Save the context state
  ctx.save();

  // Move the origin to the piston's position
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
    ctx.fillRect(-50, -10, 100, 20); // Cannon
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
  
  let prevZombieLeft = null;
  state.zombies.left.forEach(zombie => {
    if (zombie.zbool && !state.paused) {
      zombie.x += zombie.velocityX;
      

      // Check if the zombie needs to stop because it's too close to the previous zombie
      if (prevZombieLeft && (zombie.x + zombie.width >= prevZombieLeft.x - 5) && !(zombie.isClimber)) {
        zombie.velocityX = 0;
      } else if (prevZombieLeft && prevZombieLeft.velocityX === 0.5) {
        // Match the velocity if the previous zombie is moving slowly
        zombie.velocityX = 0.5;
      } else {
        zombie.velocityX = 1;
      }
      
      // else{
      prevZombieLeft = zombie;
      
    }
  });

  let prevZombieRight = null;
  state.zombies.right.forEach(zombie => {
    if (zombie.zbool && !state.paused) {
      zombie.x += zombie.velocityX;

      // Check if the zombie needs to stop because it's too close to the previous zombie
      if (prevZombieRight && (zombie.x <= prevZombieRight.x + prevZombieRight.width + 5) && !(zombie.isClimber)) {
        zombie.velocityX = 0;
      } else if (prevZombieRight && prevZombieRight.velocityX === -0.5) {
        // Match the velocity if the previous zombie is moving slowly
        zombie.velocityX = -0.5;
      } else {
        zombie.velocityX = -1;
      }
      prevZombieRight = zombie;
    }
  });

  state.zombies.left.concat(state.zombies.right).forEach((zombie, index) => {
    if (zombie.direction===1 &&(zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
              zombie.velocityX = 0;
              zombie.x = state.box.x + 70;
              handleHitZombies(state.bullet);
              handleHitZombies(state.weapons.bomb);
              if (!jetpackAvailable) {
                livess(zombie);
              }
            }
    if((zombie.direction === -1) && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
              zombie.velocityX = 0;
              zombie.x = state.box.x - zombie.width;
              handleHitZombies(state.bullet);
              handleHitZombies(state.weapons.bomb);
              if (!jetpackAvailable) {
                livess(zombie);
              }
            }
    let rightIndex = index - state.zombies.left.length;
    if (index < state.zombies.left.length) {
      if (state.blocks.lblocka.x <= zombie.x + zombie.width && state.blocks.lblocka.blockpresent) {
        zombie.velocityX = 0;
        if (index === 0) {
          zombie.x = state.blocks.lblocka.x - zombie.width;
        }
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

      

    if (zombie.isClimber && zombie.isClimbing && !state.paused) {

      climberzombie(zombie, 90);
      // moveToZeroIndex(zombie,state.left.zombies);
    } else if (zombie.isClimber && zombie.finishedclimbing && !state.paused) {
      // moveToZeroIndex(zombie,state.zombies.left);
      zombie.x += zombie.velocityX;

      if (zombie.direction === -1) {
        if (zombie.zbool && zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70) {
          zombie.velocityX = 0;
          // moveToZeroIndex(zombie,state.zombies.left);
          // console.log(state.zombies.left[0]);
          // prevZombieLeft = zombie;
          // let npr=zombie

          // state.zombies.left.forEach(zombie=>{
          //   if (npr && (zombie.x <= npr.x + npr.width + 5)) {
          //     zombie.velocityX = 0;
          //   }

          // })
          
          if (!jetpackAvailable && !state.paused) {
            livess(zombie);
            
          }
        }

        zombie.velocityX = 1;
        if (zombie.x + zombie.width >= state.blocks.lblockb.x && !state.paused) {
          
          climberzombie(zombie, 180);
          if (zombie.x >= state.blocks.lblockb.x + 90) {
            if (zombie.x + zombie.width >= state.blocks.lblockb.x + 90) {
              vanisher(state.blocks.lblocka, zombie.direction);
              zombie.y = 650;
              if ((zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
                zombie.velocityX = 0;
                if(zombie.velocityX===0){
                  let prevZombieLef;
                  prevZombieLef=zombie;
                  console.log(zombie);
                  state.zombies.left.forEach(z=>{
                    if(!state.zombies.left.climber){

                    if (prevZombieLef && (z.x + z.width >= prevZombieLef.x - 5)) {
                      z.velocityX = 0;
                    }
                  }
        
                  })
                }
                zombie.x = state.box.x - zombie.width;
                handleHitZombies(state.bullet);
                handleHitZombies(state.weapons.bomb);
                console.log(jetpackAvailable);
                if (!jetpackAvailable) {
                  livess(zombie);
                }
              }
            }
          }
        }
      } 
      if (zombie.direction === 1) {
        zombie.x += zombie.velocityX;
        if ((zombie.direction === 1) && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
          zombie.velocityX = 0;
          
          zombie.x = state.box.x + 70;
          handleHitZombies(state.bullet);
          handleHitZombies(state.weapons.bomb);
          if (!jetpackAvailable && !state.paused) {
            livess(zombie);
          }
        }
      
        zombie.velocityX = -1;
        if (zombie.x <= state.blocks.rblockb.x + state.blocks.rblockb.width && !state.paused) {
          console.log("Right zombie climbing rblocka");
          climberzombie(zombie, 180);

          secondclimbright = true;
          if (zombie.x + zombie.width <= state.blocks.rblockb.x) {
            vanisher(state.blocks.rblocka, zombie.direction);
            zombie.y = 650;
            if ((zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
              // moveToZeroIndex(zombie,state.zombies.right);
              if(zombie.isClimber && !state.paused){
                console.log("shivu");
  
              }
              zombie.velocityX = 0;
              zombie.x = state.box.x + 70;
              handleHitZombies(state.bullet);
              handleHitZombies(state.weapons.bomb);
              
              if (!jetpackAvailable) {
                livess(zombie);
              }
            }
          }
        }
      }
    } else {
      // Regular zombie movement
      if (zombie.direction === -1 && state.blocks.lblocka.x <= zombie.x + zombie.width && !zombie.immunity&& state.blocks.lblocka.blockpresent) {
        zombie.velocityX = 0;

        if (zombie.isClimber && !zombie.isClimbing && !state.paused ) {
          zombie.isClimbing = true;
          climberzombie(zombie, 90);
        }
      } else if (zombie.direction === 1 && state.blocks.rblocka.x + 90 >= zombie.x && !zombie.immunity && state.blocks.rblocka.blockpresent) {
        zombie.velocityX = 0;

        if (zombie.isClimber && !zombie.isClimbing && !state.paused) {
          zombie.isClimbing = true;
          climberzombie(zombie, 90);
        }
      }

      // New logic to stop all zombies at the box
      if (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + state.box.width && !state.paused) {
        zombie.velocityX = 0;
        if (zombie.direction === -1) {
          zombie.x = state.box.x - zombie.width;
        } else if (zombie.direction === 1) {
          zombie.x = state.box.x + state.box.width;
        }
        handleHitZombies(state.bullet);
        handleHitZombies(state.weapons.bomb);
        console.log("Zombie collided with the box and stopped.");
        console.log(jetpackAvailable);
        if (!jetpackAvailable) {
          livess(zombie);
        }
      }
    }
  });
}
function updatePlayerPosition(speed) {
  
  if(!state.paused){
  if (state.playerMoving.left) {
    state.box.x -= speed;
  }
  if (state.playerMoving.right) {
    state.box.x += speed;
  }
}

  // Prevent box from moving off screen
  const minBoxX = canvas.width / 2 - 200;
  const maxBoxX = canvas.width / 2 + 200 - 100;
  state.box.x = Math.max(minBoxX, Math.min(maxBoxX, state.box.x));

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
let lastRender=0;
// blockShooting(state.blocks.rblockb,state.blockbullet);
function gameLoop(timestamp) {
  const progress = timestamp - lastRender;
  update({ progress });
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

  // Determine the direction of the block's disappearance
  if (block.direction === 1) {
    a = 1;
  } else if (block.direction === -1) {
    a = -1;
  }

  // If the block's width is greater than 0, continue reducing it
  if (block.width > 0) {
    if (a === 1) {
      block.width -= 0.5; // Reduce the block's width by 0.5
      ctx.clearRect(block.x, block.y, block.width + 0.5, 90); // Clear the previous part of the block
      ctx.fillStyle = "red"; // Ensure the fill style is set correctly
      ctx.fillRect(block.x, block.y, block.width, 90);

      // Allow zombies behind the first one to move as the block is disappearing
      state.zombies.right.forEach(z => {
        if (z.zbool) {
          z.velocityX = -0.5;
        }
      });

    } else if (a === -1) {
      block.width -= 0.5; // Reduce the block's width by 0.5
      block.x += 0.5; // Move the x position of the block to the right by 0.5 to maintain its right edge
      ctx.clearRect(block.x - 0.5, block.y, 0.5, 90); // Clear a small portion from the left
      ctx.fillStyle = "red"; // Ensure the fill style is set correctly
      ctx.fillRect(block.x, block.y, block.width, 90);

      // Allow zombies behind the first one to move as the block is disappearing
      state.zombies.left.forEach(z => {
        if (z.zbool) {
          z.velocityX = 0.5;
        }
      });
    }
    blockDisappearing = true;

  } if(block.width===0) {
    block.blockpresent=false;
    // Stop the interval when the block width reaches 0
    clearInterval(intervalId);
    blockDisappearing = false;

    // Allow all zombies to move at full speed once the block is completely gone
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
  state.rotating = !state.rotating; // Toggle the rotating state
  }
  if (event.code === 'ArrowRight') {
  state.playerMoving.right = true;
  }
  if (event.code === 'ArrowLeft') {
  state.playerMoving.left = true;
  }
  if (event.code === 'ArrowUp' && state.box.y === state.box.initialY) {
  state.box.jumping = true; // Start the jump
  b=true;
  state.box.velocityY = -10; // Set initial jump velocity
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
      zombie.isClimbing = false; 
      // zombie.velocityX=1;
      zombie.finishedclimbing=true;
     
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

        // Optionally, you can also store other game state variables if needed
        localStorage.setItem('score', state.totalZombiesKilled); 
        console.log(localStorage);// Example: Store number of lives
        sidebar.push(state.totalZombiesKilled);
        console.log(Math.max(...sidebar));

    
        // Perform any other end-of-game logic here
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
function handleHitZombies(projectile) {
  
  // Determine if the projectile is a bomb ball or a bullet
  let projectiles = [];
  if (projectile === state.weapons.bomb) {
      projectiles = state.weapons.bomb.balls;
  } else {
      projectiles = [projectile];
  }

  projectiles.forEach(proj => {
      let hitZombies = state.zombies.left.concat(state.zombies.right).filter(zombie => {
          return proj.x > zombie.x &&
                 proj.x < zombie.x + zombie.width &&
                 proj.y > zombie.y &&
                 proj.y < zombie.y + zombie.height &&
                 zombie.zbool;
      });

      if (hitZombies.length > 0) {
          console.log("Zombie hit!");

          hitZombies.forEach(zombie => {
              zombie.zbool = false; // Mark the zombie as dead
          });
          state.totalZombiesKilled += hitZombies.length;
          console.log(state.totalZombiesKilled);
          

          // Check if immunity zombie was hit
          const hitImmunityZombie = hitZombies.some(zombie => zombie.immune);

          if (hitImmunityZombie) {
              console.log("Immunity zombie hit!");
              state.lives = 10; // Restore lives to 10
          }

          // Remove hit zombies from the arrays
          state.zombies.left = state.zombies.left.filter(zombie => !hitZombies.includes(zombie));
          state.zombies.right = state.zombies.right.filter(zombie => !hitZombies.includes(zombie));

          // Remove the projectile after hitting a zombie
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
  if(a===1){
    state.zombies.right.forEach(z=>{
      z.velocityX=-1;
    
      if ((z.x + z.width > state.box.x && z.x < state.box.x + 70)) {
        z.velocityX = 0;
        z.x = state.box.x + 70;
        handleHitZombies(state.bullet);
        handleHitZombies(state.weapons.bomb);
        console.log("Climber zombie collided with the box and stopped.");
        console.log(jetpackAvailable);
        if (!jetpackAvailable) {
          livess(z);
        }
      }
});
  }
  if(a===-1){
    state.zombies.left.forEach(z=>{
      z.velocityX=1;
    
    if ((z.x + z.width > state.box.x && z.x < state.box.x + 70)) {
    z.velocityX=0;
    z.x = state.box.x - z.width;
    handleHitZombies(state.bullet);
    handleHitZombies(state.weapons.bomb);
        console.log(jetpackAvailable);
        if (!jetpackAvailable) {
          livess(z);
        }
    }
  });
}
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

