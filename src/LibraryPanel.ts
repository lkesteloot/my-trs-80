import {makeCloseIconButton, makeIcon, makeIconButton} from "./Utils";
import {Panel} from "./Panel";
import {File, FileBuilder} from "./File";
import {FilePanel} from "./FilePanel";
import {Context} from "./Context";
import {LibraryAddEvent, LibraryEvent, LibraryModifyEvent, LibraryRemoveEvent} from "./Library";
import {clearElement} from "teamten-ts-utils";
import {CanvasScreen} from "trs80-emulator";

const FILE_ID_ATTR = "data-file-id";

/**
 * Panel showing the library of user's files.
 */
export class LibraryPanel extends Panel {
    private readonly filesDiv: HTMLElement;

    constructor(context: Context) {
        super(context);

        this.element.classList.add("library-panel");

        const header = document.createElement("h1");
        const headerTextNode = document.createElement("span");
        headerTextNode.innerText = "Library";
        header.append(headerTextNode);
        // TODO hide upload button if signed out.
        header.append(makeIconButton(makeIcon("add"), "Upload file", () => this.uploadFile()));
        header.append(makeCloseIconButton(() => this.context.panelManager.close()));
        this.element.append(header);

        this.filesDiv = document.createElement("div");
        this.filesDiv.classList.add("files");
        this.element.append(this.filesDiv);

        this.context.library.onEvent.subscribe(e => this.onLibraryEvent(e));
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
        }
    }

    /**
     * Configure and open the "open file" dialog for importing files.
     */
    private uploadFile(): void {
        const uploadElement = document.createElement("input");
        uploadElement.type = "file";
        uploadElement.accept = ".cas, .bas, .cmd";
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
                    this.openFilePanel(file);
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

        const infoDiv = document.createElement("div");
        fileDiv.append(infoDiv);

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("name");
        nameDiv.innerText = file.name;
        infoDiv.append(nameDiv);

        const filenameDiv = document.createElement("div");
        filenameDiv.classList.add("filename");
        filenameDiv.innerText = file.filename;
        infoDiv.append(filenameDiv);

        const noteDiv = document.createElement("div");
        noteDiv.classList.add("note");
        noteDiv.innerText = file.note;
        infoDiv.append(noteDiv);

        const screenshotsDiv = document.createElement("div");
        screenshotsDiv.classList.add("screenshots");
        fileDiv.append(screenshotsDiv);
        for (const screenshot of file.screenshots) {
            const screen = new CanvasScreen();
            screen.displayScreenshot(screenshot);
            const image = screen.asImage();
            screenshotsDiv.append(image);
        }

        const playButton = makeIconButton(makeIcon("play_arrow"), "Run program", () => {
            this.context.runProgram(file);
            this.context.panelManager.close();
        });
        playButton.classList.add("play-button");
        fileDiv.append(playButton);

        const infoButton = makeIconButton(makeIcon("arrow_forward"), "File information", () => {
            this.openFilePanel(file);
        });
        infoButton.classList.add("info-button");
        fileDiv.append(infoButton);
    }

    /**
     * Open a file panel on the given file.
     */
    private openFilePanel(file: File): void {
        const filePanel = new FilePanel(this.context, file);
        this.context.panelManager.pushPanel(filePanel);
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
    }
}
