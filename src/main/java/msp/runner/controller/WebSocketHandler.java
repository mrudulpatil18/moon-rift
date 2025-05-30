package msp.runner.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import msp.runner.model.*;
import msp.runner.service.GameService;
import msp.runner.service.RoomService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    public static Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();
    private final RoomService roomService;
    private final GameService gameService;
    private final ObjectMapper objectMapper;

    WebSocketHandler(RoomService roomService, GameService gameService, ObjectMapper objectMapper) {
        this.roomService = roomService;
        this.gameService = gameService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = getRoomFromSessionUrl(session);

        if(roomId == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            throw new Exception("Invalid room");
        }
        if(sessions.containsKey(roomId) && sessions.get(roomId).size() >= 2) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            throw new Exception("Room already in use");
        }
        if(!sessions.containsKey(roomId)) {
            //first player
            sessions.put(roomId, new HashSet<>());

        }
        sessions.get(roomId).add(session);
        gameService.addPlayer(roomId, session.getId());//to set player1 and player2 session ID

        if(sessions.get(roomId).size() == 2) {
            System.out.println("Sending START_GAME");
            sessions.get(roomId).forEach(socketSession -> {
                try {
                    socketSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(ServerMessage.START_GAME)));
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        }

//        PlayerMove playerMoveDTO = new PlayerMove(new Coordinate(10,20), new Coordinate(5, 0));
//        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(playerMoveDTO)));
//        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(new Status(PlayerStatus.GET_MAZE_NEW_LEVEL))));

        super.afterConnectionEstablished(session);
    }

    String getRoomFromSessionUrl(WebSocketSession session) {
        String roomId = session.getUri().getQuery().replace("room=", "");
        return roomService.isValidRoom(roomId) ? roomId : null;

    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomId = getRoomFromSessionUrl(session);
        if(roomId == null) {
            throw new Exception("Invalid room");
        }
        String jsonString = message.getPayload();
        JsonNode jsonNode = objectMapper.readTree(jsonString);

        if (jsonNode.has("statusMessage")) {
            Status status = objectMapper.readValue(message.getPayload(), Status.class);
            // ... use type1
            switch (status.getStatusMessage()){
                case GET_MAZE_NEW_LEVEL -> session.sendMessage(new TextMessage(objectMapper.writeValueAsString(gameService.generateNewLevel(roomId, session.getId()))));
                case GET_MAZE_SAME_LEVEL -> session.sendMessage(new TextMessage(objectMapper.writeValueAsString(gameService.generateSameLevel(roomId, session.getId()))));
            }
        }
        else{
            PlayerMove playerMove = objectMapper.readValue(message.getPayload(), PlayerMove.class);
            ServerMessage moveStatus = gameService.handleMove(roomId, playerMove, session.getId());
            if(moveStatus != null) {
                System.out.println(message.getPayload());
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(moveStatus)));
            if(moveStatus == ServerMessage.UPDATE_MAZE_LEVEL){
                for(WebSocketSession session1 : sessions.get(roomId)) {
                    if(session1 != session) {
                        session1.sendMessage(new TextMessage(objectMapper.writeValueAsString(ServerMessage.RESET_MAZE)));
                    }
                }
            }
            if(moveStatus == ServerMessage.GAME_OVER_WIN){
                for(WebSocketSession session1 : sessions.get(roomId)) {
                    if(session1 != session) {
                        session1.sendMessage(new TextMessage(objectMapper.writeValueAsString(ServerMessage.GAME_OVER_LOSS)));
                    }
                }
            }}}

//        else if (jsonNode.has("type2SpecificField")) {
//            Type2 type2 = mapper.convertValue(jsonNode, Type2.class);
//            // ... use type2
//        }



//        if(sessions.containsKey(roomId)) {
//
//        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        if(status.equals(CloseStatus.NOT_ACCEPTABLE)) {
            return;
        }
        System.out.println("Session: " + session + " status: " + status);
        String roomId = getRoomFromSessionUrl(session);
        if(roomId != null) {
            roomService.removeRoom(roomId);
            for(WebSocketSession session1 : sessions.get(roomId)) {
                if(session1 != session) {
                    session1.sendMessage(new TextMessage("Opponent Left"));
                    session1.close(CloseStatus.NORMAL);
                }
            }
        }

        super.afterConnectionClosed(session, status);
    }
}
