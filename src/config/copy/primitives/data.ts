/** Table, pagination, data grid primitives */

export const dataPrimitives = {
  pagination: {
    previous: "Previous",
    next: "Next",
    first: "First",
    last: "Last",
    page: "Page {n}",
    of: "of {total}",
    perPage: "per page",
    showMore: "Show more",
    showLess: "Show less",
  },
  table: {
    sortBy: "Sort by",
    filter: "Filter",
    exportCsv: "Export as CSV",
    selectAll: "Select all",
    clearSelection: "Clear selection",
    selectedCount: "{n} selected",
    noColumns: "No columns",
    loadingRows: "Loading rows…",
  },
} as const
