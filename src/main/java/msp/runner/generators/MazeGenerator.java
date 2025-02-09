package msp.runner.generators;

import msp.runner.util.Maze;

public interface MazeGenerator {
    
    Maze generateMaze(int width, int height);
}
