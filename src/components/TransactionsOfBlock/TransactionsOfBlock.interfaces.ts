import {GridRowsProp} from "@mui/x-data-grid";

export interface ITransactionsOfBlockProps {
    transactions: GridRowsProp,
    stopAutoFetchingCb: () => void,
}
export interface IQuickSearchToolbarProps {
    clearSearch: () => void;
    onChange: () => void;
    stopAutoFetchingCb: () => void,
    value: string;
}