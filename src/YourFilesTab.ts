import {LibraryAddEvent, LibraryEvent, LibraryModifyEvent, LibraryRemoveEvent} from "./Library";
import {File, FileBuilder} from "./File";
import {CanvasScreen} from "trs80-emulator";
import {defer, makeIcon, makeIconButton, makeTagCapsule, makeTextButton, TRASH_TAG} from "./Utils";
import {clearElement} from "teamten-ts-utils";
import {Context} from "./Context";
import {PageTab} from "./PageTab";
import {TagSet} from "./TagSet";
import {PageTabs} from "./PageTabs";

const FILE_ID_ATTR = "data-file-id";
const IMPORT_FILE_LABEL = "Import File";

/**
 * Quotes for the "no filter" error page.
 */
const NO_FILTER_QUOTE = [
    "No dance for you.",
    "I'm disappointed.",
    "Try being less demanding.",
    "And it's not for lack of trying.",
    "Try doing literally anything else.",
];

/**
 * Get a random quote for the "no filter" error page.
 */
function getRandomNoFilterQuote(): string {
    return NO_FILTER_QUOTE[Math.floor(Math.random()*NO_FILTER_QUOTE.length)];
}

/**
 * A TRS-80-like cursor in HTML.
 */
class AuthenticCursor {
    // This is 7 ticks of the Model III timer (30 Hz).
    private static readonly BLINK_PERIOD_MS = 233;
    public readonly node: HTMLElement;
    public readonly handle: number;
    public visible = true;

    constructor() {
        this.node = document.createElement("span");
        this.node.classList.add("authentic-cursor");
        this.update();

        this.handle = window.setInterval(() => {
            this.visible = !this.visible;
            this.update();
        }, AuthenticCursor.BLINK_PERIOD_MS);
    }

    /**
     * Stop the cursor. Only call this once.
     */
    public disable() {
        this.node.remove();
        window.clearInterval(this.handle);
    }

    /**
     * Set the correct block for the current visibility.
     */
    private update() {
        if (this.visible) {
            this.node.innerText = "\uE0B0";  // 131, bottom two pixels.
        } else {
            this.node.innerText = "\uE080";  // 128, blank.
        }
    }
}

/**
 * Tap for the Your Files UI.
 */
export class YourFilesTab extends PageTab {
    private readonly context: Context;
    private readonly filesDiv: HTMLElement;
    private readonly emptyLibrary: HTMLElement;
    private readonly emptyTitle: HTMLElement;
    private readonly emptyBody: HTMLElement;
    private emptyQuote: string | undefined = undefined;
    // If empty, show all files except Trash. Otherwise show only files that have all of these tags.
    private readonly filterTags = new TagSet();
    private searchString: string = "";
    private readonly tagEditor: HTMLElement;
    private readonly searchEditor: HTMLElement;

    private forceShowSearch = false;
    private readonly searchButton: HTMLButtonElement;
    private searchCursor: AuthenticCursor | undefined = undefined;
    private readonly openTrashButton: HTMLElement;
    private libraryInSync = false;

    constructor(context: Context, pageTabs: PageTabs) {
        super("Your Files", context.user !== undefined);

        this.context = context;

        this.element.classList.add("your-files-tab");
        context.onUser.subscribe(user => {
            this.visible = user !== undefined;
            pageTabs.configurationChanged();
        });

        this.filesDiv = document.createElement("div");
        this.filesDiv.classList.add("files");
        this.element.append(this.filesDiv);

        this.emptyLibrary = document.createElement("div");
        this.emptyLibrary.classList.add("empty-library");
        this.element.append(this.emptyLibrary);

        this.emptyTitle = document.createElement("h2");
        this.emptyBody = document.createElement("article");
        const demon = document.createElement("img");
        demon.src = "/demon.png";
        this.emptyLibrary.append(this.emptyTitle, this.emptyBody, demon);

        // Register for changes to library.
        this.libraryInSync = this.context.library.inSync;
        this.context.library.onEvent.subscribe(e => this.onLibraryEvent(e));
        this.context.library.onInSync.subscribe(inSync => this.onLibraryInSync(inSync));

        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        this.element.append(actionBar);

        this.openTrashButton = makeTextButton("Open Trash", "delete", "open-trash-button",
            () => this.openTrash());

        this.tagEditor = document.createElement("div");
        this.tagEditor.classList.add("tag-editor");

        this.searchButton = makeTextButton("Search", "search", "search-button", () => {
            this.forceShowSearch = true;
            this.refreshFilter();
        });

        this.searchEditor = document.createElement("span");
        this.searchEditor.classList.add("search-editor");

        const spacer = document.createElement("div");
        spacer.classList.add("action-bar-spacer");

        const exportAllButton = makeTextButton("Export All", "get_app", "export-all-button",
            () => this.exportAll());

        const uploadButton = makeTextButton(IMPORT_FILE_LABEL, "publish", "import-file-button",
            () => this.uploadFile());

        actionBar.append(this.openTrashButton, this.tagEditor,this.searchButton, this.searchEditor, spacer,
            exportAllButton, uploadButton);

        // Populate initial library state.
        this.context.library.getAllFiles().forEach(f => this.addFile(f));
        this.sortFiles();
    }

