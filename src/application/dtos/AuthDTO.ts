import { UserDTO } from "./UserDTO";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    farm_name?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: UserDTO; // from UserDTO
}

export interface RefreshRequest {
    refresh_token: string;
}

export interface RefreshResponse {
    access_token: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string; // reset token
    new_password: string;
}