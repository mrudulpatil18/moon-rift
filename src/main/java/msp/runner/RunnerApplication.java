package msp.runner;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RunnerApplication {

	public static void main(String[] args) {
		SpringApplication.run(RunnerApplication.class, args);
	}

}



//TODO:
//	1. GOOOD JOB ❌
//  3. ❌❌❌❌sockets with STOMP ?????????? ❌

//TODO ui: 
// convert to typescript ✅
// getNextPaths ✅
// allow movement with nextPaths ✅
// game logic :
//        1. establish sockets
//        2. send and validate a move in backend ???? UNNECESSARY ?????
//               possible reasons: anti-cheat -- not required, multiplayer intereaction ? maybe
//        3. lobby creation, multiplayer
// smooth movements
// 3d maze
// better orbs with light and trails
