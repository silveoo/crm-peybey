export const PHONE_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

export const isEmptyPhone = (value: string) => value.replace(/\D/g, '').replace(/^7/, '').length === 0;

export const formatPhone = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    if (!digits.startsWith('7')) digits = `7${digits}`;
    const local = digits.slice(1, 11);
    let result = '+7';
    if (local.length > 0) result += ` (${local.slice(0, 3)}`;
    if (local.length >= 3) result += ')';
    if (local.length > 3) result += ` ${local.slice(3, 6)}`;
    if (local.length > 6) result += `-${local.slice(6, 8)}`;
    if (local.length > 8) result += `-${local.slice(8, 10)}`;
    return result
};

export const normalizeOptionalPhone = (value: string) => isEmptyPhone(value) ? '' : formatPhone(value);
