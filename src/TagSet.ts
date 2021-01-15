
/**
 * Manages a set of tags for a File.
 */
export class TagSet {
    private readonly tagSet = new Set<string>();

    /**
     * Whether this tag set is empty (has no tags).
     */
    public isEmpty(): boolean {
        return this.tagSet.size === 0;
    }

    /**
     * Add the given tags to this set.
     */
    public add(... tags: string[]): void {
        for (const tag of tags) {
            this.tagSet.add(tag);
        }
    }

    /**
     * Add the tags from the other tag set to this set.
     */
    public addAll(tags: TagSet): void {
        for (const tag of tags.tagSet) {
            this.tagSet.add(tag);
        }
    }

    /**
     * Whether this tag set contains the specified tag.
     */
    public has(tag: string): boolean {
        return this.tagSet.has(tag);
    }

    /**
     * Whether this tag set has all of the tags in the other tag set.
     */
    public hasAll(tags: TagSet): boolean {
        for (const tag of tags.tagSet) {
            if (!this.has(tag)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Remove the tag, returning whether it was in the set before.
     */
    public remove(tag: string): boolean {
        return this.tagSet.delete(tag);
    }

    /**
     * Remove all tags from this tag set.
     */
    public clear(): void {
        this.tagSet.clear();
    }

    /**
     * Returns a sorted array of the tags.
     */
    public asArray(): string[] {
        const tags: string[] = [];

        for (const tag of this.tagSet) {
            tags.push(tag);
        }

        tags.sort();

        return tags;
    }
}
