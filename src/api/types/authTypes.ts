import type { UserProfile } from "./userTypes";

export interface LoginResponse { 
    token: string;
    user: UserProfile;
}