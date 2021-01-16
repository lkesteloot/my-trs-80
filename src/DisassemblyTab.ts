import {toHexByte, toHexWord} from "z80-base";
import {PageTab} from "./PageTab";
import {
    CMD_LOAD_BLOCK,
    CmdProgram,
} from "trs80-base";
import {clearElement} from "teamten-ts-utils";
import {Disasm, TRS80_MODEL_III_KNOWN_LABELS, Z80_KNOWN_LABELS} from "z80-disasm";

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
 * Tab for displaying chunks of CMD files.
 */
export class DisassemblyTab extends PageTab {
    private readonly cmdProgram: CmdProgram;
    private readonly innerElement: HTMLElement;

    constructor(cmdProgram: CmdProgram) {
        super("Disassembly");

        this.cmdProgram = cmdProgram;

        this.element.classList.add("disassembly-tab");

        const outer = document.createElement("div");
        outer.classList.add("disassembly-outer");
        this.element.append(outer);

        this.innerElement = document.createElement("div");
        this.innerElement.classList.add("disassembly");
        outer.append(this.innerElement);
    }

    public onFirstShow(): void {
        this.generateDisassembly();
    }

    private generateDisassembly(): void {
        const lines: HTMLElement[] = [];
        const cmdProgram = this.cmdProgram;

        const disasm = new Disasm();
        disasm.addLabels(Z80_KNOWN_LABELS);
        disasm.addLabels(TRS80_MODEL_III_KNOWN_LABELS);
        if (cmdProgram.entryPointAddress !== undefined) {
            disasm.addLabels([[cmdProgram.entryPointAddress, "MAIN"]]);
        }
        for (const chunk of cmdProgram.chunks) {
            if (chunk.type === CMD_LOAD_BLOCK) {
                const address = chunk.rawData[0] + chunk.rawData[1] * 256;
                disasm.addChunk(chunk.rawData.slice(2), address);
            }
        }
        if (cmdProgram.entryPointAddress !== undefined) {
            disasm.addEntryPoint(cmdProgram.entryPointAddress);
        }
        const instructions = disasm.disassemble();

        for (const instruction of instructions) {
            if (instruction.label !== undefined) {
                const line = document.createElement("div");
                lines.push(line);
                add(line, "                  ", "disassembly-space");
                add(line, instruction.label, "disassembly-label");
                add(line, ":", "disassembly-punctuation");
            }

            let address = instruction.address;
            const bytes = instruction.bin;

            while (bytes.length > 0) {
                const subbytes = bytes.slice(0, Math.min(4, bytes.length));
                const subbytesText = subbytes.map(toHexByte).join(" ");

                const line = document.createElement("div");
                lines.push(line);
                add(line, toHexWord(instruction.address), "disassembly-address");
                add(line, "  ", "disassembly-space");
                add(line, subbytesText, "disassembly-hex");
                if (address === instruction.address) {
                    add(line, "".padEnd(12 - subbytesText.length + 8), "disassembly-space");
                    add(line, instruction.toText(), "disassembly-opcodes");
                }

                address += subbytes.length;
                bytes.splice(0, subbytes.length);
            }
        }

        // Add the lines all at once.
        clearElement(this.innerElement);
        this.innerElement.append(... lines);
    }
}
