import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export type Journal = {
    id: string;
    user_id: string;
    date: string; // YYYY-MM-DD
    text: string;
    summary?: string;
    today_tasks?: string[];
    tomorrow_tasks?: string[];
    mood_color?: string;
    messages?: any[];
    listener_id: string;
    listener_name: string;
    created_at: string;
    updated_at: string;
};

export type JournalInsert = Omit<Journal, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useJournals() {
    const { user } = useAuth();
    const [journals, setJournals] = useState<Journal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJournals = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setJournals(data ?? []);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    const upsertJournal = async (journal: JournalInsert) => {
        if (!user) return { error: '未認証です' };

        const { error } = await supabase
            .from('journals')
            .upsert(
                {
                    ...journal,
                    user_id: user.id,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,date' }
            );

        if (error) return { error: error.message };

        await fetchJournals();
        return { error: null };
    };

    const deleteJournal = async (date: string) => {
        if (!user) return { error: '未認証です' };

        const { error } = await supabase
            .from('journals')
            .delete()
            .eq('user_id', user.id)
            .eq('date', date);

        if (error) return { error: error.message };

        await fetchJournals();
        return { error: null };
    };

    // dateキーでのアクセスを簡単にするマップ
    const journalsByDate = journals.reduce<Record<string, Journal>>((acc, j) => {
        acc[j.date] = j;
        return acc;
    }, {});

    return {
        journals,
        journalsByDate,
        loading,
        error,
        fetchJournals,
        upsertJournal,
        deleteJournal,
    };
}
