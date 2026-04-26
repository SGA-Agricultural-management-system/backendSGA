export class Optional<T> {
    private constructor(private readonly _value: T | null) { }

    static of<T>(value: T | null): Optional<T> {
        return new Optional(value);
    }

    get hasValue(): boolean {
        return this._value !== null && this._value !== undefined;
    }

    get value(): T {
        if (!this.hasValue) throw new Error('Optional is empty');
        return this._value as T;
    }

    map<R>(fn: (val: T) => R): Optional<R> {
        return this.hasValue ? Optional.of(fn(this._value as T)) : Optional.empty();
    }

    static empty<T>(): Optional<T> {
        return new Optional<T>(null);
    }
}