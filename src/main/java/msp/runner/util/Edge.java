package msp.runner.util;

public record Edge(Coordinate a, Coordinate b) {
    @Override
    public String toString() {
        return a+" <-> "+b;
    }
}
