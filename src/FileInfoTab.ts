import {Trs80File} from "trs80-base";
import {PageTabs} from "./PageTabs";
import {PageTab} from "./PageTab";
import {defer, formatDate, makeIcon, makeIconButton, makeTagCapsule, makeTextButton} from "./Utils";
import {LibraryModifyEvent, LibraryRemoveEvent} from "./Library";
import {clearElement, withCommas} from "teamten-ts-utils";
import {CanvasScreen} from "trs80-emulator";
import isEmpty from "lodash/isEmpty";
import {File} from "./File";
import {IFilePanel} from "./IFilePanel";
import firebase from "firebase";
import UpdateData = firebase.firestore.UpdateData;

const SCREENSHOT_ATTR = "data-screenshot";

/**
 * Handles the file info tab in the file panel.
 */
export class FileInfoTab {
    private readonly filePanel: IFilePanel;
    private readonly trs80File: Trs80File;
    private readonly nameInput: HTMLInputElement;
    private readonly filenameInput: HTMLInputElement;
    private readonly noteInput: HTMLTextAreaElement;
    private readonly authorInput: HTMLInputElement;
    private readonly releaseYearInput: HTMLInputElement;
    private readonly tags: string[];
    private readonly typeInput: HTMLInputElement;
    private readonly sizeInput: HTMLInputElement;
    private readonly addedAtInput: HTMLInputElement;
    private readonly modifiedAtInput: HTMLInputElement;
    private readonly tagsInput: HTMLElement;
    private readonly sharedInput: HTMLInputElement;
    private readonly screenshotsDiv: HTMLElement;
    private readonly revertButton: HTMLButtonElement;
    private readonly saveButton: HTMLButtonElement;

