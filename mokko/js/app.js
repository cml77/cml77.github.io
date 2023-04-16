document.addEventListener('DOMContentLoaded', () => {
    // width:height 8:9 todo
    const GRID_WIDTH = 8
    const GRID_HEIGHT = 20
    const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT

    // no need to type 9*8 divs :)
    const grid = createGrid();
    let squares = Array.from(grid.querySelectorAll('div'))
    const startBtn = document.querySelector('.button')
    const hamburgerBtn = document.querySelector('.toggler')
    const menu = document.querySelector('.menu')
    const span = document.getElementsByClassName('close')[0]
    const scoreDisplay = document.querySelector('.score-display')
    //level
    const linesDisplay = document.querySelector('.lines-score')
    let currentIndex = 0
    let currentRotation = 0
    const width = 10
    let score = 0
    let lines = 0
    unpause()
    let nextRandom = 0
    const colors = [
        'url(images/blue_block.png)',
        'url(images/pink_block.png)',
        'url(images/purple_block.png)',
        'url(images/peach_block.png)',
        'url(images/yellow_block.png)'
    ]

    //mokko slide
    //initial pieces on bottom lines depend on level: level:num of lines 1:2, 2:3, 3:4, 4:4 etc
    const levelLines = [2, 3, 4]
    //initial level num, will be displayed as level 1, 2 etc 
    let level = 0

    function createGrid() {
        // the main grid
        let grid = document.querySelector(".grid")
        for (let i = 0; i < GRID_SIZE; i++) {
            let gridElement = document.createElement("div")
            grid.appendChild(gridElement)
        }

        // set base of grid
        for (let i = 0; i < GRID_WIDTH; i++) {
            let gridElement = document.createElement("div")
            gridElement.setAttribute("class", "block3")
            grid.appendChild(gridElement)
        }

        let previousGrid = document.querySelector(".previous-grid")
        // Since 16 is the max grid size in which all the Tetrominoes 
        // can fit in we create one here
        for (let i = 0; i < 16; i++) {
            let gridElement = document.createElement("div")
            previousGrid.appendChild(gridElement);
        }
        return grid;
    }

    //generate random numbers 1 to 4 with probabilities  .5,  .4,  .3,  .2
    function randomWithProbability() {
        const notRandomNumbers = [1, 1, 1,  
                                2, 2, 2, 2, 2, 2,
                                3, 3,  
                                4];
        let idx = Math.floor(Math.random() * notRandomNumbers.length);
        return notRandomNumbers[idx];
    }

    //assign functions to keycodes
    function control(e) {
        if (e.keyCode === 39)
            moveright()
        else if (e.keyCode === 38)
            rotate()
        else if (e.keyCode === 37)
            moveleft()
        else if (e.keyCode === 40)
            moveDown()
    }

    // the classical behavior is to speed up the block if down button is kept pressed so doing that
    document.addEventListener('keydown', control)

    //The Tetrominoes
    const lTetromino = [
        [0],
        [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, 2],
        [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 2],
        [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 2],
        [GRID_WIDTH, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1, GRID_WIDTH * 2 + 2]
    ]

    const zTetromino = [
        [0, 1],
        [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
        [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1],
        [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
        [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1]
    ]

    /*     const sTetromino = [
            [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1],
            [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
            [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1],
            [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1]
        ]
     */
    const tTetromino = [
        [0, 1, 2],
        [1, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2],
        [1, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 1],
        [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 1],
        [1, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1]
    ]

    const oTetromino = [
        [0, 1, 2, 3],
        [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
        [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
        [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
        [0, 1, GRID_WIDTH, GRID_WIDTH + 1]
    ]

    const iTetromino = [
        [0, 1, 2, 3, 4],
        [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 3 + 1],
        [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH + 3],
        [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 3 + 1],
        [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH + 3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, /* sTetromino,  */tTetromino, oTetromino, 
        /* iTetromino */]

    //Randomly Select Tetromino
    // let random = Math.floor(Math.random() * theTetrominoes.length)
    let random = randomWithProbability()-1
    let current = theTetrominoes[random][currentRotation]
    let pieceIndex = 0
    const pieceArray = [0,1,2,3,4] 
    generateBottomLine()
    function generateBottomLine() {
        for (let i = 0; i < /* 4 *  */GRID_WIDTH; ) {
            if(Math.floor(Math.random()*3)==0) {
                // let curr = pieceArray.slice(0, random+1)
                pieceIndex++
                // (currentPosition + index) % GRID_WIDTH >= GRID_WIDTH - dx)
                while(i % GRID_WIDTH > GRID_WIDTH - (random+1)) i++
                pieceArray.slice(0, random+1).forEach(index => {    
                    squares[i+index].id = pieceIndex
                    squares[i+index].classList.add('block')
                    // squares[i+index].style.backgroundImage = colors[random]
                    squares[i+index].style.backgroundImage = colors[i % colors.length]
                })
                i+=(random+1)
            } else {
                i++
            }

            random = randomWithProbability()-1
        }
    }

    //move the Tetromino moveDown
    let currentPosition = 4
    //draw the shape
    function draw(i) {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('block')
            squares[currentPosition + index].draggable = true;
            squares[currentPosition + index].addEventListener('dragstart', dragStart)
            squares[currentPosition + index].addEventListener('dragend', dragEnd)
            squares[currentPosition + index].addEventListener('drag', dragMove)
            squares[currentPosition + index].style.backgroundImage = colors[i % colors.length]
            squares[currentPosition + index].id = String(i)
        })
    }

    /* function getColor(i) {
        return 
    } */

    //undraw the shape
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('block')
            squares[currentPosition + index].classList.remove('block2')
            squares[currentPosition + index].draggable = false;
            squares[currentPosition + index].removeEventListener('dragstart', dragStart)
            squares[currentPosition + index].removeEventListener('dragend', dragEnd)
            squares[currentPosition + index].removeEventListener('drag', dragMove)
            squares[currentPosition + index].style.backgroundImage = 'none'
            squares[currentPosition + index].id = null
        })
    }

    let startX
    var dragged = null;
    function dragStart(e) {
        timerId = null
        startX = e.pageX;
        dragged = e.target;
        console.log('drag started');
        document.querySelectorAll("div[id='"+dragged.id+"']")
            .forEach(div => div.classList.add('dragging'))
    }
    function dragEnd(e) {
        let dx = Math.round((e.pageX - startX) / grid_width)
        //console.log('drag ended ', dx);
        dragged = e.target
        current = pieceArray.slice(0, document.querySelectorAll("div[id='"+dragged.id+"']").length)
        currentPosition = squares.findIndex(div => div.id === dragged.id);
        document.querySelectorAll("div[id='"+dragged.id+"']")
            .forEach(div => div.classList.remove('dragging'))
        
        let moved=false    
        if(dx>0) {
            moved=moveright(dx)
        } else if(dx<0) {
            moved=moveleft(dx)
        }
        freeze()
        if(moved) {
            generateBottomLine()
        }
        unpause()
    }
    const grid_width = document.querySelector('.grid').offsetWidth/width
    function dragMove(e) {
        console.log(Math.round((e.pageX - startX) / grid_width));
    }

    //move down on loop
    function moveDown() {
        if(!timerId) return
        
        let moved=false
        for (let i = 0; i <= pieceIndex; i++) {
            let numOfPeices = document.querySelectorAll("div[id='"+i+"']").length
            if (numOfPeices==0) continue
            current = pieceArray.slice(0, numOfPeices)
            currentPosition = squares.findIndex(div => div.id === String(i));
            undraw()
            
            if (!(current.some(index => squares[currentPosition + index + GRID_WIDTH].classList.contains('block3')
                || squares[currentPosition + index + GRID_WIDTH].classList.contains('block2')))) {
                    currentPosition = currentPosition += GRID_WIDTH
                    moved=true
            }
            console.log(currentPosition+':'+i)

            draw(i)
            freeze()
        }
        if(!moved) {
            timerId = null
        }
    }

    function moveUp(pos) {
        undraw()
        pos = pos += GRID_WIDTH
        draw()
        freeze()
    }

    function unpause() {
        timerId = setInterval(moveDown, 100)        
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            //draw()
            //timerId = setInterval(moveDown, 50)
            unpause()
            // nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            nextRandom = randomWithProbability()-1
            displayShape()
        }
    })

    //move left and prevent collisions with shapes moving left
    function moveright(dx) {
        let startPos=currentPosition
        let id = squares[currentPosition].id
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % GRID_WIDTH >= GRID_WIDTH - dx)
        if (!isAtRightEdge) currentPosition += dx
        if (current.some(index => squares[currentPosition + index].classList.contains('block2'))) {
            currentPosition -= dx
        }
        draw(id)
        return startPos!=currentPosition
    }

    //move right and prevent collisions with shapes moving right
    function moveleft(dx) {
        let startPos=currentPosition
        let id = squares[currentPosition].id
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % GRID_WIDTH < -dx)
        if (!isAtLeftEdge) currentPosition += dx
        if (current.some(index => squares[currentPosition + index].classList.contains('block2'))) {
            currentPosition -= dx
        }
        draw(id)
        return startPos!=currentPosition
    }

    let tempCurrPosition
    //freeze the shape
    function freeze() {
        // if block has settled
        if (current.some(index => squares[currentPosition + index + GRID_WIDTH].classList.contains('block3')
            || squares[currentPosition + index + GRID_WIDTH].classList.contains('block2'))) {
            // make it block2
            current.forEach(index => squares[index + currentPosition].classList.add('block2'))
            // tempCurrPosition = currentPosition
            addScore()
            // currentPosition = tempCurrPosition 
            /* pieceIndex++
            current.forEach(index => squares[index + currentPosition].id = pieceIndex) */
            // start a new tetromino falling
            /* 
            random = nextRandom
            // nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            nextRandom = randomWithProbability()-1
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            gameOver()*/
        }
    }
    freeze()

    //Rotate the Tetromino
    function rotate() {
        undraw()
        currentRotation++
        if (currentRotation === current.length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        draw()
    }

    //Game Over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('block2'))) {
            scoreDisplay.innerHTML = 'end'
            clearInterval(timerId)
        }
    }

    //show previous tetromino in scoreDisplay
    const displayWidth = 4
    const displaySquares = document.querySelectorAll('.previous-grid div')
    let displayIndex = 0

    const smallTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], /* lTetromino */
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], /* zTetromino */
        [1, displayWidth, displayWidth + 1, displayWidth + 2], /* tTetromino */
        [0, 1, displayWidth, displayWidth + 1], /* oTetromino */
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] /* iTetromino */
    ]

    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('block')
            square.style.backgroundImage = 'none'
        })
        smallTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('block')
            displaySquares[displayIndex + index].style.backgroundImage = colors[nextRandom]
        })
    }

    //Add score
    function addScore() {
        //timerId = null
        let linesGenerated = 0
        for (currentIndex = 0; currentIndex < GRID_SIZE; currentIndex += GRID_WIDTH) {
            const row = [currentIndex, currentIndex + 1, currentIndex + 2, currentIndex + 3, 
                currentIndex + 4, currentIndex + 5, currentIndex + 6, currentIndex + 7, 
                /* currentIndex + 8, currentIndex + 9 */]
            if (row.every(index => squares[index].classList.contains('block2'))) {
                score += 10
                lines += 1
                scoreDisplay.innerHTML = score
                linesDisplay.innerHTML = lines
                row.forEach(index => {
                    // disappearBackgroundImage(squares[index])
                    squares[index].style.backgroundImage = 'none'
                    squares[index].classList.remove('block2') || squares[index].classList.remove('block')
                    squares[index].id = null

                })
                //splice array
                /* const squaresRemoved = squares.splice(currentIndex, GRID_WIDTH)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell)) */
                linesGenerated++
            }
        }
        /* if(linesGenerated>0) {
            generateBottomLine()
        } */
        //unpause()
    }

    async function disappearBackgroundImage(div) {
        //let div = document.getElementById("myDiv");
        let opacity = 1;
        let disappear = setInterval(function () {
            if (opacity > 0) {
                opacity -= 0.1;
                div.style.backgroundImage = `linear-gradient(rgba(255,255,255,${opacity}), rgba(255,255,255,${opacity})), url('your-image.jpg')`;
            } else {
                clearInterval(disappear);
                div.style.backgroundImage = 'none'
                unpause()
            }
        }, 100);
    }

    function disappearImage(image) {
        image.style.opacity = 1;
        let disappear = setInterval(function () {
            if (image.style.opacity > 0) {
                image.style.opacity -= 0.1;
            } else {
                clearInterval(disappear);
                image='none'
            }
        }, 10);
    }

    //Styling eventListeners
    hamburgerBtn.addEventListener('click', () => {
        menu.style.display = 'flex'
    })
    span.addEventListener('click', () => {
        menu.style.display = 'none'
    })
    
    menu.style.display = 'none'

})