const bird = document.getElementById( 'bird' );
const sparks = document.getElementById( 'sparks' );
const gameContainer = document.getElementById( 'gameContainer' );
const pipesContainer = document.getElementById( 'pipeContainer' );
const restartButton = document.getElementById( 'restartButton' );
const healthDisplay = document.getElementById( 'health' );
const scoreDisplay = document.getElementById( 'score' );
const gameHeight = gameContainer.getBoundingClientRect().height;
const gravityOn = true;
const collisionOn = true;
let pipes = [];
let birdTop = 100;
let birdAcceleration = 0;
let birdFallSpeed = 0.0625;
let birdHealth = 100;
let score = 0;
let pipeInterval;
let frameIndex = 0;
let pipeLeft = 780;
let pipeSpeed = 20;
let previousBottomPipeHeight;
let previousTopPipeHeight;

// bird can be either 🚁 🦅

function startGame() {
  score = 0;
  gameContainer.style.setProperty( '--background-scrolling', 'infinite' );
  gameContainer.style.setProperty( '--bird-animation', 'infinite' );
  document.addEventListener( 'keypress', function( e ) {
    birdAcceleration = -3.5;
    birdFallSpeed = 0;
  } );

  pipeInterval = setInterval( function() {
    createNewPipes();
  }, 1500 );
}

function createNewPipes() {
  // TODO:  create pipes all at once instead of periodically

  let pipeHeight = 50 + Math.random() * 425;
  let gap = Math.random() * ( gameHeight - pipeHeight - 200 );
  gap = Math.max( 200, gap );

  const newPipeTop = document.createElement( 'div' );
  newPipeTop.style.left = pipeLeft + 'px';
  newPipeTop.style.width = '60px';
  newPipeTop.style.top = '0px';

  // avoid distances too large for the bird to descend
  if( pipeHeight > 60 + previousTopPipeHeight ) {
    pipeHeight = previousTopPipeHeight + 60;
  }

  newPipeTop.style.height = pipeHeight + 'px';
  previousTopPipeHeight = pipeHeight;

  const newPipeBottom = document.createElement( 'div' );
  newPipeBottom.style.left = pipeLeft + 'px';
  newPipeBottom.style.width = '60px';
  newPipeBottom.style.bottom = '0px';
  let bottomPipeHeight = Math.max( 10, gameHeight - gap - pipeHeight );

  // avoid distances too large for the bird to climb
  if( bottomPipeHeight > 100 + previousBottomPipeHeight ) {
    bottomPipeHeight = previousBottomPipeHeight + 100;
  }

  newPipeBottom.style.height = bottomPipeHeight + 'px';
  previousBottomPipeHeight = bottomPipeHeight;

  pipesContainer.appendChild( newPipeTop );
  pipesContainer.appendChild( newPipeBottom );
  pipes.push( { top: newPipeTop, bottom: newPipeBottom } );
}

let start;
function gameLoop( timeStamp ) {
  if( start === undefined ) {
    start = timeStamp;
  }
  const elapsed = timeStamp - start;

  // if( elapsed <= 300 ) {
  //   requestAnimationFrame( gameLoop );
  //   return;
  // }

  // only animate every few frames
  if( frameIndex < 3 ) {
    frameIndex ++;
    requestAnimationFrame( gameLoop );
    return;
  }
  frameIndex = 0;

  sparks.style.setProperty( '--display-sparks', 'none' );

  // move bird up or down
  birdTop = Math.max( 20, birdTop + birdFallSpeed );
  bird.style.top = birdTop + 'px';

  // move sparks together if active
  sparks.style.top = birdTop + 'px';

  // make bird fall faster over time
  if( gravityOn ) {
    birdAcceleration += 0.5;
    birdFallSpeed += birdAcceleration;
  }

  // if fell to the ground, then game over
  if( birdTop >= gameHeight - 10 ) {
    gameOver();
    return;
  }

  // detect collision on all pipes
  // delete pipes past the bird
  // move pipes to the left
  for( let i = 0; i < pipes.length; i++ ) {
    let topPipe = pipes[ i ].top;
    let bottomPipe = pipes[ i ].bottom;
    let birdRect = bird.getBoundingClientRect();
    let topPipeRect = topPipe.getBoundingClientRect();
    let bottomPipeRect = bottomPipe.getBoundingClientRect();

    if( collisionOn && birdRect.right > topPipeRect.x ) {
      // detect bird top hitting bottom of top pipe
      if( birdRect.y < topPipeRect.bottom ) {
        // damage bird, reduce score, bounce bird off
        birdHealth -= ( topPipeRect.bottom - birdRect.y );
        score -= 1;
        birdAcceleration = 0;
        birdFallSpeed = 3.55;
        sparks.style.setProperty( '--display-sparks', 'block' );
        sparks.style.setProperty( '--spark-animation', '5' );
        sparks.style.top = birdTop + 'px';
      }
      // detect bird bottom hitting top of bottom pipe
      if( birdRect.bottom > bottomPipeRect.y ) {
        // damage bird, reduce score, bounce bird off
        birdHealth -= ( birdRect.bottom - bottomPipeRect.y );
        score -= 1;
        birdAcceleration = -3.55;
        birdFallSpeed = 0;
        sparks.style.setProperty( '--display-sparks', 'block' );
        sparks.style.setProperty( '--spark-animation', '5' );
        sparks.style.top = birdTop + 'px';
      }
    }

    // display health and check for death
    healthDisplay.innerText = Math.trunc( 100 - birdHealth );
    if( birdHealth <= 0 ) {
      gameOver();
      return;
    }

    // detect pipe going past bird to remove it
    if( topPipeRect.x <= 10 || bottomPipeRect.x <= 10 ) {
      pipesContainer.removeChild( topPipe );
      pipesContainer.removeChild( bottomPipe );
      pipes.shift();

      // TODO:  reuse pipes instead of removing them
      // by placing them back at the right side

      // increase score as pipes get past bird
      score += 10;
      scoreDisplay.innerText = score;
    }

    // animate pipe moving to the left
    topPipe.style.left = ( topPipeRect.x - pipeSpeed ) + 'px';
    bottomPipe.style.left = ( bottomPipeRect.x - pipeSpeed ) + 'px';
  }

  // proceed to next frame
  requestAnimationFrame( gameLoop );
}

function gameOver() {
  clearInterval( pipeInterval );
  bird.style.setProperty( '--bird-animation', 0 );
  gameContainer.style.setProperty('--background-scrolling', 0 );

  restartButton.style.display = 'block';
  restartButton.addEventListener( 'click', function () {
    location.reload();
  } );
}

startGame();
requestAnimationFrame( gameLoop );