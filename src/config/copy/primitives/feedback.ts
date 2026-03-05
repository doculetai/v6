/** Empty states, loading, toast, confirmation dialogs */

export const feedbackPrimitives = {
  empty: {
    noResults: "No results found",
    noData: "No data available",
    nothingHere: "Nothing here yet",
    noRecords: "No records to display",
    noItems: "No items",
    noMatches: "No matches for your search",
    startByAdding: "Start by adding something",
    emptyList: "This list is empty",
    noNotifications: "No notifications",
    noMessages: "No messages",
  },
  loading: {
    default: "Loading…",
    pleaseWait: "Please wait…",
    processing: "Processing…",
    saving: "Saving…",
    uploading: "Uploading…",
  },
  toast: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    saved: "Saved successfully",
    deleted: "Deleted successfully",
    updated: "Updated successfully",
    failed: "Something went wrong",
    copied: "Copied to clipboard",
  },
  confirm: {
    areYouSure: "Are you sure?",
    cannotUndo: "This action cannot be undone.",
    deleteConfirm: "Are you sure you want to delete this?",
    leaveConfirm: "You have unsaved changes. Leave anyway?",
    discardChanges: "Discard changes?",
    proceed: "Proceed",
    stay: "Stay",
  },
} as const
