package msp.runner.model;

import java.util.ArrayList;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Cell {
    private Coordinate cords;
    private ArrayList<Coordinate> neighbours;
    private ArrayList<Coordinate> edges;

    Cell(int x, int y){
        this.cords = new Coordinate(x, y);
        this.neighbours = new ArrayList<>();
        this.edges = new ArrayList<>();
    }

    public boolean isEdge(Coordinate c){
        for(Coordinate n : edges){
            if(n.x() == c.x() && n.y() == c.y()){
                return true;
            }
        }
        return false;
    }

    public void addEdge(Coordinate x){
        this.edges.add(x);
    }
}
