/**
 * Cellular Automata Background - Conway's Game of Life
 */

class CellularAutomata {
  constructor(canvas) {
    this.canvas = canvas;
    this.type = 'conway'; // Only Conway's Game of Life
    
    // Create fixed-size internal canvas that never changes
    this.fixedSize = this.determineOptimalSize();
    
    // Set canvas to fixed dimensions that never change
    this.canvas.width = this.fixedSize.width;
    this.canvas.height = this.fixedSize.height;
    
    // Get context with alpha disabled for better performance
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
    // Set larger cell size for better performance
    this.cellSize = 8;
    
    this.isRunning = false;
    this.frameId = null;
    this.lastFrameTime = 0;
    this.frameDelay = 100; // Slightly faster for better visual
    this.backgroundColor = '#161616'; // Match content background
    this.cellColor = '#26bbd9'; // Match accent color
    
    // Counter for managing periodic pattern refreshing
    this.stepCounter = 0;
    this.refreshInterval = this.getRandomRefreshInterval();
    
    // Immediately fill with background color to prevent black flash
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Initialize with sparse meaningful patterns in 2-3 locations
    this.initializeGrid();
    this.precompute(100);

    // Render the first frame immediately to prevent flash
    this.render();
    
    // Start the animation
    this.start();
  }
  
  // Get a random refresh interval between 20 and 60 steps
  getRandomRefreshInterval() {
    return Math.floor(Math.random() * 41) + 20; // 20 to 60
  }
  
  // Determine optimal fixed size for the canvas that will look good at any screen size
  determineOptimalSize() {
    // Use a fixed aspect ratio close to most common device ratios
    const aspectRatio = 16/9;
    
    // Use a fixed resolution that's detailed enough but not too performance-heavy
    // This resolution never changes regardless of screen size
    const height = 600;
    const width = Math.floor(height * aspectRatio);
    
    return { width, height };
  }

  initializeGrid() {
    // Calculate grid dimensions based on fixed size and cellSize
    this.cols = Math.floor(this.fixedSize.width / this.cellSize);
    this.rows = Math.floor(this.fixedSize.height / this.cellSize);
    
    // Use a sparse representation for Conway's Game of Life
    this.activeCells = new Set();
    
    // Add 2-3 interesting patterns at random locations
    const numPatterns = 2 + Math.floor(Math.random() * 2); // 2 or 3
    for (let i = 0; i < numPatterns; i++) {
      this.addInterestingPattern();
    }
  }
  
  // Pre-compute a number of steps to advance the simulation
  precompute(steps) {
    for (let i = 0; i < steps; i++) {
      this.updateConway();
    }
  }

