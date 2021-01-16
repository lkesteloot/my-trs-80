import {Trs80File} from "trs80-base";
import {PageTab} from "./PageTab";
import {HexdumpGenerator} from "./HexdumpGenerator";
import {clearElement} from "teamten-ts-utils";
import {Context} from "./Context";

/**
 * Tab for displaying the hex and ASCII of the binary.
 */
export class HexdumpTab extends PageTab {
    private readonly binary: Uint8Array;
    private readonly trs80File: Trs80File;
    private readonly hexdumpElement: HTMLElement;
    private collapse = true;
    private annotate = true;

    constructor(context: Context, trs80File: Trs80File) {
        super("Hexdump");

        this.binary = trs80File.binary;
        this.trs80File = trs80File;

        this.element.classList.add("hexdump-tab");

        const outer = document.createElement("div");
        outer.classList.add("hexdump-outer");
        this.element.append(outer);

        this.hexdumpElement = document.createElement("div");
        this.hexdumpElement.classList.add("hexdump");
        outer.append(this.hexdumpElement);

        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        this.element.append(actionBar);

        const collapseLabel = document.createElement("label");
        const collapseCheckbox = document.createElement("input");
        collapseCheckbox.type = "checkbox";
        collapseCheckbox.checked = this.collapse;
        collapseLabel.append(collapseCheckbox);
        collapseLabel.append(" Collapse duplicate lines");
        collapseCheckbox.addEventListener("change", () => {
            this.collapse = collapseCheckbox.checked;
            this.generateHexdump();
        });
        actionBar.append(collapseLabel);

        const annotateLabel = document.createElement("label");
        const annotateCheckbox = document.createElement("input");
        annotateCheckbox.type = "checkbox";
        annotateCheckbox.checked = this.annotate;
        annotateLabel.append(annotateCheckbox);
        annotateLabel.append(" Show annotations");
        annotateCheckbox.addEventListener("change", () => {
            this.annotate = annotateCheckbox.checked;
            this.generateHexdump();
        });
        actionBar.append(annotateLabel);

        // Take the hexdump out of the dom when the panel is hidden because it slows down things
        // like changing themes (the animations aren't smooth).
        let hideHandle: number | undefined = undefined;
        const cancelHide = () => {
            if (hideHandle !== undefined) {
                window.clearTimeout(hideHandle);
                hideHandle = undefined;
            }
        };
        context.panelManager.onOpenClose.subscribe(isOpen => {
            cancelHide();
            if (isOpen) {
                this.hexdumpElement.classList.remove("hidden");
            } else {
                hideHandle = window.setTimeout(() => this.hexdumpElement.classList.add("hidden"), 400);
            }
        });
    }

    public onFirstShow(): void {
        this.generateHexdump();
    }

    /**
     * Regenerate the HTML for the hexdump.
     */
    private generateHexdump(): void {
        const hexdumpGenerator = new HexdumpGenerator(this.binary, this.collapse,
            this.annotate ? this.trs80File.annotations : []);
        const lines = hexdumpGenerator.generate();

        clearElement(this.hexdumpElement);
        this.hexdumpElement.append(... lines);
    }
}
