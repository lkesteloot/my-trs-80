(self["webpackChunkmy_trs_80"] = self["webpackChunkmy_trs_80"] || []).push([["trs80-z80"],{

/***/ "./node_modules/trs80-base/dist/Addresses.js":
/*!***************************************************!*\
  !*** ./node_modules/trs80-base/dist/Addresses.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TRS80_SCREEN_END = exports.TRS80_SCREEN_BEGIN = void 0;
// RAM address range of screen.
exports.TRS80_SCREEN_BEGIN = 15 * 1024;
exports.TRS80_SCREEN_END = 16 * 1024;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Basic.js":
/*!***********************************************!*\
  !*** ./node_modules/trs80-base/dist/Basic.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// Tools for decoding Basic programs.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseBasicText = exports.decodeBasicProgram = exports.setBasicName = exports.wrapBasic = exports.BasicProgram = exports.BasicElement = exports.ElementType = exports.getToken = exports.BASIC_HEADER_BYTE = exports.BASIC_TAPE_HEADER_BYTE = void 0;
const teamten_ts_utils_1 = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
const Trs80File_1 = __webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js");
exports.BASIC_TAPE_HEADER_BYTE = 0xD3;
exports.BASIC_HEADER_BYTE = 0xFF;
const FIRST_TOKEN = 0x80;
const TOKENS = [
    "END", "FOR", "RESET", "SET", "CLS", "CMD", "RANDOM", "NEXT",
    "DATA", "INPUT", "DIM", "READ", "LET", "GOTO", "RUN", "IF",
    "RESTORE", "GOSUB", "RETURN", "REM", "STOP", "ELSE", "TRON", "TROFF",
    "DEFSTR", "DEFINT", "DEFSNG", "DEFDBL", "LINE", "EDIT", "ERROR", "RESUME",
    "OUT", "ON", "OPEN", "FIELD", "GET", "PUT", "CLOSE", "LOAD",
    "MERGE", "NAME", "KILL", "LSET", "RSET", "SAVE", "SYSTEM", "LPRINT",
    "DEF", "POKE", "PRINT", "CONT", "LIST", "LLIST", "DELETE", "AUTO",
    "CLEAR", "CLOAD", "CSAVE", "NEW", "TAB(", "TO", "FN", "USING",
    "VARPTR", "USR", "ERL", "ERR", "STRING$", "INSTR", "POINT", "TIME$",
    "MEM", "INKEY$", "THEN", "NOT", "STEP", "+", "-", "*",
    "/", "[", "AND", "OR", ">", "=", "<", "SGN",
    "INT", "ABS", "FRE", "INP", "POS", "SQR", "RND", "LOG",
    "EXP", "COS", "SIN", "TAN", "ATN", "PEEK", "CVI", "CVS",
    "CVD", "EOF", "LOC", "LOF", "MKI$", "MKS$", "MKD$", "CINT",
    "CSNG", "CDBL", "FIX", "LEN", "STR$", "VAL", "ASC", "CHR$",
    "LEFT$", "RIGHT$", "MID$",
];
const DOUBLE_QUOTE = 0x22;
const SINGLE_QUOTE = 0x27;
const COLON = 0x3A;
const REM = 0x93;
const DATA = 0x88;
const REMQUOT = 0xFB;
const ELSE = 0x95;
/**
 * Parser state.
 */
var ParserState;
(function (ParserState) {
    // Normal part of line.
    ParserState[ParserState["NORMAL"] = 0] = "NORMAL";
    // Inside string literal.
    ParserState[ParserState["STRING"] = 1] = "STRING";
    // After REM token to end of line.
    ParserState[ParserState["REM"] = 2] = "REM";
    // After DATA token to end of statement.
    ParserState[ParserState["DATA"] = 3] = "DATA";
})(ParserState || (ParserState = {}));
/**
 * Get the token for the byte value, or undefined if the value does
 * not map to a token.
 */
function getToken(c) {
    return c >= FIRST_TOKEN && c < FIRST_TOKEN + TOKENS.length ? TOKENS[c - FIRST_TOKEN] : undefined;
}
exports.getToken = getToken;
/**
 * Generate a 3-character octal version of a number.
 */
function toOctal(n) {
    return n.toString(8).padStart(3, "0");
}
/**
 * Type of Basic element, for syntax highlighting.
 */
var ElementType;
(function (ElementType) {
    ElementType[ElementType["ERROR"] = 0] = "ERROR";
    ElementType[ElementType["LINE_NUMBER"] = 1] = "LINE_NUMBER";
    ElementType[ElementType["PUNCTUATION"] = 2] = "PUNCTUATION";
    ElementType[ElementType["KEYWORD"] = 3] = "KEYWORD";
    ElementType[ElementType["REGULAR"] = 4] = "REGULAR";
    ElementType[ElementType["STRING"] = 5] = "STRING";
    ElementType[ElementType["COMMENT"] = 6] = "COMMENT";
})(ElementType = exports.ElementType || (exports.ElementType = {}));
/**
 * Piece of a Basic program (token, character, line number).
 */
class BasicElement {
    constructor(offset, text, elementType, length = 1) {
        this.offset = offset;
        this.length = length;
        this.text = text;
        this.elementType = elementType;
    }
    /**
     * Get the element's text so that it will display properly in "Another Man's Treasure" font.
     *
     * https://www.kreativekorp.com/software/fonts/trs80.shtml
     */
    asAnotherMansTreasure() {
        if (this.elementType === ElementType.STRING) {
            const parts = [];
            // Convert non-ASCII to the right value for our font.
            for (const ch of this.text) {
                let c = ch.charCodeAt(0);
                if (c < 32 || c >= 127) {
                    c += 0xE000;
                }
                parts.push(String.fromCodePoint(c));
            }
            return parts.join("");
        }
        else {
            return this.text;
        }
    }
    /**
     * Get the element's text so that it will display properly in ASCII.
     */
    asAscii() {
        if (this.elementType === ElementType.STRING) {
            const parts = [];
            for (const ch of this.text) {
                const c = ch.charCodeAt(0);
                if (ch === "\r") {
                    parts.push("\\r");
                }
                else if (c >= 32 && c < 128 && ch !== "\\") {
                    parts.push(ch);
                }
                else {
                    parts.push("\\" + toOctal(c));
                }
            }
            return parts.join("");
        }
        else {
            return this.text;
        }
    }
}
exports.BasicElement = BasicElement;
/**
 * Class representing a Basic program. If the "error" field is set, then something
 * went wrong with the program and the data may be partially loaded.
 */
class BasicProgram extends Trs80File_1.Trs80File {
    constructor(binary, error, annotations, elements) {
        super(binary, error, annotations);
        this.elements = elements;
    }
    getDescription() {
        // Don't include filename, it's usually worthless.
        return "Basic program";
    }
}
exports.BasicProgram = BasicProgram;
/**
 * Adds the header bytes necessary for writing Basic cassettes.
 */
function wrapBasic(bytes) {
    // Add Basic header.
    const buffers = [
        new Uint8Array([exports.BASIC_TAPE_HEADER_BYTE, exports.BASIC_TAPE_HEADER_BYTE, exports.BASIC_TAPE_HEADER_BYTE]),
        bytes,
    ];
    return teamten_ts_utils_1.concatByteArrays(buffers);
}
exports.wrapBasic = wrapBasic;
/**
 * Set the one-letter Basic name in the binary to the first letter of the name.
 *
 * @return a new array with the modified name.
 */
function setBasicName(bytes, name) {
    if (name === "") {
        // Pick anything.
        name = "A";
    }
    // Make a copy for modifying.
    const newName = new Uint8Array(bytes);
    if (newName[0] === exports.BASIC_TAPE_HEADER_BYTE &&
        newName[1] === exports.BASIC_TAPE_HEADER_BYTE &&
        newName[2] === exports.BASIC_TAPE_HEADER_BYTE &&
        newName.length > 3) {
        newName[3] = name.charCodeAt(0);
    }
    else if (newName[0] === exports.BASIC_HEADER_BYTE &&
        newName.length > 1) {
        newName[1] = name.charCodeAt(0);
    }
    return newName;
}
exports.setBasicName = setBasicName;
/**
 * Decode a tokenized Basic program.
 * @param binary tokenized program. May be in tape format (D3 D3 D3 followed by a one-letter program
 * name) or not (FF).
 * @return the Basic program, or undefined if the header did not indicate that this was a Basic program.
 */
function decodeBasicProgram(binary) {
    const b = new teamten_ts_utils_1.ByteReader(binary);
    let state;
    let preStringState = ParserState.NORMAL;
    let error;
    const annotations = [];
    // Map from byte address to BasicElement for that byte.
    const elements = [];
    const firstByte = b.read();
    if (firstByte === exports.BASIC_TAPE_HEADER_BYTE) {
        if (b.read() !== exports.BASIC_TAPE_HEADER_BYTE || b.read() !== exports.BASIC_TAPE_HEADER_BYTE) {
            return undefined;
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Header", 0, b.addr()));
        // One-byte ASCII program name. This is nearly always meaningless, so we do nothing with it.
        b.read();
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Name", b.addr() - 1, b.addr()));
    }
    else if (firstByte === exports.BASIC_HEADER_BYTE) {
        // All good.
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Header", 0, b.addr()));
    }
    else {
        return undefined;
    }
    while (true) {
        // Read the address of the next line. We ignore this (as does Basic when
        // loading programs), only using it to detect end of program. (In the real
        // Basic these are regenerated after loading.)
        const address = b.readShort(true);
        if (address === teamten_ts_utils_1.EOF) {
            error = "EOF in next line's address";
            break;
        }
        // Zero address indicates end of program.
        if (address === 0) {
            annotations.push(new ProgramAnnotation_1.ProgramAnnotation("End-of-program marker", b.addr() - 2, b.addr()));
            break;
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Address of next line (0x" + z80_base_1.toHexWord(address) + ")", b.addr() - 2, b.addr()));
        // Read current line number.
        const lineNumber = b.readShort(false);
        if (lineNumber === teamten_ts_utils_1.EOF) {
            error = "EOF in line number";
            break;
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Line number (" + lineNumber + ")", b.addr() - 2, b.addr()));
        elements.push(new BasicElement(b.addr() - 2, lineNumber.toString(), ElementType.LINE_NUMBER, 2));
        elements.push(new BasicElement(undefined, " ", ElementType.REGULAR));
        // Read rest of line.
        const lineAddr = b.addr();
        const lineElementsIndex = elements.length;
        let c; // Uint8 value.
        let ch; // String value.
        state = ParserState.NORMAL;
        while (true) {
            c = b.read();
            if (c === teamten_ts_utils_1.EOF || c === 0) {
                break;
            }
            ch = String.fromCharCode(c);
            // Special handling of sequences of characters that start with a colon.
            if (ch === ":" && state === ParserState.NORMAL) {
                const colonAddr = b.addr() - 1;
                if (b.peek(0) === ELSE) {
                    // :ELSE gets translated to just ELSE, probably because an old version
                    // of Basic only supported ELSE after a colon.
                    b.read(); // ELSE
                    elements.push(new BasicElement(colonAddr, "ELSE", ElementType.KEYWORD, b.addr() - colonAddr));
                }
                else if (b.peek(0) === REM && b.peek(1) === REMQUOT) {
                    // Detect the ":REM'" sequence (colon, REM, single quote), because
                    // that translates to a single quote. Must be a backward-compatible
                    // way to add a single quote as a comment.
                    b.read(); // REM
                    b.read(); // REMQUOT
                    elements.push(new BasicElement(colonAddr, "'", ElementType.COMMENT, b.addr() - colonAddr));
                    state = ParserState.REM;
                }
                else {
                    elements.push(new BasicElement(colonAddr, ":", ElementType.PUNCTUATION));
                }
            }
            else {
                switch (state) {
                    case ParserState.NORMAL:
                        const token = getToken(c);
                        elements.push(token !== undefined
                            ? new BasicElement(b.addr() - 1, token, c === DATA || c === REM ? ElementType.COMMENT
                                : token.length === 1 ? ElementType.PUNCTUATION
                                    : ElementType.KEYWORD)
                            : new BasicElement(b.addr() - 1, ch, ch === '"' ? ElementType.STRING : ElementType.REGULAR));
                        if (c === REM) {
                            state = ParserState.REM;
                        }
                        else if (c === DATA) {
                            state = ParserState.DATA;
                        }
                        else if (ch === '"') {
                            preStringState = state;
                            state = ParserState.STRING;
                        }
                        break;
                    case ParserState.STRING:
                        // Put the real value in the string. Code displaying can use the methods of
                        // BasicElement to convert it before printing.
                        elements.push(new BasicElement(b.addr() - 1, ch, ElementType.STRING));
                        if (ch === '"') {
                            // End of string.
                            state = preStringState;
                        }
                        break;
                    case ParserState.REM:
                        elements.push(new BasicElement(b.addr() - 1, ch, ElementType.COMMENT));
                        break;
                    case ParserState.DATA:
                        let elementType = ElementType.COMMENT;
                        if (ch === ":") {
                            elementType = ElementType.PUNCTUATION;
                            state = ParserState.NORMAL;
                        }
                        if (ch === '"') {
                            elementType = ElementType.STRING;
                            preStringState = state;
                            state = ParserState.STRING;
                        }
                        elements.push(new BasicElement(b.addr() - 1, ch, elementType));
                        break;
                }
            }
        }
        if (c === teamten_ts_utils_1.EOF) {
            error = "EOF in line";
            annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Partial line", lineAddr, b.addr()));
            break;
        }
        const textLineParts = [];
        for (let i = lineElementsIndex; i < elements.length; i++) {
            textLineParts.push(elements[i].text);
        }
        let textLine = textLineParts.join("").replace(/[\n\r]+/, " ");
        if (textLine.length > 33) {
            textLine = textLine.substr(0, 30) + "...";
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Line: " + textLine, lineAddr, b.addr() - 1));
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("End-of-line marker", b.addr() - 1, b.addr()));
    }
    return new BasicProgram(binary, error, annotations, elements);
}
exports.decodeBasicProgram = decodeBasicProgram;
/**
 * Parser for a single line of Basic code.
 */
class BasicParser {
    constructor(line) {
        this.result = [];
        this.lineNumber = undefined;
        this.pos = 0;
        // Only trim the start, spaces at the end should be kept.
        this.line = line.trimStart();
    }
    /**
     * Parse the line, returning the binary for it or an error. The binary includes
     * the line number and the terminating nul, but not the "next-line" pointer.
     */
    parse() {
        // Parse line number.
        this.lineNumber = this.readNumber();
        if (this.lineNumber === undefined) {
            return "Missing line number: " + this.line;
        }
        this.result.push(z80_base_1.lo(this.lineNumber));
        this.result.push(z80_base_1.hi(this.lineNumber));
        // We only trim at the start, so there could be only spaces here, but that's not allowed.
        if (this.line.substr(this.pos).trim() === "") {
            return "Empty line " + this.lineNumber;
        }
        // Skip single optional whitespace
        if (this.pos < this.line.length && BasicParser.isWhitespace(this.line.charCodeAt(this.pos))) {
            this.pos++;
        }
        while (this.pos < this.line.length) {
            let ch = this.line.charCodeAt(this.pos);
            // Lower case anything outside of strings.
            if (ch >= 0x61 && ch < 0x61 + 26) {
                ch -= 0x20;
            }
            // Handle single-quote comment.
            if (ch === SINGLE_QUOTE) {
                // Single quote is the start of a comment, but it's encoded in a backward-compatible
                // way with several tokens.
                this.result.push(COLON, REM, REMQUOT);
                this.pos++;
                // We're done, copy the rest of the line.
                break;
            }
            // Handle string.
            if (ch === DOUBLE_QUOTE) {
                this.result.push(ch);
                this.pos++;
                while (this.pos < this.line.length) {
                    ch = this.line.charCodeAt(this.pos++);
                    this.result.push(ch);
                    if (ch === DOUBLE_QUOTE) {
                        break;
                    }
                }
            }
            else {
                // See if it should be a token.
                const token = this.readToken();
                if (token === undefined) {
                    // Just a regular letter.
                    this.result.push(ch);
                    this.pos++;
                }
                else {
                    // Prefix ELSE with colon for backward compatibility.
                    if (token === ELSE && this.result[this.result.length - 1] !== COLON) {
                        this.result.push(COLON);
                    }
                    this.result.push(token);
                    this.pos += TOKENS[token - FIRST_TOKEN].length;
                    if (token === REM) {
                        // We're done, copy the rest of the line.
                        break;
                    }
                    if (token === DATA) {
                        // Copy to end of statement.
                        let inString = false;
                        while (this.pos < this.line.length) {
                            ch = this.line.charCodeAt(this.pos);
                            if (ch === DOUBLE_QUOTE) {
                                inString = !inString;
                            }
                            else if (ch === COLON && !inString) {
                                break;
                            }
                            this.result.push(ch);
                            this.pos++;
                        }
                    }
                }
            }
        }
        // Copy rest of line (for comments).
        while (this.pos < this.line.length) {
            this.result.push(this.line.charCodeAt(this.pos++));
        }
        // End-of-line marker.
        this.result.push(0);
        return new Uint8Array(this.result);
    }
    /**
     * If we're at a token, return it, else return undefined. Does not advance past the token.
     */
    readToken() {
        for (let i = 0; i < TOKENS.length; i++) {
            const token = TOKENS[i];
            if (token === this.line.substr(this.pos, token.length).toUpperCase()) {
                return FIRST_TOKEN + i;
            }
        }
        return undefined;
    }
    /**
     * Reads a decimal number and advances past it, or returns undefined if not at a number.
     */
    readNumber() {
        let n;
        while (this.pos < this.line.length && BasicParser.isDigit(this.line.charCodeAt(this.pos))) {
            if (n === undefined) {
                n = 0;
            }
            n = n * 10 + this.line.charCodeAt(this.pos) - 0x30;
            this.pos++;
        }
        return n;
    }
    /**
     * Whether the ASCII value is whitespace.
     */
    static isWhitespace(ch) {
        return ch === 0x20 || ch === 0x09;
    }
    /**
     * Whether the ASCII value is a digit.
     */
    static isDigit(ch) {
        return ch >= 0x30 && ch < 0x3A;
    }
}
/**
 * Parse a Basic program into a binary with the initial 0xFF header.
 *
 * @return the binary or an error.
 */
function parseBasicText(text) {
    // Split into lines. Only trim the start, spaces at the end should be kept.
    const lines = text.split(/[\n\r]+/)
        .map((line) => line.trimStart())
        .filter((line) => line !== "");
    const binaryParts = [];
    binaryParts.push(new Uint8Array([exports.BASIC_HEADER_BYTE]));
    // Parse each line.
    let lineNumber;
    for (const line of lines) {
        const parser = new BasicParser(line);
        const binary = parser.parse();
        if (typeof binary === "string") {
            return binary;
        }
        // Make sure line numbers are consecutive.
        if (lineNumber !== undefined && parser.lineNumber !== undefined && parser.lineNumber <= lineNumber) {
            return "Line " + parser.lineNumber + " is out of order";
        }
        lineNumber = parser.lineNumber;
        // Push next-line pointer. Can be anything as long as it's not 0x0000,
        // it'll get fixed up later.
        binaryParts.push(new Uint8Array([0xFF, 0xFF]));
        binaryParts.push(binary);
    }
    // End-of-program marker.
    binaryParts.push(new Uint8Array([0x00, 0x00]));
    return teamten_ts_utils_1.concatByteArrays(binaryParts);
}
exports.parseBasicText = parseBasicText;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Cassette.js":
/*!**************************************************!*\
  !*** ./node_modules/trs80-base/dist/Cassette.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeCassette = exports.Cassette = exports.CassetteFile = exports.CassetteSpeed = void 0;
const SystemProgram_1 = __webpack_require__(/*! ./SystemProgram */ "./node_modules/trs80-base/dist/SystemProgram.js");
const Trs80File_1 = __webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js");
const Trs80FileDecoder_1 = __webpack_require__(/*! ./Trs80FileDecoder */ "./node_modules/trs80-base/dist/Trs80FileDecoder.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
// Low-speed header and sync constants.
const LOW_SPEED_HEADER_BYTE = 0x00;
const LOW_SPEED_SYNC_BYTE = 0xA5;
const LOW_SPEED_ACCEPTABLE_HEADER = (LOW_SPEED_HEADER_BYTE << 24) |
    (LOW_SPEED_HEADER_BYTE << 16) |
    (LOW_SPEED_HEADER_BYTE << 8) |
    (LOW_SPEED_HEADER_BYTE << 0);
const LOW_SPEED_DETECT = (LOW_SPEED_HEADER_BYTE << 24) |
    (LOW_SPEED_HEADER_BYTE << 16) |
    (LOW_SPEED_HEADER_BYTE << 8) |
    (LOW_SPEED_SYNC_BYTE << 0);
// High-speed header and sync constants.
const HIGH_SPEED_HEADER_BYTE = 0x55;
const HIGH_SPEED_SYNC_BYTE = 0x7F;
const HIGH_SPEED_ACCEPTABLE_HEADER1 = (HIGH_SPEED_HEADER_BYTE << 24) |
    (HIGH_SPEED_HEADER_BYTE << 16) |
    (HIGH_SPEED_HEADER_BYTE << 8) |
    (HIGH_SPEED_HEADER_BYTE << 0);
const HIGH_SPEED_ACCEPTABLE_HEADER2 = ~HIGH_SPEED_ACCEPTABLE_HEADER1;
const HIGH_SPEED_DETECT = (HIGH_SPEED_HEADER_BYTE << 24) |
    (HIGH_SPEED_HEADER_BYTE << 16) |
    (HIGH_SPEED_HEADER_BYTE << 8) |
    (HIGH_SPEED_SYNC_BYTE << 0);
var CassetteSpeed;
(function (CassetteSpeed) {
    CassetteSpeed[CassetteSpeed["LOW_SPEED"] = 0] = "LOW_SPEED";
    CassetteSpeed[CassetteSpeed["HIGH_SPEED"] = 1] = "HIGH_SPEED";
})(CassetteSpeed = exports.CassetteSpeed || (exports.CassetteSpeed = {}));
/**
 * See if actual and reference are equal, modulo some bit offset.
 *
 * @param actual the last 32 bits of the stream.
 * @param reference the 32 bits we're looking for.
 * @return the number of extra bits (0 to 7 inclusive) in "actual" after the end of reference,
 * or undefined if not a match.
 */
function checkMatch(actual, reference) {
    for (let offset = 0; offset < 8; offset++) {
        if ((actual & ~((1 << offset) - 1)) === reference << offset) {
            return offset;
        }
    }
    return undefined;
}
/**
 * Represents a file on a cassette. (Not the CAS file itself.)
 */
class CassetteFile {
    constructor(offset, speed, file) {
        this.offset = offset;
        this.speed = speed;
        this.file = file;
    }
    /**
     * Return the file's annotations adjusted by the offset into the cassette.
     */
    adjustedAnnotations() {
        return this.file.annotations.map(annotation => annotation.adjusted(this.offset));
    }
}
exports.CassetteFile = CassetteFile;
/**
 * Represents a cassette (CAS file).
 */
class Cassette extends Trs80File_1.Trs80File {
    constructor(binary, error, annotations, files) {
        super(binary, error, annotations);
        this.files = files;
    }
    getDescription() {
        if (this.files.length === 0) {
            return "Empty cassette";
        }
        else if (this.files.length === 1) {
            const cassetteFile = this.files[0];
            return cassetteFile.file.getDescription() + " on a " +
                (cassetteFile.speed === CassetteSpeed.LOW_SPEED ? "low" : "high") + " speed cassette";
        }
        else {
            return "Cassette with " + this.files.length + " files";
        }
    }
}
exports.Cassette = Cassette;
/**
 * High-speed CAS files have start bits built-in. Strip these out because
 * we re-insert them below when encoding. We could also remove the
 * writing of start bits below, but we don't really know how many bits
 * there are at the end that we shouldn't write.
 *
 * Update: We no longer insert start bits in encodeHighSpeed(), so this
 * routine is no longer necessary, but we keep it around anyway.
 */
function stripStartBits(inBytes) {
    // Compute new size of array.
    const outBytes = new Uint8Array(Math.floor(inBytes.length * 8 / 9));
    // Fill output buffer.
    for (let i = 0; i < outBytes.length; i++) {
        // Index of most-significant data bit.
        const bitIndex = i * 9 + 1;
        const byteIndex = Math.floor(bitIndex / 8);
        const bitOffset = bitIndex % 8;
        let value = inBytes[byteIndex] << bitOffset;
        if (bitOffset !== 0) {
            value |= inBytes[byteIndex + 1] >> (8 - bitOffset);
        }
        outBytes[i] = value;
    }
    return outBytes;
}
/**
 * Decodes a CAS from the binary. If the binary is not at all a cassette,
 * returns undefined. If it's a cassette with decoding errors, returns
 * partially-decoded object and sets the "error" field.
 */
function decodeCassette(binary) {
    const start = 0;
    const annotations = [];
    const cassetteFiles = [];
    while (true) {
        let recentBits = 0xFFFFFFFF;
        let programBinary;
        let speed;
        let programStartIndex = 0;
        for (let i = start; i < binary.length; i++) {
            const byte = binary[i];
            recentBits = (recentBits << 8) | byte;
            const lowSpeedBitOffset = checkMatch(recentBits, LOW_SPEED_DETECT);
            if (lowSpeedBitOffset !== undefined) {
                if (lowSpeedBitOffset !== 0) {
                    // TODO
                    throw new Error("We don't yet handle low-speed cassettes with bit offsets of " + lowSpeedBitOffset);
                }
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Low speed header", 0, i));
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Low speed sync byte", i, i + 1));
                speed = CassetteSpeed.LOW_SPEED;
                programStartIndex = i + 1;
                programBinary = binary.subarray(programStartIndex);
                break;
            }
            const highSpeedBitOffset = checkMatch(recentBits, HIGH_SPEED_DETECT);
            if (highSpeedBitOffset !== undefined) {
                if (highSpeedBitOffset !== 0) {
                    // TODO
                    throw new Error("We don't yet handle high-speed cassettes with bit offsets of " +
                        highSpeedBitOffset);
                }
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("High speed header", 0, i));
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("High speed sync byte", i, i + 1));
                speed = CassetteSpeed.HIGH_SPEED;
                programStartIndex = i + 1;
                programBinary = stripStartBits(binary.subarray(programStartIndex));
                break;
            }
            if (i >= start + 4 &&
                recentBits !== LOW_SPEED_ACCEPTABLE_HEADER &&
                recentBits !== HIGH_SPEED_ACCEPTABLE_HEADER1 &&
                recentBits !== HIGH_SPEED_ACCEPTABLE_HEADER2) {
                // We should be seeing the header bits.
                break;
            }
        }
        if (programBinary === undefined || speed === undefined) {
            // Not a CAS file.
            return undefined;
        }
        // See what kind of file it is. System program aren't decoded by decodeTrs80File() because
        // these are always on cassettes or with a .3BN extension. So try that ourselves first.
        let file = SystemProgram_1.decodeSystemProgram(programBinary);
        if (file === undefined) {
            file = Trs80FileDecoder_1.decodeTrs80File(programBinary, undefined);
        }
        cassetteFiles.push(new CassetteFile(programStartIndex, speed, file));
        // TODO handle multiple files. See HAUNT.CAS.
        break;
    }
    // Merge the annotations of the files into ours.
    for (const file of cassetteFiles) {
        annotations.push(...file.adjustedAnnotations());
    }
    return new Cassette(binary, undefined, annotations, cassetteFiles);
}
exports.decodeCassette = decodeCassette;


/***/ }),

/***/ "./node_modules/trs80-base/dist/CmdProgram.js":
/*!****************************************************!*\
  !*** ./node_modules/trs80-base/dist/CmdProgram.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Tools for dealing with CMD (machine language) programs.
 *
 * http://www.trs-80.com/wordpress/zaps-patches-pokes-tips/tape-and-file-formats-structures/#cmdfile
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeCmdProgram = exports.CmdProgram = exports.CMD_CHUNK_TYPE_NAME = exports.CmdLoadModuleHeaderChunk = exports.CmdTransferAddressChunk = exports.CmdLoadBlockChunk = exports.CmdChunk = exports.CMD_MAX_TYPE = exports.CMD_LOAD_MODULE_HEADER = exports.CMD_TRANSFER_ADDRESS = exports.CMD_LOAD_BLOCK = void 0;
const teamten_ts_utils_1 = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
const Trs80File_1 = __webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js");
// Chunk types.
exports.CMD_LOAD_BLOCK = 0x01;
exports.CMD_TRANSFER_ADDRESS = 0x02;
exports.CMD_LOAD_MODULE_HEADER = 0x05;
exports.CMD_MAX_TYPE = 0x1F;
/**
 * Represents a chunk of bytes from the file.
 */
class CmdChunk {
    constructor(type, data) {
        this.type = type;
        this.rawData = data;
    }
    /**
     * Add annotations about this chunk, assuming its data is at "addr".
     */
    addAnnotations(annotations, addr) {
        // Nothing for unknown chunks.
    }
}
exports.CmdChunk = CmdChunk;
/**
 * A chunk for loading data into memory.
 */
class CmdLoadBlockChunk extends CmdChunk {
    constructor(type, data) {
        super(type, data);
        this.address = data[0] + data[1] * 256;
        this.loadData = data.slice(2);
    }
    addAnnotations(annotations, addr) {
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Load address (0x" + z80_base_1.toHexWord(this.address) + ")", addr, addr + 2));
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Data (" + this.loadData.length + " byte" +
            (this.loadData.length === 1 ? "" : "s") + ")", addr + 2, addr + 2 + this.loadData.length));
    }
}
exports.CmdLoadBlockChunk = CmdLoadBlockChunk;
/**
 * A chunk for jumping to the start of the program.
 */
class CmdTransferAddressChunk extends CmdChunk {
    constructor(type, data) {
        super(type, data);
        this.address = data.length === 2 ? (data[0] + data[1] * 256) : 0;
    }
    addAnnotations(annotations, addr) {
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Jump address (0x" + z80_base_1.toHexWord(this.address) + ")", addr, addr + 2));
    }
}
exports.CmdTransferAddressChunk = CmdTransferAddressChunk;
/**
 * A header chunk for the filename.
 */
class CmdLoadModuleHeaderChunk extends CmdChunk {
    constructor(type, data) {
        super(type, data);
        this.filename = new TextDecoder("ascii").decode(data).trim().replace(/ +/g, " ");
    }
    addAnnotations(annotations, addr) {
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Name (" + this.filename + ")", addr, addr + this.rawData.length));
    }
}
exports.CmdLoadModuleHeaderChunk = CmdLoadModuleHeaderChunk;
/**
 * A friendly (not so technical) name for the block type.
 * See page 43 of The LDOS Quarterly, Volume 1, Number 4.
 * https://www.tim-mann.org/trs80/doc/ldosq1-4.pdf
 * http://www.vintagecomputer.net/fjkraan/comp/trs80/doc/Trscmdff.txt
 * https://tim-mann.org/trs80/doc/gocmd.pdf
 * http://www.manmrk.net/tutorials/TRS80/Software/ldos/trs80/doc/ldosq1-4.txt
 */
exports.CMD_CHUNK_TYPE_NAME = new Map([
    [0x01, "data"],
    [0x02, "jump address"],
    [0x04, "end of partitioned data set member"],
    [0x05, "header"],
    [0x06, "partitioned data set header"],
    [0x07, "patch name header"],
    [0x08, "ISAM directory entry"],
    [0x0A, "end of ISAM directory"],
    [0x0C, "PDS directory entry"],
    [0x0E, "end of PDS directory"],
    [0x10, "yanked load block"],
    [0x1F, "copyright block"],
]);
/**
 * Class representing a CMD (machine language) program. If the "error" field is set, then something
 * went wrong with the program and the data may be partially loaded.
 */
class CmdProgram extends Trs80File_1.Trs80File {
    constructor(binary, error, annotations, chunks, filename, entryPointAddress) {
        super(binary, error, annotations);
        this.chunks = chunks;
        this.filename = filename;
        this.entryPointAddress = entryPointAddress;
    }
    getDescription() {
        return "CMD program" + (this.filename !== undefined ? " (" + this.filename + ")" : "");
    }
    /**
     * Convert an address in memory to the original byte offset in the binary. Returns undefined if
     * not found in any chunk.
     */
    addressToByteOffset(address) {
        // Offset in the binary of first byte of chunk.
        let offset = 0;
        for (const chunk of this.chunks) {
            if (chunk instanceof CmdLoadBlockChunk) {
                if (address >= chunk.address && address < chunk.address + chunk.loadData.length) {
                    // Skip type, length, and address.
                    return offset + 4 + (address - chunk.address);
                }
            }
            // Skip type, length and data.
            offset += 2 + chunk.rawData.length;
        }
        return undefined;
    }
}
exports.CmdProgram = CmdProgram;
/**
 * Decodes a CMD program from the binary. If the binary is not at all a CMD
 * program, returns undefined. If it's a CMD program with decoding errors, returns
 * partially-decoded binary and sets the "error" field.
 */
function decodeCmdProgram(binary) {
    var _a;
    let error;
    const annotations = [];
    const chunks = [];
    let filename;
    let entryPointAddress = 0;
    const b = new teamten_ts_utils_1.ByteReader(binary);
    // Read each chunk.
    while (true) {
        // First byte is type of chunk.
        const type = b.read();
        // End of file?
        if (type === teamten_ts_utils_1.EOF ||
            // Invalid type byte?
            type > exports.CMD_MAX_TYPE ||
            // Error earlier?
            error !== undefined ||
            // Just saw jump? There's typically junk after this and it can make it seem like there's an error.
            (chunks.length > 0 && chunks[chunks.length - 1] instanceof CmdTransferAddressChunk)) {
            if (chunks.length === 0) {
                return undefined;
            }
            return new CmdProgram(binary.subarray(0, b.addr()), error, annotations, chunks, filename, entryPointAddress);
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Type of chunk (" +
            ((_a = exports.CMD_CHUNK_TYPE_NAME.get(type)) !== null && _a !== void 0 ? _a : "unknown") + ")", b.addr() - 1, b.addr()));
        // Second byte is length, in bytes.
        let length = b.read();
        if (length === teamten_ts_utils_1.EOF) {
            error = "File is truncated at length";
            continue;
        }
        // Adjust load block length.
        if (type === exports.CMD_LOAD_BLOCK && length <= 2) {
            length += 256;
        }
        else if (type === exports.CMD_LOAD_MODULE_HEADER && length === 0) {
            length = 256;
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Length of chunk (" + length +
            " byte" + (length === 1 ? "" : "s") + ")", b.addr() - 1, b.addr()));
        // Read the raw bytes.
        const dataAddr = b.addr();
        const data = b.readBytes(length);
        if (data.length < length) {
            error = "File is truncated at data";
            // We continue so we can create a partial chunk. The loop will stop at the top of the next
            // iteration. Not sure this is the right thing to do.
        }
        // Create type-specific chunk objects.
        let chunk;
        switch (type) {
            case exports.CMD_LOAD_BLOCK:
                chunk = new CmdLoadBlockChunk(type, data);
                break;
            case exports.CMD_TRANSFER_ADDRESS: {
                const cmdTransferAddressChunk = new CmdTransferAddressChunk(type, data);
                entryPointAddress = cmdTransferAddressChunk.address;
                chunk = cmdTransferAddressChunk;
                break;
            }
            case exports.CMD_LOAD_MODULE_HEADER: {
                const cmdLoadModuleHeaderChunk = new CmdLoadModuleHeaderChunk(type, data);
                filename = cmdLoadModuleHeaderChunk.filename;
                if (filename === "") {
                    filename = undefined;
                }
                chunk = cmdLoadModuleHeaderChunk;
                break;
            }
            default:
                chunk = new CmdChunk(type, data);
                break;
        }
        chunk.addAnnotations(annotations, dataAddr);
        chunks.push(chunk);
    }
}
exports.decodeCmdProgram = decodeCmdProgram;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Crc16.js":
/*!***********************************************!*\
  !*** ./node_modules/trs80-base/dist/Crc16.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CRC_16_CCITT = exports.Crc16 = void 0;
/**
 * Performs CRC-16 operations treating bits as big-endian.
 *
 * https://en.wikipedia.org/wiki/Cyclic_redundancy_check
 * https://en.wikipedia.org/wiki/Computation_of_cyclic_redundancy_checks
 * https://en.wikipedia.org/wiki/Mathematics_of_cyclic_redundancy_checks
 */
class Crc16 {
    /**
     * Specifies the generator, which must be a 16-bit value.
     */
    constructor(generator) {
        this.generator = generator;
    }
    /**
     * Update the CRC with the new data, which must be a byte.
     *
     * @return the new CRC.
     */
    update(crc, data) {
        for (let shift = 8; shift < 16; shift++) {
            const isOne = ((crc ^ (data << shift)) & 0x8000) !== 0;
            crc <<= 1;
            if (isOne) {
                crc ^= this.generator;
            }
        }
        return crc & 0xFFFF;
    }
}
exports.Crc16 = Crc16;
/**
 * The CRC-16-CCITT polynomial, used for floppy disks. The polynomial is
 * x^16 + x^12 + x^5 + 1, which maps to 0x11021, but the leading 1 is
 * removed because it doesn't affect the outcome.
 */
exports.CRC_16_CCITT = new Crc16(0x1021);


/***/ }),

