package msp.runner.controller;

import msp.runner.service.RoomCreationService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoomController {

    private final RoomCreationService roomCreationService;

    public RoomController(RoomCreationService roomCreationService) {
        this.roomCreationService = roomCreationService;
    }

    @CrossOrigin
    @PostMapping("/room/create")
    public String createRoom() {
        return roomCreationService.generateUniqueRoom();
    }

}
