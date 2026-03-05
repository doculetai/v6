/** Form validation and form field primitives */

export const formPrimitives = {
  validation: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    minLength: "Must be at least {n} characters",
    maxLength: "Must be at most {n} characters",
    invalidFormat: "Invalid format",
    passwordMismatch: "Passwords do not match",
    passwordTooWeak: "Password is too weak",
    invalidPhone: "Please enter a valid phone number",
    invalidDateRange: "End date must be after start date",
    invalidAmount: "Please enter a valid amount",
    fileRequired: "Please select a file",
  },
  fields: {
    email: "Email",
    password: "Password",
    name: "Name",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    address: "Address",
    city: "City",
    country: "Country",
    optional: "(optional)",
    required: "(required)",
    selectPlaceholder: "Choose one",
    searchPlaceholder: "Search records",
    noOptions: "No options found",
    typeToSearch: "Type to search…",
  },
} as const
