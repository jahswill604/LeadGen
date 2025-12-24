import { supabase } from '../utils/supabaseClient';
import { User } from '../types';
import { handleAppError } from '../utils/errorHandling';

export const authService = {
    async signUp(email: string, password: string, name: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            throw handleAppError(error);
        }
        return data.user;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw handleAppError(error);
        }
        return data.user;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        return {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
            companyName: user.user_metadata.company_name,
        };
    },

    onAuthStateChange(callback: (user: User | null) => void) {
        return supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                callback({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                    companyName: session.user.user_metadata.company_name,
                });
            } else {
                callback(null);
            }
        });
    },
};
