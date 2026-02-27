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
    mood_score?: number; // 0-100
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
            .order('created_at', { ascending: false }); // 作成順（新しい順）

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

    const upsertJournal = async (journal: JournalInsert & { id?: string }) => {
        if (!user) return { error: '未認証です' };

        // IDがあれば更新、なければ新規作成
        const payload: any = {
            ...journal,
            user_id: user.id,
            updated_at: new Date().toISOString(),
        };

        // 新規作成時（idがない時）にidプロパティがundefinedの状態で入るとエラーになる場合があるため
        // 明示的にidがある時だけセットする
        if (!journal.id) {
            delete payload.id;
        }

        const { error } = await supabase
            .from('journals')
            .upsert(payload);

        if (error) return { error: error.message };

        await fetchJournals();
        return { error: null };
    };

    const deleteJournal = async (id: string) => {
        if (!user) return { error: '未認証です' };

        const { error } = await supabase
            .from('journals')
            .delete()
            .eq('user_id', user.id)
            .eq('id', id);

        if (error) return { error: error.message };

        await fetchJournals();
        return { error: null };
    };

    // dateキーに対してジャーナルの「配列」をマッピングする
    const journalsByDate = journals.reduce<Record<string, Journal[]>>((acc, j) => {
        if (!acc[j.date]) acc[j.date] = [];
        acc[j.date].push(j);
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
