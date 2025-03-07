package msp.runner.websocket;

import msp.runner.service.RoomService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    public static Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();
    private final RoomService roomService;

    WebSocketHandler(RoomService roomService) {
        this.roomService = roomService;
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
            sessions.put(roomId, new HashSet<>());
        }
        sessions.get(roomId).add(session);

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
        if(sessions.containsKey(roomId)) {
            for(WebSocketSession session1 : sessions.get(roomId)) {
                if(session1 != session) {
                    session1.sendMessage(new TextMessage(message.getPayload()));
                }
            }
        }
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