    constructor(filePanel: IFilePanel, pageTabs: PageTabs, trs80File: Trs80File) {
        this.filePanel = filePanel;
        this.trs80File = trs80File;

        // Make our own copy of tags that will reflect what's in the UI.
        this.tags = [...filePanel.file.tags];
        // this.tags = ["RetroStore", "CMD", "Mine", "Floppy"]; // TODO DELETE

        const tab = new PageTab("File Info");
        tab.element.classList.add("file-info-tab");

        // Form for editing file info.
        const form = document.createElement("form");
        form.classList.add("file-panel-form");
        tab.element.append(form);

        const makeInputBox = (label: string, cssClass: string | undefined, enabled: boolean): HTMLInputElement => {
            const labelElement = document.createElement("label");
            if (cssClass !== undefined) {
                labelElement.classList.add(cssClass);
            }
            labelElement.innerText = label;
            form.append(labelElement);

            const inputElement = document.createElement("input");
            inputElement.disabled = !enabled;
            labelElement.append(inputElement);

            return inputElement;
        };

        this.nameInput = makeInputBox("Name", "name", true);
        this.filenameInput = makeInputBox("Filename", "filename", true);

        const noteLabel = document.createElement("label");
        noteLabel.classList.add("note");
        noteLabel.innerText = "Note";
        form.append(noteLabel);
        this.noteInput = document.createElement("textarea");
        this.noteInput.rows = 10;
        noteLabel.append(this.noteInput);

        this.authorInput = makeInputBox("Author", undefined, true);
        this.releaseYearInput = makeInputBox("Release year", undefined, true);
        this.typeInput = makeInputBox("Type", undefined, false);
        this.addedAtInput = makeInputBox("Added", undefined, false);
        this.sizeInput = makeInputBox("Size", undefined, false);
        this.modifiedAtInput = makeInputBox("Last modified", undefined, false);
        {
            // Tags editor.
            const labelElement = document.createElement("label");
            labelElement.innerText = "Tags";
            form.append(labelElement);

            this.tagsInput = document.createElement("div");
            this.tagsInput.classList.add("tags-editor");
            labelElement.append(this.tagsInput);
        }
        {
            // Shared editor.
            const labelElement = document.createElement("label");
            labelElement.classList.add("shared");
            labelElement.innerText = "Shared";
            form.append(labelElement);

            this.sharedInput = document.createElement("input");
            this.sharedInput.type = "checkbox";

            const offIcon = makeIcon("toggle_off");
            offIcon.classList.add("off-state");

            const onIcon = makeIcon("toggle_on");
            onIcon.classList.add("on-state");

            labelElement.append(this.sharedInput, offIcon, onIcon);
        }

        this.screenshotsDiv = document.createElement("div");
        this.screenshotsDiv.classList.add("screenshots");
        form.append(this.screenshotsDiv);

        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        tab.element.append(actionBar);

        const runButton = makeTextButton("Run", "play_arrow", "play-button", () => {
            this.filePanel.context.runProgram(this.filePanel.file, this.trs80File);
            this.filePanel.context.panelManager.close();

        });
        actionBar.append(runButton);
        const deleteButton = makeTextButton("Delete File", "delete", "delete-button", () => {
            this.filePanel.context.db.deleteFile(this.filePanel.file)
                .then(() => {
                    this.filePanel.context.library.removeFile(this.filePanel.file);
                    // We automatically close as a result of the file being removed from the library.
                })
                .catch(error => {
                    // TODO.
                    console.error(error);
                });
        });
        actionBar.append(deleteButton);
        this.revertButton = makeTextButton("Revert", "undo", "revert-button", undefined);
        actionBar.append(this.revertButton);
        this.saveButton = makeTextButton("Save", ["save", "cached", "check"], "save-button", undefined);
        actionBar.append(this.saveButton);

        for (const input of [this.nameInput, this.filenameInput, this.noteInput, this.authorInput, this.releaseYearInput]) {
            input.addEventListener("input", () => this.updateButtonStatus());
        }
        this.sharedInput.addEventListener("change", () => this.updateButtonStatus());
        this.nameInput.addEventListener("input", () => {
            this.filePanel.setHeaderText(this.fileFromUi().name);
        });

        this.revertButton.addEventListener("click", () => {
            this.updateUi();
        });
        this.saveButton.addEventListener("click", () => {
            const newFile = this.fileFromUi().builder().withModifiedAt(new Date()).build();

            this.saveButton.classList.add("saving");

            // Disable right away so it's not clicked again.
            this.saveButton.disabled = true;

            this.filePanel.context.db.updateFile(this.filePanel.file, newFile)
                .then(() => {
                    this.saveButton.classList.remove("saving");
                    this.saveButton.classList.add("success");
                    setTimeout(() => {
                        this.saveButton.classList.remove("success");
                    }, 2000);
                    this.filePanel.file = newFile;
                    this.filePanel.context.library.modifyFile(newFile);
                    this.updateUi();
                })
                .catch(error => {
                    this.saveButton.classList.remove("saving");
                    // TODO show error.
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                    this.updateUi();
                });
        });

        this.filePanel.context.library.onEvent.subscribe(event => {
            if (event instanceof LibraryModifyEvent && event.newFile.id === this.filePanel.file.id) {
                // Make sure we don't clobber any user-entered data in the input fields.
                const updateData = this.filePanel.file.getUpdateDataComparedTo(event.newFile);
                this.filePanel.file = event.newFile;
                this.updateUi(updateData);
            }
            if (event instanceof LibraryRemoveEvent && event.oldFile.id === this.filePanel.file.id) {
                // We've been deleted.
                this.filePanel.context.panelManager.popPanel();
            }
        });

        this.updateUi();
        pageTabs.addTab(tab);
    }

