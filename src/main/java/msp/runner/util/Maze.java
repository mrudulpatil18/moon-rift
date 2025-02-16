package msp.runner.util;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Maze {
    private int width;
    private int height;
    private Cell[][] grid;
    private Coordinate start;
    private Coordinate end;

    public Maze(int width, int height) {
        this.width = width;
        this.height = height;
        this.grid = new Cell[width][height];

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                Cell c = new Cell(i, j);
                grid[i][j] = c;
            }
        }

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                ArrayList<Coordinate> n = new ArrayList<>();
                if (i > 0) {
                    n.add(grid[i - 1][j].getCords());
                }
                if (j > 0) {
                    n.add(grid[i][j - 1].getCords());
                }
                if (i < width - 1) {
                    n.add(grid[i + 1][j].getCords());
                }
                if (j < height - 1) {
                    n.add(grid[i][j + 1].getCords());
                }
                grid[i][j].setNeighbours(n);
            }
        }
    }

    public void setStart(int x, int y) {
        this.start = grid[x][y].getCords();
    }

    public Cell getCell(int x, int y) {
        return grid[x][y];
    }

    public Cell getCell(Coordinate a) {
        return grid[a.x()][a.y()];
    }

    public void carveEdge(Coordinate a, Coordinate b) {
        Cell x = getCell(a);
        Cell y = getCell(b);
        x.addEdge(b);
        y.addEdge(a);
    }

    public ArrayList<Coordinate> getNeighbours(Coordinate a) {
        return getCell(a).getNeighbours();
    }

    public List<Edge> getAllEdges() {
        Set<Edge> edges = new HashSet<>();
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                Cell c = grid[i][j];
                for (Coordinate cord : c.getEdges()) {
                    Edge e1 = new Edge(c.getCords(), cord);
                    Edge e2 = new Edge(cord, c.getCords());
                    if (!edges.contains(e1) && !edges.contains(e2)) {
                        edges.add(e1);
                    }
                }
            }
        }
        return edges.stream().toList();
    }

    public void printMaze() {
        System.out.println("height: " + height + " width: " + width);
        System.out.println("Start Cell: " + start);
        System.out.println("End Cell: " + end);
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                Cell c = grid[j][i];
                System.out.print(c.getCords());
                if (j + 1 <= width && c.getEdges().contains(new Coordinate(j + 1, i))) {
                    System.out.print(" - ");
                } else {
                    System.out.print("   ");
                }
            }
            System.out.print("\n");
            for (int j = 0; j < width; j++) {
                Cell c = grid[j][i];
                if (i + 1 <= height && c.getEdges().contains(new Coordinate(j, i + 1))) {
                    System.out.print("  |     ");
                } else {
                    System.out.print("        ");
                }
            }
            System.out.print("\n");
        }
    }

}