/***/ "./node_modules/trs80-base/dist/DmkFloppyDisk.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-base/dist/DmkFloppyDisk.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Handles DMK floppy disk images.
 *
 * https://retrocomputing.stackexchange.com/questions/15282/understanding-the-dmk-disk-image-file-format-used-by-trs-80-emulators
 * http://www.classiccmp.org/cpmarchives/trs80/mirrors/trs-80.com/early/www.trs-80.com/trs80-dm.htm
 * http://www.classiccmp.org/cpmarchives/trs80/mirrors/www.discover-net.net/~dmkeil/trs80/trstech.htm
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeDmkFloppyDisk = exports.DmkFloppyDisk = void 0;
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const z80_base_2 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const Crc16_1 = __webpack_require__(/*! ./Crc16 */ "./node_modules/trs80-base/dist/Crc16.js");
const FloppyDisk_1 = __webpack_require__(/*! ./FloppyDisk */ "./node_modules/trs80-base/dist/FloppyDisk.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
const FILE_HEADER_SIZE = 16;
const TRACK_HEADER_SIZE = 128;
/**
 * Represents a single sector on a DMK floppy.
 */
class DmkSector {
    constructor(track, doubleDensity, offset) {
        this.track = track;
        this.doubleDensity = doubleDensity;
        this.offset = offset;
        this.dataIndex = this.findDataIndex();
    }
    /**
     * Get the cylinder for this sector. This is 0-based.
     */
    getCylinder() {
        return this.getByte(1);
    }
    /**
     * Get the side for this sector.
     */
    getSide() {
        return FloppyDisk_1.numberToSide(this.getByte(2));
    }
    /**
     * Get the sector number for this sector. This is 1-based.
     */
    getSectorNumber() {
        return this.getByte(3);
    }
    /**
     * Get the sector length in bytes.
     */
    getLength() {
        return 128 * (1 << this.getByte(4));
    }
    /**
     * Get the CRC for the IDAM.
     */
    getIdamCrc() {
        // Bit endian.
        return (this.getByte(5) << 8) + this.getByte(6);
    }
    /**
     * Compute the CRC for the IDAM.
     */
    computeIdemCrc() {
        let crc = 0xFFFF;
        for (let i = -3; i < 5; i++) {
            crc = Crc16_1.CRC_16_CCITT.update(crc, this.getByte(i));
        }
        return crc;
    }
    /**
     * Get the CRC for the data bytes.
     */
    getDataCrc() {
        // Bit endian.
        const index = this.dataIndex + this.getLength();
        return (this.getByte(index) << 8) + this.getByte(index + 1);
    }
    /**
     * Compute the CRC for the data bytes.
     */
    computeDataCrc() {
        let crc = 0xFFFF;
        const index = this.dataIndex;
        const begin = index - 4;
        const end = index + this.getLength();
        for (let i = begin; i < end; i++) {
            crc = Crc16_1.CRC_16_CCITT.update(crc, this.getByte(i));
        }
        return crc;
    }
    /**
     * Whether the sector data should be considered invalid.
     */
    isDeleted() {
        const dam = this.getByte(this.dataIndex - 1);
        if (dam !== 0xF8 && dam !== 0xFB) {
            console.error("Unknown DAM: " + z80_base_2.toHexByte(dam));
        }
        // Normally, 0xFB, but 0xF8 if sector is considered deleted.
        return dam === 0xF8;
    }
    /**
     * Get a byte from the sector data.
     *
     * @param index index into the sector, relative to the 0xFE byte. Can be negative.
     */
    getByte(index) {
        return this.track.floppyDisk.binary[this.track.offset + this.offset + index];
    }
    /**
     * Look for the byte that indicates the start of data (0xFB or 0xF8). Various
     * floppy disk documentation specify an exact number here, but I've seen a variety
     * of values, so just search.
     */
    findDataIndex() {
        for (let i = 7; i < 55; i++) {
            const byte = this.track.floppyDisk.binary[this.track.offset + this.offset + i];
            if (byte === 0xFB || byte === 0xF8) {
                // Maybe also check that the previous three bytes are 0xA1.
                return i + 1;
            }
        }
        // Not sure what to do here. trs80gp says that this is valid.
        throw new Error(`Can't find byte at start of DAM (track ${this.track.trackNumber}, offset 0x${z80_base_1.toHexWord(this.offset)})`);
    }
}
/**
 * Represents a single track on a DMK floppy.
 */
class DmkTrack {
    constructor(floppyDisk, trackNumber, side, offset) {
        /**
         * Sectors in this track.
         */
        this.sectors = [];
        this.floppyDisk = floppyDisk;
        this.trackNumber = trackNumber;
        this.side = side;
        this.offset = offset;
    }
}
/**
 * Handles the DMK floppy disk file format, developed by David M. Keil.
 *
 * http://www.classiccmp.org/cpmarchives/trs80/mirrors/trs-80.com/early/www.trs-80.com/trs80-dm.htm
 * http://www.classiccmp.org/cpmarchives/trs80/mirrors/www.discover-net.net/~dmkeil/trs80/trstech.htm
 */
class DmkFloppyDisk extends FloppyDisk_1.FloppyDisk {
    constructor(binary, error, annotations, supportsDoubleDensity, writeProtected, trackCount, trackLength, flags) {
        super(binary, error, annotations, supportsDoubleDensity);
        this.tracks = [];
        this.writeProtected = writeProtected;
        this.trackCount = trackCount;
        this.trackLength = trackLength;
        this.flags = flags;
    }
    getDescription() {
        return "Floppy disk (DMK)";
    }
    readSector(trackNumber, side, sectorNumber) {
        // console.log(`readSector(${trackNumber}, ${sectorNumber}, ${side})`);
        for (const track of this.tracks) {
            if (track.trackNumber === trackNumber) { // TODO not checking side.
                for (const sector of track.sectors) {
                    if (sectorNumber === undefined || (sector.getSectorNumber() === sectorNumber &&
                        sector.getSide() === side)) {
                        const begin = track.offset + sector.offset + sector.dataIndex;
                        const end = begin + sector.getLength();
                        const sectorData = new FloppyDisk_1.SectorData(this.binary.subarray(begin, end));
                        sectorData.crcError = sector.getDataCrc() !== sector.computeDataCrc();
                        sectorData.deleted = sector.isDeleted();
                        // console.log(sectorData);
                        return sectorData;
                    }
                }
            }
        }
        return undefined;
    }
}
exports.DmkFloppyDisk = DmkFloppyDisk;
/**
 * Decode a DMK floppy disk file.
 */
function decodeDmkFloppyDisk(binary) {
    const error = undefined;
    const annotations = [];
    if (binary.length < FILE_HEADER_SIZE) {
        return undefined;
    }
    // Decode the header. Comments marked [DMK] are from David Keil's original documentation.
    // [DMK] If this byte is set to FFH the disk is `write protected', 00H allows writing.
    const writeProtected = binary[0] === 0xFF;
    if (binary[0] !== 0x00 && binary[0] !== 0xFF) {
        return undefined;
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation(writeProtected ? "Write protected" : "Writable", 0, 1));
    // [DMK] Number of tracks on virtual disk. Since tracks start at 0 this value will be one greater
    // than the highest track written to the disk. So a disk with 40 tracks will have a value
    // of 40 (28H) in this field after formatting while the highest track written would be 39.
    // This field is updated after a track is formatted if the track formatted is greater than
    // or equal to the current number of tracks. Re-formatting a disk with fewer tracks will
    // NOT reduce the number of tracks on the virtual disk. Once a virtual disk has allocated
    // space for a track it will NEVER release it. Formatting a virtual disk with 80 tracks
    // then re-formatting it with 40 tracks would waste space just like formatting only 40
    // tracks on an 80 track drive. The emulator and TRS-80 operating system don't care.
    // To re-format a virtual disk with fewer tracks use the /I option at start-up to
    // delete and re-create the virtual disk first, then re-format to save space.
    //
    // [DMK] Note: This field should NEVER be modified. Changing this number will cause TRS-80
    // operating system disk errors. (Like reading an 80 track disk in a 40 track drive)
    const trackCount = binary[1];
    if (trackCount > 160) {
        // Not sure what a reasonable maximum is. I've only see 80.
        return undefined;
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation(trackCount + " tracks", 1, 2));
    // [DMK] This is the track length for the virtual disk. By default the value is 1900H, 80H bytes
    // more than the actual track length, this gives a track length of 6272 bytes. A real double
    // density track length is approx. 6250 bytes. This is the default value when a virtual disk is created.
    // Values for other disk and format types are 0CC0H for single density 5.25" floppies,
    // 14E0H for single density 8" floppies and 2940H for double density 8" floppies. The max value is 2940H.
    // For normal formatting of disks the values of 1900H and 2940H for 5.25" and 8" are used.
    // The emulator will write two bytes and read every second byte when  in single density to maintain
    // proper sector spacing, allowing mixed density disks. Setting the track length must be done before
    // a virtual disk is formatted or the disk will have to be re-formatted and since the space for the
    // disk has already been allocated no space will be saved.
    //
    // [DMK] WARNING: Bytes are entered in reverse order (ex. 2940H would be entered, byte 2=40, byte 3=29).
    //
    // [DMK] Note: No modification of the track length is necessary, doing so only saves space and is not
    // necessary to normal operation. The values for all normal 5.25" and 8" disks are set when the
    // virtual disk is created. DON'T modify the track length unless you understand these instructions completely.
    // Nothing in the PC world can be messed up by improper modification but any other virtual disk mounted
    // in the emulator with an improperly modified disk could have their data scrambled.
    const trackLength = binary[2] + (binary[3] << 8);
    if (trackLength > 0x2940) {
        return undefined;
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation(trackLength + " bytes per track", 2, 4));
    // [DMK] Virtual disk option flags.
    //
    // [DMK] Bit 4 of this byte, if set, means this is a single sided ONLY disk. This bit is set if the
    // user selects single sided during disk creation and should not require modification. This flag is
    // used only to save PC hard disk space and is never required.
    //
    // [DMK] Bit 6 of this byte, if set, means this disk is to be single density size and the emulator
    // will access one byte instead of two when doing I/O in single density. Double density can still
    // be written to a single density disk but with half the track length only 10 256 byte sectors can be
    // written in either density. Mixed density is also possible but sector timing may be off so protected
    // disks may not work, a maximum of 10 256 byte sectors of mixed density can be written to a
    // single density disk. A program like "Spook House" which has a mixed density track 0 with 1 SD sector
    // and 1 DD sector and the rest of the disk consisting of 10 SD sectors/track will work with this flag set
    // and save half the PC hard disk space. The protected disk "Super Utility + 3.0" however has 6 SD and 6 DD
    // sectors/track for a total of 12 256 byte sectors/track. This disk cannot be single density.
    // This bit is set if the user selects single density during disk creation and should
    // not require modification. This flag is used only to save PC hard disk space and is never required.
    //
    // [DMK] Bit 7 of this byte, if set, means density is to be ignored when accessing this disk. The disk MUST
    // be formatted in double density but the emulator will then read and write the sectors in either density.
    // The emulator will access one byte instead of two when doing I/O in single density.
    // This flag was an early way to support mixed density disks it is no longer needed for this purpose.
    // It is now used for compatibility with old virtual disks created without the double byte now used when in
    // single density. This bit can be set manually in a hex editor to access old virtual disks written
    // in single density.
    const flags = binary[4];
    const flagParts = [];
    const singleSided = (flags & 0x10) !== 0;
    if (singleSided) {
        flagParts.push("SS");
    }
    if ((flags & 0x40) !== 0) {
        flagParts.push("SD");
    }
    if ((flags & 0x80) !== 0) {
        flagParts.push("ignore density");
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Flags: [" + flagParts.join(",") + "]", 4, 5));
    // Sanity check.
    const sideCount = singleSided ? 1 : 2;
    const expectedLength = FILE_HEADER_SIZE + sideCount * trackCount * trackLength;
    if (binary.length !== expectedLength) {
        console.error(`DMK file wrong size (${binary.length} != ${expectedLength})`);
        return undefined;
    }
    // Check that these are zero.
    for (let i = 5; i < 12; i++) {
        if (binary[i] !== 0x00) {
            console.error("DMK: Reserved byte " + i + " is not zero: 0x" + z80_base_2.toHexByte(binary[i]));
            return undefined;
        }
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Reserved", 5, 12));
    // [DMK] Must be zero if virtual disk is in emulator's native format.
    //
    // [DMK] Must be 12345678h if virtual disk is a REAL disk specification file used to access
    // REAL TRS-80 floppies in compatible PC drives.
    if (binary[12] + binary[13] + binary[14] + binary[15] !== 0x00) {
        return undefined;
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Virtual disk", 12, 16));
    const floppyDisk = new DmkFloppyDisk(binary, error, annotations, true, writeProtected, trackCount, trackLength, flags);
    // Read the tracks.
    let binaryOffset = FILE_HEADER_SIZE;
    for (let trackNumber = 0; trackNumber < trackCount; trackNumber++) {
        for (let side = 0; side < sideCount; side++) {
            const trackOffset = binaryOffset;
            const track = new DmkTrack(floppyDisk, trackNumber, FloppyDisk_1.numberToSide(side), trackOffset);
            // Read the track header. The term "IDAM" in the comment below refers to the "ID access mark",
            // where "ID" is referring to the sector ID, the few byte just before the sector data.
            // [DMK] Each side of each track has a 128 (80H) byte header which contains an offset pointer
            // to each IDAM in the track. This allows a maximum of 64 sector IDAMs/track. This is more than
            // twice what an 8 inch disk would require and 3.5 times that of a normal TRS-80 5 inch DD disk.
            // This should more than enough for any protected disk also.
            //
            // [DMK] These IDAM pointers MUST adhere to the following rules:
            //
            // * Each pointer is a 2 byte offset to the FEh byte of the IDAM. In double byte single density
            //   the pointer is to the first FEh.
            // * The offset includes the 128 byte header. For example, an IDAM 10h bytes into the track would
            //   have a pointer of 90h, 10h+80h=90h.
            // * The IDAM offsets MUST be in ascending order with no unused or bad pointers.
            // * If all the entries are not used the header is terminated with a 0000h entry. Unused entries
            //   must also be zero filled..
            // * Any IDAMs overwritten during a sector write command should have their entry removed from the
            //   header and all other pointer entries shifted to fill in.
            // * The IDAM pointers are created during the track write command (format). A completed track write
            //   MUST remove all previous IDAM pointers. A partial track write (aborted with the forced interrupt
            //   command) MUST have it's previous pointers that were not overwritten added to the new IDAM pointers.
            // * The pointer bytes are stored in reverse order (LSB/MSB).
            //
            // [DMK] Each IDAM pointer has two flags. Bit 15 is set if the sector is double density. Bit 14 is
            // currently undefined. These bits must be masked to get the actual sector offset. For example,
            // an offset to an IDAM at byte 90h would be 0090h if single density and 8090h if double density.
            for (let i = 0; i < TRACK_HEADER_SIZE; i += 2) {
                const sectorOffset = binary[binaryOffset + i] + (binary[binaryOffset + i + 1] << 8);
                if (sectorOffset !== 0) {
                    track.sectors.push(new DmkSector(track, (sectorOffset & 0x8000) !== 0, sectorOffset & 0x3FFF));
                }
            }
            annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Track ${trackNumber} header`, binaryOffset, binaryOffset + TRACK_HEADER_SIZE));
            for (const sector of track.sectors) {
                let i = trackOffset + sector.offset;
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Sector ID access mark", i, i + 1));
                i++;
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Cylinder " + sector.getCylinder(), i, i + 1));
                i++;
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Side " + sector.getSide(), i, i + 1));
                i++;
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Sector " + sector.getSectorNumber(), i, i + 1));
                i++;
                const sectorLength = sector.getLength();
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Length " + sectorLength, i, i + 1));
                i++;
                const actualIdamCrc = sector.computeIdemCrc();
                const expectedIdamCrc = sector.getIdamCrc();
                let idamCrcLabel = "IDAM CRC";
                if (actualIdamCrc === expectedIdamCrc) {
                    idamCrcLabel += " (valid)";
                }
                else {
                    idamCrcLabel += ` (got 0x${z80_base_1.toHexWord(actualIdamCrc)}, expected 0x${z80_base_1.toHexWord(expectedIdamCrc)})`;
                }
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation(idamCrcLabel, i, i + 2));
                i += 2;
                i = trackOffset + sector.offset + sector.dataIndex;
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Sector data", i, i + sectorLength));
                i += sectorLength;
                const actualDataCrc = sector.computeDataCrc();
                const expectedDataCrc = sector.getDataCrc();
                let dataCrcLabel = "Data CRC";
                if (actualDataCrc === expectedDataCrc) {
                    dataCrcLabel += " (valid)";
                }
                else {
                    dataCrcLabel += ` (got 0x${z80_base_1.toHexWord(actualDataCrc)}, expected 0x${z80_base_1.toHexWord(expectedDataCrc)})`;
                }
                annotations.push(new ProgramAnnotation_1.ProgramAnnotation(dataCrcLabel, i, i + 2));
                i += 2;
            }
            floppyDisk.tracks.push(track);
            binaryOffset += trackLength;
        }
    }
    return floppyDisk;
}
exports.decodeDmkFloppyDisk = decodeDmkFloppyDisk;


/***/ }),

/***/ "./node_modules/trs80-base/dist/FloppyDisk.js":
/*!****************************************************!*\
  !*** ./node_modules/trs80-base/dist/FloppyDisk.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FloppyDisk = exports.SectorData = exports.numberToSide = exports.Side = void 0;
const Trs80File_1 = __webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js");
// Side of a floppy disk.
var Side;
(function (Side) {
    Side[Side["FRONT"] = 0] = "FRONT";
    Side[Side["BACK"] = 1] = "BACK";
})(Side = exports.Side || (exports.Side = {}));
/**
 * Convert a number to a side, where 0 maps to FRONT and 1 maps to BACK.
 * Other numbers throw an exception.
 */
function numberToSide(n) {
    if (n === 0) {
        return Side.FRONT;
    }
    if (n === 1) {
        return Side.BACK;
    }
    throw new Error("Invalid side number " + n);
}
exports.numberToSide = numberToSide;
/**
 * Byte for filling sector data when reading off the end.
 */
const FILL_BYTE = 0xE5;
/**
 * Data from a sector that was read from a disk.
 */
class SectorData {
    constructor(data) {
        /**
         * Whether the sector data is invalid. This is indicated on the floppy by having a 0xF8 data
         * address mark (DAM) byte, instead of the normal 0xFB. For JV1 this is set to true for the directory track.
         */
        this.deleted = false;
        /**
         * Whether there was a CRC error when reading the physical disk.
         */
        this.crcError = false;
        this.data = data;
    }
}
exports.SectorData = SectorData;
/**
 * Abstract class for virtual floppy disk file formats.
 */
class FloppyDisk extends Trs80File_1.Trs80File {
    constructor(binary, error, annotations, supportsDoubleDensity) {
        super(binary, error, annotations);
        this.supportsDoubleDensity = supportsDoubleDensity;
    }
    /**
     * Pad a sector to its full length.
     */
    padSector(data, sectorSize) {
        if (data.length < sectorSize) {
            const newData = new Uint8Array(sectorSize);
            newData.set(data);
            newData.fill(FILL_BYTE, data.length);
            data = newData;
        }
        return data;
    }
}
exports.FloppyDisk = FloppyDisk;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Jv1FloppyDisk.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-base/dist/Jv1FloppyDisk.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeJv1FloppyDisk = exports.Jv1FloppyDisk = void 0;
const FloppyDisk_1 = __webpack_require__(/*! ./FloppyDisk */ "./node_modules/trs80-base/dist/FloppyDisk.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
const BYTES_PER_SECTOR = 256;
const SECTORS_PER_TRACK = 10;
const BYTES_PER_TRACK = BYTES_PER_SECTOR * SECTORS_PER_TRACK;
const DIRECTORY_TRACK = 17;
/**
 * Floppy disk in the JV1 format.
 */
class Jv1FloppyDisk extends FloppyDisk_1.FloppyDisk {
    constructor(binary, error, annotations) {
        super(binary, error, annotations, false);
    }
    getDescription() {
        return "Floppy disk (JV1)";
    }
    readSector(trackNumber, side, sectorNumber) {
        sectorNumber = sectorNumber !== null && sectorNumber !== void 0 ? sectorNumber : 0;
        // Check for errors.
        if (trackNumber < 0 ||
            side === FloppyDisk_1.Side.BACK ||
            sectorNumber >= SECTORS_PER_TRACK) {
            return undefined;
        }
        // Offset straight into data.
        const offset = (SECTORS_PER_TRACK * trackNumber + sectorNumber) * BYTES_PER_SECTOR;
        const data = this.padSector(this.binary.subarray(offset, offset + BYTES_PER_SECTOR), BYTES_PER_SECTOR);
        const sectorData = new FloppyDisk_1.SectorData(data);
        if (trackNumber === DIRECTORY_TRACK) {
            // I don't know why "deleted" is used for the directory track.
            sectorData.deleted = true;
        }
        return sectorData;
    }
}
exports.Jv1FloppyDisk = Jv1FloppyDisk;
/**
 * Decode a JV1 floppy disk file.
 */
function decodeJv1FloppyDisk(binary) {
    let error;
    const annotations = [];
    const length = binary.length;
    // Magic number check.
    if (length < 2 || binary[0] !== 0x00 || binary[1] !== 0xFE) {
        return undefined;
    }
    // Basic sanity check.
    if (length % BYTES_PER_TRACK !== 0) {
        error = "Length is not a multiple of track size (" + BYTES_PER_TRACK + " bytes)";
    }
    // Create annotations.
    for (let byteOffset = 0; byteOffset < length; byteOffset += BYTES_PER_SECTOR) {
        const track = Math.floor(byteOffset / BYTES_PER_TRACK);
        const sector = (byteOffset - track * BYTES_PER_TRACK) / BYTES_PER_SECTOR;
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Track " + track + ", sector " + sector, byteOffset, Math.min(byteOffset + BYTES_PER_SECTOR, length)));
    }
    return new Jv1FloppyDisk(binary, error, annotations);
}
exports.decodeJv1FloppyDisk = decodeJv1FloppyDisk;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Jv3FloppyDisk.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-base/dist/Jv3FloppyDisk.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeJv3FloppyDisk = exports.Jv3FloppyDisk = void 0;
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const FloppyDisk_1 = __webpack_require__(/*! ./FloppyDisk */ "./node_modules/trs80-base/dist/FloppyDisk.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
// The JV3 file consists of sectors of different sizes all bunched together. Before that
// comes a directory of these sectors, with three bytes per directory entry (track,
// sector, and flags), mapping in order to the subsequent sectors.
// The directory is in this header:
const HEADER_SIZE = 34 * 256;
// We can fit this many 3-byte records into it:
const RECORD_COUNT = Math.floor(HEADER_SIZE / 3);
// Flags for SectorInfo.
var Flags;
(function (Flags) {
    Flags[Flags["SIZE_CODE_MASK"] = 3] = "SIZE_CODE_MASK";
    Flags[Flags["NON_IBM"] = 4] = "NON_IBM";
    Flags[Flags["BAD_CRC"] = 8] = "BAD_CRC";
    Flags[Flags["SIDE"] = 16] = "SIDE";
    Flags[Flags["DAM_MASK"] = 96] = "DAM_MASK";
    // Single-density.
    Flags[Flags["DAM_SD_FB"] = 0] = "DAM_SD_FB";
    Flags[Flags["DAM_SD_FA"] = 32] = "DAM_SD_FA";
    Flags[Flags["DAM_SD_F9"] = 64] = "DAM_SD_F9";
    Flags[Flags["DAM_SD_F8"] = 96] = "DAM_SD_F8";
    // Double-density.
    Flags[Flags["DAM_DD_FB"] = 0] = "DAM_DD_FB";
    Flags[Flags["DAM_DD_F8"] = 32] = "DAM_DD_F8";
    Flags[Flags["DOUBLE_DENSITY"] = 128] = "DOUBLE_DENSITY";
})(Flags || (Flags = {}));
const FREE = 0xFF;
const SIZE_CODE_MASK = 0x03;
class SectorInfo {
    constructor(track, sector, flags, offset) {
        // Make both FREE to avoid confusion.
        if (track === FREE || sector === FREE) {
            track = FREE;
            sector = FREE;
        }
        this.track = track;
        this.sector = sector;
        this.flags = flags;
        this.offset = offset;
        // In used sectors: 0=256,1=128,2=1024,3=512
        // In free sectors: 0=512,1=1024,2=128,3=256
        const sizeCode = (flags & SIZE_CODE_MASK) ^ (this.isFree() ? 0x02 : 0x01);
        this.size = 128 << sizeCode;
    }
    getSide() {
        return (this.flags & Flags.SIDE) === 0 ? FloppyDisk_1.Side.FRONT : FloppyDisk_1.Side.BACK;
    }
    /**
     * Return the flags as a string, for debugging.
     */
    flagsToString() {
        const parts = [];
        parts.push(this.size + " bytes");
        if ((this.flags & Flags.NON_IBM) !== 0) {
            parts.push("non-IBM");
        }
        if ((this.flags & Flags.BAD_CRC) !== 0) {
            parts.push("bad CRC");
        }
        parts.push("side " + ((this.flags & Flags.SIDE) === 0 ? 0 : 1));
        if ((this.flags & Flags.DOUBLE_DENSITY) !== 0) {
            parts.push("double density");
        }
        else {
            parts.push("single density");
        }
        return parts.join(", ");
    }
    /**
     * Whether the sector entry is free (doesn't represent real space in the file).
     */
    isFree() {
        return this.track === FREE;
    }
    /**
     * Whether the sector is encoded with MFM (instead of FM).
     */
    isDoubleDensity() {
        return (this.flags & Flags.DOUBLE_DENSITY) !== 0;
    }
    /**
     * Whether the sector's data is invalid.
     *
     * Normally FB is normal and F8 is deleted, but the single-density version has
     * two other values (F9 and FA), which we also consider deleted, to match xtrs.
     */
    isDeleted() {
        const dam = this.flags & Flags.DAM_MASK;
        if (this.isDoubleDensity()) {
            return dam === Flags.DAM_DD_F8;
        }
        else {
            return dam !== Flags.DAM_SD_FB;
        }
    }
    /**
     * Whether the floppy had a bar CRC when reading it.
     */
    hasCrcError() {
        return (this.flags & Flags.BAD_CRC) !== 0;
    }
}
/**
 * Floppy disk in the JV3 format.
 */
class Jv3FloppyDisk extends FloppyDisk_1.FloppyDisk {
    constructor(binary, error, annotations, sectorInfos, writeProtected) {
        super(binary, error, annotations, true);
        this.sectorInfos = sectorInfos;
        this.writeProtected = writeProtected;
    }
    getDescription() {
        return "Floppy disk (JV3)";
    }
    readSector(trackNumber, side, sectorNumber) {
        const sectorInfo = this.findSectorInfo(trackNumber, side, sectorNumber);
        if (sectorInfo === undefined) {
            return undefined;
        }
        const data = this.padSector(this.binary.subarray(sectorInfo.offset, sectorInfo.offset + sectorInfo.size), sectorInfo.size);
        const sectorData = new FloppyDisk_1.SectorData(data);
        sectorData.deleted = sectorInfo.isDeleted();
        sectorData.crcError = sectorInfo.hasCrcError();
        return sectorData;
    }
    /**
     * Find the sector for the specified track and side.
     */
    findSectorInfo(track, side, sector) {
        for (const sectorInfo of this.sectorInfos) {
            if (!sectorInfo.isFree() &&
                sectorInfo.track === track &&
                sectorInfo.getSide() === side &&
                (sector === undefined || sectorInfo.sector === sector)) {
                return sectorInfo;
            }
        }
        return undefined;
    }
}
exports.Jv3FloppyDisk = Jv3FloppyDisk;
/**
 * Decode a JV3 floppy disk file.
 */
function decodeJv3FloppyDisk(binary) {
    let error;
    const annotations = [];
    const sectorInfos = [];
    // Read the directory.
    let sectorOffset = HEADER_SIZE;
    for (let i = 0; i < RECORD_COUNT; i++) {
        const offset = i * 3;
        if (offset + 2 >= binary.length) {
            error = "Directory truncated at entry " + i;
            break;
        }
        const track = binary[offset];
        const sector = binary[offset + 1];
        const flags = binary[offset + 2];
        const sectorInfo = new SectorInfo(track, sector, flags, sectorOffset);
        sectorOffset += sectorInfo.size;
        if (!sectorInfo.isFree()) {
            if (sectorOffset > binary.length) {
                error = `Sector truncated at entry ${i} (${sectorOffset} > ${binary.length})`;
                break;
            }
            annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Track " + sectorInfo.track + ", sector " +
                sectorInfo.sector + ", " + sectorInfo.flagsToString(), offset, offset + 3));
            sectorInfos.push(sectorInfo);
        }
    }
    // Annotate the sectors themselves.
    for (const sectorInfo of sectorInfos) {
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Track " + sectorInfo.track + ", sector " + sectorInfo.sector, sectorInfo.offset, sectorInfo.offset + sectorInfo.size));
    }
    const writableOffset = RECORD_COUNT * 3;
    const writable = binary[writableOffset];
    if (writable !== 0 && writable !== 0xFF) {
        error = "Invalid \"writable\" byte: 0x" + z80_base_1.toHexByte(writable);
    }
    const writeProtected = writable === 0;
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation(writeProtected ? "Write protected" : "Writable", writableOffset, writableOffset + 1));
    return new Jv3FloppyDisk(binary, error, annotations, sectorInfos, writeProtected);
}
exports.decodeJv3FloppyDisk = decodeJv3FloppyDisk;


/***/ }),

/***/ "./node_modules/trs80-base/dist/ProgramAnnotation.js":
/*!***********************************************************!*\
  !*** ./node_modules/trs80-base/dist/ProgramAnnotation.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProgramAnnotation = void 0;
/**
 * Information about one particular section of a program. The indices refer back to a binary
 * that the program was parsed from.
 */
class ProgramAnnotation {
    constructor(text, begin, end) {
        this.text = text;
        this.begin = begin;
        this.end = end;
    }
    /**
     * Create a new program annotation with the begin and end increased by the specified offset.
     */
    adjusted(offset) {
        return new ProgramAnnotation(this.text, this.begin + offset, this.end + offset);
    }
}
exports.ProgramAnnotation = ProgramAnnotation;


/***/ }),

/***/ "./node_modules/trs80-base/dist/RawBinaryFile.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-base/dist/RawBinaryFile.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RawBinaryFile = void 0;
const Trs80File_1 = __webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js");
/**
 * File when we don't recognize the type.
 */
class RawBinaryFile extends Trs80File_1.Trs80File {
    constructor(binary) {
        super(binary, undefined, []);
    }
    getDescription() {
        return "Unknown file";
    }
}
exports.RawBinaryFile = RawBinaryFile;


/***/ }),

/***/ "./node_modules/trs80-base/dist/SystemProgram.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-base/dist/SystemProgram.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Tools for dealing with SYSTEM (machine language) programs.
 *
 * http://www.trs-80.com/wordpress/zaps-patches-pokes-tips/tape-and-file-formats-structures/
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeSystemProgram = exports.SystemProgram = exports.SystemChunk = void 0;
const teamten_ts_utils_1 = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const ProgramAnnotation_1 = __webpack_require__(/*! ./ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
const Trs80File_1 = __webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js");
const FILE_HEADER = 0x55;
const DATA_HEADER = 0x3C;
const END_OF_FILE_MARKER = 0x78;
const FILENAME_LENGTH = 6;
/**
 * Represents a chunk of bytes from the file, with a checksum.
 */
class SystemChunk {
    constructor(loadAddress, data, checksum) {
        this.loadAddress = loadAddress;
        this.data = data;
        this.checksum = checksum;
    }
    /**
     * Whether the checksum supplied on tape matches what we compute.
     */
    isChecksumValid() {
        let checksum = 0;
        // Include load address and data.
        checksum += (this.loadAddress >> 8) & 0xFF;
        checksum += this.loadAddress & 0xFF;
        for (const b of this.data) {
            checksum += b;
        }
        checksum &= 0xFF;
        return checksum === this.checksum;
    }
}
exports.SystemChunk = SystemChunk;
/**
 * Class representing a SYSTEM (machine language) program. If the "error" field is set, then something
 * went wrong with the program and the data may be partially loaded.
 */
class SystemProgram extends Trs80File_1.Trs80File {
    constructor(binary, error, filename, chunks, entryPointAddress, annotations) {
        super(binary, error, annotations);
        this.filename = filename;
        this.chunks = chunks;
        this.entryPointAddress = entryPointAddress;
        this.annotations = annotations;
    }
    getDescription() {
        return "System program (" + this.filename + ")";
    }
    /**
     * Convert an address in memory to the original byte offset in the binary. Returns undefined if
     * not found in any chunk.
     */
    addressToByteOffset(address) {
        // Skip file header and block header.
        let offset = 1 + FILENAME_LENGTH + 4;
        for (const chunk of this.chunks) {
            if (address >= chunk.loadAddress && address < chunk.loadAddress + chunk.data.length) {
                return offset + (address - chunk.loadAddress);
            }
            // Skip checksum and block header of the next block.
            offset += chunk.data.length + 5;
        }
        return undefined;
    }
}
exports.SystemProgram = SystemProgram;
/**
 * Decodes a system program from the binary. If the binary is not at all a system
 * program, returns undefined. If it's a system program with decoding errors, returns
 * partially-decoded binary and sets the "error" field.
 */
function decodeSystemProgram(binary) {
    const chunks = [];
    const annotations = [];
    let entryPointAddress = 0;
    const b = new teamten_ts_utils_1.ByteReader(binary);
    const headerByte = b.read();
    if (headerByte === teamten_ts_utils_1.EOF) {
        return undefined;
    }
    if (headerByte !== FILE_HEADER) {
        return undefined;
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation("System file header", b.addr() - 1, b.addr()));
    let filename = b.readString(FILENAME_LENGTH);
    // Make a SystemProgram object with what we have so far.
    const makeSystemProgram = (error) => {
        const programBinary = binary.subarray(0, b.addr());
        return new SystemProgram(programBinary, error, filename, chunks, entryPointAddress, annotations);
    };
    if (filename.length < FILENAME_LENGTH) {
        // Binary is truncated.
        return makeSystemProgram("File is truncated at filename");
    }
    filename = filename.trim();
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Filename "${filename}"`, b.addr() - FILENAME_LENGTH, b.addr()));
    while (true) {
        const marker = b.read();
        if (marker === teamten_ts_utils_1.EOF) {
            return makeSystemProgram("File is truncated at start of block");
        }
        if (marker === END_OF_FILE_MARKER) {
            annotations.push(new ProgramAnnotation_1.ProgramAnnotation("End of file marker", b.addr() - 1, b.addr()));
            break;
        }
        if (marker !== DATA_HEADER) {
            // Here if the marker is 0x55, we could guess that it's a high-speed cassette header.
            return makeSystemProgram("Unexpected byte " + z80_base_1.toHexByte(marker) + " at start of block");
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation("Data chunk marker", b.addr() - 1, b.addr()));
        let length = b.read();
        if (length === teamten_ts_utils_1.EOF) {
            return makeSystemProgram("File is truncated at block length");
        }
        // 0 means 256.
        if (length === 0) {
            length = 256;
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Length (${length} byte${length === 1 ? "" : "s"})`, b.addr() - 1, b.addr()));
        const loadAddress = b.readShort(false);
        if (loadAddress === teamten_ts_utils_1.EOF) {
            return makeSystemProgram("File is truncated at load address");
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Address (0x${z80_base_1.toHexWord(loadAddress)})`, b.addr() - 2, b.addr()));
        const dataStartAddr = b.addr();
        const data = b.readBytes(length);
        if (data.length < length) {
            return makeSystemProgram("File is truncated at data");
        }
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Chunk data`, dataStartAddr, b.addr()));
        const checksum = b.read();
        if (loadAddress === teamten_ts_utils_1.EOF) {
            return makeSystemProgram("File is truncated at checksum");
        }
        const systemChunk = new SystemChunk(loadAddress, data, checksum);
        chunks.push(systemChunk);
        annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Checksum (0x${z80_base_1.toHexByte(checksum)}, ${systemChunk.isChecksumValid() ? "" : "in"}valid)`, b.addr() - 1, b.addr()));
    }
    entryPointAddress = b.readShort(false);
    if (entryPointAddress === teamten_ts_utils_1.EOF) {
        entryPointAddress = 0;
        return makeSystemProgram("File is truncated at entry point address");
    }
    annotations.push(new ProgramAnnotation_1.ProgramAnnotation(`Jump address (0x${z80_base_1.toHexWord(entryPointAddress)})`, b.addr() - 2, b.addr()));
    return makeSystemProgram();
}
exports.decodeSystemProgram = decodeSystemProgram;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Trs80File.js":
/*!***************************************************!*\
  !*** ./node_modules/trs80-base/dist/Trs80File.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trs80File = void 0;
/**
 * Base class for decoded TRS-80 files.
 */
class Trs80File {
    constructor(binary, error, annotations) {
        this.binary = binary;
        this.error = error;
        this.annotations = annotations;
    }
}
exports.Trs80File = Trs80File;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Trs80FileDecoder.js":
/*!**********************************************************!*\
  !*** ./node_modules/trs80-base/dist/Trs80FileDecoder.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeTrs80File = void 0;
const Basic_1 = __webpack_require__(/*! ./Basic */ "./node_modules/trs80-base/dist/Basic.js");
const Cassette_1 = __webpack_require__(/*! ./Cassette */ "./node_modules/trs80-base/dist/Cassette.js");
const CmdProgram_1 = __webpack_require__(/*! ./CmdProgram */ "./node_modules/trs80-base/dist/CmdProgram.js");
const RawBinaryFile_1 = __webpack_require__(/*! ./RawBinaryFile */ "./node_modules/trs80-base/dist/RawBinaryFile.js");
const Jv1FloppyDisk_1 = __webpack_require__(/*! ./Jv1FloppyDisk */ "./node_modules/trs80-base/dist/Jv1FloppyDisk.js");
const Jv3FloppyDisk_1 = __webpack_require__(/*! ./Jv3FloppyDisk */ "./node_modules/trs80-base/dist/Jv3FloppyDisk.js");
const DmkFloppyDisk_1 = __webpack_require__(/*! ./DmkFloppyDisk */ "./node_modules/trs80-base/dist/DmkFloppyDisk.js");
const SystemProgram_1 = __webpack_require__(/*! ./SystemProgram */ "./node_modules/trs80-base/dist/SystemProgram.js");
/**
 * Get the extension of the filename, including the dot, in upper case, or
 * an empty string if the filename does not contain an extension.
 */
