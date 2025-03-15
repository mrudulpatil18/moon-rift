package msp.runner.controller;

import msp.runner.service.GameService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import msp.runner.generators.HuntAndKillGenerator;
import msp.runner.generators.MazeGenerator;
import msp.runner.model.Maze;
import msp.runner.dtos.MazeDTO;


@RestController
public class MazeController {
    @CrossOrigin
    @GetMapping("/maze")
    public MazeDTO getNewMaze(@RequestParam Integer dimension, @RequestParam String roomId) {
        MazeGenerator mazeGenerator = new HuntAndKillGenerator();
        Maze maze =  mazeGenerator.generateMaze(dimension, dimension, null);
        maze.printMaze();
        return new MazeDTO(maze);
    }

}
