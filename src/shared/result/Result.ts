export class Result<T, E = Error> {
    private constructor(
        private readonly _value: T | null,
        private readonly _error: E | null,
    ) { }

    get isSuccess(): boolean {
        return this._error === null;
    }

    get isFailure(): boolean {
        return !this.isSuccess;
    }

    get value(): T {
        if (!this.isSuccess) throw new Error('Cannot get value from failed result');
        return this._value as T;
    }

    get error(): E {
        if (this.isSuccess) throw new Error('Cannot get error from successful result');
        return this._error as E;
    }

    static ok<U, F = never>(value: U): Result<U, F> {
        return new Result<U, F>(value, null);
    }

    static fail<U = never, F = Error>(error: F): Result<U, F> {
        return new Result<U, F>(null, error);
    }
}