package msp.runner.dtos;

import lombok.Getter;
import lombok.Setter;
import msp.runner.model.Cell;
import msp.runner.model.Coordinate;
import msp.runner.model.Maze;

@Getter
@Setter
public class MazeDTO {
    int width;
    int height;
    int startX;
    int startY;
    int endX;
    int endY;
    int [][]wallH;
    int [][]wallV;

    public MazeDTO(Maze m) {

        this.width = m.getWidth();
        this.height = m.getHeight();

        wallH = new int[width][height];
        wallV = new int[width][height];

        startX = m.getStart().x();
        startY = m.getStart().y();
        endX = m.getEnd().x();
        endY = m.getEnd().y();

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                wallH[i][j] = 1;
                wallV[i][j] = 1;
            }
        }

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                Cell c = m.getGrid()[x][y];
                if (c.getEdges().contains(new Coordinate(x, y + 1))) {
                    wallH[x][y] = 0;
                }
                if (c.getEdges().contains(new Coordinate(x + 1, y))) {
                    wallV[x][y] = 0;
                }
            }
        }
    }
}