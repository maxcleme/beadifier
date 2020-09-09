export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    add(c: Color): Color {
        this.r += c.r;
        this.g += c.g;
        this.b += c.b;
        return this;
    }

    sub(c: Color): Color {
        this.r -= c.r;
        this.g -= c.g;
        this.b -= c.b;
        return this;
    }

    mult(s: number): Color {
        this.r *= s;
        this.g *= s;
        this.b *= s;
        return this;
    }
}
