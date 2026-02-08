"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

interface TableAccordionContextValue {
    expandedRowId: string | null;
    setExpandedRowId: (rowId: string | null) => void;
}

const TableAccordionContext = createContext<TableAccordionContextValue | null>(
    null,
);

/**
 * Hook used by ExpandableTableRow to participate in accordion behavior.
 * Returns null if no accordion context is present (rows expand independently).
 */
export function useTableAccordion() {
    return useContext(TableAccordionContext);
}

interface TableAccordionProviderProps {
    children: ReactNode;
}

/**
 * Provider that ensures only one row is expanded at a time within a DataTable.
 * Wrap table children with this — DataTable does it automatically.
 */
export function TableAccordionProvider({
    children,
}: TableAccordionProviderProps) {
    const [expandedRowId, setExpandedRowIdState] = useState<string | null>(
        null,
    );

    const setExpandedRowId = useCallback((rowId: string | null) => {
        setExpandedRowIdState((prev) => (prev === rowId ? null : rowId));
    }, []);

    return (
        <TableAccordionContext.Provider
            value={{ expandedRowId, setExpandedRowId }}
        >
            {children}
        </TableAccordionContext.Provider>
    );
}
