package msp.runner.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {
    private final Map<String, Instant> rooms = new ConcurrentHashMap<>();

    public String createRoom() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 5);
        } while (rooms.containsKey(code));

        rooms.put(code, Instant.now());
        System.out.println("Created room: " + code);
        return code;
    }

    public Boolean isValidRoom(String code) {
        return rooms.get(code) != null;
    }

    public void removeRoom(String code) {
          rooms.remove(code);
    }

}