    /**
     * Update UI after a change to file.
     *
     * @param updateData if specified, only fields defined in the object will be updated. (The _values_ of
     * those fields are ignored -- only their presence is important because that indicates that the data
     * is fresh in the file object.) The purpose is to avoid clobbering user-entered data in the various
     * input fields when the file object changes elsewhere in unrelated ways, such as new screenshots.
     */
    private updateUi(updateData?: UpdateData): void {
        const file = this.filePanel.file;

        if (updateData === undefined || updateData.hasOwnProperty("name")) {
            this.nameInput.value = file.name;
        }
        if (updateData === undefined || updateData.hasOwnProperty("filename")) {
            this.filenameInput.value = file.filename;
        }
        if (updateData === undefined || updateData.hasOwnProperty("note")) {
            this.noteInput.value = file.note;
        }
        if (updateData === undefined || updateData.hasOwnProperty("author")) {
            this.authorInput.value = file.author;
        }
        if (updateData === undefined || updateData.hasOwnProperty("releaseYear")) {
            this.releaseYearInput.value = file.releaseYear;
        }
        this.typeInput.value = this.trs80File.getDescription();
        this.sizeInput.value = withCommas(file.binary.length) + " byte" + (file.binary.length === 1 ? "" : "s");
        this.addedAtInput.value = formatDate(file.addedAt);
        this.modifiedAtInput.value = formatDate(file.modifiedAt);
        this.updateTagsInput();
        this.sharedInput.checked = file.shared;
        if (updateData === undefined || updateData.hasOwnProperty("screenshots")) {
            this.populateScreenshots();
        }

        this.updateButtonStatus();
    }

    /**
     * Update the UI for showing and editing the tags on this file.
     */
    private updateTagsInput(): void {
        clearElement(this.tagsInput);
        for (const tag of this.tags) {
            this.tagsInput.append(makeTagCapsule(tag, true, () => {
                const i = this.tags.indexOf(tag);
                if (i >= 0) {
                    this.tags.splice(i, 1);
                    this.updateTagsInput();
                    this.updateButtonStatus();
                } else {
                    console.error(`Can't find tag "${tag}" to delete`);
                }
            }));
        }
    }

    /**
     * Fill the screenshots UI with those from the file.
     */
    private populateScreenshots(): void {
        clearElement(this.screenshotsDiv);

        for (const screenshot of this.filePanel.file.screenshots) {
            const screenshotDiv = document.createElement("div");
            screenshotDiv.setAttribute(SCREENSHOT_ATTR, screenshot);
            screenshotDiv.classList.add("screenshot");
            const deleteButton = makeIconButton(makeIcon("delete"), "Delete screenshot", () => {
                screenshotDiv.remove();
                this.updateButtonStatus();
            });
            screenshotDiv.append(deleteButton);
            this.screenshotsDiv.append(screenshotDiv);

            // Defer this so that if we have a lot of screenshots it doesn't hang the browser when
            // creating this panel.
            defer(() => {
                const screen = new CanvasScreen();
                screen.displayScreenshot(screenshot);
                screenshotDiv.append(screen.asImage());
            });
        }
    }

    /**
     * Update the save/restore buttons' enabled status based on input fields.
     */
    private updateButtonStatus(): void {
        const file = this.filePanel.file;
        const newFile = this.fileFromUi();

        const isSame = isEmpty(newFile.getUpdateDataComparedTo(file));
        const isValid = newFile.name.length > 0 &&
            newFile.filename.length > 0;

        this.revertButton.disabled = isSame;
        this.saveButton.disabled = isSame || !isValid;
    }

    /**
     * Make a new File object based on the user's inputs.
     */
    private fileFromUi(): File {
        // Collect screenshots from UI.
        const screenshots: string[] = [];
        for (const screenshotDiv of this.screenshotsDiv.children) {
            let screenshot = screenshotDiv.getAttribute(SCREENSHOT_ATTR);
            if (screenshot === null) {
                console.error("Screenshot attribute " + SCREENSHOT_ATTR + " is null");
            } else {
                screenshots.push(screenshot);
            }
        }

        return this.filePanel.file.builder()
            .withName(this.nameInput.value.trim())
            .withFilename(this.filenameInput.value.trim())
            .withNote(this.noteInput.value.trim())
            .withAuthor(this.authorInput.value.trim())
            .withReleaseYear(this.releaseYearInput.value.trim())
            .withShared(this.sharedInput.checked)
            .withTags(this.tags)
            .withScreenshots(screenshots)
            .build();
    }
}