function getExtension(filename) {
    // Strip pathname, in case the filename has no dot but a path component does.
    // Not sure if we need to support backslash here.
    const slash = filename.lastIndexOf("/");
    if (slash >= 0) {
        filename = filename.substr(slash + 1);
    }
    // Look for extension.
    const dot = filename.lastIndexOf(".");
    // If the dot is at position 0, then it's just a hidden file, not an extension.
    return dot > 0 ? filename.substr(dot).toUpperCase() : "";
}
/**
 * Decode a file that's known to be a floppy disk, but not what kind specifically.
 */
function decodeDsk(binary) {
    // TODO see trs_disk.c:trs_disk_emutype()
    // TODO see DiskDrive.cpp:Dectect_JV1, etc.
    let trs80File;
    trs80File = DmkFloppyDisk_1.decodeDmkFloppyDisk(binary);
    if (trs80File !== undefined) {
        return trs80File;
    }
    trs80File = Jv1FloppyDisk_1.decodeJv1FloppyDisk(binary);
    if (trs80File !== undefined) {
        return trs80File;
    }
    trs80File = Jv3FloppyDisk_1.decodeJv3FloppyDisk(binary);
    if (trs80File !== undefined) {
        return trs80File;
    }
    return undefined;
}
/**
 * Top-level decoder for any TRS-80 file.
 *
 * @param binary the bytes of the file.
 * @param filename optional filename to help with detection.
 */
function decodeTrs80File(binary, filename) {
    var _a, _b, _c, _d;
    let trs80File;
    const extension = filename === undefined ? "" : getExtension(filename);
    if (extension === ".JV1") {
        return (_a = Jv1FloppyDisk_1.decodeJv1FloppyDisk(binary)) !== null && _a !== void 0 ? _a : new RawBinaryFile_1.RawBinaryFile(binary);
    }
    if (extension === ".DSK") {
        return (_b = decodeDsk(binary)) !== null && _b !== void 0 ? _b : new RawBinaryFile_1.RawBinaryFile(binary);
    }
    if (extension === ".DMK") {
        return (_c = DmkFloppyDisk_1.decodeDmkFloppyDisk(binary)) !== null && _c !== void 0 ? _c : new RawBinaryFile_1.RawBinaryFile(binary);
    }
    // "Model III BiNary" format, invented by George Phillips for trs80gp.
    // Rarely used as a stand-alone file, usually just embedded in .CAS files.
    if (extension === ".3BN") {
        return (_d = SystemProgram_1.decodeSystemProgram(binary)) !== null && _d !== void 0 ? _d : new RawBinaryFile_1.RawBinaryFile(binary);
    }
    trs80File = Cassette_1.decodeCassette(binary);
    if (trs80File !== undefined) {
        return trs80File;
    }
    trs80File = CmdProgram_1.decodeCmdProgram(binary);
    if (trs80File !== undefined) {
        return trs80File;
    }
    trs80File = Basic_1.decodeBasicProgram(binary);
    if (trs80File !== undefined) {
        return trs80File;
    }
    return new RawBinaryFile_1.RawBinaryFile(binary);
}
exports.decodeTrs80File = decodeTrs80File;


/***/ }),

/***/ "./node_modules/trs80-base/dist/Trsdos.js":
/*!************************************************!*\
  !*** ./node_modules/trs80-base/dist/Trsdos.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Classes for handling TRSDOS diskettes.
 *
 * http://www.trs-80.com/wordpress/zaps-patches-pokes-tips/zaps-and-patches/#guidedtour
 * http://www.manmrk.net/tutorials/TRS80/Software/ldos/trs80/doc/prgguide.pdf
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeTrsdos = exports.Trsdos = exports.TrsdosDirEntry = exports.TrsdosHitInfo = exports.TrsdosGatInfo = exports.TrsdosExtent = exports.trsdosProtectionLevelToString = exports.TrsdosProtectionLevel = void 0;
const teamten_ts_utils_1 = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
const FloppyDisk_1 = __webpack_require__(/*! ./FloppyDisk */ "./node_modules/trs80-base/dist/FloppyDisk.js");
// Number of bytes per dir entry in the sector.
const DIR_ENTRY_LENGTH = 48;
// Apparently this is constant in TRSDOS.
const BYTES_PER_SECTOR = 256;
// Apparently this is 3, but somewhere else I read 6.
const SECTORS_PER_GRANULE = 3;
// The number of sectors on each track, numbered 1 to 18.
const SECTORS_PER_TRACK = 18;
// Copyright in the last 16 bytes of each directory sector.
const EXPECTED_TANDY = "(c) 1980 Tandy";
// Password value that means "no password".
const NO_PASSWORD = 0xEF5C;
// Password value for "PASSWORD".
const PASSWORD = 0xD38F;
/**
 * Decodes binary into an ASCII string. Returns undefined if any non-ASCII value is
 * found in the string, where "ASCII" is defined as being in the range 32 to 126 inclusive.
 */
function decodeAscii(binary, trim = true) {
    const parts = [];
    for (const b of binary) {
        if (b === 0x0D) {
            // Auto command ends with carriage return.
            break;
        }
        if (b < 32 || b >= 127) {
            return undefined;
        }
        parts.push(String.fromCodePoint(b));
    }
    let s = parts.join("");
    if (trim) {
        s = s.trim();
    }
    return s;
}
/**
 * Lowest three bits of the directory entry's flag.
 */
var TrsdosProtectionLevel;
(function (TrsdosProtectionLevel) {
    // Keep this values in this order, they match the bit values (0 to 7).
    TrsdosProtectionLevel[TrsdosProtectionLevel["FULL"] = 0] = "FULL";
    TrsdosProtectionLevel[TrsdosProtectionLevel["REMOVE"] = 1] = "REMOVE";
    TrsdosProtectionLevel[TrsdosProtectionLevel["RENAME"] = 2] = "RENAME";
    TrsdosProtectionLevel[TrsdosProtectionLevel["WRITE"] = 3] = "WRITE";
    TrsdosProtectionLevel[TrsdosProtectionLevel["UPDATE"] = 4] = "UPDATE";
    TrsdosProtectionLevel[TrsdosProtectionLevel["READ"] = 5] = "READ";
    TrsdosProtectionLevel[TrsdosProtectionLevel["EXEC"] = 6] = "EXEC";
    TrsdosProtectionLevel[TrsdosProtectionLevel["NO_ACCESS"] = 7] = "NO_ACCESS";
})(TrsdosProtectionLevel = exports.TrsdosProtectionLevel || (exports.TrsdosProtectionLevel = {}));
/**
 * Gets the string version of the protection level enum.
 * @param level
 */
