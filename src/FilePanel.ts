import {Panel} from "./Panel";
import {File} from "./File";
import {Context} from "./Context";
import {PageTabs} from "./PageTabs";
import {decodeTrs80File, decodeTrsdos, FloppyDisk} from "trs80-base";
import {HexdumpTab} from "./HexdumpTab";
import {FileInfoTab} from "./FileInfoTab";
import {IFilePanel} from "./IFilePanel";
import {TrsdosTab} from "./TrsdosTab";

/**
 * Panel to explore a file.
 */
export class FilePanel extends Panel implements IFilePanel {
    public file: File;

    constructor(context: Context, file: File) {
        super(context, file.name, "file-panel", true);

        this.file = file;
        const trs80File = decodeTrs80File(file.binary, file.filename);

        const pageTabs = new PageTabs(this.content);
        new FileInfoTab(this, pageTabs, trs80File);
        new HexdumpTab(this.context, pageTabs, trs80File);

        if (trs80File instanceof FloppyDisk) {
            const trsdos = decodeTrsdos(trs80File);
            if (trsdos !== undefined) {
                new TrsdosTab(this, pageTabs, trsdos);
            }
        }
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
