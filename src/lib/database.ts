import Database from '@tauri-apps/plugin-sql';export const DB_URL='sqlite:crm.db';let dbPromise:Promise<Database>|null=null;export const getDb=()=>dbPromise??=(Database.load(DB_URL));