  updateConway() {
    const neighborCounts = {};
    const newActiveCells = new Set();
    
    // Count neighbors for all cells adjacent to active cells
    for (const cellKey of this.activeCells) {
      const [row, col] = cellKey.split(',').map(Number);
      
      // Check neighbors for each active cell
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          
          const r = (row + i + this.rows) % this.rows;
          const c = (col + j + this.cols) % this.cols;
          const neighborKey = `${r},${c}`;
          
          neighborCounts[neighborKey] = (neighborCounts[neighborKey] || 0) + 1;
        }
      }
    }
    
    // Apply Conway's rules
    for (const cellKey of this.activeCells) {
      const neighbors = neighborCounts[cellKey] || 0;
      
      // Cell stays alive if it has 2 or 3 neighbors
      if (neighbors === 2 || neighbors === 3) {
        newActiveCells.add(cellKey);
      }
    }
    
    // Add new cells that have exactly 3 neighbors
    for (const [cellKey, count] of Object.entries(neighborCounts)) {
      if (count === 3 && !this.activeCells.has(cellKey)) {
        newActiveCells.add(cellKey);
      }
    }
    
    // Update active cells
    this.activeCells = newActiveCells;
    
    // Increment step counter
    this.stepCounter++;
    
    // Check if we need to refresh with new patterns
    if (this.stepCounter >= this.refreshInterval) {
      // Only add new patterns if the simulation is getting sparse
      if (this.activeCells.size < 50) {
        this.addInterestingPattern();
      } else if (Math.random() < 0.1) { // 10% chance to add a new pattern anyway
        this.addInterestingPattern();
      }
      
      this.stepCounter = 0;
      this.refreshInterval = this.getRandomRefreshInterval();
    }
  }
  
  // Add a significant Conway's Game of Life pattern at a random location
  addInterestingPattern() {
    const patterns = [
      // R-pentomino (creates a lot of activity)
      [[0,1], [0,2], [1,0], [1,1], [2,1]],
      
      // Gosper glider gun (creates gliders continuously)
      [[0,24], 
       [1,22], [1,24], 
       [2,12], [2,13], [2,20], [2,21], [2,34], [2,35], 
       [3,11], [3,15], [3,20], [3,21], [3,34], [3,35], 
       [4,0], [4,1], [4,10], [4,16], [4,20], [4,21], 
       [5,0], [5,1], [5,10], [5,14], [5,16], [5,17], [5,22], [5,24], 
       [6,10], [6,16], [6,24], 
       [7,11], [7,15], 
       [8,12], [8,13]],
      
      // Lightweight spaceship (LWSS)
      [[0,1], [0,4], [1,0], [2,0], [3,0], [3,4], [4,0], [4,1], [4,2], [4,3]],
      
      // Pulsar (period 3 oscillator)
      [[2,4], [2,5], [2,6], [2,10], [2,11], [2,12],
       [4,2], [4,7], [4,9], [4,14],
       [5,2], [5,7], [5,9], [5,14],
       [6,2], [6,7], [6,9], [6,14],
       [7,4], [7,5], [7,6], [7,10], [7,11], [7,12],
       [9,4], [9,5], [9,6], [9,10], [9,11], [9,12],
       [10,2], [10,7], [10,9], [10,14],
       [11,2], [11,7], [11,9], [11,14],
       [12,2], [12,7], [12,9], [12,14],
       [14,4], [14,5], [14,6], [14,10], [14,11], [14,12]],
      
      // Glider fleet (multiple gliders)
      [[0,0], [0,4], [0,8], [0,12],
       [1,1], [1,5], [1,9], [1,13],
       [2,0], [2,1], [2,2], [2,4], [2,5], [2,6], [2,8], [2,9], [2,10], [2,12], [2,13], [2,14]],
       
      // Acorn (methuselah that evolves for a long time)
      [[0,1], [1,3], [2,0], [2,1], [2,4], [2,5], [2,6]]
    ];
    
    // Choose a random pattern
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Calculate pattern dimensions to ensure proper padding
    let maxRow = 0, maxCol = 0;
    for (const [r, c] of pattern) {
      maxRow = Math.max(maxRow, r);
      maxCol = Math.max(maxCol, c);
    }
    
    // Choose a random location with increased padding to ensure pattern fits and isn't too close to edges
    const padding = 40; // Increased padding to keep patterns away from edges
    const row = padding + Math.floor(Math.random() * (this.rows - maxRow - padding * 2));
    const col = padding + Math.floor(Math.random() * (this.cols - maxCol - padding * 2));
    
    // Add the pattern
    for (const [dr, dc] of pattern) {
      this.activeCells.add(`${row + dr},${col + dc}`);
    }
  }

  /* Rendering and Animation Loop */
  render() {
    // Clear the canvas with background color
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw cells (monochromatic)
    this.ctx.fillStyle = this.cellColor;
    
    // Single drawing path for all cells
    this.ctx.beginPath();
    for (const cellKey of this.activeCells) {
      const [row, col] = cellKey.split(',').map(Number);
      // Draw exact cells with no gaps
      this.ctx.rect(
        col * this.cellSize, 
        row * this.cellSize, 
        this.cellSize, 
        this.cellSize
      );
    }
    this.ctx.fill();
  }

  update() {
    const now = performance.now();
    if (now - this.lastFrameTime < this.frameDelay) {
      this.frameId = requestAnimationFrame(() => this.update());
      return;
    }
    
    this.lastFrameTime = now;
    
    // Update Conway's Game of Life
    this.updateConway();
    
    // Render the current state
    this.render();
    
    // Request next frame
    this.frameId = requestAnimationFrame(() => this.update());
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.frameId = requestAnimationFrame(() => this.update());
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}

// Main automata manager
class AutomataManager {
  constructor(canvas) {
    this.canvas = canvas;
    
    // Immediately fill canvas with background color to prevent flash
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Initialize Conway's Game of Life immediately
    this.automata = new CellularAutomata(canvas);
    
    // Only add visibility listener, NO resize listener
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
  }
  
  handleVisibilityChange() {
    if (document.hidden && this.automata) {
      this.automata.stop();
    } else if (this.automata) {
      this.automata.start();
    }
  }
}

export { AutomataManager }; 