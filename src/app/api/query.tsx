import { createClient } from '../utils/supabase/server'
import { cookies } from 'next/headers'

const cookieStore = cookies();
const supabase = createClient(cookieStore);
const queryDatabase = async (query: string) => {
    const { data: characters } = await supabase.from('characters')
        .select('charcter, pinyin, definition')
        .like('pinyin_no_tones', `${query}%`)
    console.log(characters)
}

export default queryDatabase