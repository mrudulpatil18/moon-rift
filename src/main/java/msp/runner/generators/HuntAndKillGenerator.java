package msp.runner.generators;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.NoArgsConstructor;
import msp.runner.model.Coordinate;
import msp.runner.model.Maze;

@NoArgsConstructor
public class HuntAndKillGenerator implements MazeGenerator {
    @Override
    public Maze generateMaze(int width, int height) {
        Set<Coordinate> visited = new HashSet<>();
        Set<Coordinate> nonVisited = initializeNonVisited(width, height);
        Maze maze = new Maze(width, height);
        
        // Start from random cell
        Coordinate currentCell = getRandomCell(width, height);
        maze.setStart(currentCell);
        visited.add(currentCell);
        nonVisited.remove(currentCell);

        while (!nonVisited.isEmpty()) {
            // Walk phase - keep walking until no unvisited neighbors
            while (true) {
                List<Coordinate> unvisitedNeighbors = getUnvisitedNeighbors(maze, currentCell, visited);
                if (unvisitedNeighbors.isEmpty()) {
                    break;
                }
                
                Coordinate nextCell = getRandomElement(unvisitedNeighbors);
                maze.carveEdge(currentCell, nextCell);
                visited.add(nextCell);
                nonVisited.remove(nextCell);
                currentCell = nextCell;
            }

            // Hunt phase - find an unvisited cell with at least one visited neighbor
            Coordinate huntResult = hunt(maze, nonVisited, visited);
            if (huntResult == null) {
                break; // No valid cells found during hunt - maze is complete
            }
            
            // Connect the hunted cell to a random visited neighbor
            List<Coordinate> visitedNeighbors = getVisitedNeighbors(maze, huntResult, visited);
            Coordinate connectTo = getRandomElement(visitedNeighbors);
            maze.carveEdge(huntResult, connectTo);
            
            visited.add(huntResult);
            nonVisited.remove(huntResult);
            currentCell = huntResult;
        }
        maze.setEnd(getFarthestCellCoordinates(maze, width, height));
        return maze;
    }

    private Coordinate getFarthestCellCoordinates(Maze m, int width, int height) {
        Coordinate start = m.getStart();
        java.util.Queue<Coordinate> queue = new java.util.LinkedList<>();
        Map<Coordinate, Integer> distances = new HashMap<>();
        Set<Coordinate> visited = new HashSet<>();
    
        queue.add(start);
        distances.put(start, 0);
        visited.add(start);
    
        while (!queue.isEmpty()) {
            Coordinate current = queue.poll();
            int currentDistance = distances.get(current);
            List<Coordinate> neighbors = m.getCell(current).getEdges();
            
            for (Coordinate neighbor : neighbors) {
                if (!visited.contains(neighbor)) {
                    queue.add(neighbor);
                    visited.add(neighbor);
                    distances.put(neighbor, currentDistance + 1);
                }
            }
        }
    
        // Find the cell with maximum distance
        return Collections.max(distances.entrySet(), Map.Entry.comparingByValue()).getKey();
    }
    

    private Set<Coordinate> initializeNonVisited(int width, int height) {
        Set<Coordinate> nonVisited = new HashSet<>();
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                nonVisited.add(new Coordinate(x, y));
            }
        }
        return nonVisited;
    }

    private Coordinate getRandomCell(int width, int height) {
        int x = (int) (Math.random() * width);
        int y = (int) (Math.random() * height);
        return new Coordinate(x, y);
    }

    private List<Coordinate> getUnvisitedNeighbors(Maze maze, Coordinate cell, Set<Coordinate> visited) {
        return maze.getNeighbours(cell).stream()
                .filter(neighbor -> !visited.contains(neighbor))
                .collect(Collectors.toList());
    }

    private List<Coordinate> getVisitedNeighbors(Maze maze, Coordinate cell, Set<Coordinate> visited) {
        return maze.getNeighbours(cell).stream()
                .filter(visited::contains)
                .collect(Collectors.toList());
    }

    private Coordinate hunt(Maze maze, Set<Coordinate> nonVisited, Set<Coordinate> visited) {
        return nonVisited.stream()
                .filter(cell -> !getVisitedNeighbors(maze, cell, visited).isEmpty())
                .findFirst()
                .orElse(null);
    }

    private <T> T getRandomElement(List<T> list) {
        return list.get((int) (Math.random() * list.size()));
    }
}