export interface SensorReadingProps {
    temperature: number;
    humidity: number;
    updatedAt: Date;
}

export class SensorReading {
    private constructor(private readonly props: SensorReadingProps) { }

    get temperature(): number { return this.props.temperature; }
    get humidity(): number { return this.props.humidity; }
    get updatedAt(): Date { return this.props.updatedAt; }

    static create(props: SensorReadingProps): SensorReading {
        return new SensorReading(props);
    }

    toJSON() {
        return {
            temperature: this.temperature,
            humidity: this.humidity,
            updated_at: this.updatedAt.toISOString(),
        };
    }
}