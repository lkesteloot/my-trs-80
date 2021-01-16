import {toHexByte, toHexWord} from "z80-base";
import {PageTab} from "./PageTab";
import {
    CMD_CHUNK_TYPE_NAME,
    CmdLoadBlockChunk,
    CmdLoadModuleHeaderChunk,
    CmdProgram,
    CmdTransferAddressChunk
} from "trs80-base";
import {clearElement} from "teamten-ts-utils";

/**
 * Add text to the line with the specified class.
 *
 * @param out the enclosing element to add to.
 * @param text the text to add.
 * @param className the name of the class for the item.
 */
function add(out: HTMLElement, text: string, className: string): HTMLElement {
    const e = document.createElement("span");
    e.innerText = text;
    e.classList.add(className);
    out.appendChild(e);
    return e;
}

/**
 * Add a snippet (first few bytes) of a binary to the line.
 */
function addBinarySnippet(line: HTMLDivElement, loadData: Uint8Array) {
    const bytes = loadData.slice(0, Math.min(3, loadData.length));
    const text = Array.from(bytes).map(toHexByte).join(" ") + (bytes.length < loadData.length ? " ..." : "");
    add(line, text, "cmd-hex");
    add(line, " (" + loadData.length + " byte" + (loadData.length == 1 ? "" : "s") + ")", "cmd-address");
}

/**
 * Tab for displaying chunks of CMD files.
 */
export class CmdTab extends PageTab {
    private readonly cmdProgram: CmdProgram;
    private readonly innerElement: HTMLElement;

    constructor(cmdProgram: CmdProgram) {
        super("CMD");

        this.cmdProgram = cmdProgram;

        this.element.classList.add("cmd-tab");

        const outer = document.createElement("div");
        outer.classList.add("cmd-outer");
        this.element.append(outer);

        this.innerElement = document.createElement("div");
        this.innerElement.classList.add("cmd");
        outer.append(this.innerElement);
    }

    public onFirstShow(): void {
        this.generateCmd();
    }

    private generateCmd(): void {
        const lines: HTMLElement[] = [];
        const cmdProgram = this.cmdProgram;

        if (cmdProgram.error !== undefined) {
            const line = document.createElement("div");
            lines.push(line);
            add(line, cmdProgram.error, "cmd-error");
        }

        // Display a row for each chunk.
        let programAddress: number | undefined = undefined;
        for (const chunk of cmdProgram.chunks) {
            const line = document.createElement("div");
            lines.push(line);

            // Chunk type.
            add(line, toHexByte(chunk.type) + "  ", "cmd-address");

            if (chunk instanceof CmdLoadBlockChunk) {
                add(line, "Load at ", "cmd-opcodes");
                add(line, toHexWord(chunk.address), "cmd-address");
                add(line, ": ", "cmd-opcodes");
                addBinarySnippet(line, chunk.loadData);
                if (programAddress !== undefined && chunk.address !== programAddress) {
                    add(line, " (not contiguous, expected " + toHexWord(programAddress) + ")", "cmd-error");
                }
                programAddress = chunk.address + chunk.loadData.length;
            } else if (chunk instanceof CmdTransferAddressChunk) {
                if (chunk.rawData.length !== 2) {
                    add(line, "Transfer address chunk has invalid length " + chunk.rawData.length, "cmd-error");
                } else {
                    add(line, "Jump to ", "cmd-opcodes");
                    add(line, toHexWord(chunk.address), "cmd-address");
                }
            } else if (chunk instanceof CmdLoadModuleHeaderChunk) {
                add(line, "Load module header: ", "cmd-opcodes");
                add(line, chunk.filename, "cmd-hex");
            } else {
                add(line, "Unknown type: ", "cmd-error");
                addBinarySnippet(line, chunk.rawData);
                const name = CMD_CHUNK_TYPE_NAME.get(chunk.type);
                if (name !== undefined) {
                    add(line, " (" + name + ")", "cmd-error");
                }
            }
        }

        /*
        const disasm = new Disasm();
        disasm.addLabels(Z80_KNOWN_LABELS);
        disasm.addLabels(TRS80_MODEL_III_KNOWN_LABELS);
        disasm.addLabels([[cmdProgram.entryPointAddress, "MAIN"]]);
        for (const chunk of cmdProgram.chunks) {
            if (chunk.type === CMD_LOAD_BLOCK) {
                const address = chunk.rawData[0] + chunk.rawData[1] * 256;
                disasm.addChunk(chunk.rawData.slice(2), address);
            }
        }
        disasm.addEntryPoint(cmdProgram.entryPointAddress);
        const instructions = disasm.disassemble();

        for (const instruction of instructions) {
            if (instruction.label !== undefined) {
                const line = document.createElement("div");
                lines.push(line);
                add(line, "                  ", classes.space);
                add(line, instruction.label, classes.label);
                add(line, ":", classes.punctuation);
            }

            let address = instruction.address;
            const bytes = instruction.bin;

            while (bytes.length > 0) {
                const subbytes = bytes.slice(0, Math.min(4, bytes.length));
                const subbytesText = subbytes.map(toHexByte).join(" ");

                const line = document.createElement("div");
                lines.push(line);
                add(line, toHexWord(instruction.address), classes.address);
                add(line, "  ", classes.space);
                add(line, subbytesText, classes.hex);
                if (address === instruction.address) {
                    add(line, "".padEnd(12 - subbytesText.length + 8), classes.space);
                    add(line, instruction.toText(), classes.opcodes);
                }

                address += subbytes.length;
                bytes.splice(0, subbytes.length);
            }
        }*/

        // Add the lines all at once.
        clearElement(this.innerElement);
        this.innerElement.append(... lines);
    }
}
