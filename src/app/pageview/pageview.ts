export interface tableBuilder {
    _id: string;
    columns: Column[];
    columns_add: Column[];
    data: any[];
    validation: any[];
    sortBy: string;
}

export interface Column {
    identifier: string;
    label: string;
    readonly: boolean;
    hidden: boolean;
    order: number;
    validation: string;
    options: any[];
    required: boolean;
    type: string;
    value: any;
    initialValue: any;
    resetFields: boolean;
    showBasedTimezone: boolean;
    timezone: string;
}




