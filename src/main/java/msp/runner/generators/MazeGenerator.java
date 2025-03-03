package msp.runner.generators;

import msp.runner.model.Maze;

public interface MazeGenerator {
    
    Maze generateMaze(int width, int height);
}
