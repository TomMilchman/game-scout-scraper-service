export function generateGameSlug(title: string, spaceReplacer: string) {
    return title
        .toLowerCase()
        .replace(/'/g, "") // remove apostrophes
        .replace(/[^a-z0-9 ]/g, "") // remove other non-alphanumeric characters except space
        .trim()
        .replace(/\s+/g, spaceReplacer); // replace spaces with underscores
}
