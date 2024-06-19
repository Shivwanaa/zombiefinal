let blockDisappearing=false;
let contactStartTime = null;
let contactTimes = new Map();
let pausedZombieVelocities=[];
const maxZombies=10;
let totalZombiesKilled = 0;
let jetpackAvailable = false;


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
    zbool: true
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
    zbool: true
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
// function generateimmunityzombies(side){
//   const gap = 100;
//   if (side === 'left' && !state.zombies.immunity.left) {
//     const lastZombie = state.zombies.left[state.zombies.left.length - 1];
//     const newX = lastZombie ? lastZombie.x - lastZombie.width - gap : -20;

//     const newZombie = {
//       x: newX,  // Ensure gap
//       y: 650,
//       velocityX: 1,
//       velocitY:0,
//       width: 40,
//       height: 90,
//       zbool: true,
//       immunity:true,

//       direction:-1,
//     };
//     state.zombies.left.push(newZombie);
//     state.zombies.climbers.left = newZombie;
//   } else if (side === 'right' && !state.zombies.climbers.right) {
//     const lastZombie = state.zombies.right[state.zombies.right.length - 1];
//     const newX = lastZombie ? lastZombie.x + lastZombie.width + gap : 1400;

//     const newZombie = {
//       x: newX,  // Ensure gap
//       y: 650,
//       velocityX: -1,
//       velocitY:0,
//       width: 40,
//       height: 90,
//       zbool: true,
//       immunity:true,

     
//       direction:1,
      
//     };
//     state.zombies.right.push(newZombie);
//     state.zombies.immunity.right = newZombie;
//   }


// }
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
      immunity: true,
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
      immunity: true,
      direction: 1
    };
    state.zombies.right.push(newZombie);
    state.zombies.immunity.right = newZombie;
  }
}



const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1400;
canvas.height = 750;
var lives = 10;

const bkGround = new Image();
bkGround.src = '/images/zombie.png';
bkGround.onload = function() {
  console.log('Image loaded successfully');
  ctx.drawImage(bkGround, 0, 0, canvas.width, canvas.height);
  startGameLoop();
};

