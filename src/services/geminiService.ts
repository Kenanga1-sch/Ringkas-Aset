import { supabase } from './supabaseClient';
import { Asset } from '../types';

export const getInventorySummary = async (query: string, inventoryData: Asset[]): Promise<string> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/gemini-assistant`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        inventoryData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return 'Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.';
    }

    const data = await response.json();
    return data.response || 'Tidak dapat menghasilkan respons.';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.';
  }
};