function trsdosProtectionLevelToString(level) {
    switch (level) {
        case TrsdosProtectionLevel.FULL:
            return "FULL";
        case TrsdosProtectionLevel.REMOVE:
            return "REMOVE";
        case TrsdosProtectionLevel.RENAME:
            return "RENAME";
        case TrsdosProtectionLevel.WRITE:
            return "WRITE";
        case TrsdosProtectionLevel.UPDATE:
            return "UPDATE";
        case TrsdosProtectionLevel.READ:
            return "READ";
        case TrsdosProtectionLevel.EXEC:
            return "EXEC";
        case TrsdosProtectionLevel.NO_ACCESS:
            return "NO_ACCESS";
        default:
            return "UNKNOWN";
    }
}
exports.trsdosProtectionLevelToString = trsdosProtectionLevelToString;
/**
 * A contiguous number of sectors for storing part of a file.
 */
class TrsdosExtent {
    constructor(trackNumber, granuleOffset, granuleCount) {
        this.trackNumber = trackNumber;
        this.granuleOffset = granuleOffset;
        this.granuleCount = granuleCount;
    }
}
exports.TrsdosExtent = TrsdosExtent;
/**
 * Decode an array of extents.
 *
 * @param binary byte we'll be pulling the extents from.
 * @param begin index of first extent in binary.
 * @param end index past last extent in binary.
 * @param trackFirst whether the track comes first or second.
 */
function decodeExtents(binary, begin, end, trackFirst) {
    const extents = [];
    for (let i = begin; i < end; i += 2) {
        if (binary[i] === 0xFF && binary[i + 1] === 0xFF) {
            break;
        }
        const trackNumber = binary[trackFirst ? i : i + 1];
        const granuleByte = binary[trackFirst ? i + 1 : i];
        const granuleOffset = granuleByte >> 5;
        const granuleCount = granuleByte & 0x1F;
        if (trackNumber >= 40) {
            // Not a TRSDOS disk.
            return undefined;
        }
        extents.push(new TrsdosExtent(trackNumber, granuleOffset, granuleCount));
    }
    return extents;
}
/**
 * The Granule Allocation Table sector info.
 */
class TrsdosGatInfo {
    constructor(gat, password, name, date, autoCommand) {
        this.gat = gat;
        this.password = password;
        this.name = name;
        this.date = date;
        this.autoCommand = autoCommand;
    }
}
exports.TrsdosGatInfo = TrsdosGatInfo;
/**
 * Converts a sector to a GAT object, or undefined if we don't think this is a GAT sector.
 */
function decodeGatInfo(binary) {
    // One byte for each track.
    const gat = binary.subarray(0, 40);
    // Top two bits don't map to anything, so must be zero.
    for (const g of gat) {
        if ((g & 0xC0) !== 0) {
            return undefined;
        }
    }
    // Assume big endian.
    const password = (binary[0xCE] << 8) | binary[0xCF];
    const name = decodeAscii(binary.subarray(0xD0, 0xD8));
    const date = decodeAscii(binary.subarray(0xD8, 0xE0));
    const autoCommand = decodeAscii(binary.subarray(0xE0));
    // Implies that this is not a TRSDOS disk.
    if (name === undefined || date === undefined || autoCommand === undefined) {
        return undefined;
    }
    return new TrsdosGatInfo(gat, password, name, date, autoCommand);
}
/**
 * The Hash Allocation Table sector info.
 */
class TrsdosHitInfo {
    constructor(hit, systemFiles) {
        this.hit = hit;
        this.systemFiles = systemFiles;
    }
}
exports.TrsdosHitInfo = TrsdosHitInfo;
/**
 * Decode the Hash Index Table sector, or undefined if we don't think this is a TRSDOS disk.
 */
function decodeHitInfo(binary) {
    // One byte for each file.
    const hit = binary.subarray(0, 80);
    const systemFiles = decodeExtents(binary, 0xE0, binary.length, false);
    if (systemFiles === undefined) {
        return undefined;
    }
    return new TrsdosHitInfo(hit, systemFiles);
}
/**
 * Single (valid) directory entry for a file.
 */
class TrsdosDirEntry {
    constructor(flags, month, year, lastSectorSize, lrl, filename, updatePassword, accessPassword, sectorCount, extents) {
        this.flags = flags;
        this.month = month;
        this.year = year;
        this.lastSectorSize = lastSectorSize;
        this.lrl = lrl;
        this.rawFilename = filename;
        this.updatePassword = updatePassword;
        this.accessPassword = accessPassword;
        this.sectorCount = sectorCount;
        this.extents = extents;
    }
    /**
     * Get the protection level for the file.
     */
    getProtectionLevel() {
        return (this.flags & 0x07);
    }
    /**
     * Whether the file is hidden in a directory listing.
     */
    isHidden() {
        return (this.flags & 0x08) !== 0;
    }
    /**
     * Whether the file has an entry in the HIT table. This bit is set to 0 when
     * deleting a file.
     */
    isActive() {
        return (this.flags & 0x10) !== 0;
    }
    /**
     * Whether there should be limitations to how many times you can copy this file.
     * Other docs (maybe for LDOS) say that this indicates "Partitioned Data Set".
     */
    hasBackupLimitation() {
        return (this.flags & 0x20) !== 0;
    }
    /**
     * Whether this is a system file (as opposed to user file).
     */
    isSystemFile() {
        return (this.flags & 0x40) !== 0;
    }
    /**
     * Whether this is an extended entry (as opposed to primary entry). Each entry can
     * only encode four extents, so subsequent extents are stored in extended entries.
     * TODO this says max four extents, but we have space for 13 extents in the binary.
     */
    isExtendedEntry() {
        return (this.flags & 0x80) !== 0;
    }
    getFlagsString() {
        const parts = [];
        parts.push(trsdosProtectionLevelToString(this.getProtectionLevel()));
        if (this.isHidden()) {
            parts.push("hidden");
        }
        if (!this.isActive()) {
            // Should never happen.
            parts.push("inactive");
        }
        if (this.hasBackupLimitation()) {
            parts.push("limits");
        }
        if (this.isSystemFile()) {
            parts.push("system");
        }
        if (this.isExtendedEntry()) {
            parts.push("extended");
        }
        return "[" + parts.join(",") + "]";
    }
    /**
     * Get the basename (part before the period) of the filename.
     */
    getBasename() {
        return this.rawFilename.substr(0, 8).trim();
    }
    /**
     * Get the extension of the filename.
     */
    getExtension() {
        return this.rawFilename.substr(8).trim();
    }
    /**
     * Get the full filename (without the internal spaces of the raw filename). If the
     * file has an extension, it will be preceded by the specified separator.
     */
    getFilename(extensionSeparator) {
        const extension = this.getExtension();
        return this.getBasename() + (extension === "" ? "" : extensionSeparator + extension);
    }
    /**
     * Return the size in bytes.
     */
    getSize() {
        return this.sectorCount * BYTES_PER_SECTOR + this.lastSectorSize;
    }
    /**
     * Return the date in MM/YY format.
     */
    getDateString() {
        return this.month.toString().padStart(2, "0") + "/" + this.year.toString().padStart(2, "0");
    }
    /**
     * Return the date as an object.
     */
    getDate() {
        return new Date(1900 + this.year, this.month - 1);
    }
}
exports.TrsdosDirEntry = TrsdosDirEntry;
/**
 * Decodes a directory entry from a 48-byte chunk, or undefined if the directory entry is empty.
 */
function decodeDirEntry(binary) {
    const flags = binary[0];
    // Check "active" bit. Setting this to zero is how files are deleted. Also check empty filename.
    if ((flags & 0x10) === 0 || binary[5] === 0) {
        return undefined;
    }
    const month = binary[1];
    const year = binary[2];
    const lastSectorSize = binary[3];
    const lrl = ((binary[4] - 1) & 0xFF) + 1; // 0 -> 256.
    const filename = decodeAscii(binary.subarray(5, 16));
    // Not sure how to convert these two into a number. Just use big endian.
    const updatePassword = (binary[16] << 8) | binary[17];
    const accessPassword = (binary[18] << 8) | binary[19];
    // Little endian.
    const sectorCount = (binary[21] << 8) | binary[20];
    const extents = decodeExtents(binary, 22, binary.length, true);
    if (filename === undefined || extents === undefined) {
        // This signals empty directory, but really should imply a non-TRSDOS disk.
        return undefined;
    }
    return new TrsdosDirEntry(flags, month, year, lastSectorSize, lrl, filename, updatePassword, accessPassword, sectorCount, extents);
}
/**
 * A decoded TRSDOS diskette.
 */
class Trsdos {
    constructor(disk, gatInfo, hitInfo, dirEntries) {
        this.disk = disk;
        this.gatInfo = gatInfo;
        this.hitInfo = hitInfo;
        this.dirEntries = dirEntries;
    }
    /**
     * Read the binary for a file on the diskette.
     */
    readFile(dirEntry) {
        const parts = [];
        let sectorCount = dirEntry.sectorCount + (dirEntry.lastSectorSize > 0 ? 1 : 0);
        for (const extent of dirEntry.extents) {
            let trackNumber = extent.trackNumber;
            let sectorNumber = extent.granuleOffset * SECTORS_PER_GRANULE + 1;
            for (let i = 0; i < extent.granuleCount * SECTORS_PER_GRANULE && sectorCount > 0; i++, sectorNumber++, sectorCount--) {
                if (sectorNumber > SECTORS_PER_TRACK) {
                    // Move to the next track.
                    sectorNumber -= SECTORS_PER_TRACK;
                    trackNumber += 1;
                }
                const sector = this.disk.readSector(trackNumber, FloppyDisk_1.Side.FRONT, sectorNumber);
                if (sector === undefined) {
                    console.log(`Sector couldn't be read ${trackNumber}, ${sectorNumber}`);
                    // TODO
                }
                else {
                    // TODO check deleted?
                    if (sector.crcError) {
                        console.log("Sector has CRC error");
                    }
                    if (sector.deleted) {
                        // console.log("Sector " + sectorNumber + " is deleted");
                    }
                    parts.push(sector.data);
                }
            }
        }
        // Clip last sector.
        if (parts.length > 0 && dirEntry.lastSectorSize > 0) {
            parts[parts.length - 1] = parts[parts.length - 1].subarray(0, dirEntry.lastSectorSize);
        }
        return teamten_ts_utils_1.concatByteArrays(parts);
    }
}
exports.Trsdos = Trsdos;
/**
 * Decode a TRSDOS diskette, or return undefined if this does not look like such a diskette.
 */
function decodeTrsdos(disk) {
    // Decode Granule Allocation Table sector.
    const gatSector = disk.readSector(17, FloppyDisk_1.Side.FRONT, 1);
    if (gatSector === undefined || gatSector.deleted) {
        return undefined;
    }
    const gatInfo = decodeGatInfo(gatSector.data);
    if (gatInfo === undefined) {
        return undefined;
    }
    // Decode Hash Index Table sector.
    const hitSector = disk.readSector(17, FloppyDisk_1.Side.FRONT, 2);
    if (hitSector === undefined || hitSector.deleted) {
        return undefined;
    }
    const hitInfo = decodeHitInfo(hitSector.data);
    if (hitInfo === undefined) {
        return undefined;
    }
    // Decode directory entries.
    const dirEntries = [];
    for (let k = 0; k < 16; k++) {
        const dirSector = disk.readSector(17, FloppyDisk_1.Side.FRONT, k + 3);
        if (dirSector !== undefined) {
            const tandy = decodeAscii(dirSector.data.subarray(5 * DIR_ENTRY_LENGTH));
            if (tandy !== EXPECTED_TANDY) {
                console.error(`Expected "${EXPECTED_TANDY}", got "${tandy}"`);
                return undefined;
            }
            for (let j = 0; j < 5; j++) {
                const dirEntry = decodeDirEntry(dirSector.data.subarray(j * DIR_ENTRY_LENGTH, (j + 1) * DIR_ENTRY_LENGTH));
                if (dirEntry !== undefined) {
                    dirEntries.push(dirEntry);
                }
            }
        }
    }
    return new Trsdos(disk, gatInfo, hitInfo, dirEntries);
}
exports.decodeTrsdos = decodeTrsdos;


/***/ }),

/***/ "./node_modules/trs80-base/dist/index.js":
/*!***********************************************!*\
  !*** ./node_modules/trs80-base/dist/index.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./Basic */ "./node_modules/trs80-base/dist/Basic.js"), exports);
__exportStar(__webpack_require__(/*! ./CmdProgram */ "./node_modules/trs80-base/dist/CmdProgram.js"), exports);
__exportStar(__webpack_require__(/*! ./Cassette */ "./node_modules/trs80-base/dist/Cassette.js"), exports);
__exportStar(__webpack_require__(/*! ./SystemProgram */ "./node_modules/trs80-base/dist/SystemProgram.js"), exports);
__exportStar(__webpack_require__(/*! ./Trs80File */ "./node_modules/trs80-base/dist/Trs80File.js"), exports);
__exportStar(__webpack_require__(/*! ./RawBinaryFile */ "./node_modules/trs80-base/dist/RawBinaryFile.js"), exports);
__exportStar(__webpack_require__(/*! ./Trs80FileDecoder */ "./node_modules/trs80-base/dist/Trs80FileDecoder.js"), exports);
__exportStar(__webpack_require__(/*! ./FloppyDisk */ "./node_modules/trs80-base/dist/FloppyDisk.js"), exports);
__exportStar(__webpack_require__(/*! ./Jv1FloppyDisk */ "./node_modules/trs80-base/dist/Jv1FloppyDisk.js"), exports);
__exportStar(__webpack_require__(/*! ./Trsdos */ "./node_modules/trs80-base/dist/Trsdos.js"), exports);
__exportStar(__webpack_require__(/*! ./Addresses */ "./node_modules/trs80-base/dist/Addresses.js"), exports);


/***/ }),

/***/ "./node_modules/trs80-disasm/dist/KnownLabels.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-disasm/dist/KnownLabels.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TRS80_MODEL_III_KNOWN_LABELS = void 0;
exports.TRS80_MODEL_III_KNOWN_LABELS = [
    [0x0298, "clkon"],
    [0x02a1, "clkoff"],
    [0x0296, "cshin"],
    [0x0235, "csin"],
    [0x0287, "cshwr"],
    [0x01f8, "csoff"],
    [0x0264, "csout"],
    [0x3033, "date"],
    [0x0060, "delay"],
    [0x0069, "initio"],
    [0x002b, "kbchar"],
    [0x0040, "kbline"],
    [0x0049, "kbwait"],
    [0x028d, "kbbrk"],
    [0x003b, "prchar"],
    [0x01d9, "prscn"],
    [0x1a19, "ready"],
    [0x0000, "reset"],
    [0x006c, "route"],
    [0x005a, "rsinit"],
    [0x0050, "rsrcv"],
    [0x0055, "rstx"],
    [0x3042, "setcas"],
    [0x3036, "time"],
    [0x0033, "vdchar"],
    [0x01c9, "vdcls"],
    [0x021b, "vdline"],
];


/***/ }),

/***/ "./node_modules/trs80-disasm/dist/Main.js":
/*!************************************************!*\
  !*** ./node_modules/trs80-disasm/dist/Main.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.disasmForTrs80Program = void 0;
const trs80_base_1 = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
const z80_disasm_1 = __webpack_require__(/*! z80-disasm */ "./node_modules/z80-disasm/dist/index.js");
const KnownLabels_1 = __webpack_require__(/*! ./KnownLabels */ "./node_modules/trs80-disasm/dist/KnownLabels.js");
// Whether to try to disassemble this chunk.
function shouldDisassembleSystemProgramChunk(chunk) {
    if (chunk.loadAddress >= trs80_base_1.TRS80_SCREEN_BEGIN && chunk.loadAddress + chunk.data.length <= trs80_base_1.TRS80_SCREEN_END) {
        return false;
    }
    // Various addresses that don't represent code.
    if (chunk.loadAddress === 0x4210 || chunk.loadAddress === 0x401E) {
        return false;
    }
    return true;
}
/**
 * Create and configure a disassembler for the specified program.
 */
function disasmForTrs80Program(program) {
    const disasm = new z80_disasm_1.Disasm();
    disasm.addLabels(z80_disasm_1.Z80_KNOWN_LABELS);
    disasm.addLabels(KnownLabels_1.TRS80_MODEL_III_KNOWN_LABELS);
    if (program.entryPointAddress !== undefined) {
        disasm.addLabels([[program.entryPointAddress, "main"]]);
    }
    if (program instanceof trs80_base_1.CmdProgram) {
        for (const chunk of program.chunks) {
            if (chunk instanceof trs80_base_1.CmdLoadBlockChunk) {
                disasm.addChunk(chunk.loadData, chunk.address);
            }
            if (chunk instanceof trs80_base_1.CmdTransferAddressChunk) {
                // Not sure what to do here. I've seen junk after this block, and we risk
                // overwriting valid things in memory. I suspect that CMD parsers of the time,
                // when running into this block, would immediately just jump to the address
                // and ignore everything after it, so let's emulate that.
                break;
            }
        }
    }
    else if (program instanceof trs80_base_1.SystemProgram) {
        for (const chunk of program.chunks) {
            if (shouldDisassembleSystemProgramChunk(chunk)) {
                disasm.addChunk(chunk.data, chunk.loadAddress);
            }
        }
    }
    else {
        throw new Error("program is neither SystemProgram nor CmdProgram");
    }
    if (program.entryPointAddress !== undefined) {
        disasm.addEntryPoint(program.entryPointAddress);
    }
    return disasm;
}
exports.disasmForTrs80Program = disasmForTrs80Program;


/***/ }),

/***/ "./node_modules/trs80-disasm/dist/index.js":
/*!*************************************************!*\
  !*** ./node_modules/trs80-disasm/dist/index.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./Main */ "./node_modules/trs80-disasm/dist/Main.js"), exports);
__exportStar(__webpack_require__(/*! ./KnownLabels */ "./node_modules/trs80-disasm/dist/KnownLabels.js"), exports);


/***/ }),

/***/ "./node_modules/z80-base/dist/Flag.js":
/*!********************************************!*\
  !*** ./node_modules/z80-base/dist/Flag.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * The flag bits in the F register.
 */
var Flag;
(function (Flag) {
    /**
     * Carry and borrow. Indicates that the addition or subtraction did not
     * fit in the register.
     */
    Flag[Flag["C"] = 1] = "C";
    /**
     * Set if the last operation was a subtraction.
     */
    Flag[Flag["N"] = 2] = "N";
    /**
     * Parity: Indicates that the result has an even number of bits set.
     */
    Flag[Flag["P"] = 4] = "P";
    /**
     * Overflow: Indicates that two's complement does not fit in register.
     */
    Flag[Flag["V"] = 4] = "V";
    /**
     * Undocumented bit, but internal state can leak into it.
     */
    Flag[Flag["X3"] = 8] = "X3";
    /**
     * Half carry: Carry from bit 3 to bit 4 during BCD operations.
     */
    Flag[Flag["H"] = 16] = "H";
    /**
     * Undocumented bit, but internal state can leak into it.
     */
    Flag[Flag["X5"] = 32] = "X5";
    /**
     * Set if value is zero.
     */
    Flag[Flag["Z"] = 64] = "Z";
    /**
     * Set of value is negative.
     */
    Flag[Flag["S"] = 128] = "S";
})(Flag = exports.Flag || (exports.Flag = {}));


/***/ }),

/***/ "./node_modules/z80-base/dist/Register.js":
/*!************************************************!*\
  !*** ./node_modules/z80-base/dist/Register.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * List of all word registers.
 */
const WORD_REG = new Set(["af", "bc", "de", "hl", "af'", "bc'", "de'", "hl'", "ix", "iy", "sp", "pc"]);
/**
 * List of all byte registers.
 */
const BYTE_REG = new Set(["a", "f", "b", "c", "d", "e", "h", "l", "ixh", "ixl", "iyh", "iyl", "i", "r"]);
/**
 * Determine whether a register stores a word.
 */
function isWordReg(s) {
    return WORD_REG.has(s.toLowerCase());
}
exports.isWordReg = isWordReg;
/**
 * Determine whether a register stores a byte.
 */
function isByteReg(s) {
    return BYTE_REG.has(s.toLowerCase());
}
exports.isByteReg = isByteReg;


/***/ }),

/***/ "./node_modules/z80-base/dist/RegisterSet.js":
/*!***************************************************!*\
  !*** ./node_modules/z80-base/dist/RegisterSet.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Utils_1 = __webpack_require__(/*! ./Utils */ "./node_modules/z80-base/dist/Utils.js");
/**
 * All registers in a Z80.
 */
class RegisterSet {
    constructor() {
        // External state:
        this.af = 0;
        this.bc = 0;
        this.de = 0;
        this.hl = 0;
        this.afPrime = 0;
        this.bcPrime = 0;
        this.dePrime = 0;
        this.hlPrime = 0;
        this.ix = 0;
        this.iy = 0;
        this.sp = 0;
        this.pc = 0;
        // Internal state:
        this.memptr = 0;
        this.i = 0;
        this.r = 0; // Low 7 bits of R.
        this.r7 = 0; // Bit 7 of R.
        this.iff1 = 0;
        this.iff2 = 0;
        this.im = 0;
        this.halted = 0;
    }
    get a() {
        return Utils_1.hi(this.af);
    }
    set a(value) {
        this.af = Utils_1.word(value, this.f);
    }
    get f() {
        return Utils_1.lo(this.af);
    }
    set f(value) {
        this.af = Utils_1.word(this.a, value);
    }
    get b() {
        return Utils_1.hi(this.bc);
    }
    set b(value) {
        this.bc = Utils_1.word(value, this.c);
    }
    get c() {
        return Utils_1.lo(this.bc);
    }
    set c(value) {
        this.bc = Utils_1.word(this.b, value);
    }
    get d() {
        return Utils_1.hi(this.de);
    }
    set d(value) {
        this.de = Utils_1.word(value, this.e);
    }
    get e() {
        return Utils_1.lo(this.de);
    }
    set e(value) {
        this.de = Utils_1.word(this.d, value);
    }
    get h() {
        return Utils_1.hi(this.hl);
    }
    set h(value) {
        this.hl = Utils_1.word(value, this.l);
    }
    get l() {
        return Utils_1.lo(this.hl);
    }
    set l(value) {
        this.hl = Utils_1.word(this.h, value);
    }
    get ixh() {
        return Utils_1.hi(this.ix);
    }
    set ixh(value) {
        this.ix = Utils_1.word(value, this.ixl);
    }
    get ixl() {
        return Utils_1.lo(this.ix);
    }
    set ixl(value) {
        this.ix = Utils_1.word(this.ixh, value);
    }
    get iyh() {
        return Utils_1.hi(this.iy);
    }
    set iyh(value) {
        this.iy = Utils_1.word(value, this.iyl);
    }
    get iyl() {
        return Utils_1.lo(this.iy);
    }
    set iyl(value) {
        this.iy = Utils_1.word(this.iyh, value);
    }
    /**
     * Combine the two R parts together.
     */
    get rCombined() {
        return (this.r7 & 0x80) | (this.r & 0xF7);
    }
}
exports.RegisterSet = RegisterSet;
/**
 * All real fields of RegisterSet, for enumeration.
 */
exports.registerSetFields = [
    "af", "bc", "de", "hl",
    "afPrime", "bcPrime", "dePrime", "hlPrime",
    "ix", "iy", "sp", "pc",
    "memptr", "i", "r", "iff1", "iff2", "im", "halted"
];


/***/ }),

/***/ "./node_modules/z80-base/dist/Utils.js":
/*!*********************************************!*\
  !*** ./node_modules/z80-base/dist/Utils.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Various utility functions.
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Convert a number to hex and zero-pad to the specified number of hex digits.
 */
function toHex(value, digits) {
    return value.toString(16).toUpperCase().padStart(digits, "0");
}
exports.toHex = toHex;
/**
 * Convert a byte to hex.
 */
function toHexByte(value) {
    return toHex(value, 2);
}
exports.toHexByte = toHexByte;
/**
 * Convert a word to hex.
 */
function toHexWord(value) {
    return toHex(value, 4);
}
exports.toHexWord = toHexWord;
/**
 * Convert a long (32-bit value) to hex.
 */
function toHexLong(value) {
    value &= 0xFFFFFFFF;
    // Convert two's complement negative numbers to positive numbers.
    if (value < 0) {
        value += 0x100000000;
    }
    return value.toString(16).toUpperCase().padStart(8, "0");
}
exports.toHexLong = toHexLong;
/**
 * Return the high byte of a word.
 */
function hi(value) {
    return (value >> 8) & 0xFF;
}
exports.hi = hi;
/**
 * Return the low byte of a word.
 */
function lo(value) {
    return value & 0xFF;
}
exports.lo = lo;
/**
 * Create a word from a high and low byte.
 */
function word(highByte, lowByte) {
    return ((highByte & 0xFF) << 8) | (lowByte & 0xFF);
}
exports.word = word;
/**
 * Increment a byte.
 */
function inc8(value) {
    return add8(value, 1);
}
exports.inc8 = inc8;
/**
 * Increment a word.
 */
function inc16(value) {
    return add16(value, 1);
}
exports.inc16 = inc16;
/**
 * Decrement a byte.
 */
function dec8(value) {
    return sub8(value, 1);
}
exports.dec8 = dec8;
/**
 * Decrement a word.
 */
function dec16(value) {
    return sub16(value, 1);
}
exports.dec16 = dec16;
/**
 * Add two bytes together.
 */
function add8(a, b) {
    return (a + b) & 0xFF;
}
exports.add8 = add8;
/**
 * Add two words together.
 */
function add16(a, b) {
    return (a + b) & 0xFFFF;
}
exports.add16 = add16;
/**
 * Subtract two bytes.
 */
function sub8(a, b) {
    return (a - b) & 0xFF;
}
exports.sub8 = sub8;
/**
 * Subtract two words.
 */
function sub16(a, b) {
    return (a - b) & 0xFFFF;
}
exports.sub16 = sub16;
/**
 * Convert a byte to a signed number (e.g., 0xff to -1).
 */
function signedByte(value) {
    return value >= 128 ? value - 256 : value;
}
exports.signedByte = signedByte;


/***/ }),

/***/ "./node_modules/z80-base/dist/index.js":
/*!*********************************************!*\
  !*** ./node_modules/z80-base/dist/index.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./Register */ "./node_modules/z80-base/dist/Register.js"));
__export(__webpack_require__(/*! ./RegisterSet */ "./node_modules/z80-base/dist/RegisterSet.js"));
__export(__webpack_require__(/*! ./Utils */ "./node_modules/z80-base/dist/Utils.js"));
__export(__webpack_require__(/*! ./Flag */ "./node_modules/z80-base/dist/Flag.js"));


/***/ }),

/***/ "./node_modules/z80-disasm/dist/Disasm.js":
/*!************************************************!*\
  !*** ./node_modules/z80-disasm/dist/Disasm.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Opcodes_json_1 = __importDefault(__webpack_require__(/*! ./Opcodes.json */ "./node_modules/z80-disasm/dist/Opcodes.json"));
