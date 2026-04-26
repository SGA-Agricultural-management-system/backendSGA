// No existía, lo creamos
export interface UpdateProfileRequest {
    name?: string;
    farm_name?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}