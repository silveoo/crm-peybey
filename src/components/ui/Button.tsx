import {ButtonHTMLAttributes} from 'react';
import {cn} from '../../lib/utils';

export function Button({className, ...p}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button
        className={cn('focus-ring rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50', className)} {...p}/>
}
