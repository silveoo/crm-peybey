import {CalendarDays, Settings, Utensils} from 'lucide-react';
import {useAppStore, Page} from '../../store/appStore';

const items: [Page, string, React.ReactNode][] = [['calendar', 'Календарь',
    <CalendarDays size={18}/>], ['tables', 'Столы', <Utensils size={18}/>], ['settings', 'Настройки',
    <Settings size={18}/>]];

export function AppShell({children}: { children: React.ReactNode }) {
    const {page, set, settings} = useAppStore();
    return <div className="flex h-screen">
        <aside className="w-64 border-r bg-white p-4">
            <div className="mb-8 text-xl font-semibold">◐ {settings?.restaurantName ?? 'Peybey CRM'}</div>
            {items.map(([id, label, icon]) => <button key={id} onClick={() => set({page: id})}
                                                      className={`mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${page === id ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'}`}>{icon}{label}</button>)}
        </aside>
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
}
