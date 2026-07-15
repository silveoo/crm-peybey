export interface RestaurantTable {
    id: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string
}

export type TableInput = Pick<RestaurantTable, 'name' | 'sortOrder' | 'isActive'>;
