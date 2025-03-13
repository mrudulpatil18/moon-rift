package msp.runner.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class Game {
    String roomId;
    GameState player1State;

    public Game(String roomId) {
        this.roomId = roomId;
        this.player1State = new GameState();
    }

    public boolean updatePlayer1State(PlayerMove playerMove) {
        return player1State.updateState(playerMove);
    }

    public boolean isMazeSolved() {
        return player1State.isMazeSolved();
    }


}
