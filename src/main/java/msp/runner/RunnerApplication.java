package msp.runner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import msp.runner.generators.HuntAndKillGenerator;
import msp.runner.generators.MazeGenerator;
import msp.runner.util.Maze;

@SpringBootApplication
public class RunnerApplication {

	public static void main(String[] args) {
		SpringApplication.run(RunnerApplication.class, args);

		MazeGenerator g = new HuntAndKillGenerator();
		Maze m = g.generateMaze(5, 5);
		if(m != null){
			System.out.println("DONE");
		}
	}

}
