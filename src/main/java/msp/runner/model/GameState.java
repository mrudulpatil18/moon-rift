package msp.runner.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameState {
    Maze maze;
    List<PlayerMove> playerMoves = new CopyOnWriteArrayList<>();
    int level = 5;

    public Coordinate getLastPosition() {
        if(maze == null) return null;
        return playerMoves.isEmpty() ? maze.getStart() : playerMoves.get(playerMoves.size() - 1).getTo();
    }

    boolean isMazeSolved(){
        Coordinate currPos = getLastPosition();
        return currPos.x() == maze.getEnd().x() && currPos.y() == maze.getEnd().y();
    }

    // true if successful , false if unsuccessful
    public boolean updateState(PlayerMove playerMove) {
        if(isValidMove(playerMove)){
            playerMoves.add(playerMove);
            return true;
        }
        return false;
    }

    private boolean isValidMove(PlayerMove playerMove){
        //check if move is within the maze bounds
        Coordinate from = playerMove.getFrom();
        Coordinate to = playerMove.getTo();
        if(from.x() >= maze.getWidth() || from.y() >= maze.getHeight() || from.x() < 0 || from.y() < 0){
            return false;
        }

        if(to.x() >= maze.getWidth() || to.y() >= maze.getHeight() || to.x() < 0 || to.y() < 0) {
            return false;
        }

        //check if current pos is FROM
        Coordinate currPos = playerMoves.isEmpty() ? maze.getStart() : playerMoves.get(playerMoves.size() - 1).getTo();
        if(currPos.x() != from.x() || currPos.y() != from.y()){
            return false;
        }

        //if TO has edge from FROM
        return maze.getCell(playerMove.getFrom()).isEdge(playerMove.getTo());
    }
}
