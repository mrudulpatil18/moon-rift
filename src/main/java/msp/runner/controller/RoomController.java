package msp.runner.controller;

import msp.runner.service.GameService;
import msp.runner.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoomController {

    private final RoomService roomCreationService;
    private final GameService gameService;

    public RoomController(RoomService roomCreationService, GameService gameService) {
        this.roomCreationService = roomCreationService;
        this.gameService = gameService;
    }

    @CrossOrigin
    @PostMapping("/room/create")
    public String createRoom() {
        String roomId = roomCreationService.createRoom();
        gameService.addGame(roomId);
        return roomId;
    }

}
