export function flattenErrors(error) {
    const errors = error?.response?.data?.errors;
    if (!errors) return {};
    return Object.fromEntries(
        Object.entries(errors).map(([key, messages]) => [key, messages[0]])
    );
}