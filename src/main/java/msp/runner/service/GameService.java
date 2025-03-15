package msp.runner.service;

import lombok.Getter;
import lombok.NoArgsConstructor;
import msp.runner.dtos.MazeDTO;
import msp.runner.generators.HuntAndKillGenerator;
import msp.runner.generators.MazeGenerator;
import msp.runner.model.*;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Service
@NoArgsConstructor
public class GameService {
    Map<String, Game> activeGames = new ConcurrentHashMap<>();
    MazeGenerator mazeGenerator = new HuntAndKillGenerator();

    public void addGame(String roomId) {
        activeGames.put(roomId, new Game(roomId));
    }

    public ServerMessage handleMove(String roomId, PlayerMove playerMove) {
        if(activeGames.get(roomId).updatePlayer1State(playerMove)){
            if(activeGames.get(roomId).isMazeSolved()){
                return ServerMessage.UPDATE_MAZE_LEVEL;
            }
            return null;
        }
        return ServerMessage.INVALID_MOVE;
    }

    public MazeDTO generateNewLevel(String roomId) {
        GameState player1State = activeGames.get(roomId).getPlayer1State();
        int dimension = player1State.getLevel() + 1;
        Coordinate startCoordinate = null;
        if(player1State.getLastPosition() != null){
            startCoordinate = player1State .getLastPosition();
        }
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension, startCoordinate);
        player1State.setLevel(dimension);
        maze.printMaze();
        player1State.setMaze(maze);
        return new MazeDTO(maze);
    }

    public MazeDTO generateSameLevel(String roomId) {
        GameState player1State = activeGames.get(roomId).getPlayer1State();
        int dimension = activeGames.get(roomId).getPlayer1State().getLevel() ;
        Coordinate startCoordinate = null;
        if(player1State.getLastPosition() != null){
            startCoordinate = player1State .getLastPosition();
        }
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension, startCoordinate);
        maze.printMaze();
        player1State.setMaze(maze);
        return new MazeDTO(maze);
    }
}
