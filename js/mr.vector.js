export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        this.x = this.x + vector.x;
        this.y = this.y + vector.y;
    }
    sub(vector) {
        this.x = this.x - vector.x;
        this.y = this.y - vector.y;
    }
    mult(n) {
        this.x = this.x * n;
        this.y = this.y * n;
    }
    div(n) {
        this.x = this.x / n;
        this.y = this.y / n;
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        let m = this.mag()
        if (m != 0) {
            this.div(m);
        }
    }
    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }

    }
    static add(a, b) {
        let vector = new Vector(a.x + b.x, a.y + b.y)
        return vector;
    }
    static sub(a, b) {
        let vector = new Vector(a.x - b.x, a.y - b.y)
        return vector;
    }
    static div(a, b) {
        let vector = new Vector(a.x / b, a.y / b)
        return vector
    }
}