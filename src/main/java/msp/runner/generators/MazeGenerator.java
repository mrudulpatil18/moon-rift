package msp.runner.generators;

import msp.runner.model.Coordinate;
import msp.runner.model.Maze;

public interface MazeGenerator {

    public Maze generateMaze(int width, int height, Coordinate startCoordinate);
}
