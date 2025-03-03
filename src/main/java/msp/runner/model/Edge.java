package msp.runner.model;

public record Edge(Coordinate a, Coordinate b) {
    @Override
    public String toString() {
        return a+" <-> "+b;
    }
}
