import {toHexByte, toHexWord} from "z80-base";
import {PageTab} from "./PageTab";
import {
    CmdLoadBlockChunk,
    CmdProgram,
    CmdTransferAddressChunk,
    SystemChunk,
    SystemProgram,
    TRS80_SCREEN_BEGIN,
    TRS80_SCREEN_END,
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

// Whether to try to disassemble this chunk.
function shouldDisassembleSystemProgramChunk(chunk: SystemChunk): boolean {
    if (chunk.loadAddress >= TRS80_SCREEN_BEGIN && chunk.loadAddress + chunk.data.length <= TRS80_SCREEN_END) {
        return false;
    }

    // Various addresses that don't represent code.
    if (chunk.loadAddress === 0x4210 || chunk.loadAddress === 0x401E) {
        return false;
    }

    return true;
}

/**
 * Information about a preamble that might copy the rest of the program elsewhere in memory.
 */
class CopyPreamble {
    public readonly preambleLength: number;
    public readonly sourceAddress: number;
    public readonly destinationAddress: number;
    public readonly copyLength: number;

    constructor(preambleLength: number, sourceAddress: number, destinationAddress: number, copyLength: number) {
        this.preambleLength = preambleLength;
        this.sourceAddress = sourceAddress;
        this.destinationAddress = destinationAddress;
        this.copyLength = copyLength;
    }

    /**
     * Detect a preamble that copies the program to another address. It typically looks like:
     *
     * 6000  21 0E 60            ld hl,0x600E
     * 6003  11 00 43            ld de,0x4300
     * 6006  01 5C 07            ld bc,0x075C
     * 6009  ED B0               ldir
     * 600B  C3 00 43            jp 0x4300
     */
    public static detect(chunk: CmdLoadBlockChunk, entryPointAddress: number | undefined): CopyPreamble | undefined {
        // Only do this for that first chunk.
        if (chunk.address !== entryPointAddress) {
            return undefined;
        }

        const preambleLength = 0x0E;
        if (chunk.loadData.length < preambleLength) {
            return undefined;
        }

        const sourceAddress = chunk.loadData[0x01] | (chunk.loadData[0x02] << 8);
        const destinationAddress = chunk.loadData[0x04] | (chunk.loadData[0x05] << 8);
        const length = chunk.loadData[0x07] | (chunk.loadData[0x08] << 8);
        const jumpAddress = chunk.loadData[0x0C] | (chunk.loadData[0x0D] << 8);

        if (chunk.loadData[0x00] === 0x21 && // LD HL,nnnn
            chunk.loadData[0x03] === 0x11 && // LD DE,nnnn
            chunk.loadData[0x06] === 0x01 && // LD BC,nnnn
            chunk.loadData[0x09] === 0xED && chunk.loadData[0x0A] === 0xB0 && // LDIR
            chunk.loadData[0x0B] === 0xC3 && // JP nnnn
            sourceAddress == chunk.address + preambleLength &&
            destinationAddress === jumpAddress) {

            return new CopyPreamble(preambleLength, sourceAddress, destinationAddress, length);
        }

        return undefined;
    }
}

/**
 * Tab for disassembling CMD or system program files.
 */
export class DisassemblyTab extends PageTab {
    private readonly program: CmdProgram | SystemProgram;
    private readonly innerElement: HTMLElement;

    constructor(program: CmdProgram | SystemProgram) {
        super("Disassembly");

        this.program = program;

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
        const program = this.program;

        const disasm = new Disasm();
        disasm.addLabels(Z80_KNOWN_LABELS);
        disasm.addLabels(TRS80_MODEL_III_KNOWN_LABELS);
        if (program.entryPointAddress !== undefined) {
            disasm.addLabels([[program.entryPointAddress, "main"]]);
        }
        let copyOffset: number | undefined = undefined;
        if (program instanceof CmdProgram) {
            for (const chunk of program.chunks) {
                if (chunk instanceof CmdLoadBlockChunk) {
                    const preamble = CopyPreamble.detect(chunk, program.entryPointAddress);
                    if (preamble !== undefined) {
                        disasm.addLabels([[preamble.destinationAddress, "real_main"]]);
                        disasm.addChunk(chunk.loadData.subarray(0, preamble.preambleLength), chunk.address);
                        disasm.addChunk(chunk.loadData.subarray(preamble.preambleLength), preamble.destinationAddress);
                        copyOffset = preamble.sourceAddress - preamble.destinationAddress;
                        // Could also use preamble.copyLength here and only copy that many bytes.
                    } else {
                        disasm.addChunk(chunk.loadData,
                            copyOffset === undefined ? chunk.address : chunk.address - copyOffset);
                    }
                }
                if (chunk instanceof CmdTransferAddressChunk) {
                    // Not sure what to do here. I've seen junk after this block, and we risk
                    // overwriting valid things in memory. I suspect that CMD parsers of the time,
                    // when running into this block, would immediately just jump to the address
                    // and ignore everything after it, so let's emulate that.
                    break;
                }
            }
        } else {
            for (const chunk of program.chunks) {
                if (shouldDisassembleSystemProgramChunk(chunk)) {
                    disasm.addChunk(chunk.data, chunk.loadAddress);
                }
            }
        }
        if (program.entryPointAddress !== undefined) {
            disasm.addEntryPoint(program.entryPointAddress);
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
                add(line, toHexWord(address), "disassembly-address");
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
