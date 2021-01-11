import {PageTabs} from "./PageTabs";
import {decodeTrs80File, Trsdos, trsdosProtectionLevelToString} from "trs80-base";
import {PageTab} from "./PageTab";
import {withCommas} from "teamten-ts-utils";
import {makeIcon} from "./Utils";
import {IFilePanel} from "./IFilePanel";
import {FileBuilder} from "./File";

/**
 * Handles the TRSDOS tab in the file panel.
 */
export class TrsdosTab {
    constructor(filePanel: IFilePanel, pageTabs: PageTabs, trsdos: Trsdos) {
        const tab = new PageTab("TRSDOS");
        tab.element.classList.add("trsdos-tab");

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("info");
        const addField = (label: string, value: string, cssClass: string): void => {
            const labelSpan = document.createElement("div");
            labelSpan.classList.add(cssClass + "-label", "label");
            labelSpan.innerText = label + ":";
            infoDiv.append(labelSpan);
            const valueSpan = document.createElement("div");
            valueSpan.classList.add(cssClass, "value");
            if (value === "") {
                valueSpan.classList.add("empty-field");
                valueSpan.innerText = "None";
            } else {
                valueSpan.innerText = value;
            }
            infoDiv.append(valueSpan);
        };
        addField("Disk name", trsdos.gatInfo.name, "name");
        addField("Date", trsdos.gatInfo.date, "date");
        addField("Auto command", trsdos.gatInfo.autoCommand, "auto-command");
        tab.element.append(infoDiv);

        // Add directory.

        const dirDiv = document.createElement("div");
        dirDiv.classList.add("dir");
        tab.element.append(dirDiv);

        const addDirEntryField = (value: string, ... cssClass: string[]): void => {
            const dirEntry = document.createElement("div");
            dirEntry.classList.add(... cssClass);
            dirEntry.innerText = value;
            dirDiv.append(dirEntry);
        };

        addDirEntryField("Filename", "filename", "header");
        addDirEntryField("Size", "size", "header");
        addDirEntryField("Date", "date", "header");
        addDirEntryField("Permission", "protection-level", "header");
        addDirEntryField("Run", "run", "header");
        addDirEntryField("Import", "import", "header");
        for (const dirEntry of trsdos.dirEntries) {
            const extraCssClasses: string[] = [];
            if (dirEntry.isHidden()) {
                extraCssClasses.push("hidden-file");
            }
            if (dirEntry.getExtension() === "CMD") {
                extraCssClasses.push("executable-file");
            }

            addDirEntryField(dirEntry.getFilename("/"), ... ["filename", ...extraCssClasses]);
            addDirEntryField(withCommas(dirEntry.getSize()), ... ["size", ...extraCssClasses]);
            addDirEntryField(dirEntry.getDate(), ... ["date", ...extraCssClasses]);
            addDirEntryField(trsdosProtectionLevelToString(dirEntry.getProtectionLevel()),
                ... ["protection-level", ...extraCssClasses]);

            const playButton = makeIcon("play_arrow");
            playButton.classList.add(... ["run", ...extraCssClasses]);
            playButton.addEventListener("click", () => {
                const binary = trsdos.readFile(dirEntry);
                const program = decodeTrs80File(binary, dirEntry.getFilename("."));
                // TODO should set context.runningFile
                filePanel.context.trs80.runTrs80File(program);
                filePanel.context.panelManager.close();

            });
            dirDiv.append(playButton);

            // TODO this breaks the grid.
            const user = filePanel.context.user;
            if (user !== undefined) {
                const importButton = makeIcon("get_app");
                importButton.classList.add(...["import", ...extraCssClasses]);
                importButton.addEventListener("click", () => {
                    const binary = trsdos.readFile(dirEntry);

                    let file = new FileBuilder()
                        .withUid(user.uid)
                        .withName(dirEntry.getBasename())
                        .withNote(`Imported from "${filePanel.file.name}" floppy disk.`)
                        .withAuthor(filePanel.file.author)
                        .withReleaseYear(dirEntry.year > 75 ? (1900 + dirEntry.year).toString() : filePanel.file.releaseYear)
                        .withFilename(dirEntry.getFilename("/"))
                        .withShared(filePanel.file.shared) // Questionable.
                        .withBinary(binary)
                        .build();

                    filePanel.context.db.addFile(file)
                        .then(docRef => {
                            file = file.builder().withId(docRef.id).build();
                            filePanel.context.library.addFile(file);
                            filePanel.context.openFilePanel(file);
                        })
                        .catch(error => {
                            // TODO
                            console.error("Error adding document: ", error);
                        });
                });
                dirDiv.append(importButton);
            }
        }

        pageTabs.addTab(tab);
    }
}
