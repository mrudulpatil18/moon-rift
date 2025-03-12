package msp.runner.service;

import lombok.Getter;
import lombok.NoArgsConstructor;
import msp.runner.dtos.MazeDTO;
import msp.runner.generators.HuntAndKillGenerator;
import msp.runner.generators.MazeGenerator;
import msp.runner.model.Game;
import msp.runner.model.Maze;
import msp.runner.model.PlayerMove;
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

    public boolean handleMove(String roomId, PlayerMove playerMove) {
        return activeGames.get(roomId).updatePlayer1State(playerMove);
    }

    public MazeDTO generateNewLevel(String roomId) {
        int dimension = activeGames.get(roomId).getPlayer1State().getLevel() + 1;
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension);
        activeGames.get(roomId).getPlayer1State().setLevel(dimension);
        maze.printMaze();
        activeGames.get(roomId).getPlayer1State().setMaze(maze);
        return new MazeDTO(maze);
    }

    public MazeDTO generateSameLevel(String roomId) {
        int dimension = activeGames.get(roomId).getPlayer1State().getLevel() ;
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension);
        maze.printMaze();
        return new MazeDTO(maze);
    }
}
