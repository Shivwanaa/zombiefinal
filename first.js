let blockDisappearing=false;
function generateLeftZombie() {
  const gap = 100;
  const lastZombie = state.zombies.left[state.zombies.left.length - 1];
  const newX = lastZombie ? lastZombie.x - lastZombie.width - gap : 0;
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
  const newZombie = {
    x: 1380 + gap * state.zombies.right.length,  // Start off-screen
    y: 650,
    velocityX: -1,
    width: 20,
    height: 90,
    zbool: true
  };
  state.zombies.right.push(newZombie);
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1400;
canvas.height = 750;
var lives = 10;  // Initialize player lives

const bkGround = new Image();
bkGround.src = '/images/zombie.png';
bkGround.onload = function() {
  console.log('Image loaded successfully');
  ctx.drawImage(bkGround, 0, 0, canvas.width, canvas.height);
  startGameLoop();
};

let state = {
  blocks: {
    rblock: {
      x: 860,
      y: 650,
      width: 90,
      direction: 1,
    },
    lblock: {
      x: 450,
      y: 650,
      width: 90,
      direction: -1,
    },
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
  },
  piston: {
    x: 0,
    y: 0,
    rotation: 0,
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

function startGameLoop() {
  setInterval(generateLeftZombie, 4000);  // Generate a left zombie every 4 seconds
  setInterval(generateRightZombie, 4000); // Generate a right zombie every 4 seconds
  requestAnimationFrame(gameLoop);
}

function draw({ ctx, state }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background image
  ctx.drawImage(bkGround, 0, 0, canvas.width, canvas.height);

  // Draw the box
  ctx.fillStyle = "blue";
  ctx.fillRect(state.box.x, state.box.y, 70, 200);

  // Draw the zombies
  ctx.fillStyle = "green";
  state.zombies.left.forEach(zombie => {
    if (zombie.zbool) {
      ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
    }
  });
  state.zombies.right.forEach(zombie => {
    if (zombie.zbool) {
      ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
    }
  });

  // Draw the pistons (brown boxes)
  ctx.fillStyle = "rgb(200 55 0)";
  ctx.fillRect(state.blocks.lblock.x, state.blocks.lblock.y, state.blocks.lblock.width, 90);
  ctx.fillRect(state.blocks.rblock.x, state.blocks.rblock.y, state.blocks.rblock.width, 90);

  // Save the context state
  ctx.save();

  // Move the origin to the piston's position
  ctx.translate(state.piston.x, state.piston.y);

  // Rotate the canvas to the piston's rotation angle
  ctx.rotate(state.piston.rotation);

  // Draw the piston centered on the new origin
  ctx.fillStyle = "rgb(0, 255, 0)";
  ctx.fillRect(-50, -10, 100, 20);

  // Restore the context to its original state
  ctx.restore();

  // Draw the bullet if it's active
  if (state.bullet.active) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(state.bullet.x, state.bullet.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Draw the lives
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Lives: " + lives, 10, 30);
}

function update({ progress }) {
  generateLeftZombie();
  generateRightZombie();
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

    // Check if the bullet hits any zombies
    state.zombies.left.concat(state.zombies.right).forEach(zombie => {
      if (
        state.bullet.x > zombie.x &&
        state.bullet.x < zombie.x + zombie.width &&
        state.bullet.y > zombie.y &&
        state.bullet.y < zombie.y + zombie.height &&
        zombie.zbool
      ) {
        console.log("Zombie hit!");
        lives += 2;
        zombie.zbool = false; // Hide the zombie
        state.bullet.active = false; // Deactivate bullet on hit
      }
    });
  }

  // Update zombies
  let prevZombieLeft = null;

state.zombies.left.forEach(zombie => {
  if (zombie.zbool) {
    zombie.x += zombie.velocityX;
    if (prevZombieLeft && (zombie.x+zombie.width === prevZombieLeft.x-5)) {
      zombie.velocityX = 0;
    }
    else if(prevZombieLeft && zombie.x+zombie.width===prevZombieLeft.x-5){
      while(prevZombieLeft.velocityX===0.5){
      zombie.velocityX=0.5;
      }
    }
    else {
      zombie.velocityX = 1;
    }
    prevZombieLeft = zombie;
  }
});

  let prevZombieRight = null;
  state.zombies.right.forEach(zombie => {
    if (zombie.zbool) {
      zombie.x += zombie.velocityX;
      if (prevZombieRight && zombie.x=== prevZombieRight.x +prevZombieRight.width+5) { // Adjust gap value as needed
        console.log("shivwanaa");
        zombie.velocityX = 0;
      }
      else if(prevZombieRight && prevZombieRight.velocityX===-0.5){
        while(prevZombieRight.velocityX===-0.5){
        zombie.velocityX=-0.5;
        }

      }
       else {
        zombie.velocityX = -1;
      }
      prevZombieRight = zombie;
    }
  });
  state.zombies.left.concat(state.zombies.right).forEach(zombie => {
    if (zombie.zbool && (zombie.x === state.blocks.rblock.x + state.blocks.rblock.width || zombie.x + zombie.width === 450)) {
      console.log("shivu");
      zombie.velocityX = 0;
      if (!blockDisappearing && (zombie.x === state.blocks.rblock.x + state.blocks.rblock.width)) {
        console.log("ssss");
        // vanish(state.blocks.rblock,zombie);
        
        let intervalId = setInterval(() => {
          // zombie.velocityX=-0.5;
          vanish(state.blocks.rblock, intervalId, zombie);
        }, 400);
        
      }
      if (!blockDisappearing && (zombie.x + zombie.width === state.blocks.lblock.x)) {
        
        console.log("ssss");
        // vanish(state.blocks.rblock,zombie);
        let intervalId = setInterval(() => {
          // zombie.velocityX=0.5;
          vanish(state.blocks.lblock, intervalId, zombie);
        }, 400);
      }
    }

    if (zombie.zbool && zombie.x + zombie.width > state.box.x && zombie.x < state.box.x + 70) {
      zombie.velocityX = 0;
      if (zombie.zbool) {
        zombie.velocityX = 0;
        // livess(zombie);
      }
      zombie.velocityX = 0;
      console.log("Zombie eating player. Lives left: " + lives);
      if (lives === 0) {
        zombie.velocityX=0;
        console.log("Game Over!");
        cancelAnimationFrame(gameLoop); // Stop the game loop
        showGameoverScreen();
        return;
      }
    }
  });
}
// Update left zombies movement


let lastRender = 0;

function gameLoop(timestamp) {
  const progress = timestamp - lastRender;
  update({ progress });
  if (lives > 0) {
    draw({ ctx, state });
    lastRender = timestamp;
    requestAnimationFrame(gameLoop);
  }
}



function livess(zombie) {
  const currentTime = new Date().getTime(); // Get the current time in milliseconds

  if (zombie.x === state.box.x) {
    // Calculate the time elapsed since the last hit
    const timeElapsed = currentTime - lastHitTime;

    // Check if the time elapsed is greater than or equal to 4 seconds (4000 milliseconds)
    if (timeElapsed >= 4000) {
      // Decrement lives if enough time has passed since the last hit
      lives--;
      console.log("Zombie hit player. Lives left: " + lives);
      
      // Update the last hit time to the current time
      lastHitTime = currentTime;
    }
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

  } else {
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
