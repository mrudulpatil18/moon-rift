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

    public void addPlayer(String roomId, String sessionId) {
        Game game = activeGames.get(roomId);
        if(game.getPlayer1SessionId() == null) {
            game.setPlayer1SessionId(sessionId);
        }else if(game.getPlayer2SessionId() == null) {
            game.setPlayer2SessionId(sessionId);
        }
    }

    public ServerMessage handleMove(String roomId, PlayerMove playerMove, String sessionId) {
        if(activeGames.get(roomId).updatePlayerState(playerMove, sessionId)){
            if(activeGames.get(roomId).isMazeSolved(sessionId)){
                return activeGames.get(roomId).getPlayerMazeLevel(sessionId) == 6 ? ServerMessage.GAME_OVER_WIN :  ServerMessage.UPDATE_MAZE_LEVEL;
            }
            return null;
        }
        return ServerMessage.INVALID_MOVE;
    }

    public MazeDTO generateNewLevel(String roomId, String sessionId) {

        GameState playerState = sessionId.equals(activeGames.get(roomId).getPlayer1SessionId()) ? activeGames.get(roomId).getPlayer1State() : activeGames.get(roomId).getPlayer2State();
        int dimension = playerState.getLevel() + 1;
        Coordinate startCoordinate = null;
        if(playerState.getLastPosition() != null){
            startCoordinate = playerState.getLastPosition();
        }
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension, startCoordinate);
        playerState.setLevel(dimension);
//        maze.printMaze();
        playerState.setMaze(maze);
        return new MazeDTO(maze);
    }

    public MazeDTO generateSameLevel(String roomId, String sessionId) {
        GameState playerState = sessionId.equals(activeGames.get(roomId).getPlayer1SessionId()) ? activeGames.get(roomId).getPlayer1State() : activeGames.get(roomId).getPlayer2State();
        int dimension = playerState.getLevel();
        Coordinate startCoordinate = null;
        if(playerState.getLastPosition() != null){
            startCoordinate = playerState .getLastPosition();
        }
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension, startCoordinate);
//        maze.printMaze();
        playerState.setMaze(maze);
        return new MazeDTO(maze);
    }
}
