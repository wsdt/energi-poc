import {DataGrid, GridColDef, GridSortDirection} from '@mui/x-data-grid';
import React from "react";
import {ITransactionsOfBlockProps} from "./TransactionsOfBlock.interfaces";
import {QuickSearchToolbar} from "./QuickSearchToolbar";


function escapeRegExp(value: string) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const TransactionsOfBlock = (props: ITransactionsOfBlockProps) => {
    const cols: GridColDef[] = [
        {field: 'id', headerName: 'Transaction Hash', flex: 2, sortable: false},
        {field: 'from', headerName: 'From', flex: 1, sortable: false},
        {field: 'to', headerName: 'To', flex: 1, sortable: false},
        {
            field: 'value',
            headerName: 'Value',
            type: 'number',
            flex: 0.5,
            valueFormatter: (params) => `${params.value} NRG`,
            sortable: false
        },
    ]

    const [searchText, setSearchText] = React.useState('');
    const [rows, setRows] = React.useState(props.transactions);

    const requestSearch = (searchValue: string) => {
        props.stopAutoFetchingCb();
        setSearchText(searchValue);
        const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
        const filteredRows = props.transactions.filter((row) => {
            return Object.keys(row).some((field) => {
                return searchRegex.test(row[field].toString());
            });
        });
        setRows(filteredRows);
    };

    React.useEffect(() => {
        setRows(props.transactions);
    }, [props.transactions]);

    return <div style={{height: 400, width: '98%', marginLeft: 'auto', marginRight: 'auto'}}>
        <DataGrid columns={cols} rows={rows}
                  pageSize={15}
                  pagination
                  components={{Toolbar: QuickSearchToolbar}}
                  sortModel={[
                      {
                          field: 'value',
                          sort: 'desc' as GridSortDirection,
                      },
                  ]}
                  componentsProps={{
                      toolbar: {
                          value: searchText,
                          stopAutoFetchingCb: props.stopAutoFetchingCb,
                          onChange: (event: any) => requestSearch(event.target.value),
                          clearSearch: () => requestSearch(''),
                      },
                  }}
                  autoHeight autoPageSize disableSelectionOnClick/>
    </div>
}