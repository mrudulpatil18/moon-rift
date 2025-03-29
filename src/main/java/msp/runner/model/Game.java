package msp.runner.model;

import jakarta.websocket.Session;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class Game {
    String roomId;
    GameState player1State;
    GameState player2State;
    String player1SessionId;
    String player2SessionId;


    public Game(String roomId) {
        this.roomId = roomId;
        this.player1State = new GameState();
        this.player2State = new GameState();
    }

    public boolean updatePlayerState(PlayerMove playerMove, String sessionId) {
        if(player1SessionId.equals(sessionId)) {
            return player1State.updateState(playerMove);
        }
        return player2State.updateState(playerMove);
    }

    public boolean isMazeSolved(String sessionId) {
        if(player1SessionId.equals(sessionId)) {
            return player1State.isMazeSolved();
        }
        return player2State.isMazeSolved();
    }


}
