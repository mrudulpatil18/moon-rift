package msp.runner.util;

public record Coordinate(int x, int y) {
    @Override
    public final String toString() {
        return "("+x+","+y+")";
    }
}