const Instruction_1 = __webpack_require__(/*! ./Instruction */ "./node_modules/z80-disasm/dist/Instruction.js");
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const Preamble_1 = __webpack_require__(/*! ./Preamble */ "./node_modules/z80-disasm/dist/Preamble.js");
// Temporary string used for address substitution.
const TARGET = "TARGET";
// Number of bytes in memory.
const MEM_SIZE = 64 * 1024;
// Whether the byte can be converted to readable ASCII.
function isPrintable(b) {
    return b >= 32 && b < 127;
}
// Whether the byte is appropriate for a .text instruction.
function isText(b) {
    return isPrintable(b) || b === 0x0A || b === 0x0D;
}
/**
 * Main class for disassembling a binary.
 */
class Disasm {
    constructor() {
        this.memory = new Uint8Array(MEM_SIZE);
        this.hasContent = new Uint8Array(MEM_SIZE);
        this.isDecoded = new Uint8Array(MEM_SIZE);
        this.instructions = new Array(MEM_SIZE);
        this.knownLabels = new Map();
        /**
         * Addresses that might be jumped to when running the code.
         */
        this.entryPoints = [];
        /**
         * Values that were loaded into a 16-bit register. We can't be sure that these were meant to be
         * addresses, but guess that they were if it helps make a nicer disassembly.
         */
        this.referencedAddresses = new Set();
    }
    /**
     * Add a chunk of binary somewhere in memory.
     */
    addChunk(bin, address) {
        this.memory.set(bin, address);
        this.hasContent.fill(1, address, address + bin.length);
    }
    /**
     * Add a memory location that might be jumped to when running this program. If no entry
     * points are specified, then the lower address for which we have binary will be used.
     */
    addEntryPoint(entryPoint) {
        this.entryPoints.push(entryPoint);
    }
    /**
     * Disassemble one instruction.
     *
     * @param address the address to disassemble.
     */
    disassembleOne(address) {
        var _a;
        // Bytes decoded so far in the instruction being disassembled.
        let bytes = [];
        // Get the next byte.
        const next = () => {
            const byte = this.memory[address];
            bytes.push(byte);
            address = z80_base_1.inc16(address);
            return byte;
        };
        const startAddress = address;
        let jumpTarget = undefined;
        // Fetch base instruction.
        let byte = next();
        let map = Opcodes_json_1.default;
        let instruction;
        while (instruction === undefined) {
            let value = map[byte.toString(16)];
            if (value === undefined) {
                // TODO
                // asm.push(".byte 0x" + byte.toString(16));
                const stringParams = bytes.map((n) => "0x" + z80_base_1.toHex(n, 2));
                instruction = new Instruction_1.Instruction(startAddress, bytes, ".byte", stringParams, stringParams);
            }
            else if (value.shift !== undefined) {
                // Descend to sub-map.
                map = value.shift;
                byte = next();
            }
            else {
                // Found instruction. Parse arguments.
                const args = (_a = value.params, (_a !== null && _a !== void 0 ? _a : [])).slice();
                for (let i = 0; i < args.length; i++) {
                    let arg = args[i];
                    let changed;
                    do {
                        changed = false;
                        // Fetch word argument.
                        let pos = arg.indexOf("nnnn");
                        if (pos >= 0) {
                            const lowByte = next();
                            const highByte = next();
                            const nnnn = z80_base_1.word(highByte, lowByte);
                            let target;
                            if (value.mnemonic === "call" || value.mnemonic === "jp") {
                                jumpTarget = nnnn;
                                target = TARGET;
                            }
                            else {
                                target = "0x" + z80_base_1.toHex(nnnn, 4);
                                // Perhaps we should only do this if the destination register is HL, since that's
                                // often an address and other registers are more often lengths.
                                this.referencedAddresses.add(nnnn);
                            }
                            arg = arg.substr(0, pos) + target + arg.substr(pos + 4);
                            changed = true;
                        }
                        // Fetch byte argument.
                        pos = arg.indexOf("nn");
                        if (pos === -1) {
                            pos = arg.indexOf("dd");
                        }
                        if (pos >= 0) {
                            const nn = next();
                            arg = arg.substr(0, pos) + "0x" + z80_base_1.toHex(nn, 2) + arg.substr(pos + 2);
                            changed = true;
                        }
                        // Fetch offset argument.
                        pos = arg.indexOf("offset");
                        if (pos >= 0) {
                            const offset = z80_base_1.signedByte(next());
                            jumpTarget = address + offset;
                            arg = arg.substr(0, pos) + TARGET + arg.substr(pos + 6);
                            changed = true;
                        }
                    } while (changed);
                    args[i] = arg;
                }
                instruction = new Instruction_1.Instruction(startAddress, bytes, value.mnemonic, value.params, args);
                if (jumpTarget !== undefined) {
                    instruction.jumpTarget = jumpTarget;
                }
            }
        }
        return instruction;
    }
    /**
     * Makes a data (.byte, .text) instruction starting at the specified address.
     */
    makeDataInstruction(address) {
        const startAddress = address;
        const parts = [];
        let mnemonic = undefined;
        // Look for contiguous sequence of either text or not text.
        if (isText(this.memory[address])) {
            // Gobble as much text as we can.
            mnemonic = ".text";
            while (address < MEM_SIZE && this.hasContent[address] && !this.isDecoded[address] &&
                isText(this.memory[address]) && address - startAddress < 50 &&
                !(address > startAddress && this.referencedAddresses.has(address))) {
                const byte = this.memory[address];
                if (isPrintable(byte)) {
                    let char = String.fromCharCode(byte);
                    if (char === "\"") {
                        // zasm doesn't support this backslash syntax. We'd have to enclose the whole string
                        // with single quotes.
                        // http://k1.spdns.de/Develop/Projects/zasm/Documentation/z79.htm#R
                        char = "\\\"";
                    }
                    if (parts.length > 0 && parts[parts.length - 1].startsWith("\"")) {
                        const s = parts[parts.length - 1];
                        parts[parts.length - 1] = s.substring(0, s.length - 1) + char + "\"";
                    }
                    else {
                        parts.push("\"" + char + "\"");
                    }
                }
                else {
                    parts.push("0x" + z80_base_1.toHexByte(byte));
                }
                address += 1;
            }
            // See if it's too short.
            if (address - startAddress < 2) {
                // Probably not actual text.
                mnemonic = undefined;
                parts.splice(0, parts.length);
                address = startAddress;
            }
            else {
                // Allow terminating NUL. Also allow terminating 0x03, it was used by the TRS-80 $VDLINE routine.
                if (address < MEM_SIZE && this.hasContent[address] &&
                    !(address > startAddress && this.referencedAddresses.has(address)) &&
                    !this.isDecoded[address] && (this.memory[address] === 0x00 || this.memory[address] === 0x03)) {
                    parts.push("0x" + z80_base_1.toHexByte(this.memory[address]));
                    address += 1;
                }
            }
        }
        if (mnemonic === undefined) {
            mnemonic = ".byte";
            while (address < MEM_SIZE && this.hasContent[address] && !this.isDecoded[address] &&
                address - startAddress < 8 && !(address > startAddress && this.referencedAddresses.has(address))) {
                parts.push("0x" + z80_base_1.toHexByte(this.memory[address]));
                address += 1;
            }
        }
        const bytes = Array.from(this.memory.slice(startAddress, address));
        return new Instruction_1.Instruction(startAddress, bytes, mnemonic, parts, parts);
    }
    /**
     * Add an array of known label ([address, label] pairs).
     */
    addLabels(labels) {
        for (const [address, label] of labels) {
            this.knownLabels.set(address, label);
        }
    }
    /**
     * Whether we have a label with this name. This is pretty slow currently, but is only used
     * where that doesn't matter. Speed up with a set later if necessary.
     */
    haveLabel(label) {
        for (const l of this.knownLabels.values()) {
            if (l === label) {
                return true;
            }
        }
        return false;
    }
    /**
     * Add the label or, if it's already there, add a suffix to make it unique.
     */
    addUniqueLabel(address, label) {
        let suffix = 1;
        while (suffix < 1000) {
            const uniqueLabel = label + (suffix === 1 ? "" : suffix);
            if (this.haveLabel(uniqueLabel)) {
                suffix += 1;
            }
            else {
                this.addLabels([[address, uniqueLabel]]);
                break;
            }
        }
    }
    /**
     * Disassemble all instructions and assign labels.
     */
    disassemble() {
        var _a;
        // First, see if there's a preamble that copies the program else where in memory and jumps to it.
        // Use numerical for-loop instead of for-of because we modify the array in the loop and I
        // don't know what guarantees JavaScript makes about that.
        for (let i = 0; i < this.entryPoints.length; i++) {
            const entryPoint = this.entryPoints[i];
            const preamble = Preamble_1.Preamble.detect(this.memory, entryPoint);
            if (preamble !== undefined) {
                const begin = preamble.sourceAddress;
                const end = begin + preamble.copyLength;
                this.addChunk(this.memory.subarray(begin, end), preamble.destinationAddress);
                // Unmark this so that we don't decode it as data. It's possible that the program makes use of
                // it, but unlikely.
                this.hasContent.fill(0, begin, end);
                this.addUniqueLabel(preamble.jumpAddress, "main");
                // It might have a preamble! See Galaxy Invasion.
                this.addEntryPoint(preamble.jumpAddress);
            }
        }
        // Create set of addresses we want to decode, starting with our entry points.
        const addressesToDecode = new Set();
        const addAddressToDecode = (number) => {
            if (number !== undefined &&
                this.hasContent[number] &&
                this.instructions[number] === undefined) {
                addressesToDecode.add(number);
            }
        };
        if (this.entryPoints.length === 0) {
            // No explicit entry points. Default to lowest address we have data for.
            for (let address = 0; address < MEM_SIZE; address++) {
                if (this.hasContent[address]) {
                    addressesToDecode.add(address);
                    break;
                }
            }
            if (this.entryPoints.length === 0) {
                throw new Error("no binary content was specified");
            }
        }
        else {
            for (const address of this.entryPoints) {
                addressesToDecode.add(address);
            }
        }
        // Keep decoding as long as we have addresses to decode.
        while (addressesToDecode.size !== 0) {
            // Pick any to do next.
            const address = addressesToDecode.values().next().value;
            addressesToDecode.delete(address);
            const instruction = this.disassembleOne(address);
            this.instructions[address] = instruction;
            this.isDecoded.fill(1, address, address + instruction.bin.length);
            addAddressToDecode(instruction.jumpTarget);
            if (instruction.continues()) {
                addAddressToDecode(address + instruction.bin.length);
            }
        }
        // Map from jump target to list of instructions that jump there.
        const jumpTargetMap = new Map();
        // Make list of instructions in memory order.
        const instructions = [];
        for (let address = 0; address < MEM_SIZE; address++) {
            if (this.hasContent[address]) {
                let instruction = this.instructions[address];
                if (instruction === undefined) {
                    instruction = this.makeDataInstruction(address);
                }
                instructions.push(instruction);
                if (instruction.jumpTarget !== undefined) {
                    // Add this instruction to the list of instructions that call this target.
                    let sources = jumpTargetMap.get(instruction.jumpTarget);
                    if (sources === undefined) {
                        sources = [];
                        jumpTargetMap.set(instruction.jumpTarget, sources);
                    }
                    sources.push(instruction);
                }
                address += instruction.bin.length - 1;
            }
        }
        // Assign labels.
        let labelCounter = 1;
        for (const instruction of instructions) {
            let label = this.knownLabels.get(instruction.address);
            const sources = (_a = jumpTargetMap.get(instruction.address), (_a !== null && _a !== void 0 ? _a : []));
            if (sources.length !== 0) {
                if (label === undefined) {
                    // Make anonymous label.
                    label = "label" + labelCounter++;
                }
            }
            if (label !== undefined) {
                instruction.label = label;
                // Replace pseudo-target in instruction.
                for (const source of sources) {
                    source.replaceArgVariable(TARGET, label);
                }
            }
        }
        // Replace the target variable with the actual address for those
        // jumps that go outside our disassembled code.
        for (const instruction of instructions) {
            if (instruction.jumpTarget !== undefined) {
                let label = this.knownLabels.get(instruction.jumpTarget);
                if (label === undefined) {
                    label = "0x" + z80_base_1.toHexWord(instruction.jumpTarget);
                }
                instruction.replaceArgVariable(TARGET, label);
            }
        }
        return instructions;
    }
}
exports.Disasm = Disasm;


/***/ }),

/***/ "./node_modules/z80-disasm/dist/Instruction.js":
/*!*****************************************************!*\
  !*** ./node_modules/z80-disasm/dist/Instruction.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
class Instruction {
    constructor(address, bin, mnemonic, params, args) {
        this.address = address;
        this.bin = bin;
        this.mnemonic = mnemonic;
        this.params = (params !== null && params !== void 0 ? params : []);
        this.args = (args !== null && args !== void 0 ? args : []);
    }
    /**
     * Text version of the binary: two-digit hex numbers separated by a space.
     */
    binText() {
        return this.bin.map(z80_base_1.toHexByte).join(" ");
    }
    /**
     * Text of the instruction (e.g., "ld hl,0x1234").
     */
    toText() {
        return (this.mnemonic + " " + this.args.join(",")).trim();
    }
    /**
     * Replace all instances of "varName" in the args field with a replacement.
     */
    replaceArgVariable(varName, replacement) {
        const args = this.args;
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            let changed;
            do {
                changed = false;
                const pos = arg.indexOf(varName);
                if (pos >= 0) {
                    arg = arg.substr(0, pos) + replacement + arg.substr(pos + varName.length);
                    changed = true;
                }
            } while (changed);
            args[i] = arg;
        }
    }
    /**
     * Whether this instruction, when executed, potentially continues on to the next instructions. For example,
     * "nop" and "jr z,foo" return true, but "ret" and "jr foo" return false.
     */
    continues() {
        // Return without a flag test.
        if (this.mnemonic === "ret" && this.args.length === 0) {
            return false;
        }
        // Return from interrupt.
        if (this.mnemonic === "reti" || this.mnemonic === "retn") {
            return false;
        }
        // Jump without a flag test.
        if ((this.mnemonic === "jp" || this.mnemonic === "jr") && this.args.length === 1) {
            return false;
        }
        // All else might continue.
        return true;
    }
}
exports.Instruction = Instruction;


/***/ }),

/***/ "./node_modules/z80-disasm/dist/KnownLabels.js":
/*!*****************************************************!*\
  !*** ./node_modules/z80-disasm/dist/KnownLabels.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Z80_KNOWN_LABELS = [
    [0x0000, "rst00"],
    [0x0008, "rst08"],
    [0x0010, "rst10"],
    [0x0018, "rst18"],
    [0x0020, "rst20"],
    [0x0028, "rst28"],
    [0x0030, "rst30"],
    [0x0038, "rst38"],
];


/***/ }),

/***/ "./node_modules/z80-disasm/dist/Preamble.js":
/*!**************************************************!*\
  !*** ./node_modules/z80-disasm/dist/Preamble.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Information about a preamble that might copy the rest of the program elsewhere in memory. It typically looks like:
 *
 *     6000  21 0E 60            ld hl,0x600E
 *     6003  11 00 43            ld de,0x4300
 *     6006  01 5C 07            ld bc,0x075C
 *     6009  ED B0               ldir
 *     600B  C3 00 43            jp 0x4300
 *     600E  [program to be copied]
 *
 */
class Preamble {
    constructor(preambleLength, sourceAddress, destinationAddress, copyLength, jumpAddress) {
        this.preambleLength = preambleLength;
        this.sourceAddress = sourceAddress;
        this.destinationAddress = destinationAddress;
        this.copyLength = copyLength;
        this.jumpAddress = jumpAddress;
    }
    /**
     * Detect a preamble that copies the program to another address.
     */
    static detect(memory, entryPoint) {
        let preambleLength = 0x0E;
        let start = entryPoint;
        // Skip optional DI.
        if (memory[start] === 0xF3) { // DI
            start += 1;
            preambleLength += 1;
        }
        const sourceAddress = memory[start + 0x01] | (memory[start + 0x02] << 8);
        const destinationAddress = memory[start + 0x04] | (memory[start + 0x05] << 8);
        const copyLength = memory[start + 0x07] | (memory[start + 0x08] << 8);
        const jumpAddress = memory[start + 0x0C] | (memory[start + 0x0D] << 8);
        if (memory[start + 0x00] === 0x21 && // LD HL,nnnn
            memory[start + 0x03] === 0x11 && // LD DE,nnnn
            memory[start + 0x06] === 0x01 && // LD BC,nnnn
            memory[start + 0x09] === 0xED && memory[start + 0x0A] === 0xB0 && // LDIR
            memory[start + 0x0B] === 0xC3 && // JP nnnn
            jumpAddress >= destinationAddress && jumpAddress < destinationAddress + copyLength) {
            return new Preamble(preambleLength, sourceAddress, destinationAddress, copyLength, jumpAddress);
        }
        return undefined;
    }
}
exports.Preamble = Preamble;


/***/ }),

/***/ "./node_modules/z80-disasm/dist/TextFormatter.js":
/*!*******************************************************!*\
  !*** ./node_modules/z80-disasm/dist/TextFormatter.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
/**
 * Converts an array of instructions into an array of text lines, suitable for displaying
 * in a shell console.
 */
function instructionsToText(instructions) {
    const lines = [];
    for (const instruction of instructions) {
        if (instruction.label !== undefined) {
            lines.push("                 " + instruction.label + ":");
        }
        let address = instruction.address;
        const bytes = instruction.bin;
        while (bytes.length > 0) {
            const subbytes = bytes.slice(0, Math.min(3, bytes.length));
            lines.push(z80_base_1.toHexWord(address) + " " +
                subbytes.map(z80_base_1.toHexByte).join(" ").padEnd(12) +
                (address === instruction.address ? "        " + instruction.toText() : ""));
            address += subbytes.length;
            bytes.splice(0, subbytes.length);
        }
    }
    return lines;
}
exports.instructionsToText = instructionsToText;


/***/ }),

/***/ "./node_modules/z80-disasm/dist/index.js":
/*!***********************************************!*\
  !*** ./node_modules/z80-disasm/dist/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Disasm_1 = __webpack_require__(/*! ./Disasm */ "./node_modules/z80-disasm/dist/Disasm.js");
exports.Disasm = Disasm_1.Disasm;
var Instruction_1 = __webpack_require__(/*! ./Instruction */ "./node_modules/z80-disasm/dist/Instruction.js");
exports.Instruction = Instruction_1.Instruction;
__export(__webpack_require__(/*! ./KnownLabels */ "./node_modules/z80-disasm/dist/KnownLabels.js"));
__export(__webpack_require__(/*! ./TextFormatter */ "./node_modules/z80-disasm/dist/TextFormatter.js"));


/***/ }),