let state = {
  bomb : {
    active: false,       // Whether the bomb is currently active (thrown)
  x: 0,                // X coordinate of the bomb
  y: 0,                // Y coordinate of the bomb
  radius: 50,          // Radius of the bomb explosion area
  damage: 1,           // Damage inflicted by the bomb
  velocityX: 5,        // Initial velocity in the X direction
  velocityY: -10,      // Initial velocity in the Y direction (negative because it's upwards)
  gravity: 0.5,         // Damage inflicted by the bomb
  },
  blocks: {
    rblock: {
      x: 960,
      y: 650,
      width: 90,
      direction: 1,
      blockpresent:true,
    },
    lblock: {
      x: 350,
      y: 650,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:false,
    },
    lblocka:{
      x:460,
      y:650,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:true,


    },
    lblockb:{
      x:480,
      y:560,
      width: 90,
      direction: -1,
      blockpresent:true,
      unbreakable:true,


    },
    rblocka:{
      x:850,
      y:650,
      width: 90,
      direction: 1,
      blockpresent:true,
      unbreakable:true,
    },
    rblockb:{
      x:830,
      y:560,
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
  piston: {
    x: 0,
    y: 0,
    rotation: 0,
    recoil: 0,          // Recoil amount
    recoilRecovery: 0.1 ,
    originalX: 0,       // Original position to return to after recoil
    originalY: 0// Recoil recovery speed
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
  gravity: 0.5
};

function generateZombies() {
  for (let i = 0; i < maxZombies / 2; i++) {
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
  // Check if all current zombies are dead
  if (!state.zombies.climbers.left) {
    generateClimberZombie('left');
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
  if (allZombiesDead()) {
    // Clear existing zombies
    blockDisappearing=true;
    state.zombies.left = [];
    state.zombies.right = [];
    
    // Generate new batch of zombies
    generateZombies();
  }
  
}

// Generate initial batch of zombies
generateZombies();


function startGameLoop() {
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

  // Draw the pistons (brown boxes)
  ctx.fillStyle = "rgb(200 55 0)";
  ctx.fillRect(state.blocks.lblock.x, state.blocks.lblock.y, state.blocks.lblock.width, 90);
  ctx.fillRect(state.blocks.rblock.x, state.blocks.rblock.y, state.blocks.rblock.width, 90);
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.lblocka.x, state.blocks.lblocka.y, state.blocks.lblocka.width, 90);
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.lblockb.x, state.blocks.lblockb.y, state.blocks.lblockb.width, 90);
  ctx.fillStyle = "rgb(180 40 25)";
 
  ctx.fillRect(state.blocks.rblocka.x, state.blocks.rblocka.y, state.blocks.rblocka.width, 90);
  ctx.fillStyle = "rgb(180 40 25)";
  ctx.fillRect(state.blocks.rblockb.x, state.blocks.rblockb.y, state.blocks.rblockb.width, 90);
  
  // Save the context state
  ctx.save();

  // Move the origin to the piston's position
  ctx.translate(state.piston.x, state.piston.y);

  // Rotate the canvas to the piston's rotation angle
  ctx.rotate(state.piston.rotation);
  const recoilOffsetX = Math.cos(state.piston.rotation) * state.piston.recoil;
  const recoilOffsetY = Math.sin(state.piston.rotation) * state.piston.recoil;

  // Draw the piston centered on the new origin with recoil offset
  ctx.fillStyle = "rgb(0, 255, 0)";
  ctx.fillRect(-50 + recoilOffsetX, -10 + recoilOffsetY, 100, 20);

  // Draw the piston centered on the new origin


  // Restore the context to its original state
  ctx.restore();

  // Draw the bullet if it's active
  if (state.bullet.active) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(state.bullet.x, state.bullet.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function update({ progress }) {
  manageZombieGeneration();
  const speed = progress * 0.1;

  // Update box position based on arrow key state
  if (state.playerMoving.left) {
    state.box.x -= speed;
  }
  if (state.playerMoving.right) {
    state.box.x += speed;
  }

  // Prevent box from moving off screen
  if (state.box.x < canvas.width / 2 - 200) {
    state.box.x = canvas.width / 2 - 200;
  }
  if (state.box.x > canvas.width / 2 + 200 - 100) {
    state.box.x = canvas.width / 2 + 200 - 100;
  }

  // Update jump and gravity
  if (state.box.jumping) {
    state.box.velocityY -= speed;
    state.box.y += state.box.velocityY;

    if (state.box.initialY - state.box.y >= 30) {
      state.box.jumping = false;
    }
  } else {
    if (state.box.y < state.box.initialY) {
      state.box.velocityY += speed;
      state.box.y += state.box.velocityY;

      if (state.box.y >= state.box.initialY) {
        state.box.y = state.box.initialY;
        state.box.velocityY = 0;
      }
    }
  }

  // Update the piston's position to follow the box
  state.piston.x = state.box.x + 55;
  state.piston.y = state.box.y + 50;
  

  // Update the piston's rotation only if rotating is enabled
  if (state.rotating) {
    const deltaX = state.mouse.x - state.piston.x;
    const deltaY = state.mouse.y - state.piston.y;
    state.piston.rotation = Math.atan2(deltaY, deltaX);
  }

  // Update bullet position if active
  if (state.bullet.active) {
    state.bullet.x += state.bullet.velocityX;
    state.bullet.y += state.bullet.velocityY;
    state.bullet.velocityY += state.gravity;

    // Check if the bullet is off screen and deactivate it
    if (state.bullet.x < 0 || state.bullet.x > canvas.width || state.bullet.y > canvas.height) {
      state.bullet.active = false;
    }
    
    const hitZombies = state.zombies.left.concat(state.zombies.right).filter(zombie => {
      return state.bullet.x > zombie.x &&
             state.bullet.x < zombie.x + zombie.width &&
             state.bullet.y > zombie.y &&
             state.bullet.y < zombie.y + zombie.height &&
             zombie.zbool;
    });
    if (state.blocks.lblockb.blockpresent && state.bullet.active &&
      state.bullet.x >= state.blocks.lblockb.x &&
      state.bullet.x < state.blocks.lblockb.x + state.blocks.lblockb.width &&
      state.bullet.y >= state.blocks.lblockb.y &&
      state.bullet.y < state.blocks.lblockb.y + state.blocks.lblockb.width) {
    
    // Mark block as disappeared
    
   // Clear block from canvas
    // state.bullet.active = false;  
    state.blocks.lblockb.blockpresent = false;
   
  }
  
  // Check if the bullet hits rblocka
  if (state.blocks.rblocka.blockpresent && state.bullet.active &&
      state.bullet.x >= state.blocks.rblocka.x &&
      state.bullet.x < state.blocks.rblocka.x + state.blocks.rblocka.width &&
      state.bullet.y >= state.blocks.rblocka.y &&
      state.bullet.y < state.blocks.rblocka.y + state.blocks.rblocka.width) {
    
     // Mark block as disappeared
     
      // Clear block from canvas
      state.blocks.rblocka.blockpresent = false;
    // state.bullet.active = false;  // Deactivate the bullet
    console.log("Bullet hit rblocka, block disappeared!");
  }
  
    if (hitZombies.length > 0) {

      console.log("Zombie hit!");
      totalZombiesKilled++
      if(state.zombies.left.immunity || state.zombies.right.immunity){
        console.log("immunity");
        lives=20;
        state.zombies.immunity.right=false;
        state.zombies.immunity.left=false;

      }
      if (totalZombiesKilled === 20) {
        jetpackAvailable = true;
        jetpack();
        // Display a message or provide visual indication to the player
      }
      if(lives<10){
      // state.bullet.active = false;
      } 
      // Remove hit zombies from the arrays
      console.log(hitZombies);
      state.zombies.left = state.zombies.left.filter(zombie => !hitZombies.includes(zombie));
      state.zombies.right = state.zombies.right.filter(zombie => !hitZombies.includes(zombie));

      
    }}
let prevZombieLeft = null;
state.zombies.left.forEach(zombie => {
  if (zombie.zbool) {
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

    prevZombieLeft = zombie;
  }
});

let prevZombieRight = null;
state.zombies.right.forEach(zombie => {
  if (zombie.zbool) {
    zombie.x += zombie.velocityX;

    // Check if the zombie needs to stop because it's too close to the previous zombie
    if (prevZombieRight && (zombie.x <= prevZombieRight.x + prevZombieRight.width + 5) && !(zombie.isClimber)) {
      zombie.velocityX = 0;
    }
    
     else if (prevZombieRight && prevZombieRight.velocityX === -0.5) {
      // Match the velocity if the previous zombie is moving slowly
      zombie.velocityX = -0.5;
    } else {
      zombie.velocityX = -1;
    }

    prevZombieRight = zombie;
  }
});

  
  state.zombies.left.concat(state.zombies.right).forEach((zombie,index) => {
    console.log(state.zombies.left);
    let rightIndex = index - state.zombies.left.length;
    if( index<state.zombies.left.length){
    if(state.blocks.lblocka.x<=zombie.x+zombie.width)
    {
      zombie.velocityX = 0;
      if(index===0){
       
      zombie.x = state.blocks.lblocka.x - zombie.width;
      }
    }

  }
  if( index>=state.zombies.left.length){
    if(state.blocks.rblocka.x+90>=zombie.x)
    {
      zombie.velocityX = 0
    }
    
  }
  
    if ((zombie === state.zombies.left[0] &&state.blocks.lblock.blockpresent&& zombie.zbool &&zombie.x + zombie.width === state.blocks.lblock.x)||(zombie === state.zombies.right[0] &&state.blocks.rblock.blockpresent && zombie.zbool&&zombie.x === state.blocks.rblock.x + state.blocks.rblock.width)){
      console.log("shivu");
      zombie.velocityX = 0
      if (!blockDisappearing && (zombie.x === state.blocks.rblock.x + state.blocks.rblock.width) && state.blocks.rblock.blockpresent) {
        console.log("ssss");
        // vanish(state.blocks.rblock,zombie);
        let intervalId = setInterval(() => {
          // zombie.velocityX=-0.5;
          vanish(state.blocks.rblock, intervalId, zombie);  
        }, 400);

        // clearInterval(intervalId);
        
      }
      if (!blockDisappearing && (zombie.x + zombie.width === state.blocks.lblock.x)&& state.blocks.lblock.blockpresent) {
        
        console.log("ssss");
        // vanish(state.blocks.rblock,zombie);
        let intervalId = setInterval(() => {
          // zombie.velocityX=0.5;
          vanish(state.blocks.lblock, intervalId, zombie);
        }, 400);
      }
    }
  
if (zombie.isClimber && zombie.isClimbing) {
  climberzombie(zombie, 90);
}

else if (zombie.isClimber && zombie.finishedclimbing) {
  zombie.x += zombie.velocityX;
  let intervalId;

  


  // Move forward after climbing
  if (zombie.direction === -1) {
    intervalId = setInterval(() => {
      // zombie.velocityX=-0.5;
      vanish(state.blocks.lblocka, intervalId, zombie);  
    }, 400);
    if (zombie.zbool && zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70) {


      zombie.velocityX = 0;
    
    livess(zombie);
    }
      
    zombie.velocityX = 1;
    // dissapear(state.blocks.lblocka);
    if (zombie.x + zombie.width >= state.blocks.lblockb.x) {
      console.log("second");
      climberzombie(zombie, 180);
      if(zombie.x>=state.blocks.lblockb.x+90){
        if (zombie.x + zombie.width >= state.blocks.lblockb.x+90) {
          intervalId = setInterval(() => {
            // zombie.velocityX=-0.5;
            vanish(state.blocks.lblockb, intervalId, zombie);  
          }, 400);
          
          
          zombie.y=650;
         
      }
    }
  }
}
else if (zombie.direction === 1) {
  intervalId = setInterval(() => {
    // zombie.velocityX=-0.5;
    vanish(state.blocks.rblocka, intervalId, zombie);  
  }, 400);
  
  zombie.velocityX = -1;
  // dissapear(state.blocks.rblocka);
  if (zombie.x <= state.blocks.rblockb.x + state.blocks.rblockb.width) {
    console.log("Right zombie climbing rblocka");
    climberzombie(zombie, 180);
    if (zombie.x+zombie.width <= state.blocks.rblockb.x) {
      intervalId = setInterval(() => {
        // zombie.velocityX=-0.5;
        vanish(state.blocks.lblockb, intervalId, zombie);  
      }, 400);
      
      // dissapear(state.blocks.rblockb);
      zombie.y = 650;
    }
  }
}




  // Check for collision with the box
  if ((zombie.direction === -1) && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
    zombie.velocityX = 0;
    zombie.x = state.box.x - zombie.width;
    livess(zombie);
  
  }



  if ((zombie.direction === 1) && (zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70)) {
    zombie.velocityX = 0;
    zombie.x = state.box.x + 70; // Adjust position to ensure no overlap
    console.log("Climber zombie collided with the box and stopped.");
    livess(zombie);
  }
}

 else {
  // Regular zombie movement
  if (zombie.direction === -1 && state.blocks.lblocka.x <= zombie.x + zombie.width && !zombie.immunity) {
    zombie.velocityX = 0;

    // Start climbing if the zombie is a climber and not already climbing
    if (zombie.isClimber && !zombie.isClimbing) {
      zombie.isClimbing = true; // Set the climbing state
      climberzombie(zombie, 90); // Pass the specific zombie to the climberzombie function
    }
  } else if (zombie.direction === 1 && state.blocks.rblocka.x + 90 >= zombie.x && !zombie.immunity) {
    zombie.velocityX = 0;

    // Start climbing if the zombie is a climber and not already climbing
    if (zombie.isClimber && !zombie.isClimbing) {
    
      zombie.isClimbing = true; // Set the climbing state
      climberzombie(zombie, 90); // Pass the specific zombie to the climberzombie function
    }
  } 
}


if (zombie.zbool && zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70) {


    zombie.velocityX = 0;
  
  livess(zombie);
  }
  //   if (!contactTimes.has(zombie)) {
  //     contactTimes.set(zombie, Date.now());
  //   } else {
  //     const contactDuration = Date.now() - contactTimes.get(zombie);
  //     if (contactDuration > 3000) {
  //       console.log("Zombie contact duration exceeded 3 seconds. Lives left: " + lives);
  //       lives--;
  //       contactTimes.set(zombie, Date.now());
  //       // contactTimes.delete(zombie);
  //       if (lives === 0) {
  //         console.log("Game Over!");
  //         cancelAnimationFrame(gameLoop);
  //         showGameoverScreen();
  //         return;
  //       }
  //     }
  //   }
  // } 
  // else {
  //   contactTimes.delete(zombie);
  // }



});
}

let lastRender = 0;

function gameLoop(timestamp) {
  const progress = timestamp - lastRender;
  update({ progress });
  if (lives > 0) {
    draw({ ctx, state });
    drawLifeBar();
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
  state.box.velocityY = -10; // Set initial jump velocity
  }
  if (event.code === 'KeyV') {
    // Shoot the bullet
    state.bullet.active = true;
    const bulletSpeed = 10; // Initial speed of the bullet
    state.bullet.x = state.piston.x - 50 * Math.cos(state.piston.rotation); // Starting from the left end of the piston
    state.bullet.y = state.piston.y - 50 * Math.sin(state.piston.rotation); // Starting from the left end of the piston
    state.bullet.velocityX = -bulletSpeed * Math.cos(state.piston.rotation); // Bullet velocity in X direction
    state.bullet.velocityY = -bulletSpeed * Math.sin(state.piston.rotation);
    // state.piston.recoil = -5; // Recoil amount // Bullet velocity in Y direction
  }
  
    if (event.key === 'b' || event.key === 'B') {
      throwBomb(state.box.x + 35, state.box.y + 35); // Example: throw bomb near the player's box
    }
  
  if(event.code==='KeyP'){
    console.log("pause");
    pausedScreen();
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
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game over text
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
      window.location.reload();
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
const grav = 0.2; // Gravity constant, adjust as needed
let isJetpackActive = false;
let hoverDuration = 0;
const maxHoverDuration = 20 * 1000; // Maximum hover duration in milliseconds (20 seconds)

function jetpack() {
  if (isJetpackActive) {
    // Apply gravity to velocityY
    state.box.velocityY += grav;

    // Update the vertical position of the player
    state.box.y += state.box.velocityY;

    // Limit maximum ascending speed
    if (state.box.velocityY < -5) {
      state.box.velocityY = -5; // Adjust maximum ascent speed as needed
    }

    // Limit maximum descending speed
    if (state.box.velocityY > 5) {
      state.box.velocityY = 5; // Adjust maximum descent speed as needed
    }

    // Increment hover duration
    hoverDuration += 1000 / 60; // Assuming 60 FPS
  }

  // Ensure the player does not go below a certain y-position (ground level)
  if (state.box.y >= 100) { // Adjust ground level as needed
    state.box.y = 100; // Ensure player stays on ground level
    state.box.velocityY = 0; // Reset velocity when on ground
    hoverDuration = 0; // Reset hover duration
  }
}

// Example key press event listener to activate jetpack
document.addEventListener('keydown', event => {
  if (event.key === 'j' && !isJetpackActive) { // Activate jetpack only if it's not already active
    activateJetpack();
  }
});
canvas.addEventListener('click', function(event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  // Check if click is within jetpack button bounds
  if (
    mouseX >= jetpackButton.x &&
    mouseX <= jetpackButton.x + jetpackButton.width &&
    mouseY >= jetpackButton.y &&
    mouseY <= jetpackButton.y + jetpackButton.height
  ) {
    activateJetpack();
  }
});
function activateJetpack() {
  if (!isJetpackActive && jetpackTimer <= 0) {
    isJetpackActive = true; // Set jetpack active
    state.box.velocityY = -5; // Initial upward velocity when jetpack is activated
    jetpackTimer = jetpackDuration; // Start the jetpack countdown timer
  }
}


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
function throwBomb(x, y) {
  if (!state.bomb.active) {
    state.bomb.active = true;
    state.bomb.x = x;   // Set bomb coordinates
    state.bomb.y = y;
    state.bomb.velocityX = 5;  // Initial X velocity
    state.bomb.velocityY = -10; // Initial Y velocity (upwards)
    
    // Additional logic such as animation or sound effects can be added here
  }
}
// function dissapear(block){
//   ctx.clearRect(block.x , block.y, 90, 90);
// }
// function isBulletInBlock(bullet, block) {
//   return bullet.x >= block.x &&
//          bullet.x < block.x + block.width &&
//          bullet.y >= block.y &&
//          bullet.y < block.y + block.height;
// }
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
        console.log("Game Over!");
        cancelAnimationFrame(gameLoop);
        showGameoverScreen();
        return;
      }
    }
  }
}
 
// else {
//   contactTimes.delete(zombie);
// }

