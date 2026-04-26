export interface LotProps {
    id: string;
    name: string;
    crop: string;
}

export class Lot {
    private constructor(private readonly props: LotProps) { }

    get id(): string { return this.props.id; }
    get name(): string { return this.props.name; }
    get crop(): string { return this.props.crop; }

    static create(props: LotProps): Lot {
        return new Lot(props);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            crop: this.crop,
        };
    }
}