/***/ "./node_modules/z80-disasm/dist/Opcodes.json":
/*!***************************************************!*\
  !*** ./node_modules/z80-disasm/dist/Opcodes.json ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"0":{"mnemonic":"nop"},"1":{"mnemonic":"ld","params":["bc","nnnn"]},"2":{"mnemonic":"ld","params":["(bc)","a"]},"3":{"mnemonic":"inc","params":["bc"]},"4":{"mnemonic":"inc","params":["b"]},"5":{"mnemonic":"dec","params":["b"]},"6":{"mnemonic":"ld","params":["b","nn"]},"7":{"mnemonic":"rlca"},"8":{"mnemonic":"ex","params":["af","af\'"]},"9":{"mnemonic":"add","params":["hl","bc"]},"10":{"mnemonic":"djnz","params":["offset"]},"11":{"mnemonic":"ld","params":["de","nnnn"]},"12":{"mnemonic":"ld","params":["(de)","a"]},"13":{"mnemonic":"inc","params":["de"]},"14":{"mnemonic":"inc","params":["d"]},"15":{"mnemonic":"dec","params":["d"]},"16":{"mnemonic":"ld","params":["d","nn"]},"17":{"mnemonic":"rla"},"18":{"mnemonic":"jr","params":["offset"]},"19":{"mnemonic":"add","params":["hl","de"]},"20":{"mnemonic":"jr","params":["nz","offset"]},"21":{"mnemonic":"ld","params":["hl","nnnn"]},"22":{"mnemonic":"ld","params":["(nnnn)","hl"]},"23":{"mnemonic":"inc","params":["hl"]},"24":{"mnemonic":"inc","params":["h"]},"25":{"mnemonic":"dec","params":["h"]},"26":{"mnemonic":"ld","params":["h","nn"]},"27":{"mnemonic":"daa"},"28":{"mnemonic":"jr","params":["z","offset"]},"29":{"mnemonic":"add","params":["hl","hl"]},"30":{"mnemonic":"jr","params":["nc","offset"]},"31":{"mnemonic":"ld","params":["sp","nnnn"]},"32":{"mnemonic":"ld","params":["(nnnn)","a"]},"33":{"mnemonic":"inc","params":["sp"]},"34":{"mnemonic":"inc","params":["(hl)"]},"35":{"mnemonic":"dec","params":["(hl)"]},"36":{"mnemonic":"ld","params":["(hl)","nn"]},"37":{"mnemonic":"scf"},"38":{"mnemonic":"jr","params":["c","offset"]},"39":{"mnemonic":"add","params":["hl","sp"]},"40":{"mnemonic":"ld","params":["b","b"]},"41":{"mnemonic":"ld","params":["b","c"]},"42":{"mnemonic":"ld","params":["b","d"]},"43":{"mnemonic":"ld","params":["b","e"]},"44":{"mnemonic":"ld","params":["b","h"]},"45":{"mnemonic":"ld","params":["b","l"]},"46":{"mnemonic":"ld","params":["b","(hl)"]},"47":{"mnemonic":"ld","params":["b","a"]},"48":{"mnemonic":"ld","params":["c","b"]},"49":{"mnemonic":"ld","params":["c","c"]},"50":{"mnemonic":"ld","params":["d","b"]},"51":{"mnemonic":"ld","params":["d","c"]},"52":{"mnemonic":"ld","params":["d","d"]},"53":{"mnemonic":"ld","params":["d","e"]},"54":{"mnemonic":"ld","params":["d","h"]},"55":{"mnemonic":"ld","params":["d","l"]},"56":{"mnemonic":"ld","params":["d","(hl)"]},"57":{"mnemonic":"ld","params":["d","a"]},"58":{"mnemonic":"ld","params":["e","b"]},"59":{"mnemonic":"ld","params":["e","c"]},"60":{"mnemonic":"ld","params":["h","b"]},"61":{"mnemonic":"ld","params":["h","c"]},"62":{"mnemonic":"ld","params":["h","d"]},"63":{"mnemonic":"ld","params":["h","e"]},"64":{"mnemonic":"ld","params":["h","h"]},"65":{"mnemonic":"ld","params":["h","l"]},"66":{"mnemonic":"ld","params":["h","(hl)"]},"67":{"mnemonic":"ld","params":["h","a"]},"68":{"mnemonic":"ld","params":["l","b"]},"69":{"mnemonic":"ld","params":["l","c"]},"70":{"mnemonic":"ld","params":["(hl)","b"]},"71":{"mnemonic":"ld","params":["(hl)","c"]},"72":{"mnemonic":"ld","params":["(hl)","d"]},"73":{"mnemonic":"ld","params":["(hl)","e"]},"74":{"mnemonic":"ld","params":["(hl)","h"]},"75":{"mnemonic":"ld","params":["(hl)","l"]},"76":{"mnemonic":"halt"},"77":{"mnemonic":"ld","params":["(hl)","a"]},"78":{"mnemonic":"ld","params":["a","b"]},"79":{"mnemonic":"ld","params":["a","c"]},"80":{"mnemonic":"add","params":["a","b"]},"81":{"mnemonic":"add","params":["a","c"]},"82":{"mnemonic":"add","params":["a","d"]},"83":{"mnemonic":"add","params":["a","e"]},"84":{"mnemonic":"add","params":["a","h"]},"85":{"mnemonic":"add","params":["a","l"]},"86":{"mnemonic":"add","params":["a","(hl)"]},"87":{"mnemonic":"add","params":["a","a"]},"88":{"mnemonic":"adc","params":["a","b"]},"89":{"mnemonic":"adc","params":["a","c"]},"90":{"mnemonic":"sub","params":["a","b"]},"91":{"mnemonic":"sub","params":["a","c"]},"92":{"mnemonic":"sub","params":["a","d"]},"93":{"mnemonic":"sub","params":["a","e"]},"94":{"mnemonic":"sub","params":["a","h"]},"95":{"mnemonic":"sub","params":["a","l"]},"96":{"mnemonic":"sub","params":["a","(hl)"]},"97":{"mnemonic":"sub","params":["a","a"]},"98":{"mnemonic":"sbc","params":["a","b"]},"99":{"mnemonic":"sbc","params":["a","c"]},"a":{"mnemonic":"ld","params":["a","(bc)"]},"b":{"mnemonic":"dec","params":["bc"]},"c":{"mnemonic":"inc","params":["c"]},"d":{"mnemonic":"dec","params":["c"]},"e":{"mnemonic":"ld","params":["c","nn"]},"f":{"mnemonic":"rrca"},"1a":{"mnemonic":"ld","params":["a","(de)"]},"1b":{"mnemonic":"dec","params":["de"]},"1c":{"mnemonic":"inc","params":["e"]},"1d":{"mnemonic":"dec","params":["e"]},"1e":{"mnemonic":"ld","params":["e","nn"]},"1f":{"mnemonic":"rra"},"2a":{"mnemonic":"ld","params":["hl","(nnnn)"]},"2b":{"mnemonic":"dec","params":["hl"]},"2c":{"mnemonic":"inc","params":["l"]},"2d":{"mnemonic":"dec","params":["l"]},"2e":{"mnemonic":"ld","params":["l","nn"]},"2f":{"mnemonic":"cpl"},"3a":{"mnemonic":"ld","params":["a","(nnnn)"]},"3b":{"mnemonic":"dec","params":["sp"]},"3c":{"mnemonic":"inc","params":["a"]},"3d":{"mnemonic":"dec","params":["a"]},"3e":{"mnemonic":"ld","params":["a","nn"]},"3f":{"mnemonic":"ccf"},"4a":{"mnemonic":"ld","params":["c","d"]},"4b":{"mnemonic":"ld","params":["c","e"]},"4c":{"mnemonic":"ld","params":["c","h"]},"4d":{"mnemonic":"ld","params":["c","l"]},"4e":{"mnemonic":"ld","params":["c","(hl)"]},"4f":{"mnemonic":"ld","params":["c","a"]},"5a":{"mnemonic":"ld","params":["e","d"]},"5b":{"mnemonic":"ld","params":["e","e"]},"5c":{"mnemonic":"ld","params":["e","h"]},"5d":{"mnemonic":"ld","params":["e","l"]},"5e":{"mnemonic":"ld","params":["e","(hl)"]},"5f":{"mnemonic":"ld","params":["e","a"]},"6a":{"mnemonic":"ld","params":["l","d"]},"6b":{"mnemonic":"ld","params":["l","e"]},"6c":{"mnemonic":"ld","params":["l","h"]},"6d":{"mnemonic":"ld","params":["l","l"]},"6e":{"mnemonic":"ld","params":["l","(hl)"]},"6f":{"mnemonic":"ld","params":["l","a"]},"7a":{"mnemonic":"ld","params":["a","d"]},"7b":{"mnemonic":"ld","params":["a","e"]},"7c":{"mnemonic":"ld","params":["a","h"]},"7d":{"mnemonic":"ld","params":["a","l"]},"7e":{"mnemonic":"ld","params":["a","(hl)"]},"7f":{"mnemonic":"ld","params":["a","a"]},"8a":{"mnemonic":"adc","params":["a","d"]},"8b":{"mnemonic":"adc","params":["a","e"]},"8c":{"mnemonic":"adc","params":["a","h"]},"8d":{"mnemonic":"adc","params":["a","l"]},"8e":{"mnemonic":"adc","params":["a","(hl)"]},"8f":{"mnemonic":"adc","params":["a","a"]},"9a":{"mnemonic":"sbc","params":["a","d"]},"9b":{"mnemonic":"sbc","params":["a","e"]},"9c":{"mnemonic":"sbc","params":["a","h"]},"9d":{"mnemonic":"sbc","params":["a","l"]},"9e":{"mnemonic":"sbc","params":["a","(hl)"]},"9f":{"mnemonic":"sbc","params":["a","a"]},"a0":{"mnemonic":"and","params":["a","b"]},"a1":{"mnemonic":"and","params":["a","c"]},"a2":{"mnemonic":"and","params":["a","d"]},"a3":{"mnemonic":"and","params":["a","e"]},"a4":{"mnemonic":"and","params":["a","h"]},"a5":{"mnemonic":"and","params":["a","l"]},"a6":{"mnemonic":"and","params":["a","(hl)"]},"a7":{"mnemonic":"and","params":["a","a"]},"a8":{"mnemonic":"xor","params":["a","b"]},"a9":{"mnemonic":"xor","params":["a","c"]},"aa":{"mnemonic":"xor","params":["a","d"]},"ab":{"mnemonic":"xor","params":["a","e"]},"ac":{"mnemonic":"xor","params":["a","h"]},"ad":{"mnemonic":"xor","params":["a","l"]},"ae":{"mnemonic":"xor","params":["a","(hl)"]},"af":{"mnemonic":"xor","params":["a","a"]},"b0":{"mnemonic":"or","params":["a","b"]},"b1":{"mnemonic":"or","params":["a","c"]},"b2":{"mnemonic":"or","params":["a","d"]},"b3":{"mnemonic":"or","params":["a","e"]},"b4":{"mnemonic":"or","params":["a","h"]},"b5":{"mnemonic":"or","params":["a","l"]},"b6":{"mnemonic":"or","params":["a","(hl)"]},"b7":{"mnemonic":"or","params":["a","a"]},"b8":{"mnemonic":"cp","params":["b"]},"b9":{"mnemonic":"cp","params":["c"]},"ba":{"mnemonic":"cp","params":["d"]},"bb":{"mnemonic":"cp","params":["e"]},"bc":{"mnemonic":"cp","params":["h"]},"bd":{"mnemonic":"cp","params":["l"]},"be":{"mnemonic":"cp","params":["(hl)"]},"bf":{"mnemonic":"cp","params":["a"]},"c0":{"mnemonic":"ret","params":["nz"]},"c1":{"mnemonic":"pop","params":["bc"]},"c2":{"mnemonic":"jp","params":["nz","nnnn"]},"c3":{"mnemonic":"jp","params":["nnnn"]},"c4":{"mnemonic":"call","params":["nz","nnnn"]},"c5":{"mnemonic":"push","params":["bc"]},"c6":{"mnemonic":"add","params":["a","nn"]},"c7":{"mnemonic":"rst","params":["00"]},"c8":{"mnemonic":"ret","params":["z"]},"c9":{"mnemonic":"ret"},"ca":{"mnemonic":"jp","params":["z","nnnn"]},"cb":{"shift":{"0":{"mnemonic":"rlc","params":["b"]},"1":{"mnemonic":"rlc","params":["c"]},"2":{"mnemonic":"rlc","params":["d"]},"3":{"mnemonic":"rlc","params":["e"]},"4":{"mnemonic":"rlc","params":["h"]},"5":{"mnemonic":"rlc","params":["l"]},"6":{"mnemonic":"rlc","params":["(hl)"]},"7":{"mnemonic":"rlc","params":["a"]},"8":{"mnemonic":"rrc","params":["b"]},"9":{"mnemonic":"rrc","params":["c"]},"10":{"mnemonic":"rl","params":["b"]},"11":{"mnemonic":"rl","params":["c"]},"12":{"mnemonic":"rl","params":["d"]},"13":{"mnemonic":"rl","params":["e"]},"14":{"mnemonic":"rl","params":["h"]},"15":{"mnemonic":"rl","params":["l"]},"16":{"mnemonic":"rl","params":["(hl)"]},"17":{"mnemonic":"rl","params":["a"]},"18":{"mnemonic":"rr","params":["b"]},"19":{"mnemonic":"rr","params":["c"]},"20":{"mnemonic":"sla","params":["b"]},"21":{"mnemonic":"sla","params":["c"]},"22":{"mnemonic":"sla","params":["d"]},"23":{"mnemonic":"sla","params":["e"]},"24":{"mnemonic":"sla","params":["h"]},"25":{"mnemonic":"sla","params":["l"]},"26":{"mnemonic":"sla","params":["(hl)"]},"27":{"mnemonic":"sla","params":["a"]},"28":{"mnemonic":"sra","params":["b"]},"29":{"mnemonic":"sra","params":["c"]},"30":{"mnemonic":"sll","params":["b"]},"31":{"mnemonic":"sll","params":["c"]},"32":{"mnemonic":"sll","params":["d"]},"33":{"mnemonic":"sll","params":["e"]},"34":{"mnemonic":"sll","params":["h"]},"35":{"mnemonic":"sll","params":["l"]},"36":{"mnemonic":"sll","params":["(hl)"]},"37":{"mnemonic":"sll","params":["a"]},"38":{"mnemonic":"srl","params":["b"]},"39":{"mnemonic":"srl","params":["c"]},"40":{"mnemonic":"bit","params":["0","b"]},"41":{"mnemonic":"bit","params":["0","c"]},"42":{"mnemonic":"bit","params":["0","d"]},"43":{"mnemonic":"bit","params":["0","e"]},"44":{"mnemonic":"bit","params":["0","h"]},"45":{"mnemonic":"bit","params":["0","l"]},"46":{"mnemonic":"bit","params":["0","(hl)"]},"47":{"mnemonic":"bit","params":["0","a"]},"48":{"mnemonic":"bit","params":["1","b"]},"49":{"mnemonic":"bit","params":["1","c"]},"50":{"mnemonic":"bit","params":["2","b"]},"51":{"mnemonic":"bit","params":["2","c"]},"52":{"mnemonic":"bit","params":["2","d"]},"53":{"mnemonic":"bit","params":["2","e"]},"54":{"mnemonic":"bit","params":["2","h"]},"55":{"mnemonic":"bit","params":["2","l"]},"56":{"mnemonic":"bit","params":["2","(hl)"]},"57":{"mnemonic":"bit","params":["2","a"]},"58":{"mnemonic":"bit","params":["3","b"]},"59":{"mnemonic":"bit","params":["3","c"]},"60":{"mnemonic":"bit","params":["4","b"]},"61":{"mnemonic":"bit","params":["4","c"]},"62":{"mnemonic":"bit","params":["4","d"]},"63":{"mnemonic":"bit","params":["4","e"]},"64":{"mnemonic":"bit","params":["4","h"]},"65":{"mnemonic":"bit","params":["4","l"]},"66":{"mnemonic":"bit","params":["4","(hl)"]},"67":{"mnemonic":"bit","params":["4","a"]},"68":{"mnemonic":"bit","params":["5","b"]},"69":{"mnemonic":"bit","params":["5","c"]},"70":{"mnemonic":"bit","params":["6","b"]},"71":{"mnemonic":"bit","params":["6","c"]},"72":{"mnemonic":"bit","params":["6","d"]},"73":{"mnemonic":"bit","params":["6","e"]},"74":{"mnemonic":"bit","params":["6","h"]},"75":{"mnemonic":"bit","params":["6","l"]},"76":{"mnemonic":"bit","params":["6","(hl)"]},"77":{"mnemonic":"bit","params":["6","a"]},"78":{"mnemonic":"bit","params":["7","b"]},"79":{"mnemonic":"bit","params":["7","c"]},"80":{"mnemonic":"res","params":["0","b"]},"81":{"mnemonic":"res","params":["0","c"]},"82":{"mnemonic":"res","params":["0","d"]},"83":{"mnemonic":"res","params":["0","e"]},"84":{"mnemonic":"res","params":["0","h"]},"85":{"mnemonic":"res","params":["0","l"]},"86":{"mnemonic":"res","params":["0","(hl)"]},"87":{"mnemonic":"res","params":["0","a"]},"88":{"mnemonic":"res","params":["1","b"]},"89":{"mnemonic":"res","params":["1","c"]},"90":{"mnemonic":"res","params":["2","b"]},"91":{"mnemonic":"res","params":["2","c"]},"92":{"mnemonic":"res","params":["2","d"]},"93":{"mnemonic":"res","params":["2","e"]},"94":{"mnemonic":"res","params":["2","h"]},"95":{"mnemonic":"res","params":["2","l"]},"96":{"mnemonic":"res","params":["2","(hl)"]},"97":{"mnemonic":"res","params":["2","a"]},"98":{"mnemonic":"res","params":["3","b"]},"99":{"mnemonic":"res","params":["3","c"]},"a":{"mnemonic":"rrc","params":["d"]},"b":{"mnemonic":"rrc","params":["e"]},"c":{"mnemonic":"rrc","params":["h"]},"d":{"mnemonic":"rrc","params":["l"]},"e":{"mnemonic":"rrc","params":["(hl)"]},"f":{"mnemonic":"rrc","params":["a"]},"1a":{"mnemonic":"rr","params":["d"]},"1b":{"mnemonic":"rr","params":["e"]},"1c":{"mnemonic":"rr","params":["h"]},"1d":{"mnemonic":"rr","params":["l"]},"1e":{"mnemonic":"rr","params":["(hl)"]},"1f":{"mnemonic":"rr","params":["a"]},"2a":{"mnemonic":"sra","params":["d"]},"2b":{"mnemonic":"sra","params":["e"]},"2c":{"mnemonic":"sra","params":["h"]},"2d":{"mnemonic":"sra","params":["l"]},"2e":{"mnemonic":"sra","params":["(hl)"]},"2f":{"mnemonic":"sra","params":["a"]},"3a":{"mnemonic":"srl","params":["d"]},"3b":{"mnemonic":"srl","params":["e"]},"3c":{"mnemonic":"srl","params":["h"]},"3d":{"mnemonic":"srl","params":["l"]},"3e":{"mnemonic":"srl","params":["(hl)"]},"3f":{"mnemonic":"srl","params":["a"]},"4a":{"mnemonic":"bit","params":["1","d"]},"4b":{"mnemonic":"bit","params":["1","e"]},"4c":{"mnemonic":"bit","params":["1","h"]},"4d":{"mnemonic":"bit","params":["1","l"]},"4e":{"mnemonic":"bit","params":["1","(hl)"]},"4f":{"mnemonic":"bit","params":["1","a"]},"5a":{"mnemonic":"bit","params":["3","d"]},"5b":{"mnemonic":"bit","params":["3","e"]},"5c":{"mnemonic":"bit","params":["3","h"]},"5d":{"mnemonic":"bit","params":["3","l"]},"5e":{"mnemonic":"bit","params":["3","(hl)"]},"5f":{"mnemonic":"bit","params":["3","a"]},"6a":{"mnemonic":"bit","params":["5","d"]},"6b":{"mnemonic":"bit","params":["5","e"]},"6c":{"mnemonic":"bit","params":["5","h"]},"6d":{"mnemonic":"bit","params":["5","l"]},"6e":{"mnemonic":"bit","params":["5","(hl)"]},"6f":{"mnemonic":"bit","params":["5","a"]},"7a":{"mnemonic":"bit","params":["7","d"]},"7b":{"mnemonic":"bit","params":["7","e"]},"7c":{"mnemonic":"bit","params":["7","h"]},"7d":{"mnemonic":"bit","params":["7","l"]},"7e":{"mnemonic":"bit","params":["7","(hl)"]},"7f":{"mnemonic":"bit","params":["7","a"]},"8a":{"mnemonic":"res","params":["1","d"]},"8b":{"mnemonic":"res","params":["1","e"]},"8c":{"mnemonic":"res","params":["1","h"]},"8d":{"mnemonic":"res","params":["1","l"]},"8e":{"mnemonic":"res","params":["1","(hl)"]},"8f":{"mnemonic":"res","params":["1","a"]},"9a":{"mnemonic":"res","params":["3","d"]},"9b":{"mnemonic":"res","params":["3","e"]},"9c":{"mnemonic":"res","params":["3","h"]},"9d":{"mnemonic":"res","params":["3","l"]},"9e":{"mnemonic":"res","params":["3","(hl)"]},"9f":{"mnemonic":"res","params":["3","a"]},"a0":{"mnemonic":"res","params":["4","b"]},"a1":{"mnemonic":"res","params":["4","c"]},"a2":{"mnemonic":"res","params":["4","d"]},"a3":{"mnemonic":"res","params":["4","e"]},"a4":{"mnemonic":"res","params":["4","h"]},"a5":{"mnemonic":"res","params":["4","l"]},"a6":{"mnemonic":"res","params":["4","(hl)"]},"a7":{"mnemonic":"res","params":["4","a"]},"a8":{"mnemonic":"res","params":["5","b"]},"a9":{"mnemonic":"res","params":["5","c"]},"aa":{"mnemonic":"res","params":["5","d"]},"ab":{"mnemonic":"res","params":["5","e"]},"ac":{"mnemonic":"res","params":["5","h"]},"ad":{"mnemonic":"res","params":["5","l"]},"ae":{"mnemonic":"res","params":["5","(hl)"]},"af":{"mnemonic":"res","params":["5","a"]},"b0":{"mnemonic":"res","params":["6","b"]},"b1":{"mnemonic":"res","params":["6","c"]},"b2":{"mnemonic":"res","params":["6","d"]},"b3":{"mnemonic":"res","params":["6","e"]},"b4":{"mnemonic":"res","params":["6","h"]},"b5":{"mnemonic":"res","params":["6","l"]},"b6":{"mnemonic":"res","params":["6","(hl)"]},"b7":{"mnemonic":"res","params":["6","a"]},"b8":{"mnemonic":"res","params":["7","b"]},"b9":{"mnemonic":"res","params":["7","c"]},"ba":{"mnemonic":"res","params":["7","d"]},"bb":{"mnemonic":"res","params":["7","e"]},"bc":{"mnemonic":"res","params":["7","h"]},"bd":{"mnemonic":"res","params":["7","l"]},"be":{"mnemonic":"res","params":["7","(hl)"]},"bf":{"mnemonic":"res","params":["7","a"]},"c0":{"mnemonic":"set","params":["0","b"]},"c1":{"mnemonic":"set","params":["0","c"]},"c2":{"mnemonic":"set","params":["0","d"]},"c3":{"mnemonic":"set","params":["0","e"]},"c4":{"mnemonic":"set","params":["0","h"]},"c5":{"mnemonic":"set","params":["0","l"]},"c6":{"mnemonic":"set","params":["0","(hl)"]},"c7":{"mnemonic":"set","params":["0","a"]},"c8":{"mnemonic":"set","params":["1","b"]},"c9":{"mnemonic":"set","params":["1","c"]},"ca":{"mnemonic":"set","params":["1","d"]},"cb":{"mnemonic":"set","params":["1","e"]},"cc":{"mnemonic":"set","params":["1","h"]},"cd":{"mnemonic":"set","params":["1","l"]},"ce":{"mnemonic":"set","params":["1","(hl)"]},"cf":{"mnemonic":"set","params":["1","a"]},"d0":{"mnemonic":"set","params":["2","b"]},"d1":{"mnemonic":"set","params":["2","c"]},"d2":{"mnemonic":"set","params":["2","d"]},"d3":{"mnemonic":"set","params":["2","e"]},"d4":{"mnemonic":"set","params":["2","h"]},"d5":{"mnemonic":"set","params":["2","l"]},"d6":{"mnemonic":"set","params":["2","(hl)"]},"d7":{"mnemonic":"set","params":["2","a"]},"d8":{"mnemonic":"set","params":["3","b"]},"d9":{"mnemonic":"set","params":["3","c"]},"da":{"mnemonic":"set","params":["3","d"]},"db":{"mnemonic":"set","params":["3","e"]},"dc":{"mnemonic":"set","params":["3","h"]},"dd":{"mnemonic":"set","params":["3","l"]},"de":{"mnemonic":"set","params":["3","(hl)"]},"df":{"mnemonic":"set","params":["3","a"]},"e0":{"mnemonic":"set","params":["4","b"]},"e1":{"mnemonic":"set","params":["4","c"]},"e2":{"mnemonic":"set","params":["4","d"]},"e3":{"mnemonic":"set","params":["4","e"]},"e4":{"mnemonic":"set","params":["4","h"]},"e5":{"mnemonic":"set","params":["4","l"]},"e6":{"mnemonic":"set","params":["4","(hl)"]},"e7":{"mnemonic":"set","params":["4","a"]},"e8":{"mnemonic":"set","params":["5","b"]},"e9":{"mnemonic":"set","params":["5","c"]},"ea":{"mnemonic":"set","params":["5","d"]},"eb":{"mnemonic":"set","params":["5","e"]},"ec":{"mnemonic":"set","params":["5","h"]},"ed":{"mnemonic":"set","params":["5","l"]},"ee":{"mnemonic":"set","params":["5","(hl)"]},"ef":{"mnemonic":"set","params":["5","a"]},"f0":{"mnemonic":"set","params":["6","b"]},"f1":{"mnemonic":"set","params":["6","c"]},"f2":{"mnemonic":"set","params":["6","d"]},"f3":{"mnemonic":"set","params":["6","e"]},"f4":{"mnemonic":"set","params":["6","h"]},"f5":{"mnemonic":"set","params":["6","l"]},"f6":{"mnemonic":"set","params":["6","(hl)"]},"f7":{"mnemonic":"set","params":["6","a"]},"f8":{"mnemonic":"set","params":["7","b"]},"f9":{"mnemonic":"set","params":["7","c"]},"fa":{"mnemonic":"set","params":["7","d"]},"fb":{"mnemonic":"set","params":["7","e"]},"fc":{"mnemonic":"set","params":["7","h"]},"fd":{"mnemonic":"set","params":["7","l"]},"fe":{"mnemonic":"set","params":["7","(hl)"]},"ff":{"mnemonic":"set","params":["7","a"]}}},"cc":{"mnemonic":"call","params":["z","nnnn"]},"cd":{"mnemonic":"call","params":["nnnn"]},"ce":{"mnemonic":"adc","params":["a","nn"]},"cf":{"mnemonic":"rst","params":["8"]},"d0":{"mnemonic":"ret","params":["nc"]},"d1":{"mnemonic":"pop","params":["de"]},"d2":{"mnemonic":"jp","params":["nc","nnnn"]},"d3":{"mnemonic":"out","params":["(nn)","a"]},"d4":{"mnemonic":"call","params":["nc","nnnn"]},"d5":{"mnemonic":"push","params":["de"]},"d6":{"mnemonic":"sub","params":["a","nn"]},"d7":{"mnemonic":"rst","params":["10"]},"d8":{"mnemonic":"ret","params":["c"]},"d9":{"mnemonic":"exx"},"da":{"mnemonic":"jp","params":["c","nnnn"]},"db":{"mnemonic":"in","params":["a","(nn)"]},"dc":{"mnemonic":"call","params":["c","nnnn"]},"dd":{"shift":{"9":{"mnemonic":"add","params":["ix","bc"]},"19":{"mnemonic":"add","params":["ix","de"]},"21":{"mnemonic":"ld","params":["ix","nnnn"]},"22":{"mnemonic":"ld","params":["(nnnn)","ix"]},"23":{"mnemonic":"inc","params":["ix"]},"24":{"mnemonic":"inc","params":["ixh"]},"25":{"mnemonic":"dec","params":["ixh"]},"26":{"mnemonic":"ld","params":["ixh","nn"]},"29":{"mnemonic":"add","params":["ix","ix"]},"34":{"mnemonic":"inc","params":["(ix+dd)"]},"35":{"mnemonic":"dec","params":["(ix+dd)"]},"36":{"mnemonic":"ld","params":["(ix+dd)","nn"]},"39":{"mnemonic":"add","params":["ix","sp"]},"44":{"mnemonic":"ld","params":["b","ixh"]},"45":{"mnemonic":"ld","params":["b","ixl"]},"46":{"mnemonic":"ld","params":["b","(ix+dd)"]},"54":{"mnemonic":"ld","params":["d","ixh"]},"55":{"mnemonic":"ld","params":["d","ixl"]},"56":{"mnemonic":"ld","params":["d","(ix+dd)"]},"60":{"mnemonic":"ld","params":["ixh","b"]},"61":{"mnemonic":"ld","params":["ixh","c"]},"62":{"mnemonic":"ld","params":["ixh","d"]},"63":{"mnemonic":"ld","params":["ixh","e"]},"64":{"mnemonic":"ld","params":["ixh","ixh"]},"65":{"mnemonic":"ld","params":["ixh","ixl"]},"66":{"mnemonic":"ld","params":["h","(ix+dd)"]},"67":{"mnemonic":"ld","params":["ixh","a"]},"68":{"mnemonic":"ld","params":["ixl","b"]},"69":{"mnemonic":"ld","params":["ixl","c"]},"70":{"mnemonic":"ld","params":["(ix+dd)","b"]},"71":{"mnemonic":"ld","params":["(ix+dd)","c"]},"72":{"mnemonic":"ld","params":["(ix+dd)","d"]},"73":{"mnemonic":"ld","params":["(ix+dd)","e"]},"74":{"mnemonic":"ld","params":["(ix+dd)","h"]},"75":{"mnemonic":"ld","params":["(ix+dd)","l"]},"77":{"mnemonic":"ld","params":["(ix+dd)","a"]},"84":{"mnemonic":"add","params":["a","ixh"]},"85":{"mnemonic":"add","params":["a","ixl"]},"86":{"mnemonic":"add","params":["a","(ix+dd)"]},"94":{"mnemonic":"sub","params":["a","ixh"]},"95":{"mnemonic":"sub","params":["a","ixl"]},"96":{"mnemonic":"sub","params":["a","(ix+dd)"]},"2a":{"mnemonic":"ld","params":["ix","(nnnn)"]},"2b":{"mnemonic":"dec","params":["ix"]},"2c":{"mnemonic":"inc","params":["ixl"]},"2d":{"mnemonic":"dec","params":["ixl"]},"2e":{"mnemonic":"ld","params":["ixl","nn"]},"4c":{"mnemonic":"ld","params":["c","ixh"]},"4d":{"mnemonic":"ld","params":["c","ixl"]},"4e":{"mnemonic":"ld","params":["c","(ix+dd)"]},"5c":{"mnemonic":"ld","params":["e","ixh"]},"5d":{"mnemonic":"ld","params":["e","ixl"]},"5e":{"mnemonic":"ld","params":["e","(ix+dd)"]},"6a":{"mnemonic":"ld","params":["ixl","d"]},"6b":{"mnemonic":"ld","params":["ixl","e"]},"6c":{"mnemonic":"ld","params":["ixl","ixh"]},"6d":{"mnemonic":"ld","params":["ixl","ixl"]},"6e":{"mnemonic":"ld","params":["l","(ix+dd)"]},"6f":{"mnemonic":"ld","params":["ixl","a"]},"7c":{"mnemonic":"ld","params":["a","ixh"]},"7d":{"mnemonic":"ld","params":["a","ixl"]},"7e":{"mnemonic":"ld","params":["a","(ix+dd)"]},"8c":{"mnemonic":"adc","params":["a","ixh"]},"8d":{"mnemonic":"adc","params":["a","ixl"]},"8e":{"mnemonic":"adc","params":["a","(ix+dd)"]},"9c":{"mnemonic":"sbc","params":["a","ixh"]},"9d":{"mnemonic":"sbc","params":["a","ixl"]},"9e":{"mnemonic":"sbc","params":["a","(ix+dd)"]},"a4":{"mnemonic":"and","params":["a","ixh"]},"a5":{"mnemonic":"and","params":["a","ixl"]},"a6":{"mnemonic":"and","params":["a","(ix+dd)"]},"ac":{"mnemonic":"xor","params":["a","ixh"]},"ad":{"mnemonic":"xor","params":["a","ixl"]},"ae":{"mnemonic":"xor","params":["a","(ix+dd)"]},"b4":{"mnemonic":"or","params":["a","ixh"]},"b5":{"mnemonic":"or","params":["a","ixl"]},"b6":{"mnemonic":"or","params":["a","(ix+dd)"]},"bc":{"mnemonic":"cp","params":["ixh"]},"bd":{"mnemonic":"cp","params":["ixl"]},"be":{"mnemonic":"cp","params":["(ix+dd)"]},"cb":{"shift":{"0":{"mnemonic":"ld","params":["b","rlc"],"extra":["(ix+dd)"]},"1":{"mnemonic":"ld","params":["c","rlc"],"extra":["(ix+dd)"]},"2":{"mnemonic":"ld","params":["d","rlc"],"extra":["(ix+dd)"]},"3":{"mnemonic":"ld","params":["e","rlc"],"extra":["(ix+dd)"]},"4":{"mnemonic":"ld","params":["h","rlc"],"extra":["(ix+dd)"]},"5":{"mnemonic":"ld","params":["l","rlc"],"extra":["(ix+dd)"]},"6":{"mnemonic":"rlc","params":["(ix+dd)"]},"7":{"mnemonic":"ld","params":["a","rlc"],"extra":["(ix+dd)"]},"8":{"mnemonic":"ld","params":["b","rrc"],"extra":["(ix+dd)"]},"9":{"mnemonic":"ld","params":["c","rrc"],"extra":["(ix+dd)"]},"10":{"mnemonic":"ld","params":["b","rl"],"extra":["(ix+dd)"]},"11":{"mnemonic":"ld","params":["c","rl"],"extra":["(ix+dd)"]},"12":{"mnemonic":"ld","params":["d","rl"],"extra":["(ix+dd)"]},"13":{"mnemonic":"ld","params":["e","rl"],"extra":["(ix+dd)"]},"14":{"mnemonic":"ld","params":["h","rl"],"extra":["(ix+dd)"]},"15":{"mnemonic":"ld","params":["l","rl"],"extra":["(ix+dd)"]},"16":{"mnemonic":"rl","params":["(ix+dd)"]},"17":{"mnemonic":"ld","params":["a","rl"],"extra":["(ix+dd)"]},"18":{"mnemonic":"ld","params":["b","rr"],"extra":["(ix+dd)"]},"19":{"mnemonic":"ld","params":["c","rr"],"extra":["(ix+dd)"]},"20":{"mnemonic":"ld","params":["b","sla"],"extra":["(ix+dd)"]},"21":{"mnemonic":"ld","params":["c","sla"],"extra":["(ix+dd)"]},"22":{"mnemonic":"ld","params":["d","sla"],"extra":["(ix+dd)"]},"23":{"mnemonic":"ld","params":["e","sla"],"extra":["(ix+dd)"]},"24":{"mnemonic":"ld","params":["h","sla"],"extra":["(ix+dd)"]},"25":{"mnemonic":"ld","params":["l","sla"],"extra":["(ix+dd)"]},"26":{"mnemonic":"sla","params":["(ix+dd)"]},"27":{"mnemonic":"ld","params":["a","sla"],"extra":["(ix+dd)"]},"28":{"mnemonic":"ld","params":["b","sra"],"extra":["(ix+dd)"]},"29":{"mnemonic":"ld","params":["c","sra"],"extra":["(ix+dd)"]},"30":{"mnemonic":"ld","params":["b","sll"],"extra":["(ix+dd)"]},"31":{"mnemonic":"ld","params":["c","sll"],"extra":["(ix+dd)"]},"32":{"mnemonic":"ld","params":["d","sll"],"extra":["(ix+dd)"]},"33":{"mnemonic":"ld","params":["e","sll"],"extra":["(ix+dd)"]},"34":{"mnemonic":"ld","params":["h","sll"],"extra":["(ix+dd)"]},"35":{"mnemonic":"ld","params":["l","sll"],"extra":["(ix+dd)"]},"36":{"mnemonic":"sll","params":["(ix+dd)"]},"37":{"mnemonic":"ld","params":["a","sll"],"extra":["(ix+dd)"]},"38":{"mnemonic":"ld","params":["b","srl"],"extra":["(ix+dd)"]},"39":{"mnemonic":"ld","params":["c","srl"],"extra":["(ix+dd)"]},"40":{"mnemonic":"bit","params":["0","(ix+dd)"]},"41":{"mnemonic":"bit","params":["0","(ix+dd)"]},"42":{"mnemonic":"bit","params":["0","(ix+dd)"]},"43":{"mnemonic":"bit","params":["0","(ix+dd)"]},"44":{"mnemonic":"bit","params":["0","(ix+dd)"]},"45":{"mnemonic":"bit","params":["0","(ix+dd)"]},"46":{"mnemonic":"bit","params":["0","(ix+dd)"]},"47":{"mnemonic":"bit","params":["0","(ix+dd)"]},"48":{"mnemonic":"bit","params":["1","(ix+dd)"]},"49":{"mnemonic":"bit","params":["1","(ix+dd)"]},"50":{"mnemonic":"bit","params":["2","(ix+dd)"]},"51":{"mnemonic":"bit","params":["2","(ix+dd)"]},"52":{"mnemonic":"bit","params":["2","(ix+dd)"]},"53":{"mnemonic":"bit","params":["2","(ix+dd)"]},"54":{"mnemonic":"bit","params":["2","(ix+dd)"]},"55":{"mnemonic":"bit","params":["2","(ix+dd)"]},"56":{"mnemonic":"bit","params":["2","(ix+dd)"]},"57":{"mnemonic":"bit","params":["2","(ix+dd)"]},"58":{"mnemonic":"bit","params":["3","(ix+dd)"]},"59":{"mnemonic":"bit","params":["3","(ix+dd)"]},"60":{"mnemonic":"bit","params":["4","(ix+dd)"]},"61":{"mnemonic":"bit","params":["4","(ix+dd)"]},"62":{"mnemonic":"bit","params":["4","(ix+dd)"]},"63":{"mnemonic":"bit","params":["4","(ix+dd)"]},"64":{"mnemonic":"bit","params":["4","(ix+dd)"]},"65":{"mnemonic":"bit","params":["4","(ix+dd)"]},"66":{"mnemonic":"bit","params":["4","(ix+dd)"]},"67":{"mnemonic":"bit","params":["4","(ix+dd)"]},"68":{"mnemonic":"bit","params":["5","(ix+dd)"]},"69":{"mnemonic":"bit","params":["5","(ix+dd)"]},"70":{"mnemonic":"bit","params":["6","(ix+dd)"]},"71":{"mnemonic":"bit","params":["6","(ix+dd)"]},"72":{"mnemonic":"bit","params":["6","(ix+dd)"]},"73":{"mnemonic":"bit","params":["6","(ix+dd)"]},"74":{"mnemonic":"bit","params":["6","(ix+dd)"]},"75":{"mnemonic":"bit","params":["6","(ix+dd)"]},"76":{"mnemonic":"bit","params":["6","(ix+dd)"]},"77":{"mnemonic":"bit","params":["6","(ix+dd)"]},"78":{"mnemonic":"bit","params":["7","(ix+dd)"]},"79":{"mnemonic":"bit","params":["7","(ix+dd)"]},"80":{"mnemonic":"ld","params":["b","res"],"extra":["0","(ix+dd)"]},"81":{"mnemonic":"ld","params":["c","res"],"extra":["0","(ix+dd)"]},"82":{"mnemonic":"ld","params":["d","res"],"extra":["0","(ix+dd)"]},"83":{"mnemonic":"ld","params":["e","res"],"extra":["0","(ix+dd)"]},"84":{"mnemonic":"ld","params":["h","res"],"extra":["0","(ix+dd)"]},"85":{"mnemonic":"ld","params":["l","res"],"extra":["0","(ix+dd)"]},"86":{"mnemonic":"res","params":["0","(ix+dd)"]},"87":{"mnemonic":"ld","params":["a","res"],"extra":["0","(ix+dd)"]},"88":{"mnemonic":"ld","params":["b","res"],"extra":["1","(ix+dd)"]},"89":{"mnemonic":"ld","params":["c","res"],"extra":["1","(ix+dd)"]},"90":{"mnemonic":"ld","params":["b","res"],"extra":["2","(ix+dd)"]},"91":{"mnemonic":"ld","params":["c","res"],"extra":["2","(ix+dd)"]},"92":{"mnemonic":"ld","params":["d","res"],"extra":["2","(ix+dd)"]},"93":{"mnemonic":"ld","params":["e","res"],"extra":["2","(ix+dd)"]},"94":{"mnemonic":"ld","params":["h","res"],"extra":["2","(ix+dd)"]},"95":{"mnemonic":"ld","params":["l","res"],"extra":["2","(ix+dd)"]},"96":{"mnemonic":"res","params":["2","(ix+dd)"]},"97":{"mnemonic":"ld","params":["a","res"],"extra":["2","(ix+dd)"]},"98":{"mnemonic":"ld","params":["b","res"],"extra":["3","(ix+dd)"]},"99":{"mnemonic":"ld","params":["c","res"],"extra":["3","(ix+dd)"]},"a":{"mnemonic":"ld","params":["d","rrc"],"extra":["(ix+dd)"]},"b":{"mnemonic":"ld","params":["e","rrc"],"extra":["(ix+dd)"]},"c":{"mnemonic":"ld","params":["h","rrc"],"extra":["(ix+dd)"]},"d":{"mnemonic":"ld","params":["l","rrc"],"extra":["(ix+dd)"]},"e":{"mnemonic":"rrc","params":["(ix+dd)"]},"f":{"mnemonic":"ld","params":["a","rrc"],"extra":["(ix+dd)"]},"1a":{"mnemonic":"ld","params":["d","rr"],"extra":["(ix+dd)"]},"1b":{"mnemonic":"ld","params":["e","rr"],"extra":["(ix+dd)"]},"1c":{"mnemonic":"ld","params":["h","rr"],"extra":["(ix+dd)"]},"1d":{"mnemonic":"ld","params":["l","rr"],"extra":["(ix+dd)"]},"1e":{"mnemonic":"rr","params":["(ix+dd)"]},"1f":{"mnemonic":"ld","params":["a","rr"],"extra":["(ix+dd)"]},"2a":{"mnemonic":"ld","params":["d","sra"],"extra":["(ix+dd)"]},"2b":{"mnemonic":"ld","params":["e","sra"],"extra":["(ix+dd)"]},"2c":{"mnemonic":"ld","params":["h","sra"],"extra":["(ix+dd)"]},"2d":{"mnemonic":"ld","params":["l","sra"],"extra":["(ix+dd)"]},"2e":{"mnemonic":"sra","params":["(ix+dd)"]},"2f":{"mnemonic":"ld","params":["a","sra"],"extra":["(ix+dd)"]},"3a":{"mnemonic":"ld","params":["d","srl"],"extra":["(ix+dd)"]},"3b":{"mnemonic":"ld","params":["e","srl"],"extra":["(ix+dd)"]},"3c":{"mnemonic":"ld","params":["h","srl"],"extra":["(ix+dd)"]},"3d":{"mnemonic":"ld","params":["l","srl"],"extra":["(ix+dd)"]},"3e":{"mnemonic":"srl","params":["(ix+dd)"]},"3f":{"mnemonic":"ld","params":["a","srl"],"extra":["(ix+dd)"]},"4a":{"mnemonic":"bit","params":["1","(ix+dd)"]},"4b":{"mnemonic":"bit","params":["1","(ix+dd)"]},"4c":{"mnemonic":"bit","params":["1","(ix+dd)"]},"4d":{"mnemonic":"bit","params":["1","(ix+dd)"]},"4e":{"mnemonic":"bit","params":["1","(ix+dd)"]},"4f":{"mnemonic":"bit","params":["1","(ix+dd)"]},"5a":{"mnemonic":"bit","params":["3","(ix+dd)"]},"5b":{"mnemonic":"bit","params":["3","(ix+dd)"]},"5c":{"mnemonic":"bit","params":["3","(ix+dd)"]},"5d":{"mnemonic":"bit","params":["3","(ix+dd)"]},"5e":{"mnemonic":"bit","params":["3","(ix+dd)"]},"5f":{"mnemonic":"bit","params":["3","(ix+dd)"]},"6a":{"mnemonic":"bit","params":["5","(ix+dd)"]},"6b":{"mnemonic":"bit","params":["5","(ix+dd)"]},"6c":{"mnemonic":"bit","params":["5","(ix+dd)"]},"6d":{"mnemonic":"bit","params":["5","(ix+dd)"]},"6e":{"mnemonic":"bit","params":["5","(ix+dd)"]},"6f":{"mnemonic":"bit","params":["5","(ix+dd)"]},"7a":{"mnemonic":"bit","params":["7","(ix+dd)"]},"7b":{"mnemonic":"bit","params":["7","(ix+dd)"]},"7c":{"mnemonic":"bit","params":["7","(ix+dd)"]},"7d":{"mnemonic":"bit","params":["7","(ix+dd)"]},"7e":{"mnemonic":"bit","params":["7","(ix+dd)"]},"7f":{"mnemonic":"bit","params":["7","(ix+dd)"]},"8a":{"mnemonic":"ld","params":["d","res"],"extra":["1","(ix+dd)"]},"8b":{"mnemonic":"ld","params":["e","res"],"extra":["1","(ix+dd)"]},"8c":{"mnemonic":"ld","params":["h","res"],"extra":["1","(ix+dd)"]},"8d":{"mnemonic":"ld","params":["l","res"],"extra":["1","(ix+dd)"]},"8e":{"mnemonic":"res","params":["1","(ix+dd)"]},"8f":{"mnemonic":"ld","params":["a","res"],"extra":["1","(ix+dd)"]},"9a":{"mnemonic":"ld","params":["d","res"],"extra":["3","(ix+dd)"]},"9b":{"mnemonic":"ld","params":["e","res"],"extra":["3","(ix+dd)"]},"9c":{"mnemonic":"ld","params":["h","res"],"extra":["3","(ix+dd)"]},"9d":{"mnemonic":"ld","params":["l","res"],"extra":["3","(ix+dd)"]},"9e":{"mnemonic":"res","params":["3","(ix+dd)"]},"9f":{"mnemonic":"ld","params":["a","res"],"extra":["3","(ix+dd)"]},"a0":{"mnemonic":"ld","params":["b","res"],"extra":["4","(ix+dd)"]},"a1":{"mnemonic":"ld","params":["c","res"],"extra":["4","(ix+dd)"]},"a2":{"mnemonic":"ld","params":["d","res"],"extra":["4","(ix+dd)"]},"a3":{"mnemonic":"ld","params":["e","res"],"extra":["4","(ix+dd)"]},"a4":{"mnemonic":"ld","params":["h","res"],"extra":["4","(ix+dd)"]},"a5":{"mnemonic":"ld","params":["l","res"],"extra":["4","(ix+dd)"]},"a6":{"mnemonic":"res","params":["4","(ix+dd)"]},"a7":{"mnemonic":"ld","params":["a","res"],"extra":["4","(ix+dd)"]},"a8":{"mnemonic":"ld","params":["b","res"],"extra":["5","(ix+dd)"]},"a9":{"mnemonic":"ld","params":["c","res"],"extra":["5","(ix+dd)"]},"aa":{"mnemonic":"ld","params":["d","res"],"extra":["5","(ix+dd)"]},"ab":{"mnemonic":"ld","params":["e","res"],"extra":["5","(ix+dd)"]},"ac":{"mnemonic":"ld","params":["h","res"],"extra":["5","(ix+dd)"]},"ad":{"mnemonic":"ld","params":["l","res"],"extra":["5","(ix+dd)"]},"ae":{"mnemonic":"res","params":["5","(ix+dd)"]},"af":{"mnemonic":"ld","params":["a","res"],"extra":["5","(ix+dd)"]},"b0":{"mnemonic":"ld","params":["b","res"],"extra":["6","(ix+dd)"]},"b1":{"mnemonic":"ld","params":["c","res"],"extra":["6","(ix+dd)"]},"b2":{"mnemonic":"ld","params":["d","res"],"extra":["6","(ix+dd)"]},"b3":{"mnemonic":"ld","params":["e","res"],"extra":["6","(ix+dd)"]},"b4":{"mnemonic":"ld","params":["h","res"],"extra":["6","(ix+dd)"]},"b5":{"mnemonic":"ld","params":["l","res"],"extra":["6","(ix+dd)"]},"b6":{"mnemonic":"res","params":["6","(ix+dd)"]},"b7":{"mnemonic":"ld","params":["a","res"],"extra":["6","(ix+dd)"]},"b8":{"mnemonic":"ld","params":["b","res"],"extra":["7","(ix+dd)"]},"b9":{"mnemonic":"ld","params":["c","res"],"extra":["7","(ix+dd)"]},"ba":{"mnemonic":"ld","params":["d","res"],"extra":["7","(ix+dd)"]},"bb":{"mnemonic":"ld","params":["e","res"],"extra":["7","(ix+dd)"]},"bc":{"mnemonic":"ld","params":["h","res"],"extra":["7","(ix+dd)"]},"bd":{"mnemonic":"ld","params":["l","res"],"extra":["7","(ix+dd)"]},"be":{"mnemonic":"res","params":["7","(ix+dd)"]},"bf":{"mnemonic":"ld","params":["a","res"],"extra":["7","(ix+dd)"]},"c0":{"mnemonic":"ld","params":["b","set"],"extra":["0","(ix+dd)"]},"c1":{"mnemonic":"ld","params":["c","set"],"extra":["0","(ix+dd)"]},"c2":{"mnemonic":"ld","params":["d","set"],"extra":["0","(ix+dd)"]},"c3":{"mnemonic":"ld","params":["e","set"],"extra":["0","(ix+dd)"]},"c4":{"mnemonic":"ld","params":["h","set"],"extra":["0","(ix+dd)"]},"c5":{"mnemonic":"ld","params":["l","set"],"extra":["0","(ix+dd)"]},"c6":{"mnemonic":"set","params":["0","(ix+dd)"]},"c7":{"mnemonic":"ld","params":["a","set"],"extra":["0","(ix+dd)"]},"c8":{"mnemonic":"ld","params":["b","set"],"extra":["1","(ix+dd)"]},"c9":{"mnemonic":"ld","params":["c","set"],"extra":["1","(ix+dd)"]},"ca":{"mnemonic":"ld","params":["d","set"],"extra":["1","(ix+dd)"]},"cb":{"mnemonic":"ld","params":["e","set"],"extra":["1","(ix+dd)"]},"cc":{"mnemonic":"ld","params":["h","set"],"extra":["1","(ix+dd)"]},"cd":{"mnemonic":"ld","params":["l","set"],"extra":["1","(ix+dd)"]},"ce":{"mnemonic":"set","params":["1","(ix+dd)"]},"cf":{"mnemonic":"ld","params":["a","set"],"extra":["1","(ix+dd)"]},"d0":{"mnemonic":"ld","params":["b","set"],"extra":["2","(ix+dd)"]},"d1":{"mnemonic":"ld","params":["c","set"],"extra":["2","(ix+dd)"]},"d2":{"mnemonic":"ld","params":["d","set"],"extra":["2","(ix+dd)"]},"d3":{"mnemonic":"ld","params":["e","set"],"extra":["2","(ix+dd)"]},"d4":{"mnemonic":"ld","params":["h","set"],"extra":["2","(ix+dd)"]},"d5":{"mnemonic":"ld","params":["l","set"],"extra":["2","(ix+dd)"]},"d6":{"mnemonic":"set","params":["2","(ix+dd)"]},"d7":{"mnemonic":"ld","params":["a","set"],"extra":["2","(ix+dd)"]},"d8":{"mnemonic":"ld","params":["b","set"],"extra":["3","(ix+dd)"]},"d9":{"mnemonic":"ld","params":["c","set"],"extra":["3","(ix+dd)"]},"da":{"mnemonic":"ld","params":["d","set"],"extra":["3","(ix+dd)"]},"db":{"mnemonic":"ld","params":["e","set"],"extra":["3","(ix+dd)"]},"dc":{"mnemonic":"ld","params":["h","set"],"extra":["3","(ix+dd)"]},"dd":{"mnemonic":"ld","params":["l","set"],"extra":["3","(ix+dd)"]},"de":{"mnemonic":"set","params":["3","(ix+dd)"]},"df":{"mnemonic":"ld","params":["a","set"],"extra":["3","(ix+dd)"]},"e0":{"mnemonic":"ld","params":["b","set"],"extra":["4","(ix+dd)"]},"e1":{"mnemonic":"ld","params":["c","set"],"extra":["4","(ix+dd)"]},"e2":{"mnemonic":"ld","params":["d","set"],"extra":["4","(ix+dd)"]},"e3":{"mnemonic":"ld","params":["e","set"],"extra":["4","(ix+dd)"]},"e4":{"mnemonic":"ld","params":["h","set"],"extra":["4","(ix+dd)"]},"e5":{"mnemonic":"ld","params":["l","set"],"extra":["4","(ix+dd)"]},"e6":{"mnemonic":"set","params":["4","(ix+dd)"]},"e7":{"mnemonic":"ld","params":["a","set"],"extra":["4","(ix+dd)"]},"e8":{"mnemonic":"ld","params":["b","set"],"extra":["5","(ix+dd)"]},"e9":{"mnemonic":"ld","params":["c","set"],"extra":["5","(ix+dd)"]},"ea":{"mnemonic":"ld","params":["d","set"],"extra":["5","(ix+dd)"]},"eb":{"mnemonic":"ld","params":["e","set"],"extra":["5","(ix+dd)"]},"ec":{"mnemonic":"ld","params":["h","set"],"extra":["5","(ix+dd)"]},"ed":{"mnemonic":"ld","params":["l","set"],"extra":["5","(ix+dd)"]},"ee":{"mnemonic":"set","params":["5","(ix+dd)"]},"ef":{"mnemonic":"ld","params":["a","set"],"extra":["5","(ix+dd)"]},"f0":{"mnemonic":"ld","params":["b","set"],"extra":["6","(ix+dd)"]},"f1":{"mnemonic":"ld","params":["c","set"],"extra":["6","(ix+dd)"]},"f2":{"mnemonic":"ld","params":["d","set"],"extra":["6","(ix+dd)"]},"f3":{"mnemonic":"ld","params":["e","set"],"extra":["6","(ix+dd)"]},"f4":{"mnemonic":"ld","params":["h","set"],"extra":["6","(ix+dd)"]},"f5":{"mnemonic":"ld","params":["l","set"],"extra":["6","(ix+dd)"]},"f6":{"mnemonic":"set","params":["6","(ix+dd)"]},"f7":{"mnemonic":"ld","params":["a","set"],"extra":["6","(ix+dd)"]},"f8":{"mnemonic":"ld","params":["b","set"],"extra":["7","(ix+dd)"]},"f9":{"mnemonic":"ld","params":["c","set"],"extra":["7","(ix+dd)"]},"fa":{"mnemonic":"ld","params":["d","set"],"extra":["7","(ix+dd)"]},"fb":{"mnemonic":"ld","params":["e","set"],"extra":["7","(ix+dd)"]},"fc":{"mnemonic":"ld","params":["h","set"],"extra":["7","(ix+dd)"]},"fd":{"mnemonic":"ld","params":["l","set"],"extra":["7","(ix+dd)"]},"fe":{"mnemonic":"set","params":["7","(ix+dd)"]},"ff":{"mnemonic":"ld","params":["a","set"],"extra":["7","(ix+dd)"]}}},"e1":{"mnemonic":"pop","params":["ix"]},"e3":{"mnemonic":"ex","params":["(sp)","ix"]},"e5":{"mnemonic":"push","params":["ix"]},"e9":{"mnemonic":"jp","params":["ix"]},"f9":{"mnemonic":"ld","params":["sp","ix"]}}},"de":{"mnemonic":"sbc","params":["a","nn"]},"df":{"mnemonic":"rst","params":["18"]},"e0":{"mnemonic":"ret","params":["po"]},"e1":{"mnemonic":"pop","params":["hl"]},"e2":{"mnemonic":"jp","params":["po","nnnn"]},"e3":{"mnemonic":"ex","params":["(sp)","hl"]},"e4":{"mnemonic":"call","params":["po","nnnn"]},"e5":{"mnemonic":"push","params":["hl"]},"e6":{"mnemonic":"and","params":["nn"]},"e7":{"mnemonic":"rst","params":["20"]},"e8":{"mnemonic":"ret","params":["pe"]},"e9":{"mnemonic":"jp","params":["hl"]},"ea":{"mnemonic":"jp","params":["pe","nnnn"]},"eb":{"mnemonic":"ex","params":["de","hl"]},"ec":{"mnemonic":"call","params":["pe","nnnn"]},"ed":{"shift":{"40":{"mnemonic":"in","params":["b","(c)"]},"41":{"mnemonic":"out","params":["(c)","b"]},"42":{"mnemonic":"sbc","params":["hl","bc"]},"43":{"mnemonic":"ld","params":["(nnnn)","bc"]},"44":{"mnemonic":"neg"},"45":{"mnemonic":"retn"},"46":{"mnemonic":"im","params":["0"]},"47":{"mnemonic":"ld","params":["i","a"]},"48":{"mnemonic":"in","params":["c","(c)"]},"49":{"mnemonic":"out","params":["(c)","c"]},"50":{"mnemonic":"in","params":["d","(c)"]},"51":{"mnemonic":"out","params":["(c)","d"]},"52":{"mnemonic":"sbc","params":["hl","de"]},"53":{"mnemonic":"ld","params":["(nnnn)","de"]},"54":{"mnemonic":"neg"},"55":{"mnemonic":"retn"},"56":{"mnemonic":"im","params":["1"]},"57":{"mnemonic":"ld","params":["a","i"]},"58":{"mnemonic":"in","params":["e","(c)"]},"59":{"mnemonic":"out","params":["(c)","e"]},"60":{"mnemonic":"in","params":["h","(c)"]},"61":{"mnemonic":"out","params":["(c)","h"]},"62":{"mnemonic":"sbc","params":["hl","hl"]},"63":{"mnemonic":"ld","params":["(nnnn)","hl"]},"64":{"mnemonic":"neg"},"65":{"mnemonic":"retn"},"66":{"mnemonic":"im","params":["0"]},"67":{"mnemonic":"rrd"},"68":{"mnemonic":"in","params":["l","(c)"]},"69":{"mnemonic":"out","params":["(c)","l"]},"70":{"mnemonic":"in","params":["f","(c)"]},"71":{"mnemonic":"out","params":["(c)","0"]},"72":{"mnemonic":"sbc","params":["hl","sp"]},"73":{"mnemonic":"ld","params":["(nnnn)","sp"]},"74":{"mnemonic":"neg"},"75":{"mnemonic":"retn"},"76":{"mnemonic":"im","params":["1"]},"78":{"mnemonic":"in","params":["a","(c)"]},"79":{"mnemonic":"out","params":["(c)","a"]},"4c":{"mnemonic":"neg"},"5c":{"mnemonic":"neg"},"6c":{"mnemonic":"neg"},"7c":{"mnemonic":"neg"},"5d":{"mnemonic":"retn"},"6d":{"mnemonic":"retn"},"7d":{"mnemonic":"retn"},"4e":{"mnemonic":"im","params":["0"]},"6e":{"mnemonic":"im","params":["0"]},"4a":{"mnemonic":"adc","params":["hl","bc"]},"4b":{"mnemonic":"ld","params":["bc","(nnnn)"]},"4d":{"mnemonic":"reti"},"4f":{"mnemonic":"ld","params":["r","a"]},"5a":{"mnemonic":"adc","params":["hl","de"]},"5b":{"mnemonic":"ld","params":["de","(nnnn)"]},"5e":{"mnemonic":"im","params":["2"]},"7e":{"mnemonic":"im","params":["2"]},"5f":{"mnemonic":"ld","params":["a","r"]},"6a":{"mnemonic":"adc","params":["hl","hl"]},"6b":{"mnemonic":"ld","params":["hl","(nnnn)"]},"6f":{"mnemonic":"rld"},"7a":{"mnemonic":"adc","params":["hl","sp"]},"7b":{"mnemonic":"ld","params":["sp","(nnnn)"]},"a0":{"mnemonic":"ldi"},"a1":{"mnemonic":"cpi"},"a2":{"mnemonic":"ini"},"a3":{"mnemonic":"outi"},"a8":{"mnemonic":"ldd"},"a9":{"mnemonic":"cpd"},"aa":{"mnemonic":"ind"},"ab":{"mnemonic":"outd"},"b0":{"mnemonic":"ldir"},"b1":{"mnemonic":"cpir"},"b2":{"mnemonic":"inir"},"b3":{"mnemonic":"otir"},"b8":{"mnemonic":"lddr"},"b9":{"mnemonic":"cpdr"},"ba":{"mnemonic":"indr"},"bb":{"mnemonic":"otdr"}}},"ee":{"mnemonic":"xor","params":["a","nn"]},"ef":{"mnemonic":"rst","params":["28"]},"f0":{"mnemonic":"ret","params":["p"]},"f1":{"mnemonic":"pop","params":["af"]},"f2":{"mnemonic":"jp","params":["p","nnnn"]},"f3":{"mnemonic":"di"},"f4":{"mnemonic":"call","params":["p","nnnn"]},"f5":{"mnemonic":"push","params":["af"]},"f6":{"mnemonic":"or","params":["nn"]},"f7":{"mnemonic":"rst","params":["30"]},"f8":{"mnemonic":"ret","params":["m"]},"f9":{"mnemonic":"ld","params":["sp","hl"]},"fa":{"mnemonic":"jp","params":["m","nnnn"]},"fb":{"mnemonic":"ei"},"fc":{"mnemonic":"call","params":["m","nnnn"]},"fd":{"shift":{"9":{"mnemonic":"add","params":["iy","bc"]},"19":{"mnemonic":"add","params":["iy","de"]},"21":{"mnemonic":"ld","params":["iy","nnnn"]},"22":{"mnemonic":"ld","params":["(nnnn)","iy"]},"23":{"mnemonic":"inc","params":["iy"]},"24":{"mnemonic":"inc","params":["iyh"]},"25":{"mnemonic":"dec","params":["iyh"]},"26":{"mnemonic":"ld","params":["iyh","nn"]},"29":{"mnemonic":"add","params":["iy","iy"]},"34":{"mnemonic":"inc","params":["(iy+dd)"]},"35":{"mnemonic":"dec","params":["(iy+dd)"]},"36":{"mnemonic":"ld","params":["(iy+dd)","nn"]},"39":{"mnemonic":"add","params":["iy","sp"]},"44":{"mnemonic":"ld","params":["b","iyh"]},"45":{"mnemonic":"ld","params":["b","iyl"]},"46":{"mnemonic":"ld","params":["b","(iy+dd)"]},"54":{"mnemonic":"ld","params":["d","iyh"]},"55":{"mnemonic":"ld","params":["d","iyl"]},"56":{"mnemonic":"ld","params":["d","(iy+dd)"]},"60":{"mnemonic":"ld","params":["iyh","b"]},"61":{"mnemonic":"ld","params":["iyh","c"]},"62":{"mnemonic":"ld","params":["iyh","d"]},"63":{"mnemonic":"ld","params":["iyh","e"]},"64":{"mnemonic":"ld","params":["iyh","iyh"]},"65":{"mnemonic":"ld","params":["iyh","iyl"]},"66":{"mnemonic":"ld","params":["h","(iy+dd)"]},"67":{"mnemonic":"ld","params":["iyh","a"]},"68":{"mnemonic":"ld","params":["iyl","b"]},"69":{"mnemonic":"ld","params":["iyl","c"]},"70":{"mnemonic":"ld","params":["(iy+dd)","b"]},"71":{"mnemonic":"ld","params":["(iy+dd)","c"]},"72":{"mnemonic":"ld","params":["(iy+dd)","d"]},"73":{"mnemonic":"ld","params":["(iy+dd)","e"]},"74":{"mnemonic":"ld","params":["(iy+dd)","h"]},"75":{"mnemonic":"ld","params":["(iy+dd)","l"]},"77":{"mnemonic":"ld","params":["(iy+dd)","a"]},"84":{"mnemonic":"add","params":["a","iyh"]},"85":{"mnemonic":"add","params":["a","iyl"]},"86":{"mnemonic":"add","params":["a","(iy+dd)"]},"94":{"mnemonic":"sub","params":["a","iyh"]},"95":{"mnemonic":"sub","params":["a","iyl"]},"96":{"mnemonic":"sub","params":["a","(iy+dd)"]},"2a":{"mnemonic":"ld","params":["iy","(nnnn)"]},"2b":{"mnemonic":"dec","params":["iy"]},"2c":{"mnemonic":"inc","params":["iyl"]},"2d":{"mnemonic":"dec","params":["iyl"]},"2e":{"mnemonic":"ld","params":["iyl","nn"]},"4c":{"mnemonic":"ld","params":["c","iyh"]},"4d":{"mnemonic":"ld","params":["c","iyl"]},"4e":{"mnemonic":"ld","params":["c","(iy+dd)"]},"5c":{"mnemonic":"ld","params":["e","iyh"]},"5d":{"mnemonic":"ld","params":["e","iyl"]},"5e":{"mnemonic":"ld","params":["e","(iy+dd)"]},"6a":{"mnemonic":"ld","params":["iyl","d"]},"6b":{"mnemonic":"ld","params":["iyl","e"]},"6c":{"mnemonic":"ld","params":["iyl","iyh"]},"6d":{"mnemonic":"ld","params":["iyl","iyl"]},"6e":{"mnemonic":"ld","params":["l","(iy+dd)"]},"6f":{"mnemonic":"ld","params":["iyl","a"]},"7c":{"mnemonic":"ld","params":["a","iyh"]},"7d":{"mnemonic":"ld","params":["a","iyl"]},"7e":{"mnemonic":"ld","params":["a","(iy+dd)"]},"8c":{"mnemonic":"adc","params":["a","iyh"]},"8d":{"mnemonic":"adc","params":["a","iyl"]},"8e":{"mnemonic":"adc","params":["a","(iy+dd)"]},"9c":{"mnemonic":"sbc","params":["a","iyh"]},"9d":{"mnemonic":"sbc","params":["a","iyl"]},"9e":{"mnemonic":"sbc","params":["a","(iy+dd)"]},"a4":{"mnemonic":"and","params":["a","iyh"]},"a5":{"mnemonic":"and","params":["a","iyl"]},"a6":{"mnemonic":"and","params":["a","(iy+dd)"]},"ac":{"mnemonic":"xor","params":["a","iyh"]},"ad":{"mnemonic":"xor","params":["a","iyl"]},"ae":{"mnemonic":"xor","params":["a","(iy+dd)"]},"b4":{"mnemonic":"or","params":["a","iyh"]},"b5":{"mnemonic":"or","params":["a","iyl"]},"b6":{"mnemonic":"or","params":["a","(iy+dd)"]},"bc":{"mnemonic":"cp","params":["iyh"]},"bd":{"mnemonic":"cp","params":["iyl"]},"be":{"mnemonic":"cp","params":["(iy+dd)"]},"cb":{"shift":{"0":{"mnemonic":"ld","params":["b","rlc"],"extra":["(iy+dd)"]},"1":{"mnemonic":"ld","params":["c","rlc"],"extra":["(iy+dd)"]},"2":{"mnemonic":"ld","params":["d","rlc"],"extra":["(iy+dd)"]},"3":{"mnemonic":"ld","params":["e","rlc"],"extra":["(iy+dd)"]},"4":{"mnemonic":"ld","params":["h","rlc"],"extra":["(iy+dd)"]},"5":{"mnemonic":"ld","params":["l","rlc"],"extra":["(iy+dd)"]},"6":{"mnemonic":"rlc","params":["(iy+dd)"]},"7":{"mnemonic":"ld","params":["a","rlc"],"extra":["(iy+dd)"]},"8":{"mnemonic":"ld","params":["b","rrc"],"extra":["(iy+dd)"]},"9":{"mnemonic":"ld","params":["c","rrc"],"extra":["(iy+dd)"]},"10":{"mnemonic":"ld","params":["b","rl"],"extra":["(iy+dd)"]},"11":{"mnemonic":"ld","params":["c","rl"],"extra":["(iy+dd)"]},"12":{"mnemonic":"ld","params":["d","rl"],"extra":["(iy+dd)"]},"13":{"mnemonic":"ld","params":["e","rl"],"extra":["(iy+dd)"]},"14":{"mnemonic":"ld","params":["h","rl"],"extra":["(iy+dd)"]},"15":{"mnemonic":"ld","params":["l","rl"],"extra":["(iy+dd)"]},"16":{"mnemonic":"rl","params":["(iy+dd)"]},"17":{"mnemonic":"ld","params":["a","rl"],"extra":["(iy+dd)"]},"18":{"mnemonic":"ld","params":["b","rr"],"extra":["(iy+dd)"]},"19":{"mnemonic":"ld","params":["c","rr"],"extra":["(iy+dd)"]},"20":{"mnemonic":"ld","params":["b","sla"],"extra":["(iy+dd)"]},"21":{"mnemonic":"ld","params":["c","sla"],"extra":["(iy+dd)"]},"22":{"mnemonic":"ld","params":["d","sla"],"extra":["(iy+dd)"]},"23":{"mnemonic":"ld","params":["e","sla"],"extra":["(iy+dd)"]},"24":{"mnemonic":"ld","params":["h","sla"],"extra":["(iy+dd)"]},"25":{"mnemonic":"ld","params":["l","sla"],"extra":["(iy+dd)"]},"26":{"mnemonic":"sla","params":["(iy+dd)"]},"27":{"mnemonic":"ld","params":["a","sla"],"extra":["(iy+dd)"]},"28":{"mnemonic":"ld","params":["b","sra"],"extra":["(iy+dd)"]},"29":{"mnemonic":"ld","params":["c","sra"],"extra":["(iy+dd)"]},"30":{"mnemonic":"ld","params":["b","sll"],"extra":["(iy+dd)"]},"31":{"mnemonic":"ld","params":["c","sll"],"extra":["(iy+dd)"]},"32":{"mnemonic":"ld","params":["d","sll"],"extra":["(iy+dd)"]},"33":{"mnemonic":"ld","params":["e","sll"],"extra":["(iy+dd)"]},"34":{"mnemonic":"ld","params":["h","sll"],"extra":["(iy+dd)"]},"35":{"mnemonic":"ld","params":["l","sll"],"extra":["(iy+dd)"]},"36":{"mnemonic":"sll","params":["(iy+dd)"]},"37":{"mnemonic":"ld","params":["a","sll"],"extra":["(iy+dd)"]},"38":{"mnemonic":"ld","params":["b","srl"],"extra":["(iy+dd)"]},"39":{"mnemonic":"ld","params":["c","srl"],"extra":["(iy+dd)"]},"40":{"mnemonic":"bit","params":["0","(iy+dd)"]},"41":{"mnemonic":"bit","params":["0","(iy+dd)"]},"42":{"mnemonic":"bit","params":["0","(iy+dd)"]},"43":{"mnemonic":"bit","params":["0","(iy+dd)"]},"44":{"mnemonic":"bit","params":["0","(iy+dd)"]},"45":{"mnemonic":"bit","params":["0","(iy+dd)"]},"46":{"mnemonic":"bit","params":["0","(iy+dd)"]},"47":{"mnemonic":"bit","params":["0","(iy+dd)"]},"48":{"mnemonic":"bit","params":["1","(iy+dd)"]},"49":{"mnemonic":"bit","params":["1","(iy+dd)"]},"50":{"mnemonic":"bit","params":["2","(iy+dd)"]},"51":{"mnemonic":"bit","params":["2","(iy+dd)"]},"52":{"mnemonic":"bit","params":["2","(iy+dd)"]},"53":{"mnemonic":"bit","params":["2","(iy+dd)"]},"54":{"mnemonic":"bit","params":["2","(iy+dd)"]},"55":{"mnemonic":"bit","params":["2","(iy+dd)"]},"56":{"mnemonic":"bit","params":["2","(iy+dd)"]},"57":{"mnemonic":"bit","params":["2","(iy+dd)"]},"58":{"mnemonic":"bit","params":["3","(iy+dd)"]},"59":{"mnemonic":"bit","params":["3","(iy+dd)"]},"60":{"mnemonic":"bit","params":["4","(iy+dd)"]},"61":{"mnemonic":"bit","params":["4","(iy+dd)"]},"62":{"mnemonic":"bit","params":["4","(iy+dd)"]},"63":{"mnemonic":"bit","params":["4","(iy+dd)"]},"64":{"mnemonic":"bit","params":["4","(iy+dd)"]},"65":{"mnemonic":"bit","params":["4","(iy+dd)"]},"66":{"mnemonic":"bit","params":["4","(iy+dd)"]},"67":{"mnemonic":"bit","params":["4","(iy+dd)"]},"68":{"mnemonic":"bit","params":["5","(iy+dd)"]},"69":{"mnemonic":"bit","params":["5","(iy+dd)"]},"70":{"mnemonic":"bit","params":["6","(iy+dd)"]},"71":{"mnemonic":"bit","params":["6","(iy+dd)"]},"72":{"mnemonic":"bit","params":["6","(iy+dd)"]},"73":{"mnemonic":"bit","params":["6","(iy+dd)"]},"74":{"mnemonic":"bit","params":["6","(iy+dd)"]},"75":{"mnemonic":"bit","params":["6","(iy+dd)"]},"76":{"mnemonic":"bit","params":["6","(iy+dd)"]},"77":{"mnemonic":"bit","params":["6","(iy+dd)"]},"78":{"mnemonic":"bit","params":["7","(iy+dd)"]},"79":{"mnemonic":"bit","params":["7","(iy+dd)"]},"80":{"mnemonic":"ld","params":["b","res"],"extra":["0","(iy+dd)"]},"81":{"mnemonic":"ld","params":["c","res"],"extra":["0","(iy+dd)"]},"82":{"mnemonic":"ld","params":["d","res"],"extra":["0","(iy+dd)"]},"83":{"mnemonic":"ld","params":["e","res"],"extra":["0","(iy+dd)"]},"84":{"mnemonic":"ld","params":["h","res"],"extra":["0","(iy+dd)"]},"85":{"mnemonic":"ld","params":["l","res"],"extra":["0","(iy+dd)"]},"86":{"mnemonic":"res","params":["0","(iy+dd)"]},"87":{"mnemonic":"ld","params":["a","res"],"extra":["0","(iy+dd)"]},"88":{"mnemonic":"ld","params":["b","res"],"extra":["1","(iy+dd)"]},"89":{"mnemonic":"ld","params":["c","res"],"extra":["1","(iy+dd)"]},"90":{"mnemonic":"ld","params":["b","res"],"extra":["2","(iy+dd)"]},"91":{"mnemonic":"ld","params":["c","res"],"extra":["2","(iy+dd)"]},"92":{"mnemonic":"ld","params":["d","res"],"extra":["2","(iy+dd)"]},"93":{"mnemonic":"ld","params":["e","res"],"extra":["2","(iy+dd)"]},"94":{"mnemonic":"ld","params":["h","res"],"extra":["2","(iy+dd)"]},"95":{"mnemonic":"ld","params":["l","res"],"extra":["2","(iy+dd)"]},"96":{"mnemonic":"res","params":["2","(iy+dd)"]},"97":{"mnemonic":"ld","params":["a","res"],"extra":["2","(iy+dd)"]},"98":{"mnemonic":"ld","params":["b","res"],"extra":["3","(iy+dd)"]},"99":{"mnemonic":"ld","params":["c","res"],"extra":["3","(iy+dd)"]},"a":{"mnemonic":"ld","params":["d","rrc"],"extra":["(iy+dd)"]},"b":{"mnemonic":"ld","params":["e","rrc"],"extra":["(iy+dd)"]},"c":{"mnemonic":"ld","params":["h","rrc"],"extra":["(iy+dd)"]},"d":{"mnemonic":"ld","params":["l","rrc"],"extra":["(iy+dd)"]},"e":{"mnemonic":"rrc","params":["(iy+dd)"]},"f":{"mnemonic":"ld","params":["a","rrc"],"extra":["(iy+dd)"]},"1a":{"mnemonic":"ld","params":["d","rr"],"extra":["(iy+dd)"]},"1b":{"mnemonic":"ld","params":["e","rr"],"extra":["(iy+dd)"]},"1c":{"mnemonic":"ld","params":["h","rr"],"extra":["(iy+dd)"]},"1d":{"mnemonic":"ld","params":["l","rr"],"extra":["(iy+dd)"]},"1e":{"mnemonic":"rr","params":["(iy+dd)"]},"1f":{"mnemonic":"ld","params":["a","rr"],"extra":["(iy+dd)"]},"2a":{"mnemonic":"ld","params":["d","sra"],"extra":["(iy+dd)"]},"2b":{"mnemonic":"ld","params":["e","sra"],"extra":["(iy+dd)"]},"2c":{"mnemonic":"ld","params":["h","sra"],"extra":["(iy+dd)"]},"2d":{"mnemonic":"ld","params":["l","sra"],"extra":["(iy+dd)"]},"2e":{"mnemonic":"sra","params":["(iy+dd)"]},"2f":{"mnemonic":"ld","params":["a","sra"],"extra":["(iy+dd)"]},"3a":{"mnemonic":"ld","params":["d","srl"],"extra":["(iy+dd)"]},"3b":{"mnemonic":"ld","params":["e","srl"],"extra":["(iy+dd)"]},"3c":{"mnemonic":"ld","params":["h","srl"],"extra":["(iy+dd)"]},"3d":{"mnemonic":"ld","params":["l","srl"],"extra":["(iy+dd)"]},"3e":{"mnemonic":"srl","params":["(iy+dd)"]},"3f":{"mnemonic":"ld","params":["a","srl"],"extra":["(iy+dd)"]},"4a":{"mnemonic":"bit","params":["1","(iy+dd)"]},"4b":{"mnemonic":"bit","params":["1","(iy+dd)"]},"4c":{"mnemonic":"bit","params":["1","(iy+dd)"]},"4d":{"mnemonic":"bit","params":["1","(iy+dd)"]},"4e":{"mnemonic":"bit","params":["1","(iy+dd)"]},"4f":{"mnemonic":"bit","params":["1","(iy+dd)"]},"5a":{"mnemonic":"bit","params":["3","(iy+dd)"]},"5b":{"mnemonic":"bit","params":["3","(iy+dd)"]},"5c":{"mnemonic":"bit","params":["3","(iy+dd)"]},"5d":{"mnemonic":"bit","params":["3","(iy+dd)"]},"5e":{"mnemonic":"bit","params":["3","(iy+dd)"]},"5f":{"mnemonic":"bit","params":["3","(iy+dd)"]},"6a":{"mnemonic":"bit","params":["5","(iy+dd)"]},"6b":{"mnemonic":"bit","params":["5","(iy+dd)"]},"6c":{"mnemonic":"bit","params":["5","(iy+dd)"]},"6d":{"mnemonic":"bit","params":["5","(iy+dd)"]},"6e":{"mnemonic":"bit","params":["5","(iy+dd)"]},"6f":{"mnemonic":"bit","params":["5","(iy+dd)"]},"7a":{"mnemonic":"bit","params":["7","(iy+dd)"]},"7b":{"mnemonic":"bit","params":["7","(iy+dd)"]},"7c":{"mnemonic":"bit","params":["7","(iy+dd)"]},"7d":{"mnemonic":"bit","params":["7","(iy+dd)"]},"7e":{"mnemonic":"bit","params":["7","(iy+dd)"]},"7f":{"mnemonic":"bit","params":["7","(iy+dd)"]},"8a":{"mnemonic":"ld","params":["d","res"],"extra":["1","(iy+dd)"]},"8b":{"mnemonic":"ld","params":["e","res"],"extra":["1","(iy+dd)"]},"8c":{"mnemonic":"ld","params":["h","res"],"extra":["1","(iy+dd)"]},"8d":{"mnemonic":"ld","params":["l","res"],"extra":["1","(iy+dd)"]},"8e":{"mnemonic":"res","params":["1","(iy+dd)"]},"8f":{"mnemonic":"ld","params":["a","res"],"extra":["1","(iy+dd)"]},"9a":{"mnemonic":"ld","params":["d","res"],"extra":["3","(iy+dd)"]},"9b":{"mnemonic":"ld","params":["e","res"],"extra":["3","(iy+dd)"]},"9c":{"mnemonic":"ld","params":["h","res"],"extra":["3","(iy+dd)"]},"9d":{"mnemonic":"ld","params":["l","res"],"extra":["3","(iy+dd)"]},"9e":{"mnemonic":"res","params":["3","(iy+dd)"]},"9f":{"mnemonic":"ld","params":["a","res"],"extra":["3","(iy+dd)"]},"a0":{"mnemonic":"ld","params":["b","res"],"extra":["4","(iy+dd)"]},"a1":{"mnemonic":"ld","params":["c","res"],"extra":["4","(iy+dd)"]},"a2":{"mnemonic":"ld","params":["d","res"],"extra":["4","(iy+dd)"]},"a3":{"mnemonic":"ld","params":["e","res"],"extra":["4","(iy+dd)"]},"a4":{"mnemonic":"ld","params":["h","res"],"extra":["4","(iy+dd)"]},"a5":{"mnemonic":"ld","params":["l","res"],"extra":["4","(iy+dd)"]},"a6":{"mnemonic":"res","params":["4","(iy+dd)"]},"a7":{"mnemonic":"ld","params":["a","res"],"extra":["4","(iy+dd)"]},"a8":{"mnemonic":"ld","params":["b","res"],"extra":["5","(iy+dd)"]},"a9":{"mnemonic":"ld","params":["c","res"],"extra":["5","(iy+dd)"]},"aa":{"mnemonic":"ld","params":["d","res"],"extra":["5","(iy+dd)"]},"ab":{"mnemonic":"ld","params":["e","res"],"extra":["5","(iy+dd)"]},"ac":{"mnemonic":"ld","params":["h","res"],"extra":["5","(iy+dd)"]},"ad":{"mnemonic":"ld","params":["l","res"],"extra":["5","(iy+dd)"]},"ae":{"mnemonic":"res","params":["5","(iy+dd)"]},"af":{"mnemonic":"ld","params":["a","res"],"extra":["5","(iy+dd)"]},"b0":{"mnemonic":"ld","params":["b","res"],"extra":["6","(iy+dd)"]},"b1":{"mnemonic":"ld","params":["c","res"],"extra":["6","(iy+dd)"]},"b2":{"mnemonic":"ld","params":["d","res"],"extra":["6","(iy+dd)"]},"b3":{"mnemonic":"ld","params":["e","res"],"extra":["6","(iy+dd)"]},"b4":{"mnemonic":"ld","params":["h","res"],"extra":["6","(iy+dd)"]},"b5":{"mnemonic":"ld","params":["l","res"],"extra":["6","(iy+dd)"]},"b6":{"mnemonic":"res","params":["6","(iy+dd)"]},"b7":{"mnemonic":"ld","params":["a","res"],"extra":["6","(iy+dd)"]},"b8":{"mnemonic":"ld","params":["b","res"],"extra":["7","(iy+dd)"]},"b9":{"mnemonic":"ld","params":["c","res"],"extra":["7","(iy+dd)"]},"ba":{"mnemonic":"ld","params":["d","res"],"extra":["7","(iy+dd)"]},"bb":{"mnemonic":"ld","params":["e","res"],"extra":["7","(iy+dd)"]},"bc":{"mnemonic":"ld","params":["h","res"],"extra":["7","(iy+dd)"]},"bd":{"mnemonic":"ld","params":["l","res"],"extra":["7","(iy+dd)"]},"be":{"mnemonic":"res","params":["7","(iy+dd)"]},"bf":{"mnemonic":"ld","params":["a","res"],"extra":["7","(iy+dd)"]},"c0":{"mnemonic":"ld","params":["b","set"],"extra":["0","(iy+dd)"]},"c1":{"mnemonic":"ld","params":["c","set"],"extra":["0","(iy+dd)"]},"c2":{"mnemonic":"ld","params":["d","set"],"extra":["0","(iy+dd)"]},"c3":{"mnemonic":"ld","params":["e","set"],"extra":["0","(iy+dd)"]},"c4":{"mnemonic":"ld","params":["h","set"],"extra":["0","(iy+dd)"]},"c5":{"mnemonic":"ld","params":["l","set"],"extra":["0","(iy+dd)"]},"c6":{"mnemonic":"set","params":["0","(iy+dd)"]},"c7":{"mnemonic":"ld","params":["a","set"],"extra":["0","(iy+dd)"]},"c8":{"mnemonic":"ld","params":["b","set"],"extra":["1","(iy+dd)"]},"c9":{"mnemonic":"ld","params":["c","set"],"extra":["1","(iy+dd)"]},"ca":{"mnemonic":"ld","params":["d","set"],"extra":["1","(iy+dd)"]},"cb":{"mnemonic":"ld","params":["e","set"],"extra":["1","(iy+dd)"]},"cc":{"mnemonic":"ld","params":["h","set"],"extra":["1","(iy+dd)"]},"cd":{"mnemonic":"ld","params":["l","set"],"extra":["1","(iy+dd)"]},"ce":{"mnemonic":"set","params":["1","(iy+dd)"]},"cf":{"mnemonic":"ld","params":["a","set"],"extra":["1","(iy+dd)"]},"d0":{"mnemonic":"ld","params":["b","set"],"extra":["2","(iy+dd)"]},"d1":{"mnemonic":"ld","params":["c","set"],"extra":["2","(iy+dd)"]},"d2":{"mnemonic":"ld","params":["d","set"],"extra":["2","(iy+dd)"]},"d3":{"mnemonic":"ld","params":["e","set"],"extra":["2","(iy+dd)"]},"d4":{"mnemonic":"ld","params":["h","set"],"extra":["2","(iy+dd)"]},"d5":{"mnemonic":"ld","params":["l","set"],"extra":["2","(iy+dd)"]},"d6":{"mnemonic":"set","params":["2","(iy+dd)"]},"d7":{"mnemonic":"ld","params":["a","set"],"extra":["2","(iy+dd)"]},"d8":{"mnemonic":"ld","params":["b","set"],"extra":["3","(iy+dd)"]},"d9":{"mnemonic":"ld","params":["c","set"],"extra":["3","(iy+dd)"]},"da":{"mnemonic":"ld","params":["d","set"],"extra":["3","(iy+dd)"]},"db":{"mnemonic":"ld","params":["e","set"],"extra":["3","(iy+dd)"]},"dc":{"mnemonic":"ld","params":["h","set"],"extra":["3","(iy+dd)"]},"dd":{"mnemonic":"ld","params":["l","set"],"extra":["3","(iy+dd)"]},"de":{"mnemonic":"set","params":["3","(iy+dd)"]},"df":{"mnemonic":"ld","params":["a","set"],"extra":["3","(iy+dd)"]},"e0":{"mnemonic":"ld","params":["b","set"],"extra":["4","(iy+dd)"]},"e1":{"mnemonic":"ld","params":["c","set"],"extra":["4","(iy+dd)"]},"e2":{"mnemonic":"ld","params":["d","set"],"extra":["4","(iy+dd)"]},"e3":{"mnemonic":"ld","params":["e","set"],"extra":["4","(iy+dd)"]},"e4":{"mnemonic":"ld","params":["h","set"],"extra":["4","(iy+dd)"]},"e5":{"mnemonic":"ld","params":["l","set"],"extra":["4","(iy+dd)"]},"e6":{"mnemonic":"set","params":["4","(iy+dd)"]},"e7":{"mnemonic":"ld","params":["a","set"],"extra":["4","(iy+dd)"]},"e8":{"mnemonic":"ld","params":["b","set"],"extra":["5","(iy+dd)"]},"e9":{"mnemonic":"ld","params":["c","set"],"extra":["5","(iy+dd)"]},"ea":{"mnemonic":"ld","params":["d","set"],"extra":["5","(iy+dd)"]},"eb":{"mnemonic":"ld","params":["e","set"],"extra":["5","(iy+dd)"]},"ec":{"mnemonic":"ld","params":["h","set"],"extra":["5","(iy+dd)"]},"ed":{"mnemonic":"ld","params":["l","set"],"extra":["5","(iy+dd)"]},"ee":{"mnemonic":"set","params":["5","(iy+dd)"]},"ef":{"mnemonic":"ld","params":["a","set"],"extra":["5","(iy+dd)"]},"f0":{"mnemonic":"ld","params":["b","set"],"extra":["6","(iy+dd)"]},"f1":{"mnemonic":"ld","params":["c","set"],"extra":["6","(iy+dd)"]},"f2":{"mnemonic":"ld","params":["d","set"],"extra":["6","(iy+dd)"]},"f3":{"mnemonic":"ld","params":["e","set"],"extra":["6","(iy+dd)"]},"f4":{"mnemonic":"ld","params":["h","set"],"extra":["6","(iy+dd)"]},"f5":{"mnemonic":"ld","params":["l","set"],"extra":["6","(iy+dd)"]},"f6":{"mnemonic":"set","params":["6","(iy+dd)"]},"f7":{"mnemonic":"ld","params":["a","set"],"extra":["6","(iy+dd)"]},"f8":{"mnemonic":"ld","params":["b","set"],"extra":["7","(iy+dd)"]},"f9":{"mnemonic":"ld","params":["c","set"],"extra":["7","(iy+dd)"]},"fa":{"mnemonic":"ld","params":["d","set"],"extra":["7","(iy+dd)"]},"fb":{"mnemonic":"ld","params":["e","set"],"extra":["7","(iy+dd)"]},"fc":{"mnemonic":"ld","params":["h","set"],"extra":["7","(iy+dd)"]},"fd":{"mnemonic":"ld","params":["l","set"],"extra":["7","(iy+dd)"]},"fe":{"mnemonic":"set","params":["7","(iy+dd)"]},"ff":{"mnemonic":"ld","params":["a","set"],"extra":["7","(iy+dd)"]}}},"e1":{"mnemonic":"pop","params":["iy"]},"e3":{"mnemonic":"ex","params":["(sp)","iy"]},"e5":{"mnemonic":"push","params":["iy"]},"e9":{"mnemonic":"jp","params":["iy"]},"f9":{"mnemonic":"ld","params":["sp","iy"]}}},"fe":{"mnemonic":"cp","params":["nn"]},"ff":{"mnemonic":"rst","params":["38"]}}');

/***/ })

}]);