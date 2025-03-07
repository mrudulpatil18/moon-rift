package msp.runner.controller;

import msp.runner.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoomController {

    private final RoomService roomCreationService;

    public RoomController(RoomService roomCreationService) {
        this.roomCreationService = roomCreationService;
    }

    @CrossOrigin
    @PostMapping("/room/create")
    public String createRoom() {
        return roomCreationService.createRoom();
    }

}
