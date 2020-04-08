export class ImageConfiguration {
    filters: string[]

    constructor() {
        this.filters = [];
    }

    add(filter: string) {
        this.filters.push(filter)
    }

    clear() {
        this.filters.length = 0;
    }

    css() {
        return this.filters.join(" ")
    }
}