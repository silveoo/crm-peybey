import {RestaurantTable, TableInput} from '../features/tables/table.types';

export interface TableRepository {
    list(): Promise<RestaurantTable[]>;

    create(input: TableInput): Promise<RestaurantTable>;

    update(id: string, input: TableInput): Promise<RestaurantTable>;

    delete(id: string): Promise<void>
}
