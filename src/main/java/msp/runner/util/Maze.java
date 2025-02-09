package msp.runner.util;

import java.util.ArrayList;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Maze {
    private int width;
    private int height;
    private Cell[][] grid;
    private Cell start;
    private Cell end;

    public Maze(int width, int height){
        this.width = width;
        this.height = height;
        this.grid = new Cell[width][height];

        for(int i = 0; i < width; i++){
            for(int j = 0; j < height; j++){
                Cell c = new Cell(i, j);
                grid[i][j] = c;
            }
        }

        for(int i = 0; i < width; i++){
            for(int j = 0; j < height; j++){
                ArrayList<Coordinate> n = new ArrayList<>();
                if(i > 0){n.add(grid[i-1][j].getCords());}//left
                if(j > 0){n.add(grid[i][j-1].getCords());}//up
                if(i < width-1){n.add(grid[i+1][j].getCords());}//right
                if(j < height-1){n.add(grid[i][j+1].getCords());}//down
                grid[i][j].setNeighbours(n);
            }
        }
    }

    public void setStart(int x, int y){
        this.start = grid[x][y];
    }
    
    public Cell getCell(int x, int y){
        return grid[x][y];
    }

    public Cell getCell(Coordinate a){
        return grid[a.x()][a.y()];
    }

    public void carveEdge(Coordinate a, Coordinate b){
        Cell x = getCell(a);
        Cell y = getCell(b);
        x.addEdge(b);
        y.addEdge(a);

    }

}
