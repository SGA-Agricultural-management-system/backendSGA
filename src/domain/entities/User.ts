export interface UserProps {
    id: string;
    name: string;
    email: string;
    hashedPassword: string;
    role: string; // 'farmer' | 'admin'
    farmName?: string;
    farmId?: string;
}

export class User {
    private constructor(private readonly props: UserProps) { }

    get id(): string { return this.props.id; }
    get name(): string { return this.props.name; }
    get email(): string { return this.props.email; }
    get hashedPassword(): string { return this.props.hashedPassword; }
    get role(): string { return this.props.role; }
    get farmName(): string | undefined { return this.props.farmName; }
    get farmId(): string | undefined { return this.props.farmId; }

    static create(props: UserProps): User {
        return new User({ ...props });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            farm_name: this.farmName,
            farm_id: this.farmId,
        };
    }
}