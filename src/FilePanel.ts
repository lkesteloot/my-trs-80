import {Panel} from "./Panel";
import {File} from "./File";
import {Context} from "./Context";
import {PageTabs} from "./PageTabs";
import {BasicProgram, Cassette, CmdProgram, decodeTrs80File, decodeTrsdos, FloppyDisk} from "trs80-base";
import {HexdumpTab} from "./HexdumpTab";
import {FileInfoTab} from "./FileInfoTab";
import {IFilePanel} from "./IFilePanel";
import {TrsdosTab} from "./TrsdosTab";
import {BasicTab} from "./BasicTab";
import {CmdTab} from "./CmdTab";
import {DisassemblyTab} from "./DisassemblyTab";

/**
 * Panel to explore a file.
 */
export class FilePanel extends Panel implements IFilePanel {
    public file: File;
    public readonly pageTabs: PageTabs;

    constructor(context: Context, file: File) {
        super(context, file.name, "file-panel", true);

        this.file = file;
        const trs80File = decodeTrs80File(file.binary, file.filename);

        this.pageTabs = new PageTabs(this.content);
        this.pageTabs.addTab(new FileInfoTab(this, trs80File));
        this.pageTabs.addTab(new HexdumpTab(this.context, trs80File));

        // Refer to the file in the cassette if possible.
        let effectiveFile = trs80File;
        if (effectiveFile instanceof Cassette && effectiveFile.files.length === 1) {
            // Here we could open a tab for each file on the cassette.
            effectiveFile = effectiveFile.files[0].file;
        }

        if (trs80File instanceof FloppyDisk) {
            const trsdos = decodeTrsdos(trs80File);
            if (trsdos !== undefined) {
                this.pageTabs.addTab(new TrsdosTab(this, trsdos));
            }
        }

        if (effectiveFile instanceof BasicProgram) {
            this.pageTabs.addTab(new BasicTab(effectiveFile));
        }
        if (effectiveFile instanceof CmdProgram) {
            this.pageTabs.addTab(new CmdTab(effectiveFile));
            this.pageTabs.addTab(new DisassemblyTab(effectiveFile));
        }
    }

    onPanelDestroy(): void {
        this.pageTabs.destroy();
        super.onPanelDestroy();
    }

    setHeaderText(header: string): void {
        if (header === "") {
            // If we completely blank out the span, the H1 shrinks, so keep it constant height with a space.
            this.headerTextNode.innerHTML = "&nbsp;";
        } else {
            this.headerTextNode.innerText = header;
        }
    }
}