    onKeyDown(e: KeyboardEvent): boolean {
        // Plain letter.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            this.searchString += e.key;
            this.refreshFilter();
            return true;
        } else if (e.key === "Backspace" && this.searchString.length > 0) {
            // Backspace.
            if (e.ctrlKey || e.altKey) {
                // Backspace word. Mac uses Alt and Windows uses Ctrl, so support both.
                this.searchString = this.searchString.replace(/\S*\s*$/, "");
            } else if (e.metaKey) {
                // Backspace all.
                this.searchString = "";
            } else {
                // Backspace letter.
                this.searchString = this.searchString.substr(0, this.searchString.length - 1);
            }
            this.forceShowSearch = false;
            this.refreshFilter();
            return true;
        }

        return super.onKeyDown(e);
    }

    /**
     * Handle change to library files.
     */
    private onLibraryEvent(event: LibraryEvent): void {
        if (event instanceof LibraryAddEvent) {
            this.addFile(event.newFile);
            this.sortFiles();
        }
        if (event instanceof LibraryModifyEvent) {
            // Probably not worth modifying in-place.
            this.removeFile(event.oldFile.id);
            this.addFile(event.newFile);
            this.sortFiles();
        }
        if (event instanceof LibraryRemoveEvent) {
            this.removeFile(event.oldFile.id);
            this.refreshFilter();
        }
    }

    /**
     * React to whether library is now fully in sync.
     */
    private onLibraryInSync(inSync: boolean): void {
        this.libraryInSync = inSync;
        this.refreshFilter();
    }

    /**
     * Start a download of all data in the database.
     */
    private exportAll(): void {
        // Download info about all files.
        const allFiles = {
            version: 1,
            files: this.context.library.getAllFiles().map(f => f.asMap()),
        };
        const contents = JSON.stringify(allFiles);
        const blob = new Blob([contents], {type: "application/json"});

        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "my-trs-80.json";
        a.click();
    }

    /**
     * Configure and open the "open file" dialog for importing files.
     */
    private uploadFile(): void {
        const uploadElement = document.createElement("input");
        uploadElement.type = "file";
        uploadElement.accept = ".cas, .bas, .cmd, .dmk, .dsk, .jv1, .jv3, .3bn";
        uploadElement.multiple = true;
        uploadElement.addEventListener("change", () => {
            const user = this.context.user;
            if (user === undefined) {
                console.error("Can't import with signed-out user");
                return;
            }
            const files = uploadElement.files ?? [];
            const openFilePanel = files.length === 1;
            for (const f of files) {
                f.arrayBuffer()
                    .then(arrayBuffer => {
                        const bytes = new Uint8Array(arrayBuffer);
                        this.importFile(user.uid, f.name, bytes, openFilePanel);
                    })
                    .catch(error => {
                        // TODO
                        console.error(error);
                    });
            }
        });
        uploadElement.click();
    }

    /**
     * Add an uploaded file to our library.
     * @param uid user ID.
     * @param filename original filename from the user.
     * @param binary raw binary of the file.
     * @param openFilePanel whether to open the file panel for this file after importing it.
     */
    private importFile(uid: string, filename: string, binary: Uint8Array, openFilePanel: boolean): void {
        let name = filename;

        // Remove extension.
        const i = name.lastIndexOf(".");
        if (i > 0) {
            name = name.substr(0, i);
        }

        // Capitalize.
        name = name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();

        // All-caps for filename.
        filename = filename.toUpperCase();

        let file = new FileBuilder()
            .withUid(uid)
            .withName(name)
            .withFilename(filename)
            .withBinary(binary)
            .build();

        this.context.db.addFile(file)
            .then(docRef => {
                file = file.builder().withId(docRef.id).build();
                this.context.library.addFile(file);
                if (openFilePanel) {
                    this.context.openFilePanel(file);
                }
            })
            .catch(error => {
                // TODO
                console.error("Error adding document: ", error);
            });
    }

    /**
     * Add a file to the list of files in the library.
     */
    private addFile(file: File): void {
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("file");
        fileDiv.setAttribute(FILE_ID_ATTR, file.id);
        this.filesDiv.append(fileDiv);

        const screenshotsDiv = document.createElement("div");
        screenshotsDiv.classList.add("screenshots");
        fileDiv.append(screenshotsDiv);
        /* TODO find a way to show all screenshots.
        for (const screenshot of file.screenshots) {
            // Don't do these all at once, they can take tens of milliseconds each, and in a large
            // library that can hang the page for several seconds. Dribble them in later.
            defer(() => {
                const screen = new CanvasScreen();
                screen.displayScreenshot(screenshot);
                const image = screen.asImage();
                screenshotsDiv.append(image)
            });
        }*/
        defer(() => {
            const screen = new CanvasScreen();
            if (file.screenshots.length > 0) {
                screen.displayScreenshot(file.screenshots[0]);
            } else {
                screenshotsDiv.classList.add("missing");
            }
            screenshotsDiv.append(screen.asImage());
        });

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("name");
        nameDiv.innerText = file.name;
        if (file.releaseYear !== "") {
            const releaseYearSpan = document.createElement("span");
            releaseYearSpan.classList.add("release-year");
            releaseYearSpan.innerText = " (" + file.releaseYear + ")";
            nameDiv.append(releaseYearSpan);
        }
        fileDiv.append(nameDiv);

        const filenameDiv = document.createElement("div");
        filenameDiv.classList.add("filename");
        filenameDiv.innerText = file.filename;
        fileDiv.append(filenameDiv);

        const noteDiv = document.createElement("div");
        noteDiv.classList.add("note");
        noteDiv.innerText = [file.author, file.note].filter(field => field !== "").join(" — ");
        fileDiv.append(noteDiv);

        const tagsDiv = document.createElement("span");
        tagsDiv.classList.add("tags");
        for (const tag of file.getAllTags().asArray()) {
            tagsDiv.append(makeTagCapsule({
                tag: tag,
                clickCallback: () => {
                    this.filterTags.add(tag);
                    this.refreshFilter();
                },
            }));
        }
        fileDiv.append(tagsDiv);

        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("buttons");
        fileDiv.append(buttonsDiv);

        const playButton = makeIconButton(makeIcon("play_arrow"), "Run program", () => {
            this.context.runProgram(file);
            this.context.panelManager.close();
        });
        playButton.classList.add("play-button");
        buttonsDiv.append(playButton);

        const infoButton = makeIconButton(makeIcon("edit"), "File information", () => {
            this.context.openFilePanel(file);
        });
        infoButton.classList.add("info-button");
        buttonsDiv.append(infoButton);
    }

    /**
     * Remove a file from the UI by its ID.
     */
    private removeFile(fileId: string): void {
        const element = this.getFileElementById(fileId);
        if (element !== undefined) {
            element.remove();
        } else {
            console.error("removeFile(): No element with file ID " + fileId);
        }
    }

    /**
     * Update the hidden flags based on a new tag filter.
     */
    private refreshFilter(): void {
        let anyFiles = false;
        let anyVisible = false;

        // Parse out the search terms.
        const searchWords = this.searchString.split(/\W+/).filter(s => s !== "");

        // Update hidden.
        for (const fileDiv of this.filesDiv.children) {
            let hidden = false;

            const fileId = fileDiv.getAttribute(FILE_ID_ATTR);
            if (fileId !== null) {
                const file = this.context.library.getFile(fileId);
                if (file !== undefined) {
                    anyFiles = true;
                    const fileTags = file.getAllTags();

                    // Only show files that have all the filter items.
                    if (!this.filterTags.isEmpty() && !fileTags.hasAll(this.filterTags)) {
                        hidden = true;
                    }

                    // If we're not explicitly filtering for trash, hide files in the trash.
                    if (!this.filterTags.has(TRASH_TAG) && fileTags.has(TRASH_TAG)) {
                        hidden = true;
                    }

                    // Must match every word.
                    if (!searchWords.every(word => file.matchesFilterPrefix(word))) {
                        hidden = true;
                    }
                }
            }

            fileDiv.classList.toggle("hidden", hidden);
            if (!hidden) {
                anyVisible = true;
            }
        }

        // Update whether the splash screen is shown.
        let displaySplashScreen: boolean;
        if (this.libraryInSync) {
            if (anyFiles) {
                if (anyVisible) {
                    displaySplashScreen = false;
                    this.emptyQuote = undefined;
                } else {
                    displaySplashScreen = true;
                    this.emptyTitle.innerText = "No files match your filter.";
                    if (this.emptyQuote === undefined) {
                        this.emptyQuote = getRandomNoFilterQuote();
                    }
                    this.emptyBody.innerText = this.emptyQuote;
                }
            } else {
                displaySplashScreen = true;
                this.emptyTitle.innerText = "You have no files in your library!";
                this.emptyBody.innerHTML = `Upload a file from your computer using the “${IMPORT_FILE_LABEL.replace(/ /g, "&nbsp;")}” button below, or import one from the RetroStore tab.`;
            }
        } else {
            // Just show nothing at all while loading the library.
            displaySplashScreen = false;
        }


        this.filesDiv.classList.toggle("hidden", displaySplashScreen);
        this.emptyLibrary.classList.toggle("hidden", !displaySplashScreen);

        // Update filter UI in the action bar.
        if (this.filterTags.isEmpty()) {
            this.tagEditor.classList.add("hidden");
            this.openTrashButton.classList.toggle("hidden", !this.anyFileInTrash());
        } else {
            this.tagEditor.classList.remove("hidden");
            this.openTrashButton.classList.add("hidden");

            clearElement(this.tagEditor);
            this.tagEditor.append("Filter tags:");

            for (const tag of this.filterTags.asArray()) {
                this.tagEditor.append(makeTagCapsule({
                    tag: tag,
                    iconName: "clear",
                    clickCallback: () => {
                        this.filterTags.remove(tag);
                        this.refreshFilter();
                    },
                }));
            }
        }

        // Draw search prefix.
        if (this.searchString !== "" || this.forceShowSearch) {
            this.searchButton.classList.add("hidden");
            this.searchEditor.classList.remove("hidden");

            const labelNode = document.createElement("label");
            labelNode.innerText = "Search:";
            const searchStringNode = document.createElement("span");
            searchStringNode.innerText = this.searchString;
            if (this.searchCursor === undefined) {
                this.searchCursor = new AuthenticCursor();
            }
            clearElement(this.searchEditor);
            this.searchEditor.append(labelNode, searchStringNode, this.searchCursor.node);
        } else {
            this.searchButton.classList.remove("hidden");
            this.searchEditor.classList.add("hidden");

            if (this.searchCursor !== undefined) {
                this.searchCursor.disable();
                this.searchCursor = undefined;
            }
        }
    }

    /**
     * Whether there's anything in the trash.
     */
    private anyFileInTrash(): boolean {
        for (const file of this.context.library.getAllFiles()) {
            if (file.tags.indexOf(TRASH_TAG) >= 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Adds trash to the filter.
     */
    private openTrash(): void {
        this.filterTags.add(TRASH_TAG);
        this.refreshFilter();
    }

    /**
     * Return an element for a file given its ID, or undefined if not found.
     */
    private getFileElementById(fileId: string): Element | undefined {
        let selectors = ":scope > [" + FILE_ID_ATTR + "=\"" + fileId + "\"]";
        const element = this.filesDiv.querySelector(selectors);
        return element === null ? undefined : element;
    }

    /**
     * Sort files already displayed.
     */
    private sortFiles(): void {
        // Sort existing files.
        const fileElements: {file: File, element: Element}[] = [];
        for (const element of this.filesDiv.children) {
            const fileId = element.getAttribute(FILE_ID_ATTR);
            if (fileId !== null) {
                const file = this.context.library.getFile(fileId);
                if (file !== undefined) {
                    fileElements.push({file: file, element: element});
                }
            }
        }
        fileElements.sort((a, b) => File.compare(a.file, b.file));

        // Repopulate the UI in the right order.
        clearElement(this.filesDiv);
        this.filesDiv.append(... fileElements.map(e => e.element));

        // Update the hidden flags.
        this.refreshFilter();
    }
}
