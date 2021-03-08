/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/BasicTab.ts":
/*!*************************!*\
  !*** ./src/BasicTab.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BasicTab": () => (/* binding */ BasicTab)
/* harmony export */ });
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__);



/**
 * Add text to the line with the specified class.
 *
 * @param out the enclosing element to add to.
 * @param text the text to add.
 * @param className the name of the class for the item.
 * @return the new element.
 */
function add(out, text, className) {
    const e = document.createElement("span");
    e.innerText = text;
    e.classList.add(className);
    out.appendChild(e);
    return e;
}
/**
 * Tab for displaying the decoded Basic source code.
 */
class BasicTab extends _PageTab__WEBPACK_IMPORTED_MODULE_1__.PageTab {
    constructor(basic) {
        super("Basic");
        this.basic = basic;
        this.element.classList.add("basic-tab");
        const outer = document.createElement("div");
        outer.classList.add("basic-outer");
        this.element.append(outer);
        this.basicElement = document.createElement("div");
        this.basicElement.classList.add("basic");
        outer.append(this.basicElement);
    }
    onFirstShow() {
        this.generateBasic();
    }
    /**
     * Regenerate the HTML for the Basic program.
     */
    generateBasic() {
        const lines = [];
        let line = undefined;
        for (const basicElement of this.basic.elements) {
            // Create a new line if necessary.
            if (line === undefined || basicElement.elementType === trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.LINE_NUMBER) {
                line = document.createElement("div");
                lines.push(line);
            }
            add(line, basicElement.asAscii(), BasicTab.classNameForBasicElement(basicElement));
        }
        // Add the lines all at once.
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__.clearElement)(this.basicElement);
        this.basicElement.append(...lines);
    }
    /**
     * Get the CSS class name for the given element.
     */
    static classNameForBasicElement(basicElement) {
        switch (basicElement.elementType) {
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.ERROR:
                return "basic-error";
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.LINE_NUMBER:
                return "basic-line-number";
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.PUNCTUATION:
                return "basic-punctuation";
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.KEYWORD:
                return "basic-keyword";
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.REGULAR:
            default:
                return "basic-regular";
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.STRING:
                return "basic-string";
            case trs80_base__WEBPACK_IMPORTED_MODULE_0__.ElementType.COMMENT:
                return "basic-comment";
        }
    }
}


/***/ }),

/***/ "./src/CmdTab.ts":
/*!***********************!*\
  !*** ./src/CmdTab.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CmdTab": () => (/* binding */ CmdTab)
/* harmony export */ });
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(z80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__);




/**
 * Add text to the line with the specified class.
 *
 * @param out the enclosing element to add to.
 * @param text the text to add.
 * @param className the name of the class for the item.
 */
function add(out, text, className) {
    const e = document.createElement("span");
    e.innerText = text;
    e.classList.add(className);
    out.appendChild(e);
    return e;
}
/**
 * Add a snippet (first few bytes) of a binary to the line.
 */
function addBinarySnippet(line, loadData) {
    const bytes = loadData.slice(0, Math.min(3, loadData.length));
    const text = Array.from(bytes).map(z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexByte).join(" ") + (bytes.length < loadData.length ? " ..." : "");
    add(line, text, "cmd-hex");
    add(line, " (" + loadData.length + " byte" + (loadData.length == 1 ? "" : "s") + ")", "cmd-address");
}
/**
 * Tab for displaying chunks of CMD files.
 */
class CmdTab extends _PageTab__WEBPACK_IMPORTED_MODULE_1__.PageTab {
    constructor(cmdProgram) {
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
    onFirstShow() {
        this.generateCmd();
    }
    generateCmd() {
        const lines = [];
        const cmdProgram = this.cmdProgram;
        if (cmdProgram.error !== undefined) {
            const line = document.createElement("div");
            lines.push(line);
            add(line, cmdProgram.error, "cmd-error");
        }
        // Display a row for each chunk.
        let programAddress = undefined;
        for (const chunk of cmdProgram.chunks) {
            const line = document.createElement("div");
            lines.push(line);
            // Chunk type.
            add(line, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexByte)(chunk.type) + "  ", "cmd-address");
            if (chunk instanceof trs80_base__WEBPACK_IMPORTED_MODULE_2__.CmdLoadBlockChunk) {
                add(line, "Load at ", "cmd-opcodes");
                add(line, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(chunk.address), "cmd-address");
                add(line, ": ", "cmd-opcodes");
                addBinarySnippet(line, chunk.loadData);
                if (programAddress !== undefined && chunk.address !== programAddress) {
                    add(line, " (not contiguous, expected " + (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(programAddress) + ")", "cmd-error");
                }
                programAddress = chunk.address + chunk.loadData.length;
            }
            else if (chunk instanceof trs80_base__WEBPACK_IMPORTED_MODULE_2__.CmdTransferAddressChunk) {
                if (chunk.rawData.length !== 2) {
                    add(line, "Transfer address chunk has invalid length " + chunk.rawData.length, "cmd-error");
                }
                else {
                    add(line, "Jump to ", "cmd-opcodes");
                    add(line, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(chunk.address), "cmd-address");
                }
                // Not sure what to do here. I've seen junk after this block. I suspect that CMD
                // parsers of the time, when running into this block, would immediately just
                // jump to the address and ignore everything after it, so let's emulate that.
                break;
            }
            else if (chunk instanceof trs80_base__WEBPACK_IMPORTED_MODULE_2__.CmdLoadModuleHeaderChunk) {
                add(line, "Load module header: ", "cmd-opcodes");
                add(line, chunk.filename, "cmd-hex");
            }
            else {
                add(line, "Unknown type: ", "cmd-error");
                addBinarySnippet(line, chunk.rawData);
                const name = trs80_base__WEBPACK_IMPORTED_MODULE_2__.CMD_CHUNK_TYPE_NAME.get(chunk.type);
                if (name !== undefined) {
                    add(line, " (" + name + ")", "cmd-error");
                }
            }
        }
        // Add the lines all at once.
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__.clearElement)(this.innerElement);
        this.innerElement.append(...lines);
    }
}


/***/ }),

/***/ "./src/Context.ts":
/*!************************!*\
  !*** ./src/Context.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Context": () => (/* binding */ Context)
/* harmony export */ });
/* harmony import */ var _Library__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Library */ "./src/Library.ts");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var strongly_typed_events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! strongly-typed-events */ "./node_modules/strongly-typed-events/dist/index.js");
/* harmony import */ var _FilePanel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./FilePanel */ "./src/FilePanel.ts");




const FRAGMENT_PREFIX = "#!";
/**
 * Context of the whole app, with its global variables.
 */
class Context {
    constructor(library, trs80, db, panelManager) {
        this._runningFile = undefined;
        this._user = undefined;
        this.userResolved = false;
        this.onUser = new strongly_typed_events__WEBPACK_IMPORTED_MODULE_2__.SimpleEventDispatcher();
        this.onRunningFile = new strongly_typed_events__WEBPACK_IMPORTED_MODULE_2__.SimpleEventDispatcher();
        // Dispatched when we initially figure out if we're signed in or not.
        this.onUserResolved = new strongly_typed_events__WEBPACK_IMPORTED_MODULE_2__.SimpleEventDispatcher();
        this.library = library;
        this.trs80 = trs80;
        this.db = db;
        this.panelManager = panelManager;
        // Listen for changes to the file we're running.
        this.library.onEvent.subscribe(event => {
            if (this._runningFile !== undefined) {
                if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_0__.LibraryModifyEvent && event.oldFile.id === this._runningFile.id) {
                    this.runningFile = event.newFile;
                }
                if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_0__.LibraryRemoveEvent && event.oldFile.id === this._runningFile.id) {
                    this.runningFile = undefined;
                }
            }
        });
    }
    /**
     * Run a program.
     */
    runProgram(file, trs80File) {
        if (trs80File === undefined) {
            trs80File = (0,trs80_base__WEBPACK_IMPORTED_MODULE_1__.decodeTrs80File)(file.binary, file.filename);
        }
        if (trs80File.error !== undefined) {
            // TODO
            console.error("Error in TRS-80 file: " + trs80File.error);
        }
        else {
            this.runningFile = file;
            this.trs80.runTrs80File(trs80File);
        }
    }
    /**
     * Open a file panel on the given file.
     */
    openFilePanel(file) {
        const filePanel = new _FilePanel__WEBPACK_IMPORTED_MODULE_3__.FilePanel(this, file);
        this.panelManager.pushPanel(filePanel);
    }
    /**
     * Get the currently-running file, if any.
     */
    get runningFile() {
        return this._runningFile;
    }
    /**
     * Set the currently-running file, if any.
     */
    set runningFile(file) {
        this._runningFile = file;
        this.onRunningFile.dispatch(file);
    }
    /**
     * Set the currently signed-in user.
     */
    set user(user) {
        this._user = user;
        this.onUser.dispatch(user);
        if (!this.userResolved) {
            this.userResolved = true;
            this.onUserResolved.dispatch();
        }
    }
    /**
     * Get the currently signed-in user.
     */
    get user() {
        return this._user;
    }
    /**
     * Return the URL fragment for this context, including the leading hash.
     */
    getFragment() {
        const parts = [];
        if (this._runningFile !== undefined) {
            parts.push("runFile=" + this._runningFile.id);
        }
        const fragment = parts.join(",");
        return fragment === "" ? "" : FRAGMENT_PREFIX + fragment;
    }
    /**
     * Returns a map of variables in the fragment. Every value array will have at least one element.
     */
    static parseFragment(fragment) {
        const args = new Map();
        if (fragment.startsWith(FRAGMENT_PREFIX)) {
            fragment = fragment.substr(FRAGMENT_PREFIX.length);
            const parts = fragment.split(",");
            for (const part of parts) {
                const subparts = part.split("=");
                if (subparts.length !== 2) {
                    console.error(`Fragment part "${part}" is malformed.`);
                }
                else {
                    const key = subparts[0];
                    const value = subparts[1];
                    let values = args.get(key);
                    if (values === undefined) {
                        values = [];
                        args.set(key, values);
                    }
                    values.push(value);
                }
            }
        }
        return args;
    }
}


/***/ }),

/***/ "./src/Database.ts":
/*!*************************!*\
  !*** ./src/Database.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Database": () => (/* binding */ Database)
/* harmony export */ });
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ "./node_modules/firebase/app/dist/index.esm.js");
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./File */ "./src/File.ts");


const FILES_COLLECTION_NAME = "files";
const USERS_COLLECTION_NAME = "users";
/**
 * Interface to the Firestore data.
 */
class Database {
    constructor(firestore) {
        this.firestore = firestore;
    }
    /**
     * Get all files for this user.
     */
    getAllFiles(uid) {
        return this.firestore.collection(FILES_COLLECTION_NAME).where("uid", "==", uid).get();
    }
    /**
     * Get a file by its ID. Rejects without argument if can't be found or has insufficient permission.
     */
    getFile(fileId) {
        return this.firestore.collection(FILES_COLLECTION_NAME).doc(fileId).get()
            .then(snapshot => {
            if (snapshot.exists) {
                return Promise.resolve(_File__WEBPACK_IMPORTED_MODULE_1__.FileBuilder.fromDoc(snapshot).build());
            }
            else {
                // I don't know when this can happen because both missing and non-shared
                // files show up in the catch clause.
                return Promise.reject();
            }
        })
            .catch(error => {
            console.error(`Can't get file ${fileId}`, error);
            return Promise.reject();
        });
    }
    /**
     * Add a file to the database.
     */
    addFile(file) {
        return this.firestore.collection(FILES_COLLECTION_NAME).add({
            uid: file.uid,
            name: file.name,
            filename: file.filename,
            note: file.note,
            author: file.author,
            releaseYear: file.releaseYear,
            shared: file.shared,
            tags: file.tags,
            hash: file.hash,
            binary: firebase_app__WEBPACK_IMPORTED_MODULE_0__.default.firestore.Blob.fromUint8Array(file.binary),
            addedAt: firebase_app__WEBPACK_IMPORTED_MODULE_0__.default.firestore.Timestamp.fromDate(file.addedAt),
            modifiedAt: firebase_app__WEBPACK_IMPORTED_MODULE_0__.default.firestore.Timestamp.fromDate(file.modifiedAt),
        });
    }
    /**
     * Updates an existing file in the database. Both files should have the same ID.
     */
    updateFile(oldFile, newFile) {
        if (oldFile.id !== newFile.id) {
            throw new Error("File IDs must match in updateFile");
        }
        return this.firestore.collection(FILES_COLLECTION_NAME).doc(oldFile.id)
            .update(newFile.getUpdateDataComparedTo(oldFile));
    }
    /**
     * Deletes a file in the database.
     */
    deleteFile(file) {
        return this.firestore.collection(FILES_COLLECTION_NAME).doc(file.id).delete();
    }
    /**
     * Get or create a user for the given auth user.
     */
    userFromAuthUser(authUser) {
        const docRef = this.firestore.collection(USERS_COLLECTION_NAME).doc(authUser.uid);
        return this.firestore.runTransaction(transaction => {
            return transaction.get(docRef)
                .then(doc => {
                let user;
                if (doc.exists) {
                    // User already exists. Remember when they last signed in.
                    user = authUser.toUser(doc.data());
                    // TODO make delta object.
                    transaction.update(docRef, {
                        emailAddress: user.emailAddress,
                        name: user.name,
                        modifiedAt: user.modifiedAt,
                        lastActiveAt: firebase_app__WEBPACK_IMPORTED_MODULE_0__.default.firestore.Timestamp.fromDate(new Date()),
                    });
                }
                else {
                    // User does not yet exist, create it.
                    user = authUser.toNewUser();
                    transaction.set(docRef, {
                        emailAddress: user.emailAddress,
                        name: user.name,
                        admin: user.admin,
                        addedAt: user.addedAt,
                        modifiedAt: user.modifiedAt,
                        lastActiveAt: user.lastActiveAt,
                    });
                }
                return user;
            });
        });
    }
}


/***/ }),

/***/ "./src/DialogBox.ts":
/*!**************************!*\
  !*** ./src/DialogBox.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DialogBox": () => (/* binding */ DialogBox)
/* harmony export */ });
class DialogBox {
    constructor(title, content, cssClass) {
        this.backgroundNode = undefined;
        const body = document.querySelector("body");
        this.backgroundNode = document.createElement("div");
        this.backgroundNode.classList.add("dialog-box-background");
        this.backgroundNode.addEventListener("click", e => {
            if (e.target === this.backgroundNode) {
                this.close();
                e.preventDefault();
                e.stopPropagation();
            }
        });
        body.append(this.backgroundNode);
        const frame = document.createElement("div");
        frame.classList.add("dialog-box-frame");
        if (cssClass !== undefined) {
            frame.classList.add(cssClass);
        }
        this.backgroundNode.append(frame);
        const h1 = document.createElement("h1");
        h1.innerText = title;
        frame.append(h1);
        const contentFrame = document.createElement("div");
        contentFrame.classList.add("dialog-box-content-frame");
        frame.append(contentFrame);
        contentFrame.append(content);
        // Handler for the ESC key.
        this.escListener = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            }
        };
        document.addEventListener("keydown", this.escListener);
        // Wait a bit to let the initial view render, which enables the fade-in animation.
        setTimeout(() => { var _a; return (_a = this.backgroundNode) === null || _a === void 0 ? void 0 : _a.classList.add("dialog-box-shown"); }, 10);
    }
    /**
     * Close and destroy the dialog box. The dialog box cannot be re-opened.
     */
    close() {
        if (this.backgroundNode !== undefined) {
            document.removeEventListener("keydown", this.escListener);
            const backgroundNode = this.backgroundNode;
            backgroundNode.classList.remove("dialog-box-shown");
            this.backgroundNode = undefined;
            setTimeout(() => backgroundNode.remove(), 500);
        }
    }
}


/***/ }),

/***/ "./src/DisassemblyTab.ts":
/*!*******************************!*\
  !*** ./src/DisassemblyTab.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DisassemblyTab": () => (/* binding */ DisassemblyTab)
/* harmony export */ });
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(z80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var trs80_disasm__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! trs80-disasm */ "./node_modules/trs80-disasm/dist/index.js");
/* harmony import */ var trs80_disasm__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(trs80_disasm__WEBPACK_IMPORTED_MODULE_3__);




/**
 * Add text to the line with the specified class.
 *
 * @param out the enclosing element to add to.
 * @param text the text to add.
 * @param className the name of the class for the item.
 */
function add(out, text, className) {
    const e = document.createElement("span");
    e.innerText = text;
    e.classList.add(className);
    out.appendChild(e);
    return e;
}
/**
 * Tab for disassembling CMD or system program files.
 */
class DisassemblyTab extends _PageTab__WEBPACK_IMPORTED_MODULE_1__.PageTab {
    constructor(program) {
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
    onFirstShow() {
        this.generateDisassembly();
    }
    generateDisassembly() {
        const disasm = (0,trs80_disasm__WEBPACK_IMPORTED_MODULE_3__.disasmForTrs80Program)(this.program);
        const instructions = disasm.disassemble();
        const lines = [];
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
                const subbytesText = subbytes.map(z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexByte).join(" ");
                const line = document.createElement("div");
                lines.push(line);
                add(line, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(address), "disassembly-address");
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
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__.clearElement)(this.innerElement);
        this.innerElement.append(...lines);
    }
}


/***/ }),

/***/ "./src/DuplicatesTab.ts":
/*!******************************!*\
  !*** ./src/DuplicatesTab.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DuplicatesTab": () => (/* binding */ DuplicatesTab)
/* harmony export */ });
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var _IFilePanel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./IFilePanel */ "./src/IFilePanel.ts");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./File */ "./src/File.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_5__);






/**
 * Tab to show duplicates of the current file.
 */
class DuplicatesTab extends _PageTab__WEBPACK_IMPORTED_MODULE_0__.PageTab {
    constructor(filePanel) {
        super("Duplicates");
        this.filePanel = filePanel;
        this.element.classList.add("duplicates-tab");
        this.mainContents = document.createElement("div");
        this.mainContents.classList.add("duplicates");
        this.element.append(this.mainContents);
        // Handler to update our data.
        this.cancelLibrarySubscription = this.filePanel.context.library.onEvent.subscribe(() => this.updateContents());
    }
    onFirstShow() {
        this.updateContents();
    }
    onDestroy() {
        this.cancelLibrarySubscription();
        super.onDestroy();
    }
    /**
     * Update the UI with data from the library.
     */
    updateContents() {
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_5__.clearElement)(this.mainContents);
        const addDirEntryField = (value, ...cssClass) => {
            const dirEntry = document.createElement("div");
            dirEntry.classList.add(...cssClass);
            dirEntry.innerText = value;
            this.mainContents.append(dirEntry);
        };
        addDirEntryField("Name", "name", "header");
        addDirEntryField("Filename", "filename", "header");
        addDirEntryField("Type", "type", "header");
        addDirEntryField("In trash", "in-trash", "header");
        addDirEntryField("Edit", "edit", "header");
        const allFiles = this.filePanel.context.library.getAllFiles();
        allFiles.sort(_File__WEBPACK_IMPORTED_MODULE_4__.File.compare);
        for (const file of allFiles) {
            if (file.hash === this.filePanel.file.hash) {
                // See if we've show this file already in the panel stack.
                const alreadyVisited = (0,_IFilePanel__WEBPACK_IMPORTED_MODULE_1__.anyFilePanel)(this.filePanel, panel => panel.file.id === file.id);
                addDirEntryField(file.name, "name");
                addDirEntryField(file.filename, "filename");
                addDirEntryField((0,trs80_base__WEBPACK_IMPORTED_MODULE_2__.decodeTrs80File)(file.binary, file.filename).getDescription(), "type");
                const inTrash = file.tags.indexOf(_Utils__WEBPACK_IMPORTED_MODULE_3__.TRASH_TAG) >= 0;
                if (inTrash) {
                    const inTrashIcon = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIcon)("delete");
                    inTrashIcon.classList.add("in-trash");
                    this.mainContents.append(inTrashIcon);
                }
                else {
                    // Dummy cell for the grid.
                    this.mainContents.append(document.createElement("span"));
                }
                const openButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIcon)("edit");
                openButton.classList.add("edit");
                if (alreadyVisited) {
                    openButton.classList.add("disabled");
                }
                else {
                    openButton.addEventListener("click", () => {
                        this.filePanel.context.openFilePanel(file);
                    });
                }
                this.mainContents.append(openButton);
            }
        }
    }
}


/***/ }),

/***/ "./src/File.ts":
/*!*********************!*\
  !*** ./src/File.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "File": () => (/* binding */ File),
/* harmony export */   "FileBuilder": () => (/* binding */ FileBuilder)
/* harmony export */ });
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var base64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js");
/* harmony import */ var _Sha1__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Sha1 */ "./src/Sha1.ts");
/* harmony import */ var _TagSet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TagSet */ "./src/TagSet.ts");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_4__);





// What's considered a "new" file.
const NEW_TIME_MS = 60 * 60 * 24 * 7 * 1000;
// Prefix for version of hash. Increment this number when the hash algorithm changes.
const HASH_PREFIX = "1:";
/**
 * Return whether the test string starts with the filter prefix.
 */
function prefixMatches(testString, filterPrefix) {
    return testString.substr(0, filterPrefix.length).localeCompare(filterPrefix, undefined, {
        usage: "search",
        sensitivity: "base",
    }) === 0;
}
/**
 * Return whether any word in the test string starts with the filter prefix.
 */
function prefixMatchesAnyWord(testString, filterPrefix) {
    return testString.split(/\W+/).some(word => prefixMatches(word, filterPrefix));
}
/**
 * Represents a file that the user owns.
 */
class File {
    constructor(id, uid, name, filename, note, author, releaseYear, shared, tags, hash, screenshots, binary, addedAt, modifiedAt) {
        this.id = id;
        this.uid = uid;
        this.name = name;
        this.filename = filename;
        this.note = note;
        this.author = author;
        this.releaseYear = releaseYear;
        this.shared = shared;
        this.tags = [...tags].sort(); // Guarantee it's sorted.
        this.isDeleted = this.tags.indexOf(_Utils__WEBPACK_IMPORTED_MODULE_0__.TRASH_TAG) >= 0;
        this.hash = hash;
        this.screenshots = screenshots;
        this.binary = binary;
        this.addedAt = addedAt;
        this.modifiedAt = modifiedAt;
    }
    /**
     * Return the file as an object that can be converted to JSON and exported.
     */
    asMap() {
        return {
            id: this.id,
            uid: this.uid,
            name: this.name,
            filename: this.filename,
            note: this.note,
            author: this.author,
            releaseYear: this.releaseYear,
            shared: this.shared,
            tags: this.tags,
            hash: this.hash,
            screenshots: this.screenshots,
            binary: base64_js__WEBPACK_IMPORTED_MODULE_1__.fromByteArray(this.binary),
            addedAt: this.addedAt.getTime(),
            modifiedAt: this.modifiedAt.getTime(),
        };
    }
    builder() {
        const builder = new FileBuilder();
        builder.id = this.id;
        builder.uid = this.uid;
        builder.name = this.name;
        builder.filename = this.filename;
        builder.note = this.note;
        builder.author = this.author;
        builder.releaseYear = this.releaseYear;
        builder.shared = this.shared;
        builder.tags = this.tags;
        builder.hash = this.hash;
        builder.screenshots = this.screenshots;
        builder.binary = this.binary;
        builder.addedAt = this.addedAt;
        builder.modifiedAt = this.modifiedAt;
        return builder;
    }
    /**
     * Returns a Firestore update object to convert oldFile to this.
     */
    getUpdateDataComparedTo(oldFile) {
        const updateData = {};
        if (this.name !== oldFile.name) {
            updateData.name = this.name;
        }
        if (this.filename !== oldFile.filename) {
            updateData.filename = this.filename;
        }
        if (this.note !== oldFile.note) {
            updateData.note = this.note;
        }
        if (this.author !== oldFile.author) {
            updateData.author = this.author;
        }
        if (this.releaseYear !== oldFile.releaseYear) {
            updateData.releaseYear = this.releaseYear;
        }
        if (this.shared !== oldFile.shared) {
            updateData.shared = this.shared;
        }
        if (!(0,_Utils__WEBPACK_IMPORTED_MODULE_0__.isSameStringArray)(this.tags, oldFile.tags)) {
            updateData.tags = this.tags;
        }
        if (this.hash !== oldFile.hash) {
            updateData.hash = this.hash;
        }
        if (!(0,_Utils__WEBPACK_IMPORTED_MODULE_0__.isSameStringArray)(this.screenshots, oldFile.screenshots)) {
            updateData.screenshots = this.screenshots;
        }
        if (this.modifiedAt.getTime() !== oldFile.modifiedAt.getTime()) {
            updateData.modifiedAt = this.modifiedAt;
        }
        return updateData;
    }
    /**
     * Get all tags, both stored in the file and the automatically created ones.
     * TODO could cache this, assume the auto ones don't change over time. The "new" would
     * change but not much.
     */
    getAllTags() {
        const allTags = new _TagSet__WEBPACK_IMPORTED_MODULE_3__.TagSet();
        if (this.shared) {
            allTags.add("Shared");
        }
        const now = Date.now();
        if (now - this.addedAt.getTime() < NEW_TIME_MS) {
            allTags.add("New");
        }
        // TODO better extension algorithm.
        const i = this.filename.lastIndexOf(".");
        if (i > 0) {
            allTags.add(this.filename.substr(i + 1).toUpperCase());
        }
        if (this.note === "") {
            allTags.add("Missing note");
        }
        if (this.screenshots.length === 0) {
            allTags.add("Missing screenshot");
        }
        allTags.add(...this.tags);
        return allTags;
    }
    /**
     * Whether this file would match the specified filter prefix.
     */
    matchesFilterPrefix(filterPrefix) {
        // Always match empty string.
        if (filterPrefix === "") {
            return true;
        }
        // Check various fields.
        if (prefixMatchesAnyWord(this.name, filterPrefix)) {
            return true;
        }
        if (prefixMatches(this.filename, filterPrefix)) {
            return true;
        }
        if (prefixMatchesAnyWord(this.note, filterPrefix)) {
            return true;
        }
        if (prefixMatchesAnyWord(this.author, filterPrefix)) {
            return true;
        }
        return false;
    }
    /**
     * Whether the hash was computed with an outdated algorithm.
     */
    isOldHash() {
        return !this.hash.startsWith(HASH_PREFIX);
    }
    /**
     * Compare two files for sorting.
     */
    static compare(a, b) {
        // Primary sort by name.
        let cmp = a.name.localeCompare(b.name, undefined, {
            usage: "sort",
            sensitivity: "base",
            ignorePunctuation: true,
            numeric: true,
        });
        if (cmp !== 0) {
            return cmp;
        }
        // Secondary sort is filename.
        cmp = a.filename.localeCompare(b.filename, undefined, {
            usage: "sort",
            numeric: true,
        });
        if (cmp !== 0) {
            return cmp;
        }
        // Break ties with ID so the sort is stable.
        return a.id.localeCompare(b.id);
    }
}
/**
 * Builder to help construct File objects.
 */
class FileBuilder {
    constructor() {
        this.id = "";
        this.uid = "";
        this.name = "";
        this.filename = "";
        this.note = "";
        this.author = "";
        this.releaseYear = "";
        this.shared = false;
        this.tags = [];
        this.hash = "";
        this.screenshots = [];
        this.binary = new Uint8Array(0);
        this.addedAt = new Date();
        this.modifiedAt = new Date();
    }
    static fromDoc(doc) {
        var _a, _b, _c, _d, _e;
        const builder = new FileBuilder();
        builder.id = doc.id;
        // Assume data() is valid, either because it's a query or because we checked "exists".
        const data = doc.data();
        builder.uid = data.uid;
        builder.name = data.name;
        builder.filename = data.filename;
        builder.note = data.note;
        builder.author = (_a = data.author) !== null && _a !== void 0 ? _a : "";
        builder.releaseYear = (_b = data.releaseYear) !== null && _b !== void 0 ? _b : "";
        builder.shared = (_c = data.shared) !== null && _c !== void 0 ? _c : false;
        builder.tags = (_d = data.tags) !== null && _d !== void 0 ? _d : [];
        builder.hash = data.hash;
        builder.screenshots = (_e = data.screenshots) !== null && _e !== void 0 ? _e : [];
        builder.binary = data.binary.toUint8Array();
        builder.addedAt = data.addedAt.toDate();
        builder.modifiedAt = data.modifiedAt.toDate();
        return builder;
    }
    withId(id) {
        this.id = id;
        return this;
    }
    withUid(uid) {
        this.uid = uid;
        return this;
    }
    withName(name) {
        this.name = name;
        return this;
    }
    withFilename(filename) {
        this.filename = filename;
        return this;
    }
    withNote(note) {
        this.note = note;
        return this;
    }
    withAuthor(author) {
        this.author = author;
        return this;
    }
    withReleaseYear(releaseYear) {
        this.releaseYear = releaseYear;
        return this;
    }
    withShared(shared) {
        this.shared = shared;
        return this;
    }
    withTags(tags) {
        this.tags = tags;
        return this;
    }
    withScreenshots(screenshots) {
        this.screenshots = screenshots;
        return this;
    }
    withBinary(binary) {
        this.binary = binary;
        // We used to do the raw binary, but that doesn't catch some irrelevant changes, like differences
        // in CAS header or the Basic name. So decode the binary and see if we can zero out the differences.
        // This might create an unfortunate preference for setting the filename first.
        let trs80File = (0,trs80_base__WEBPACK_IMPORTED_MODULE_4__.decodeTrs80File)(binary, this.filename);
        // Pull the program out of the cassette.
        if (trs80File instanceof trs80_base__WEBPACK_IMPORTED_MODULE_4__.Cassette) {
            if (trs80File.files.length > 0) {
                trs80File = trs80File.files[0].file;
                binary = trs80File.binary;
            }
        }
        // Clear out the Basic name.
        if (trs80File instanceof trs80_base__WEBPACK_IMPORTED_MODULE_4__.BasicProgram) {
            binary = (0,trs80_base__WEBPACK_IMPORTED_MODULE_4__.setBasicName)(binary, "A");
        }
        // Prefix with version number.
        this.hash = HASH_PREFIX + (0,_Sha1__WEBPACK_IMPORTED_MODULE_2__.sha1)(binary);
        return this;
    }
    withModifiedAt(modifiedAt) {
        this.modifiedAt = modifiedAt;
        return this;
    }
    build() {
        return new File(this.id, this.uid, this.name, this.filename, this.note, this.author, this.releaseYear, this.shared, this.tags, this.hash, this.screenshots, this.binary, this.addedAt, this.modifiedAt);
    }
}


/***/ }),

/***/ "./src/FileInfoTab.ts":
/*!****************************!*\
  !*** ./src/FileInfoTab.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FileInfoTab": () => (/* binding */ FileInfoTab)
/* harmony export */ });
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var _Library__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Library */ "./src/Library.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var trs80_emulator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! trs80-emulator */ "./node_modules/trs80-emulator/dist/index.js");
/* harmony import */ var lodash_isEmpty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lodash/isEmpty */ "./node_modules/lodash/isEmpty.js");
/* harmony import */ var lodash_isEmpty__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash_isEmpty__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _TagSet__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TagSet */ "./src/TagSet.ts");







const SCREENSHOT_ATTR = "data-screenshot";
/**
 * Handles the file info tab in the file panel.
 */
class FileInfoTab extends _PageTab__WEBPACK_IMPORTED_MODULE_0__.PageTab {
    constructor(filePanel, trs80File) {
        var _a;
        super("File Info");
        this.tags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
        this.allTags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
        this.filePanel = filePanel;
        this.trs80File = trs80File;
        this.editable = ((_a = filePanel.context.user) === null || _a === void 0 ? void 0 : _a.uid) === filePanel.file.uid;
        // Make union of all tags in all files. Do this here once so that if the user deletes a tag
        // that only this file has, it'll stay in this set so it can be added again easily.
        for (const file of this.filePanel.context.library.getAllFiles()) {
            this.allTags.add(...file.tags);
        }
        // We have buttons for adding/removing the trash tag.
        this.allTags.remove(_Utils__WEBPACK_IMPORTED_MODULE_1__.TRASH_TAG);
        // Make our own copy of tags that will reflect what's in the UI.
        this.tags.add(...filePanel.file.tags);
        this.element.classList.add("file-info-tab", this.editable ? "file-info-tab-editable" : "file-info-tab-readonly");
        // Container of form.
        const formContainer = document.createElement("div");
        formContainer.classList.add("file-panel-form-container");
        this.element.append(formContainer);
        // Form for editing file info.
        const form = document.createElement("div");
        form.classList.add("file-panel-form");
        formContainer.append(form);
        const makeInputBox = (label, cssClass, enabled) => {
            const labelElement = document.createElement("label");
            if (cssClass !== undefined) {
                labelElement.classList.add(cssClass);
            }
            labelElement.innerText = label;
            form.append(labelElement);
            const inputElement = document.createElement("input");
            inputElement.disabled = !enabled || !this.editable;
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
        this.noteInput.disabled = !this.editable;
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
            this.sharedInput.disabled = !this.editable;
            const offIcon = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeIcon)("toggle_off");
            offIcon.classList.add("off-state");
            const onIcon = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeIcon)("toggle_on");
            onIcon.classList.add("on-state");
            labelElement.append(this.sharedInput, offIcon, onIcon);
        }
        this.screenshotsDiv = document.createElement("div");
        this.screenshotsDiv.classList.add("screenshots");
        form.append(this.screenshotsDiv);
        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        this.element.append(actionBar);
        const exportButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTextButton)("Export", "get_app", "export-button", () => {
            // Download binary.
            const a = document.createElement("a");
            const contents = this.filePanel.file.binary;
            const blob = new Blob([contents], { type: "application/octet-stream" });
            a.href = window.URL.createObjectURL(blob);
            a.download = this.filePanel.file.filename;
            a.click();
        });
        actionBar.append(exportButton);
        const runButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTextButton)("Run", "play_arrow", "play-button", () => {
            this.filePanel.context.runProgram(this.filePanel.file, this.trs80File);
            this.filePanel.context.panelManager.close();
        });
        actionBar.append(runButton);
        this.deleteButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTextButton)("Delete File", "delete", "delete-button", () => {
            const oldFile = this.filePanel.file;
            const tags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
            tags.add(...oldFile.tags, _Utils__WEBPACK_IMPORTED_MODULE_1__.TRASH_TAG);
            const newFile = oldFile.builder()
                .withTags(tags.asArray())
                .withModifiedAt(new Date())
                .build();
            this.filePanel.context.db.updateFile(oldFile, newFile)
                .then(() => {
                this.filePanel.context.library.modifyFile(newFile);
                this.filePanel.context.panelManager.popPanel();
            })
                .catch(error => {
                // TODO.
                console.error(error);
            });
        });
        this.undeleteButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTextButton)("Undelete File", "restore_from_trash", "delete-button", () => {
            const oldFile = this.filePanel.file;
            const tags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
            tags.add(...oldFile.tags);
            tags.remove(_Utils__WEBPACK_IMPORTED_MODULE_1__.TRASH_TAG);
            const newFile = oldFile.builder()
                .withTags(tags.asArray())
                .withModifiedAt(new Date())
                .build();
            this.filePanel.context.db.updateFile(oldFile, newFile)
                .then(() => {
                this.filePanel.context.library.modifyFile(newFile);
            })
                .catch(error => {
                // TODO.
                console.error(error);
            });
        });
        this.revertButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTextButton)("Revert", "undo", "revert-button", undefined);
        this.saveButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTextButton)("Save", ["save", "cached", "check"], "save-button", undefined);
        this.saveButton.title = "Ctrl-Enter to save and close";
        if (this.editable) {
            actionBar.append(this.deleteButton, this.undeleteButton, this.revertButton, this.saveButton);
        }
        for (const input of [this.nameInput, this.filenameInput, this.noteInput, this.authorInput, this.releaseYearInput]) {
            input.addEventListener("input", () => this.updateButtonStatus());
        }
        this.sharedInput.addEventListener("change", () => this.updateButtonStatus());
        this.nameInput.addEventListener("input", () => this.filePanel.setHeaderText(this.fileFromUi().name));
        this.revertButton.addEventListener("click", () => this.updateUi());
        this.saveButton.addEventListener("click", () => this.save());
        this.cancelLibrarySubscription = this.filePanel.context.library.onEvent.subscribe(event => {
            if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_2__.LibraryModifyEvent && event.newFile.id === this.filePanel.file.id) {
                // Make sure we don't clobber any user-entered data in the input fields.
                const updateData = this.filePanel.file.getUpdateDataComparedTo(event.newFile);
                this.filePanel.file = event.newFile;
                this.updateUi(updateData);
            }
            if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_2__.LibraryRemoveEvent && event.oldFile.id === this.filePanel.file.id) {
                // We've been deleted.
                this.filePanel.context.panelManager.popPanel();
            }
        });
        this.updateUi();
    }
    onKeyDown(e) {
        // Ctrl-Enter to save and close the panel.
        if (e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.key === "Enter") {
            this.saveAndClose();
            return true;
        }
        return super.onKeyDown(e);
    }
    onDestroy() {
        this.cancelLibrarySubscription();
        super.onDestroy();
    }
    /**
     * Save if necessary, then close the panel.
     */
    saveAndClose() {
        const isSame = lodash_isEmpty__WEBPACK_IMPORTED_MODULE_5___default()(this.fileFromUi().getUpdateDataComparedTo(this.filePanel.file));
        if (isSame) {
            this.filePanel.context.panelManager.popPanel();
        }
        else {
            this.save(() => {
                this.filePanel.context.panelManager.popPanel();
            });
        }
    }
    /**
     * Save the current changes to the file, then optionally call the callback.
     */
    save(callback) {
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
            if (callback) {
                callback();
            }
        })
            .catch(error => {
            this.saveButton.classList.remove("saving");
            // TODO show error.
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
            this.updateUi();
        });
    }
    /**
     * Update UI after a change to file.
     *
     * @param updateData if specified, only fields defined in the object will be updated. (The _values_ of
     * those fields are ignored -- only their presence is important because that indicates that the data
     * is fresh in the file object.) The purpose is to avoid clobbering user-entered data in the various
     * input fields when the file object changes elsewhere in unrelated ways, such as new screenshots.
     */
    updateUi(updateData) {
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
        this.sizeInput.value = (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__.withCommas)(file.binary.length) + " byte" + (file.binary.length === 1 ? "" : "s");
        this.addedAtInput.value = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.formatDate)(file.addedAt);
        this.modifiedAtInput.value = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.formatDate)(file.modifiedAt);
        if (updateData === undefined || updateData.hasOwnProperty("tags")) {
            this.tags.clear();
            this.tags.add(...file.tags);
            this.updateTagsInput();
        }
        this.sharedInput.checked = file.shared;
        if (updateData === undefined || updateData.hasOwnProperty("screenshots")) {
            this.populateScreenshots();
        }
        this.updateButtonStatus();
    }
    /**
     * Update the UI for showing and editing the tags on this file.
     *
     * @param newTagFocus whether to put the input focus on the new tag input field.
     */
    updateTagsInput(newTagFocus) {
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__.clearElement)(this.tagsInput);
        const tagListElement = document.createElement("div");
        tagListElement.classList.add("tag-list");
        this.tagsInput.append(tagListElement);
        let count = 0;
        for (const tag of this.allTags.asArray()) {
            if (this.tags.has(tag) || this.editable) {
                const tagOptions = {
                    tag: tag,
                };
                // Add clear/add actions if editable.
                if (this.editable) {
                    if (this.tags.has(tag)) {
                        tagOptions.iconName = "clear";
                        tagOptions.clickCallback = () => {
                            this.tags.remove(tag);
                            this.updateTagsInput();
                            this.updateButtonStatus();
                        };
                    }
                    else {
                        tagOptions.faint = true;
                        tagOptions.iconName = "add";
                        tagOptions.clickCallback = () => {
                            this.tags.add(tag);
                            this.updateTagsInput();
                            this.updateButtonStatus();
                        };
                    }
                }
                tagListElement.append((0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeTagCapsule)(tagOptions));
                count += 1;
            }
        }
        // Form to add a new tag.
        if (this.editable) {
            const newTagForm = document.createElement("form");
            newTagForm.classList.add("new-tag-form");
            newTagForm.addEventListener("submit", event => {
                const newTag = newTagInput.value.trim();
                if (newTag !== "" && newTag !== _Utils__WEBPACK_IMPORTED_MODULE_1__.TRASH_TAG) {
                    this.tags.add(newTag);
                    this.allTags.add(newTag);
                    this.updateTagsInput(true);
                    this.updateButtonStatus();
                }
                event.preventDefault();
                event.stopPropagation();
            });
            tagListElement.append(newTagForm);
            const newTagInput = document.createElement("input");
            newTagInput.placeholder = "New tag";
            if (newTagFocus) {
                setTimeout(() => newTagInput.focus(), 0);
            }
            newTagForm.append(newTagInput);
        }
        else if (count === 0) {
            const instructions = document.createElement("div");
            instructions.classList.add("tags-instructions");
            instructions.innerText = "There are to tags for this file.";
            tagListElement.append(instructions);
        }
    }
    /**
     * Fill the screenshots UI with those from the file.
     */
    populateScreenshots() {
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__.clearElement)(this.screenshotsDiv);
        const labelElement = document.createElement("label");
        labelElement.innerText = "Screenshots";
        this.screenshotsDiv.append(labelElement);
        if (this.filePanel.file.screenshots.length === 0) {
            const instructions = document.createElement("div");
            instructions.classList.add("screenshots-instructions");
            if (this.editable) {
                instructions.innerText = "To take a screenshot, run the program and click the camera icon.";
            }
            else {
                instructions.innerText = "There are no screenshots for this file.";
            }
            this.screenshotsDiv.append(instructions);
        }
        for (const screenshot of this.filePanel.file.screenshots) {
            const screenshotDiv = document.createElement("div");
            screenshotDiv.setAttribute(SCREENSHOT_ATTR, screenshot);
            screenshotDiv.classList.add("screenshot");
            if (this.editable) {
                const deleteButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_1__.makeIcon)("delete"), "Delete screenshot", () => {
                    screenshotDiv.remove();
                    this.updateButtonStatus();
                });
                screenshotDiv.append(deleteButton);
            }
            this.screenshotsDiv.append(screenshotDiv);
            // Defer this so that if we have a lot of screenshots it doesn't hang the browser when
            // creating this panel.
            (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.defer)(() => {
                const screen = new trs80_emulator__WEBPACK_IMPORTED_MODULE_4__.CanvasScreen();
                screen.displayScreenshot(screenshot);
                screen.asImageAsync().then(image => screenshotDiv.append(image));
            });
        }
    }
    /**
     * Update the save/restore buttons' enabled status based on input fields.
     */
    updateButtonStatus() {
        const file = this.filePanel.file;
        const newFile = this.fileFromUi();
        const isSame = lodash_isEmpty__WEBPACK_IMPORTED_MODULE_5___default()(newFile.getUpdateDataComparedTo(file));
        const isValid = newFile.name.length > 0 &&
            newFile.filename.length > 0;
        this.revertButton.disabled = isSame;
        this.saveButton.disabled = isSame || !isValid;
        this.deleteButton.classList.toggle("hidden", file.isDeleted);
        this.undeleteButton.classList.toggle("hidden", !file.isDeleted);
    }
    /**
     * Make a new File object based on the user's inputs.
     */
    fileFromUi() {
        // Collect screenshots from UI.
        const screenshots = [];
        for (const screenshotDiv of this.screenshotsDiv.children) {
            // Skip label and instructions.
            let screenshot = screenshotDiv.getAttribute(SCREENSHOT_ATTR);
            if (screenshot !== null) {
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
            .withTags(this.tags.asArray())
            .withScreenshots(screenshots)
            .build();
    }
}


/***/ }),

/***/ "./src/FilePanel.ts":
/*!**************************!*\
  !*** ./src/FilePanel.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FilePanel": () => (/* binding */ FilePanel)
/* harmony export */ });
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _HexdumpTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HexdumpTab */ "./src/HexdumpTab.ts");
/* harmony import */ var _FileInfoTab__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FileInfoTab */ "./src/FileInfoTab.ts");
/* harmony import */ var _TrsdosTab__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TrsdosTab */ "./src/TrsdosTab.ts");
/* harmony import */ var _BasicTab__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./BasicTab */ "./src/BasicTab.ts");
/* harmony import */ var _CmdTab__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CmdTab */ "./src/CmdTab.ts");
/* harmony import */ var _DisassemblyTab__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./DisassemblyTab */ "./src/DisassemblyTab.ts");
/* harmony import */ var _SystemProgramTab__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./SystemProgramTab */ "./src/SystemProgramTab.ts");
/* harmony import */ var _TabbedPanel__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./TabbedPanel */ "./src/TabbedPanel.ts");
/* harmony import */ var _DuplicatesTab__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DuplicatesTab */ "./src/DuplicatesTab.ts");










/**
 * Head of linked list of displayed file panels.
 */
let gFilePanelHead = undefined;
/**
 * Panel to explore a file.
 */
class FilePanel extends _TabbedPanel__WEBPACK_IMPORTED_MODULE_8__.TabbedPanel {
    constructor(context, file) {
        super(context, file.name, "file-panel", true);
        this.file = file;
        this.nextFilePanel = gFilePanelHead;
        gFilePanelHead = this;
        const trs80File = (0,trs80_base__WEBPACK_IMPORTED_MODULE_0__.decodeTrs80File)(file.binary, file.filename);
        this.pageTabs.addTab(new _FileInfoTab__WEBPACK_IMPORTED_MODULE_2__.FileInfoTab(this, trs80File));
        this.pageTabs.addTab(new _HexdumpTab__WEBPACK_IMPORTED_MODULE_1__.HexdumpTab(this.context, trs80File));
        // Refer to the file in the cassette if possible.
        let effectiveFile = trs80File;
        if (effectiveFile instanceof trs80_base__WEBPACK_IMPORTED_MODULE_0__.Cassette && effectiveFile.files.length === 1) {
            // Here we could open a tab for each file on the cassette.
            effectiveFile = effectiveFile.files[0].file;
        }
        if (trs80File instanceof trs80_base__WEBPACK_IMPORTED_MODULE_0__.FloppyDisk) {
            const trsdos = (0,trs80_base__WEBPACK_IMPORTED_MODULE_0__.decodeTrsdos)(trs80File);
            if (trsdos !== undefined) {
                this.pageTabs.addTab(new _TrsdosTab__WEBPACK_IMPORTED_MODULE_3__.TrsdosTab(this, trsdos));
            }
        }
        if (effectiveFile instanceof trs80_base__WEBPACK_IMPORTED_MODULE_0__.BasicProgram) {
            this.pageTabs.addTab(new _BasicTab__WEBPACK_IMPORTED_MODULE_4__.BasicTab(effectiveFile));
        }
        if (effectiveFile instanceof trs80_base__WEBPACK_IMPORTED_MODULE_0__.CmdProgram) {
            this.pageTabs.addTab(new _CmdTab__WEBPACK_IMPORTED_MODULE_5__.CmdTab(effectiveFile));
            this.pageTabs.addTab(new _DisassemblyTab__WEBPACK_IMPORTED_MODULE_6__.DisassemblyTab(effectiveFile));
        }
        if (effectiveFile instanceof trs80_base__WEBPACK_IMPORTED_MODULE_0__.SystemProgram) {
            this.pageTabs.addTab(new _SystemProgramTab__WEBPACK_IMPORTED_MODULE_7__.SystemProgramTab(effectiveFile));
            this.pageTabs.addTab(new _DisassemblyTab__WEBPACK_IMPORTED_MODULE_6__.DisassemblyTab(effectiveFile));
        }
        if (context.library.isDuplicate(file)) {
            this.pageTabs.addTab(new _DuplicatesTab__WEBPACK_IMPORTED_MODULE_9__.DuplicatesTab(this));
        }
    }
    onPanelDestroy() {
        gFilePanelHead = this.nextFilePanel;
        super.onPanelDestroy();
    }
    setHeaderText(header) {
        if (header === "") {
            // If we completely blank out the span, the H1 shrinks, so keep it constant height with a space.
            this.headerTextNode.innerHTML = "&nbsp;";
        }
        else {
            this.headerTextNode.innerText = header;
        }
    }
}


/***/ }),

/***/ "./src/HexdumpGenerator.ts":
/*!*********************************!*\
  !*** ./src/HexdumpGenerator.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HexdumpGenerator": () => (/* binding */ HexdumpGenerator)
/* harmony export */ });
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(z80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var trs80_base_dist_ProgramAnnotation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! trs80-base/dist/ProgramAnnotation */ "./node_modules/trs80-base/dist/ProgramAnnotation.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");



const STRIDE = 16;
/**
 * Add a span with the given text and CSS classes to the specified line.
 */
function newSpan(line, text, ...cssClass) {
    const e = document.createElement("span");
    e.classList.add(...cssClass);
    e.innerText = text;
    line.append(e);
    return e;
}
/**
 * Compare two parts of an array for equality.
 */
function segmentsEqual(binary, start1, start2, length) {
    while (length-- > 0) {
        if (binary[start1++] !== binary[start2++]) {
            return false;
        }
    }
    return true;
}
/**
 * Count consecutive bytes that are around "addr".
 */
function countConsecutive(binary, addr) {
    const value = binary[addr];
    let startAddr = addr;
    while (startAddr > 0 && binary[startAddr - 1] === value) {
        startAddr--;
    }
    while (addr < binary.length - 1 && binary[addr + 1] === value) {
        addr++;
    }
    return addr - startAddr + 1;
}
/**
 * Whether this segment is made up of the same value.
 */
function allSameByte(binary, addr, length) {
    for (let i = 1; i < length; i++) {
        if (binary[addr + i] !== binary[addr]) {
            return false;
        }
    }
    return true;
}
/**
 * Generates a hexdump for the given binary.
 */
class HexdumpGenerator {
    constructor(binary, collapse, annotations) {
        this.binary = binary;
        this.collapse = collapse;
        this.annotations = annotations;
    }
    /**
     * Generate all HTML elements for this binary.
     */
    *generate() {
        const binary = this.binary;
        const [addrDigits, addrSpaces] = this.computeAddressSize();
        // Sort in case they were generated out of order.
        this.annotations.sort((a, b) => a.begin - b.begin);
        let lastAnnotation = undefined;
        for (const annotation of this.annotations) {
            if (lastAnnotation !== undefined && lastAnnotation.end < annotation.begin) {
                yield* this.generateAnnotation(new trs80_base_dist_ProgramAnnotation__WEBPACK_IMPORTED_MODULE_1__.ProgramAnnotation("", lastAnnotation.end, annotation.begin));
            }
            // Make sure there are no overlapping annotations.
            if (lastAnnotation === undefined || lastAnnotation.end <= annotation.begin) {
                yield* this.generateAnnotation(annotation);
            }
            lastAnnotation = annotation;
        }
        const lastAnnotationEnd = lastAnnotation !== undefined ? lastAnnotation.end : 0;
        if (lastAnnotationEnd < binary.length) {
            yield* this.generateAnnotation(new trs80_base_dist_ProgramAnnotation__WEBPACK_IMPORTED_MODULE_1__.ProgramAnnotation("", lastAnnotationEnd, binary.length));
        }
        // Final address to show where file ends.
        const finalLine = document.createElement("div");
        newSpan(finalLine, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHex)(binary.length, addrDigits), "address");
        yield finalLine;
    }
    /**
     * Generate all the lines for an annotation.
     * @param annotation the annotation to generate.
     */
    *generateAnnotation(annotation) {
        var _a;
        const binary = this.binary;
        const [addrDigits, addrSpaces] = this.computeAddressSize();
        const beginAddr = Math.floor(annotation.begin / STRIDE) * STRIDE;
        const endAddr = Math.min(Math.ceil(annotation.end / STRIDE) * STRIDE, binary.length);
        let lastAddr = undefined;
        for (let addr = beginAddr; addr < endAddr; addr += STRIDE) {
            if (this.collapse && lastAddr !== undefined &&
                binary.length - addr >= STRIDE && segmentsEqual(binary, lastAddr, addr, STRIDE)) {
                // Collapsed section. See if we want to print the text for it this time.
                if (addr === lastAddr + STRIDE) {
                    const line = document.createElement("div");
                    if (allSameByte(binary, addr, STRIDE)) {
                        // Lots of the same byte repeated. Say many there are.
                        const count = countConsecutive(binary, addr);
                        newSpan(line, addrSpaces + "   ... ", "address");
                        newSpan(line, count.toString(), "ascii");
                        newSpan(line, " (", "address");
                        newSpan(line, "0x" + count.toString(16).toUpperCase(), "ascii");
                        newSpan(line, ") consecutive bytes of ", "address");
                        newSpan(line, "0x" + (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexByte)(binary[addr]), "hex");
                        newSpan(line, " ...", "address");
                    }
                    else {
                        // A repeating pattern, but not all the same byte. Say how many times repeated.
                        let count = 1;
                        for (let otherAddr = addr + STRIDE; otherAddr <= binary.length - STRIDE; otherAddr += STRIDE) {
                            if (segmentsEqual(binary, lastAddr, otherAddr, STRIDE)) {
                                count += 1;
                            }
                            else {
                                break;
                            }
                        }
                        newSpan(line, addrSpaces + "  ... ", "address");
                        newSpan(line, count.toString(), "ascii");
                        const plural = count === 1 ? "" : "s";
                        newSpan(line, ` repetition${plural} of previous row ...`, "address");
                    }
                    // Draw vertical ellipsis.
                    if (annotation.text !== "" && addr !== beginAddr) {
                        // textContent doesn't trigger a reflow. Don't use innerText, which does.
                        const lineText = (_a = line.textContent) !== null && _a !== void 0 ? _a : "";
                        const width = addrDigits + STRIDE * 4 + 9;
                        const label = String.fromCodePoint(0x22EE).padStart(width - lineText.length, " ");
                        newSpan(line, label, "annotation");
                    }
                    yield line;
                }
            }
            else {
                // Non-collapsed row.
                lastAddr = addr;
                let label = "";
                if (annotation.text !== "") {
                    if (addr === beginAddr) {
                        label = annotation.text;
                    }
                    else {
                        // Vertical ellipsis.
                        label = "  " + String.fromCodePoint(0x22EE);
                    }
                }
                yield this.generateRow(addr, addrDigits, annotation.begin, annotation.end, label);
            }
        }
    }
    /**
     * Generates a single row of hex and ASCII.
     * @param addr address for the line.
     * @param addrDigits the number of digits in the address.
     * @param beginAddr the first address of this annotation (inclusive).
     * @param endAddr this last address of this annotation (exclusive).
     * @param label the label to show on this row.
     * @return the created row.
     */
    generateRow(addr, addrDigits, beginAddr, endAddr, label) {
        const binary = this.binary;
        const line = document.createElement("div");
        const cssClass = ["address"];
        if (addr < beginAddr) {
            cssClass.push("outside-annotation");
        }
        newSpan(line, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHex)(addr, addrDigits) + "  ", ...cssClass);
        // Utility function for adding text to a line, minimizing the number of needless spans.
        let currentCssClass = undefined;
        let e = undefined;
        const addText = (text, ...cssClass) => {
            if (e === undefined || currentCssClass === undefined || !(0,_Utils__WEBPACK_IMPORTED_MODULE_2__.isSameStringArray)(cssClass, currentCssClass)) {
                e = newSpan(line, text, ...cssClass);
                currentCssClass = cssClass.slice();
            }
            else {
                e.innerText += text;
            }
        };
        // Hex.
        let subAddr;
        for (subAddr = addr; subAddr < binary.length && subAddr < addr + STRIDE; subAddr++) {
            const cssClass = ["hex"];
            if (subAddr < beginAddr || subAddr >= endAddr) {
                cssClass.push("outside-annotation");
            }
            addText((0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexByte)(binary[subAddr]) + " ", ...cssClass);
        }
        addText("".padStart((addr + STRIDE - subAddr) * 3 + 2, " "), "hex");
        // ASCII.
        for (subAddr = addr; subAddr < binary.length && subAddr < addr + STRIDE; subAddr++) {
            const c = binary[subAddr];
            const cssClass = ["hex"];
            let char;
            if (c >= 32 && c < 127) {
                cssClass.push("ascii");
                char = String.fromCharCode(c);
            }
            else {
                cssClass.push("ascii-unprintable");
                char = ".";
            }
            if (subAddr < beginAddr || subAddr >= endAddr) {
                cssClass.push("outside-annotation");
            }
            addText(char, ...cssClass);
        }
        if (label !== "") {
            addText("".padStart(addr + STRIDE - subAddr + 2, " ") + label, "annotation");
        }
        return line;
    }
    /**
     * Computes the number of hex digits in the displayed address, and the number of spaces this represents.
     */
    computeAddressSize() {
        // Figure out the number of digits in the address: 4 or 6.
        const addrDigits = this.binary.length < (2 << 16) ? 4 : 6;
        const addrSpaces = "".padStart(addrDigits, " ");
        return [addrDigits, addrSpaces];
    }
}


/***/ }),

/***/ "./src/HexdumpTab.ts":
/*!***************************!*\
  !*** ./src/HexdumpTab.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HexdumpTab": () => (/* binding */ HexdumpTab)
/* harmony export */ });
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var _HexdumpGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HexdumpGenerator */ "./src/HexdumpGenerator.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__);



/**
 * Tab for displaying the hex and ASCII of the binary.
 */
class HexdumpTab extends _PageTab__WEBPACK_IMPORTED_MODULE_0__.PageTab {
    constructor(context, trs80File) {
        super("Hexdump");
        this.collapse = true;
        this.annotate = true;
        this.lineGenerator = undefined;
        this.lastLine = undefined;
        this.binary = trs80File.binary;
        this.trs80File = trs80File;
        this.element.classList.add("hexdump-tab");
        const outer = document.createElement("div");
        outer.classList.add("hexdump-outer");
        this.element.append(outer);
        this.hexdumpElement = document.createElement("div");
        this.hexdumpElement.classList.add("hexdump");
        this.hexdumpElement.addEventListener("scroll", () => {
            this.checkLoadMore();
        });
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
        // Hide the hexdump when the panel is hidden because it slows down things
        // like changing themes (the animations aren't smooth).
        let hideHandle = undefined;
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
            }
            else {
                hideHandle = window.setTimeout(() => this.hexdumpElement.classList.add("hidden"), 400);
            }
        });
        this.windowResizeListener = () => {
            this.checkLoadMore();
        };
    }
    onShow() {
        super.onShow();
        window.addEventListener("resize", this.windowResizeListener);
        // Wait for layout or our rectangle testing fails.
        setTimeout(() => this.checkLoadMore(), 10);
    }
    onFirstShow() {
        this.generateHexdump();
    }
    onHide() {
        window.removeEventListener("resize", this.windowResizeListener);
        super.onHide();
    }
    /**
     * Regenerate the HTML for the hexdump.
     */
    generateHexdump() {
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__.clearElement)(this.hexdumpElement);
        this.lastLine = undefined;
        const hexdumpGenerator = new _HexdumpGenerator__WEBPACK_IMPORTED_MODULE_1__.HexdumpGenerator(this.binary, this.collapse, this.annotate ? this.trs80File.annotations : []);
        this.lineGenerator = hexdumpGenerator.generate();
        this.checkLoadMore();
    }
    /**
     * See if we should generate more lines, and if so, do so.
     */
    checkLoadMore() {
        while (this.lineGenerator !== undefined && this.shouldLoadMore()) {
            const lineInfo = this.lineGenerator.next();
            if (lineInfo.done) {
                // All done.
                this.lineGenerator = undefined;
            }
            else {
                // Generate one more line.
                this.lastLine = lineInfo.value;
                this.hexdumpElement.append(this.lastLine);
            }
        }
    }
    /**
     * Whether we're close enough to the bottom of the text that we should generate more.
     */
    shouldLoadMore() {
        if (this.lastLine === undefined) {
            // We've not loaded anything yet.
            return true;
        }
        else {
            // See if we're close to running out of text.
            const containerRect = this.hexdumpElement.getBoundingClientRect();
            const lineRect = this.lastLine.getBoundingClientRect();
            return lineRect.top < containerRect.bottom + 1000;
        }
    }
}


/***/ }),

/***/ "./src/IFilePanel.ts":
/*!***************************!*\
  !*** ./src/IFilePanel.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "anyFilePanel": () => (/* binding */ anyFilePanel)
/* harmony export */ });
/**
 * Whether any file panel (starting with given and going backward) satisfies the given predicate.
 */
function anyFilePanel(panel, predicate) {
    return panel !== undefined && (predicate(panel) || anyFilePanel(panel.nextFilePanel, predicate));
}


/***/ }),

/***/ "./src/Library.ts":
/*!************************!*\
  !*** ./src/Library.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LibraryEvent": () => (/* binding */ LibraryEvent),
/* harmony export */   "LibraryAddEvent": () => (/* binding */ LibraryAddEvent),
/* harmony export */   "LibraryModifyEvent": () => (/* binding */ LibraryModifyEvent),
/* harmony export */   "LibraryRemoveEvent": () => (/* binding */ LibraryRemoveEvent),
/* harmony export */   "Library": () => (/* binding */ Library)
/* harmony export */ });
/* harmony import */ var strongly_typed_events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! strongly-typed-events */ "./node_modules/strongly-typed-events/dist/index.js");

/**
 * Base class for library event classes.
 */
class LibraryEvent {
}
/**
 * Event for adding a file to the library.
 */
class LibraryAddEvent extends LibraryEvent {
    constructor(newFile) {
        super();
        this.newFile = newFile;
    }
}
/**
 * Event for modifying a file in the library.
 */
class LibraryModifyEvent extends LibraryEvent {
    constructor(oldFile, newFile) {
        super();
        this.oldFile = oldFile;
        this.newFile = newFile;
    }
}
/**
 * Event for removing a file from the library.
 */
class LibraryRemoveEvent extends LibraryEvent {
    constructor(oldFile) {
        super();
        this.oldFile = oldFile;
    }
}
/**
 * Keep track of all the files in the user's library. This should be a mirror of the contents
 * of the database in the cloud.
 */
class Library {
    constructor() {
        // Map from ID to file.
        this.files = new Map();
        // Fires after the map has been updated.
        this.onEvent = new strongly_typed_events__WEBPACK_IMPORTED_MODULE_0__.SimpleEventDispatcher();
        this.inSync = false;
        // Whether the library is in sync with the cloud database. This starts out false
        // and emits a "true" once the first fetch has completed.
        this.onInSync = new strongly_typed_events__WEBPACK_IMPORTED_MODULE_0__.SimpleEventDispatcher();
        // Map from hash string to count of files with that hash, to find duplicates.
        this.hashCount = new Map();
    }
    /**
     * Get a file by its ID, or undefined it not in the library.
     */
    getFile(id) {
        return this.files.get(id);
    }
    /**
     * Return all the files we currently know about.
     */
    getAllFiles() {
        return Array.from(this.files.values());
    }
    /**
     * Specify whether the in-memory library is now in sync with the cloud database.
     */
    setInSync(inSync) {
        this.inSync = inSync;
        this.onInSync.dispatch(inSync);
    }
    /**
     * Add a file to the library.
     */
    addFile(file) {
        if (this.files.has(file.id)) {
            console.error("Library.add(): Library already has file with ID " + file.id);
            this.modifyFile(file);
        }
        else {
            this.files.set(file.id, file);
            this.incrementHash(file.hash);
            this.onEvent.dispatch(new LibraryAddEvent(file));
        }
    }
    /**
     * Modify a file already in the library.
     */
    modifyFile(file) {
        const oldFile = this.files.get(file.id);
        if (oldFile === undefined) {
            console.error("Library.modify(): Library does not have file with ID " + file.id);
        }
        else {
            this.decrementHash(oldFile.hash);
            this.files.set(file.id, file);
            this.incrementHash(file.hash);
            this.onEvent.dispatch(new LibraryModifyEvent(oldFile, file));
        }
    }
    /**
     * Remove a file from the library.
     */
    removeFile(file) {
        const oldFile = this.files.get(file.id);
        if (oldFile === undefined) {
            console.error("Library.remove(): Library does not have file with ID " + file.id);
        }
        else {
            // Here we assume that file and oldFile are the same. We could check, or we could just
            // have the caller pass in a file ID.
            this.files.delete(file.id);
            this.decrementHash(oldFile.hash);
            this.onEvent.dispatch(new LibraryRemoveEvent(oldFile));
        }
    }
    /**
     * Remove all files from the library. One event will be triggered per file.
     */
    removeAll() {
        // Make a separate list first since we'll be modifying the map as we go.
        const files = [];
        for (const file of this.files.values()) {
            files.push(file);
        }
        // Then delete each.
        for (const file of files) {
            this.removeFile(file);
        }
    }
    /**
     * Whether this file has a duplicate file (hash) in the library.
     */
    isDuplicate(file) {
        var _a;
        return ((_a = this.hashCount.get(file.hash)) !== null && _a !== void 0 ? _a : 0) > 1;
    }
    /**
     * Increment the count for the given hash.
     */
    incrementHash(hash) {
        var _a;
        this.hashCount.set(hash, ((_a = this.hashCount.get(hash)) !== null && _a !== void 0 ? _a : 0) + 1);
    }
    /**
     * Decrement the count for the given hash.
     */
    decrementHash(hash) {
        var _a;
        let count = (_a = this.hashCount.get(hash)) !== null && _a !== void 0 ? _a : 0;
        if (count < 1) {
            // Coding error.
            throw new Error("hash count for " + hash + " is " + count);
        }
        this.hashCount.set(hash, count - 1);
    }
}


/***/ }),

/***/ "./src/LibraryPanel.ts":
/*!*****************************!*\
  !*** ./src/LibraryPanel.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LibraryPanel": () => (/* binding */ LibraryPanel)
/* harmony export */ });
/* harmony import */ var _YourFilesTab__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./YourFilesTab */ "./src/YourFilesTab.ts");
/* harmony import */ var _RetroStoreTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./RetroStoreTab */ "./src/RetroStoreTab.ts");
/* harmony import */ var _TabbedPanel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TabbedPanel */ "./src/TabbedPanel.ts");



/**
 * Panel showing the library of user's files.
 */
class LibraryPanel extends _TabbedPanel__WEBPACK_IMPORTED_MODULE_2__.TabbedPanel {
    constructor(context) {
        super(context, "Library", "library-panel", false);
        this.pageTabs.addTab(new _YourFilesTab__WEBPACK_IMPORTED_MODULE_0__.YourFilesTab(context, this.pageTabs));
        this.pageTabs.addTab(new _RetroStoreTab__WEBPACK_IMPORTED_MODULE_1__.RetroStoreTab(context));
    }
}


/***/ }),

/***/ "./src/Main.ts":
/*!*********************!*\
  !*** ./src/Main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "main": () => (/* binding */ main)
/* harmony export */ });
/* harmony import */ var trs80_emulator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! trs80-emulator */ "./node_modules/trs80-emulator/dist/index.js");
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/app */ "./node_modules/firebase/app/dist/index.esm.js");
/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/auth */ "./node_modules/firebase/auth/dist/index.esm.js");
/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! firebase/firestore */ "./node_modules/firebase/firestore/dist/index.esm.js");
/* harmony import */ var firebase_analytics__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! firebase/analytics */ "./node_modules/firebase/analytics/dist/index.esm.js");
/* harmony import */ var firebaseui__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! firebaseui */ "./node_modules/firebaseui/dist/esm.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var _PanelManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./PanelManager */ "./src/PanelManager.ts");
/* harmony import */ var _LibraryPanel__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./LibraryPanel */ "./src/LibraryPanel.ts");
/* harmony import */ var _Context__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Context */ "./src/Context.ts");
/* harmony import */ var _Library__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Library */ "./src/Library.ts");
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./File */ "./src/File.ts");
/* harmony import */ var _DialogBox__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./DialogBox */ "./src/DialogBox.ts");
/* harmony import */ var _User__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./User */ "./src/User.ts");
/* harmony import */ var _Database__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Database */ "./src/Database.ts");
/* harmony import */ var trs80_emulator_dist_Editor__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! trs80-emulator/dist/Editor */ "./node_modules/trs80-emulator/dist/Editor.js");


// These imports load individual services into the firebase namespace.















class EmptyCassette extends trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.CassettePlayer {
}
function createNavbar(openLibrary, signIn, signOut) {
    const body = document.querySelector("body");
    const navbar = document.createElement("div");
    navbar.classList.add("navbar");
    const title = document.createElement("a");
    title.classList.add("home-button");
    title.textContent = "My TRS-80";
    title.href = "/";
    navbar.append(title);
    const libraryButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_6__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_6__.makeIcon)("folder_open"), "Open library (Ctrl-L)", openLibrary);
    libraryButton.classList.add("library-button");
    navbar.append(libraryButton);
    const themeButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_6__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_6__.makeIcon)("brightness_medium"), "Toggle theme", () => {
        body.classList.toggle("light-mode");
        body.classList.toggle("dark-mode");
    });
    themeButton.classList.add("theme-button");
    navbar.append(themeButton);
    const signInButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_6__.makeTextButton)("Sign In", "person", "sign-in-button", signIn);
    const signOutButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_6__.makeTextButton)("Sign Out", "person", "sign-out-button", signOut);
    navbar.append(signInButton, signOutButton);
    return navbar;
}
function main() {
    var _a, _b;
    const args = _Context__WEBPACK_IMPORTED_MODULE_9__.Context.parseFragment(window.location.hash);
    const runFileId = (_a = args.get("runFile")) === null || _a === void 0 ? void 0 : _a[0];
    const userId = (_b = args.get("user")) === null || _b === void 0 ? void 0 : _b[0];
    const body = document.querySelector("body");
    body.classList.add("signed-out");
    // Configuration for Firebase.
    firebase_app__WEBPACK_IMPORTED_MODULE_1__.default.initializeApp({
        apiKey: "AIzaSyAfGZY9BaDUmy4qNtg11JHd_kLd1JmgdBI",
        authDomain: "my-trs-80.firebaseapp.com",
        projectId: "my-trs-80",
        storageBucket: "my-trs-80.appspot.com",
        messagingSenderId: "438103442091",
        appId: "1:438103442091:web:0fe42c43917ba1add52dee"
    });
    firebase_app__WEBPACK_IMPORTED_MODULE_1__.default.analytics();
    // Configuration for Firebase sign-in screen.
    const uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase_app__WEBPACK_IMPORTED_MODULE_1__.default.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            // firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // Pop up a browser window for the actual sign-in page:
        signInFlow: "popup",
        callbacks: {
            signInSuccessWithAuthResult: (authResult) => {
                // Don't use stuff here, the user will get passed to onAuthStateChanged().
                // I don't see much else useful in authResult.
                // console.log(authResult);
                // Don't redirect, we've taken care of it.
                return false;
            },
        },
    };
    let firebaseAuth = firebase_app__WEBPACK_IMPORTED_MODULE_1__.default.auth();
    const firebaseAuthUi = new firebaseui__WEBPACK_IMPORTED_MODULE_5__.auth.AuthUI(firebaseAuth);
    const signInDiv = document.createElement("div");
    const signInInstructions = document.createElement("div");
    signInInstructions.classList.add("sign-in-instructions");
    signInInstructions.innerText = "Sign in to My TRS-80 to have a persistent place to store your files.";
    const signInFirebase = document.createElement("div");
    signInDiv.append(signInInstructions, signInFirebase);
    let signInDialog = undefined;
    const db = new _Database__WEBPACK_IMPORTED_MODULE_14__.Database(firebase_app__WEBPACK_IMPORTED_MODULE_1__.default.firestore());
    firebaseAuth.onAuthStateChanged(firebaseUser => {
        if (firebaseUser !== null) {
            //console.log(firebaseUser);
            const authUser = _User__WEBPACK_IMPORTED_MODULE_13__.AuthUser.fromFirebaseUser(firebaseUser);
            db.userFromAuthUser(authUser)
                .then(user => context.user = user)
                .catch(error => {
                // TODO.
                console.error(error);
            });
            if (signInDialog !== undefined) {
                signInDialog.close();
                signInDialog = undefined;
            }
        }
        else {
            // No user signed in, render sign-in UI.
            firebaseAuthUi.reset();
            firebaseAuthUi.start(signInFirebase, uiConfig);
            context.user = undefined;
        }
    });
    const panelManager = new _PanelManager__WEBPACK_IMPORTED_MODULE_7__.PanelManager();
    const library = new _Library__WEBPACK_IMPORTED_MODULE_10__.Library();
    const navbar = createNavbar(() => panelManager.open(), () => {
        if (signInDialog !== undefined) {
            signInDialog.close();
        }
        signInDialog = new _DialogBox__WEBPACK_IMPORTED_MODULE_12__.DialogBox("Sign In", signInDiv, "sign-in-dialog-box");
    }, () => firebase_app__WEBPACK_IMPORTED_MODULE_1__.default.auth().signOut());
    const screenDiv = document.createElement("div");
    screenDiv.classList.add("main-computer-screen");
    const screen = new trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.CanvasScreen(1.5);
    let cassette = new EmptyCassette();
    const trs80 = new trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.Trs80(screen, cassette);
    const editor = new trs80_emulator_dist_Editor__WEBPACK_IMPORTED_MODULE_15__.Editor(trs80, screen);
    screenDiv.append(editor.node);
    const reboot = () => {
        trs80.reset();
        trs80.start();
    };
    const hardwareSettingsPanel = new trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.SettingsPanel(screen.getNode(), trs80, trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.PanelType.HARDWARE);
    const viewPanel = new trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.SettingsPanel(screen.getNode(), trs80, trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.PanelType.VIEW);
    const controlPanel = new trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.ControlPanel(screen.getNode());
    controlPanel.addResetButton(reboot);
    /* We don't currently mount a cassette.
    controlPanel.addTapeRewindButton(() => {
        // cassette.rewind();
    });
     */
    controlPanel.addSettingsButton(hardwareSettingsPanel);
    controlPanel.addSettingsButton(viewPanel);
    // const progressBar = new ProgressBar(screen.getNode());
    // cassette.setProgressBar(progressBar);
    controlPanel.addMuteButton(trs80.soundPlayer);
    const driveIndicators = new trs80_emulator__WEBPACK_IMPORTED_MODULE_0__.DriveIndicators(screen.getNode());
    trs80.onMotorOn.subscribe(drive => driveIndicators.setActiveDrive(drive));
    body.append(navbar);
    body.append(screenDiv);
    let createdLibraryPanel = false;
    let wasTrs80Started = false;
    panelManager.onOpenClose.subscribe(isOpen => {
        if (isOpen && !createdLibraryPanel) {
            panelManager.pushPanel(new _LibraryPanel__WEBPACK_IMPORTED_MODULE_8__.LibraryPanel(context));
            createdLibraryPanel = true;
        }
        if (isOpen) {
            wasTrs80Started = trs80.stop();
        }
        else {
            if (wasTrs80Started) {
                trs80.start();
            }
        }
    });
    reboot();
    const context = new _Context__WEBPACK_IMPORTED_MODULE_9__.Context(library, trs80, db, panelManager);
    const screenshotButton = controlPanel.addScreenshotButton(() => {
        if (context.runningFile !== undefined) {
            let file = context.runningFile;
            const screenshot = trs80.getScreenshot();
            const screenshots = [...file.screenshots, screenshot]; // Don't modify original array.
            file = file.builder()
                .withScreenshots(screenshots)
                .withModifiedAt(new Date())
                .build();
            context.db.updateFile(context.runningFile, file)
                .then(() => context.library.modifyFile(file))
                .catch(error => {
                // TODO.
                console.error(error);
            });
        }
    });
    // Start hidden, since the user isn't signed in until later.
    screenshotButton.classList.add("hidden");
    controlPanel.addEditorButton(() => editor.startEdit());
    /**
     * Update whether the user can take a screenshot of the running program.
     */
    function updateScreenshotButtonVisibility() {
        const canSaveScreenshot = context.runningFile !== undefined &&
            context.user !== undefined &&
            context.runningFile.uid === context.user.uid;
        screenshotButton.classList.toggle("hidden", !canSaveScreenshot);
    }
    context.onRunningFile.subscribe(() => {
        window.location.hash = context.getFragment();
        updateScreenshotButtonVisibility();
    });
    context.onUser.subscribe(user => {
        body.classList.toggle("signed-in", user !== undefined);
        body.classList.toggle("signed-out", user === undefined);
        updateScreenshotButtonVisibility();
        library.removeAll();
        if (user !== undefined) {
            // Fetch all files.
            context.db.getAllFiles(userId !== null && userId !== void 0 ? userId : user.uid)
                .then((querySnapshot) => {
                // Sort files before adding them to the library so that they show up in the UI in order
                // and the screenshots get loaded with the visible ones first.
                const files = [];
                for (const doc of querySnapshot.docs) {
                    files.push(_File__WEBPACK_IMPORTED_MODULE_11__.FileBuilder.fromDoc(doc).build());
                }
                files.sort(_File__WEBPACK_IMPORTED_MODULE_11__.File.compare);
                for (const file of files) {
                    library.addFile(file);
                    // Update hash if necessary.
                    if (file.binary.length !== 0 && file.isOldHash()) {
                        // This updates the hash.
                        const newFile = file.builder().withBinary(file.binary).build();
                        console.log("Hash for " + file.name + " has been recomputed");
                        context.db.updateFile(file, newFile)
                            .then(() => {
                            library.modifyFile(newFile);
                        });
                    }
                }
                // We should now be in sync with the cloud database.
                library.setInSync(true);
            })
                .catch(error => {
                // TODO
                console.error(error);
                if (error.name === "FirebaseError") {
                    // code can be "permission-denied".
                    console.error(error.code, error.message);
                }
            });
        }
    });
    // See if we should run an app right away.
    context.onUserResolved.subscribe(() => {
        // We're signed in, or not, and can now read the database.
        if (runFileId !== undefined) {
            db.getFile(runFileId)
                .then(file => {
                context.runProgram(file);
            })
                .catch(() => {
                // TODO Should probably display error message.
            });
        }
    });
}


/***/ }),

/***/ "./src/PageTab.ts":
/*!************************!*\
  !*** ./src/PageTab.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageTab": () => (/* binding */ PageTab)
/* harmony export */ });
/**
 * Represents a single page tab and its contents.
 */
class PageTab {
    constructor(name, visible = true) {
        this.firstShow = true;
        this.name = name;
        this.visible = visible;
        this.element = document.createElement("div");
        this.element.classList.add("tab-content");
    }
    /**
     * Called when a tab is shown.
     */
    onShow() {
        if (this.firstShow) {
            this.firstShow = false;
            // Delay to give the UI a chance to highlight the tab.
            setTimeout(() => this.onFirstShow(), 0);
        }
    }
    /**
     * Called the first time a tab is shown.
     */
    onFirstShow() {
        // Nothing by default.
    }
    /**
     * Called when a key is pressed and this tab is visible.
     * @param e the keyboard event for the key down event.
     * @return whether the method handled the key.
     */
    onKeyDown(e) {
        // Nothing by default.
        return false;
    }
    /**
     * Called when a tab is hidden (another tab is shown).
     */
    onHide() {
        // Nothing by default.
    }
    /**
     * Called when the page tab is being destroyed.
     */
    onDestroy() {
        // Nothing by default.
    }
}


/***/ }),

/***/ "./src/PageTabs.ts":
/*!*************************!*\
  !*** ./src/PageTabs.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageTabs": () => (/* binding */ PageTabs)
/* harmony export */ });
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Set of page tabs.
 */
class PageTabs {
    constructor(element) {
        this.tabs = [];
        // The tab last selected by the user.
        this.activeIndex = 0;
        // Same as activeIndex, unless it's not visible, in which case some other
        // visible tab, or undefined if no tab is visible.
        this.effectiveActiveIndex = undefined;
        this.containerElement = element;
        this.containerElement.classList.add("page-tabs-container");
        // Where we draw the page tabs themselves.
        this.tabElement = document.createElement("div");
        this.tabElement.classList.add("page-tabs");
        this.containerElement.append(this.tabElement);
    }
    /**
     * Add a new tab. Be sure it's fully configured, because its onShow
     * listener might be called synchronously.
     */
    addTab(tab) {
        this.tabs.push(tab);
        this.containerElement.append(tab.element);
        this.configurationChanged();
    }
    /**
     * The panel these page tabs are on is being destroyed.
     */
    destroy() {
        for (const tab of this.tabs) {
            tab.onDestroy();
        }
    }
    /**
     * Switch the active tab.
     */
    setActiveTab(activeIndex) {
        if (activeIndex !== this.activeIndex) {
            this.activeIndex = activeIndex;
            this.configurationChanged();
        }
    }
    /**
     * Called when a key is pressed and this panel is visible.
     * @param e the keyboard event for the key down event.
     * @return whether the method handled the key.
     */
    onKeyDown(e) {
        return this.effectiveActiveIndex !== undefined && this.tabs[this.effectiveActiveIndex].onKeyDown(e);
    }
    /**
     * Update all tabs given a new configuration.
     */
    configurationChanged() {
        const oldEffectiveActiveIndex = this.effectiveActiveIndex;
        this.computeEffectiveActiveIndex();
        if (oldEffectiveActiveIndex !== this.effectiveActiveIndex) {
            if (oldEffectiveActiveIndex !== undefined) {
                this.tabs[oldEffectiveActiveIndex].onHide();
            }
            if (this.effectiveActiveIndex !== undefined) {
                this.tabs[this.effectiveActiveIndex].onShow();
            }
        }
        this.recreateTabs();
        this.updateTabContentVisibility();
    }
    /**
     * Get the current active index. If it's hidden, return another one. If none
     * exist, return undefined.
     */
    computeEffectiveActiveIndex() {
        this.effectiveActiveIndex = this.activeIndex;
        // If the active tab is hidden, find another one.
        if (this.effectiveActiveIndex >= this.tabs.length || !this.tabs[this.effectiveActiveIndex].visible) {
            // Pick any.
            this.effectiveActiveIndex = undefined;
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].visible) {
                    this.effectiveActiveIndex = i;
                    break;
                }
            }
        }
    }
    /**
     * Recreate the set of page tabs (the UI).
     */
    recreateTabs() {
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_0__.clearElement)(this.tabElement);
        for (let index = 0; index < this.tabs.length; index++) {
            const tab = this.tabs[index];
            if (tab.visible) {
                const tabDiv = document.createElement("div");
                tabDiv.innerText = tab.name;
                tabDiv.classList.toggle("page-tab-active", index === this.effectiveActiveIndex);
                tabDiv.addEventListener("click", () => {
                    this.setActiveTab(index);
                });
                this.tabElement.append(tabDiv);
            }
        }
    }
    /**
     * Update which tab contents are visible based on which is selected.
     */
    updateTabContentVisibility() {
        for (let index = 0; index < this.tabs.length; index++) {
            this.tabs[index].element.classList.toggle("hidden", index !== this.effectiveActiveIndex);
        }
    }
}


/***/ }),

/***/ "./src/Panel.ts":
/*!**********************!*\
  !*** ./src/Panel.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Panel": () => (/* binding */ Panel)
/* harmony export */ });
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");

/**
 * Base class for panels.
 */
class Panel {
    /**
     * Construct the panel and its basic UI.
     *
     * @param context the app's context object.
     * @param title title for the header.
     * @param panelCssClass class for the whole panel.
     * @param showBackButton whether to show a back button.
     */
    constructor(context, title, panelCssClass, showBackButton) {
        this.context = context;
        this.element = document.createElement("div");
        this.element.classList.add("panel", panelCssClass);
        const header = document.createElement("h1");
        if (showBackButton) {
            const backButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_0__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_0__.makeIcon)("arrow_back"), "Back (Ctrl-Backspace)", () => this.context.panelManager.popPanel());
            backButton.classList.add("back-button");
            header.append(backButton);
        }
        this.headerTextNode = document.createElement("span");
        this.headerTextNode.innerText = title;
        header.append(this.headerTextNode);
        header.append((0,_Utils__WEBPACK_IMPORTED_MODULE_0__.makeCloseIconButton)(() => this.context.panelManager.close()));
        this.element.append(header);
        this.content = document.createElement("div");
        this.content.classList.add("panel-content");
        this.element.append(this.content);
    }
    /**
     * Called when the panel is no longer visible and is being destroyed.
     */
    onPanelDestroy() {
        // Nothing by default.
    }
    /**
     * Called when a key is pressed and this panel is visible.
     * @param e the keyboard event for the key down event.
     * @return whether the method handled the key.
     */
    onKeyDown(e) {
        return false;
    }
}


/***/ }),

/***/ "./src/PanelManager.ts":
/*!*****************************!*\
  !*** ./src/PanelManager.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelManager": () => (/* binding */ PanelManager)
/* harmony export */ });
/* harmony import */ var strongly_typed_events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! strongly-typed-events */ "./node_modules/strongly-typed-events/dist/index.js");

/**
 * Manages a stack of displayed panels.
 */
class PanelManager {
    constructor() {
        this.panels = [];
        this.onOpenClose = new strongly_typed_events__WEBPACK_IMPORTED_MODULE_0__.SimpleEventDispatcher();
        this.isOpen = false;
        const body = document.querySelector("body");
        this.backgroundNode = document.createElement("div");
        this.backgroundNode.classList.add("panel-background");
        this.backgroundNode.addEventListener("click", e => {
            if (e.target === this.backgroundNode) {
                this.close();
                e.preventDefault();
                e.stopPropagation();
            }
        });
        body.append(this.backgroundNode);
        this.positioningNode = document.createElement("div");
        this.positioningNode.classList.add("panel-positioning");
        this.backgroundNode.append(this.positioningNode);
        // Pass key events to panels.
        document.addEventListener("keydown", e => {
            let handled = false;
            // Ctrl-L anywhere to toggle the panels.
            if (e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.key === "l") {
                this.toggle();
                handled = true;
            }
            // Ctrl-Backspace to pop a panel.
            if (!handled && this.panels.length > 1 && e.ctrlKey && !e.metaKey && !e.shiftKey &&
                !e.altKey && e.key === "Backspace") {
                this.popPanel();
                handled = true;
            }
            // If panel is open, pass key to visible panel.
            if (!handled && this.isOpen) {
                // Give panel first chance, in case they need Esc for something more useful
                // than closing the panel.
                handled = this.panels[this.panels.length - 1].onKeyDown(e);
                if (!handled && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.key === "Escape") {
                    this.close();
                    handled = true;
                }
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    /**
     * Push a new panel and animate it on-screen.
     */
    pushPanel(panel) {
        this.panels.push(panel);
        this.positioningNode.append(panel.element);
        if (this.panels.length === 1) {
            // First panel, position immediately.
            this.positionPanels(this.panels.length - 1);
        }
        else {
            // Position it instantly at its off-screen position.
            this.positionPanels(this.panels.length - 2);
            // Wait for it to be laid out, then position it on-screen so the animation will be used.
            setTimeout(() => {
                this.positionPanels(this.panels.length - 1);
            }, 0);
        }
    }
    /**
     * Start the animation to pop the most screen panel.
     */
    popPanel() {
        if (this.panels.length > 1) {
            // Slide it off-screen.
            this.positionPanels(this.panels.length - 2);
            // Remove it from the DOM.
            const panel = this.panels.pop();
            setTimeout(() => {
                if (panel !== undefined) {
                    panel.onPanelDestroy();
                    panel.element.remove();
                }
            }, 1000);
        }
    }
    /**
     * Move the panels to their position so that "active" will be on-screen.
     */
    positionPanels(active) {
        for (let i = 0; i < this.panels.length; i++) {
            const screen = this.panels[i];
            const offset = (i - active) * 100;
            screen.element.style.left = offset + "vw";
            screen.element.style.right = -offset + "vw";
        }
    }
    /**
     * Show the panels. Shows them where they were last.
     */
    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.onOpenClose.dispatch(true);
            this.backgroundNode.classList.add("panel-shown");
        }
    }
    /**
     * Hides the panels.
     */
    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.onOpenClose.dispatch(false);
            this.backgroundNode.classList.remove("panel-shown");
        }
    }
    /**
     * Toggle the visibility of the panels.
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    }
}


/***/ }),

/***/ "./src/RetroStoreProto.ts":
/*!********************************!*\
  !*** ./src/RetroStoreProto.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "encodeTrs80Model": () => (/* binding */ encodeTrs80Model),
/* harmony export */   "decodeTrs80Model": () => (/* binding */ decodeTrs80Model),
/* harmony export */   "encodeMediaType": () => (/* binding */ encodeMediaType),
/* harmony export */   "decodeMediaType": () => (/* binding */ decodeMediaType),
/* harmony export */   "encodeApiResponseApps": () => (/* binding */ encodeApiResponseApps),
/* harmony export */   "decodeApiResponseApps": () => (/* binding */ decodeApiResponseApps),
/* harmony export */   "encodeApiResponseMediaImages": () => (/* binding */ encodeApiResponseMediaImages),
/* harmony export */   "decodeApiResponseMediaImages": () => (/* binding */ decodeApiResponseMediaImages),
/* harmony export */   "encodeApp": () => (/* binding */ encodeApp),
/* harmony export */   "decodeApp": () => (/* binding */ decodeApp),
/* harmony export */   "encodeTrs80Extension": () => (/* binding */ encodeTrs80Extension),
/* harmony export */   "decodeTrs80Extension": () => (/* binding */ decodeTrs80Extension),
/* harmony export */   "encodeMediaImage": () => (/* binding */ encodeMediaImage),
/* harmony export */   "decodeMediaImage": () => (/* binding */ decodeMediaImage)
/* harmony export */ });
const encodeTrs80Model = {
    UNKNOWN_MODEL: 0,
    MODEL_I: 1,
    MODEL_III: 2,
    MODEL_4: 3,
    MODEL_4P: 4,
};
const decodeTrs80Model = {
    0: "UNKNOWN_MODEL" /* UNKNOWN_MODEL */,
    1: "MODEL_I" /* MODEL_I */,
    2: "MODEL_III" /* MODEL_III */,
    3: "MODEL_4" /* MODEL_4 */,
    4: "MODEL_4P" /* MODEL_4P */,
};
const encodeMediaType = {
    UNKNOWN: 0,
    DISK: 1,
    CASSETTE: 2,
    COMMAND: 3,
    BASIC: 4,
};
const decodeMediaType = {
    0: "UNKNOWN" /* UNKNOWN */,
    1: "DISK" /* DISK */,
    2: "CASSETTE" /* CASSETTE */,
    3: "COMMAND" /* COMMAND */,
    4: "BASIC" /* BASIC */,
};
function encodeApiResponseApps(message) {
    let bb = popByteBuffer();
    _encodeApiResponseApps(message, bb);
    return toUint8Array(bb);
}
function _encodeApiResponseApps(message, bb) {
    // optional bool success = 1;
    let $success = message.success;
    if ($success !== undefined) {
        writeVarint32(bb, 8);
        writeByte(bb, $success ? 1 : 0);
    }
    // optional string message = 2;
    let $message = message.message;
    if ($message !== undefined) {
        writeVarint32(bb, 18);
        writeString(bb, $message);
    }
    // repeated App app = 3;
    let array$app = message.app;
    if (array$app !== undefined) {
        for (let value of array$app) {
            writeVarint32(bb, 26);
            let nested = popByteBuffer();
            _encodeApp(value, nested);
            writeVarint32(bb, nested.limit);
            writeByteBuffer(bb, nested);
            pushByteBuffer(nested);
        }
    }
}
function decodeApiResponseApps(binary) {
    return _decodeApiResponseApps(wrapByteBuffer(binary));
}
function _decodeApiResponseApps(bb) {
    let message = {};
    end_of_message: while (!isAtEnd(bb)) {
        let tag = readVarint32(bb);
        switch (tag >>> 3) {
            case 0:
                break end_of_message;
            // optional bool success = 1;
            case 1: {
                message.success = !!readByte(bb);
                break;
            }
            // optional string message = 2;
            case 2: {
                message.message = readString(bb, readVarint32(bb));
                break;
            }
            // repeated App app = 3;
            case 3: {
                let limit = pushTemporaryLength(bb);
                let values = message.app || (message.app = []);
                values.push(_decodeApp(bb));
                bb.limit = limit;
                break;
            }
            default:
                skipUnknownField(bb, tag & 7);
        }
    }
    return message;
}
function encodeApiResponseMediaImages(message) {
    let bb = popByteBuffer();
    _encodeApiResponseMediaImages(message, bb);
    return toUint8Array(bb);
}
function _encodeApiResponseMediaImages(message, bb) {
    // optional bool success = 1;
    let $success = message.success;
    if ($success !== undefined) {
        writeVarint32(bb, 8);
        writeByte(bb, $success ? 1 : 0);
    }
    // optional string message = 2;
    let $message = message.message;
    if ($message !== undefined) {
        writeVarint32(bb, 18);
        writeString(bb, $message);
    }
    // repeated MediaImage mediaImage = 3;
    let array$mediaImage = message.mediaImage;
    if (array$mediaImage !== undefined) {
        for (let value of array$mediaImage) {
            writeVarint32(bb, 26);
            let nested = popByteBuffer();
            _encodeMediaImage(value, nested);
            writeVarint32(bb, nested.limit);
            writeByteBuffer(bb, nested);
            pushByteBuffer(nested);
        }
    }
}
function decodeApiResponseMediaImages(binary) {
    return _decodeApiResponseMediaImages(wrapByteBuffer(binary));
}
function _decodeApiResponseMediaImages(bb) {
    let message = {};
    end_of_message: while (!isAtEnd(bb)) {
        let tag = readVarint32(bb);
        switch (tag >>> 3) {
            case 0:
                break end_of_message;
            // optional bool success = 1;
            case 1: {
                message.success = !!readByte(bb);
                break;
            }
            // optional string message = 2;
            case 2: {
                message.message = readString(bb, readVarint32(bb));
                break;
            }
            // repeated MediaImage mediaImage = 3;
            case 3: {
                let limit = pushTemporaryLength(bb);
                let values = message.mediaImage || (message.mediaImage = []);
                values.push(_decodeMediaImage(bb));
                bb.limit = limit;
                break;
            }
            default:
                skipUnknownField(bb, tag & 7);
        }
    }
    return message;
}
function encodeApp(message) {
    let bb = popByteBuffer();
    _encodeApp(message, bb);
    return toUint8Array(bb);
}
function _encodeApp(message, bb) {
    // optional string id = 1;
    let $id = message.id;
    if ($id !== undefined) {
        writeVarint32(bb, 10);
        writeString(bb, $id);
    }
    // optional string name = 2;
    let $name = message.name;
    if ($name !== undefined) {
        writeVarint32(bb, 18);
        writeString(bb, $name);
    }
    // optional string version = 3;
    let $version = message.version;
    if ($version !== undefined) {
        writeVarint32(bb, 26);
        writeString(bb, $version);
    }
    // optional string description = 4;
    let $description = message.description;
    if ($description !== undefined) {
        writeVarint32(bb, 34);
        writeString(bb, $description);
    }
    // optional int32 release_year = 5;
    let $release_year = message.release_year;
    if ($release_year !== undefined) {
        writeVarint32(bb, 40);
        writeVarint64(bb, intToLong($release_year));
    }
    // repeated string screenshot_url = 6;
    let array$screenshot_url = message.screenshot_url;
    if (array$screenshot_url !== undefined) {
        for (let value of array$screenshot_url) {
            writeVarint32(bb, 50);
            writeString(bb, value);
        }
    }
    // optional string author = 7;
    let $author = message.author;
    if ($author !== undefined) {
        writeVarint32(bb, 58);
        writeString(bb, $author);
    }
    // optional Trs80Extension ext_trs80 = 8;
    let $ext_trs80 = message.ext_trs80;
    if ($ext_trs80 !== undefined) {
        writeVarint32(bb, 66);
        let nested = popByteBuffer();
        _encodeTrs80Extension($ext_trs80, nested);
        writeVarint32(bb, nested.limit);
        writeByteBuffer(bb, nested);
        pushByteBuffer(nested);
    }
}
function decodeApp(binary) {
    return _decodeApp(wrapByteBuffer(binary));
}
function _decodeApp(bb) {
    let message = {};
    end_of_message: while (!isAtEnd(bb)) {
        let tag = readVarint32(bb);
        switch (tag >>> 3) {
            case 0:
                break end_of_message;
            // optional string id = 1;
            case 1: {
                message.id = readString(bb, readVarint32(bb));
                break;
            }
            // optional string name = 2;
            case 2: {
                message.name = readString(bb, readVarint32(bb));
                break;
            }
            // optional string version = 3;
            case 3: {
                message.version = readString(bb, readVarint32(bb));
                break;
            }
            // optional string description = 4;
            case 4: {
                message.description = readString(bb, readVarint32(bb));
                break;
            }
            // optional int32 release_year = 5;
            case 5: {
                message.release_year = readVarint32(bb);
                break;
            }
            // repeated string screenshot_url = 6;
            case 6: {
                let values = message.screenshot_url || (message.screenshot_url = []);
                values.push(readString(bb, readVarint32(bb)));
                break;
            }
            // optional string author = 7;
            case 7: {
                message.author = readString(bb, readVarint32(bb));
                break;
            }
            // optional Trs80Extension ext_trs80 = 8;
            case 8: {
                let limit = pushTemporaryLength(bb);
                message.ext_trs80 = _decodeTrs80Extension(bb);
                bb.limit = limit;
                break;
            }
            default:
                skipUnknownField(bb, tag & 7);
        }
    }
    return message;
}
function encodeTrs80Extension(message) {
    let bb = popByteBuffer();
    _encodeTrs80Extension(message, bb);
    return toUint8Array(bb);
}
function _encodeTrs80Extension(message, bb) {
    // optional Trs80Model model = 1;
    let $model = message.model;
    if ($model !== undefined) {
        writeVarint32(bb, 8);
        writeVarint32(bb, encodeTrs80Model[$model]);
    }
}
function decodeTrs80Extension(binary) {
    return _decodeTrs80Extension(wrapByteBuffer(binary));
}
function _decodeTrs80Extension(bb) {
    let message = {};
    end_of_message: while (!isAtEnd(bb)) {
        let tag = readVarint32(bb);
        switch (tag >>> 3) {
            case 0:
                break end_of_message;
            // optional Trs80Model model = 1;
            case 1: {
                message.model = decodeTrs80Model[readVarint32(bb)];
                break;
            }
            default:
                skipUnknownField(bb, tag & 7);
        }
    }
    return message;
}
function encodeMediaImage(message) {
    let bb = popByteBuffer();
    _encodeMediaImage(message, bb);
    return toUint8Array(bb);
}
function _encodeMediaImage(message, bb) {
    // optional MediaType type = 1;
    let $type = message.type;
    if ($type !== undefined) {
        writeVarint32(bb, 8);
        writeVarint32(bb, encodeMediaType[$type]);
    }
    // optional string filename = 2;
    let $filename = message.filename;
    if ($filename !== undefined) {
        writeVarint32(bb, 18);
        writeString(bb, $filename);
    }
    // optional bytes data = 3;
    let $data = message.data;
    if ($data !== undefined) {
        writeVarint32(bb, 26);
        writeVarint32(bb, $data.length), writeBytes(bb, $data);
    }
    // optional int64 uploadTime = 4;
    let $uploadTime = message.uploadTime;
    if ($uploadTime !== undefined) {
        writeVarint32(bb, 32);
        writeVarint64(bb, $uploadTime);
    }
    // optional string description = 5;
    let $description = message.description;
    if ($description !== undefined) {
        writeVarint32(bb, 42);
        writeString(bb, $description);
    }
}
function decodeMediaImage(binary) {
    return _decodeMediaImage(wrapByteBuffer(binary));
}
function _decodeMediaImage(bb) {
    let message = {};
    end_of_message: while (!isAtEnd(bb)) {
        let tag = readVarint32(bb);
        switch (tag >>> 3) {
            case 0:
                break end_of_message;
            // optional MediaType type = 1;
            case 1: {
                message.type = decodeMediaType[readVarint32(bb)];
                break;
            }
            // optional string filename = 2;
            case 2: {
                message.filename = readString(bb, readVarint32(bb));
                break;
            }
            // optional bytes data = 3;
            case 3: {
                message.data = readBytes(bb, readVarint32(bb));
                break;
            }
            // optional int64 uploadTime = 4;
            case 4: {
                message.uploadTime = readVarint64(bb, /* unsigned */ false);
                break;
            }
            // optional string description = 5;
            case 5: {
                message.description = readString(bb, readVarint32(bb));
                break;
            }
            default:
                skipUnknownField(bb, tag & 7);
        }
    }
    return message;
}
function pushTemporaryLength(bb) {
    let length = readVarint32(bb);
    let limit = bb.limit;
    bb.limit = bb.offset + length;
    return limit;
}
function skipUnknownField(bb, type) {
    switch (type) {
        case 0:
            while (readByte(bb) & 0x80) { }
            break;
        case 2:
            skip(bb, readVarint32(bb));
            break;
        case 5:
            skip(bb, 4);
            break;
        case 1:
            skip(bb, 8);
            break;
        default: throw new Error("Unimplemented type: " + type);
    }
}
function stringToLong(value) {
    return {
        low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
        high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
        unsigned: false,
    };
}
function longToString(value) {
    let low = value.low;
    let high = value.high;
    return String.fromCharCode(low & 0xFFFF, low >>> 16, high & 0xFFFF, high >>> 16);
}
// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.
let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);
let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);
function intToLong(value) {
    value |= 0;
    return {
        low: value,
        high: value >> 31,
        unsigned: value >= 0,
    };
}
let bbStack = [];
function popByteBuffer() {
    const bb = bbStack.pop();
    if (!bb)
        return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
    bb.offset = bb.limit = 0;
    return bb;
}
function pushByteBuffer(bb) {
    bbStack.push(bb);
}
function wrapByteBuffer(bytes) {
    return { bytes, offset: 0, limit: bytes.length };
}
function toUint8Array(bb) {
    let bytes = bb.bytes;
    let limit = bb.limit;
    return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}
function skip(bb, offset) {
    if (bb.offset + offset > bb.limit) {
        throw new Error('Skip past limit');
    }
    bb.offset += offset;
}
function isAtEnd(bb) {
    return bb.offset >= bb.limit;
}
function grow(bb, count) {
    let bytes = bb.bytes;
    let offset = bb.offset;
    let limit = bb.limit;
    let finalOffset = offset + count;
    if (finalOffset > bytes.length) {
        let newBytes = new Uint8Array(finalOffset * 2);
        newBytes.set(bytes);
        bb.bytes = newBytes;
    }
    bb.offset = finalOffset;
    if (finalOffset > limit) {
        bb.limit = finalOffset;
    }
    return offset;
}
function advance(bb, count) {
    let offset = bb.offset;
    if (offset + count > bb.limit) {
        throw new Error('Read past limit');
    }
    bb.offset += count;
    return offset;
}
function readBytes(bb, count) {
    let offset = advance(bb, count);
    return bb.bytes.subarray(offset, offset + count);
}
function writeBytes(bb, buffer) {
    let offset = grow(bb, buffer.length);
    bb.bytes.set(buffer, offset);
}
function readString(bb, count) {
    // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
    let offset = advance(bb, count);
    let fromCharCode = String.fromCharCode;
    let bytes = bb.bytes;
    let invalid = '\uFFFD';
    let text = '';
    for (let i = 0; i < count; i++) {
        let c1 = bytes[i + offset], c2, c3, c4, c;
        // 1 byte
        if ((c1 & 0x80) === 0) {
            text += fromCharCode(c1);
        }
        // 2 bytes
        else if ((c1 & 0xE0) === 0xC0) {
            if (i + 1 >= count)
                text += invalid;
            else {
                c2 = bytes[i + offset + 1];
                if ((c2 & 0xC0) !== 0x80)
                    text += invalid;
                else {
                    c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
                    if (c < 0x80)
                        text += invalid;
                    else {
                        text += fromCharCode(c);
                        i++;
                    }
                }
            }
        }
        // 3 bytes
        else if ((c1 & 0xF0) == 0xE0) {
            if (i + 2 >= count)
                text += invalid;
            else {
                c2 = bytes[i + offset + 1];
                c3 = bytes[i + offset + 2];
                if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080)
                    text += invalid;
                else {
                    c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
                    if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF))
                        text += invalid;
                    else {
                        text += fromCharCode(c);
                        i += 2;
                    }
                }
            }
        }
        // 4 bytes
        else if ((c1 & 0xF8) == 0xF0) {
            if (i + 3 >= count)
                text += invalid;
            else {
                c2 = bytes[i + offset + 1];
                c3 = bytes[i + offset + 2];
                c4 = bytes[i + offset + 3];
                if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080)
                    text += invalid;
                else {
                    c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
                    if (c < 0x10000 || c > 0x10FFFF)
                        text += invalid;
                    else {
                        c -= 0x10000;
                        text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
                        i += 3;
                    }
                }
            }
        }
        else
            text += invalid;
    }
    return text;
}
function writeString(bb, text) {
    // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
    let n = text.length;
    let byteCount = 0;
    // Write the byte count first
    for (let i = 0; i < n; i++) {
        let c = text.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
            c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
        }
        byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
    }
    writeVarint32(bb, byteCount);
    let offset = grow(bb, byteCount);
    let bytes = bb.bytes;
    // Then write the bytes
    for (let i = 0; i < n; i++) {
        let c = text.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
            c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
        }
        if (c < 0x80) {
            bytes[offset++] = c;
        }
        else {
            if (c < 0x800) {
                bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
            }
            else {
                if (c < 0x10000) {
                    bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
                }
                else {
                    bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
                    bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
                }
                bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
            }
            bytes[offset++] = (c & 0x3F) | 0x80;
        }
    }
}
function writeByteBuffer(bb, buffer) {
    let offset = grow(bb, buffer.limit);
    let from = bb.bytes;
    let to = buffer.bytes;
    // This for loop is much faster than subarray+set on V8
    for (let i = 0, n = buffer.limit; i < n; i++) {
        from[i + offset] = to[i];
    }
}
function readByte(bb) {
    return bb.bytes[advance(bb, 1)];
}
function writeByte(bb, value) {
    let offset = grow(bb, 1);
    bb.bytes[offset] = value;
}
function readFloat(bb) {
    let offset = advance(bb, 4);
    let bytes = bb.bytes;
    // Manual copying is much faster than subarray+set in V8
    f32_u8[0] = bytes[offset++];
    f32_u8[1] = bytes[offset++];
    f32_u8[2] = bytes[offset++];
    f32_u8[3] = bytes[offset++];
    return f32[0];
}
function writeFloat(bb, value) {
    let offset = grow(bb, 4);
    let bytes = bb.bytes;
    f32[0] = value;
    // Manual copying is much faster than subarray+set in V8
    bytes[offset++] = f32_u8[0];
    bytes[offset++] = f32_u8[1];
    bytes[offset++] = f32_u8[2];
    bytes[offset++] = f32_u8[3];
}
function readDouble(bb) {
    let offset = advance(bb, 8);
    let bytes = bb.bytes;
    // Manual copying is much faster than subarray+set in V8
    f64_u8[0] = bytes[offset++];
    f64_u8[1] = bytes[offset++];
    f64_u8[2] = bytes[offset++];
    f64_u8[3] = bytes[offset++];
    f64_u8[4] = bytes[offset++];
    f64_u8[5] = bytes[offset++];
    f64_u8[6] = bytes[offset++];
    f64_u8[7] = bytes[offset++];
    return f64[0];
}
function writeDouble(bb, value) {
    let offset = grow(bb, 8);
    let bytes = bb.bytes;
    f64[0] = value;
    // Manual copying is much faster than subarray+set in V8
    bytes[offset++] = f64_u8[0];
    bytes[offset++] = f64_u8[1];
    bytes[offset++] = f64_u8[2];
    bytes[offset++] = f64_u8[3];
    bytes[offset++] = f64_u8[4];
    bytes[offset++] = f64_u8[5];
    bytes[offset++] = f64_u8[6];
    bytes[offset++] = f64_u8[7];
}
function readInt32(bb) {
    let offset = advance(bb, 4);
    let bytes = bb.bytes;
    return (bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24));
}
function writeInt32(bb, value) {
    let offset = grow(bb, 4);
    let bytes = bb.bytes;
    bytes[offset] = value;
    bytes[offset + 1] = value >> 8;
    bytes[offset + 2] = value >> 16;
    bytes[offset + 3] = value >> 24;
}
function readInt64(bb, unsigned) {
    return {
        low: readInt32(bb),
        high: readInt32(bb),
        unsigned,
    };
}
function writeInt64(bb, value) {
    writeInt32(bb, value.low);
    writeInt32(bb, value.high);
}
function readVarint32(bb) {
    let c = 0;
    let value = 0;
    let b;
    do {
        b = readByte(bb);
        if (c < 32)
            value |= (b & 0x7F) << c;
        c += 7;
    } while (b & 0x80);
    return value;
}
function writeVarint32(bb, value) {
    value >>>= 0;
    while (value >= 0x80) {
        writeByte(bb, (value & 0x7f) | 0x80);
        value >>>= 7;
    }
    writeByte(bb, value);
}
function readVarint64(bb, unsigned) {
    let part0 = 0;
    let part1 = 0;
    let part2 = 0;
    let b;
    b = readByte(bb);
    part0 = (b & 0x7F);
    if (b & 0x80) {
        b = readByte(bb);
        part0 |= (b & 0x7F) << 7;
        if (b & 0x80) {
            b = readByte(bb);
            part0 |= (b & 0x7F) << 14;
            if (b & 0x80) {
                b = readByte(bb);
                part0 |= (b & 0x7F) << 21;
                if (b & 0x80) {
                    b = readByte(bb);
                    part1 = (b & 0x7F);
                    if (b & 0x80) {
                        b = readByte(bb);
                        part1 |= (b & 0x7F) << 7;
                        if (b & 0x80) {
                            b = readByte(bb);
                            part1 |= (b & 0x7F) << 14;
                            if (b & 0x80) {
                                b = readByte(bb);
                                part1 |= (b & 0x7F) << 21;
                                if (b & 0x80) {
                                    b = readByte(bb);
                                    part2 = (b & 0x7F);
                                    if (b & 0x80) {
                                        b = readByte(bb);
                                        part2 |= (b & 0x7F) << 7;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return {
        low: part0 | (part1 << 28),
        high: (part1 >>> 4) | (part2 << 24),
        unsigned,
    };
}
function writeVarint64(bb, value) {
    let part0 = value.low >>> 0;
    let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
    let part2 = value.high >>> 24;
    // ref: src/google/protobuf/io/coded_stream.cc
    let size = part2 === 0 ?
        part1 === 0 ?
            part0 < 1 << 14 ?
                part0 < 1 << 7 ? 1 : 2 :
                part0 < 1 << 21 ? 3 : 4 :
            part1 < 1 << 14 ?
                part1 < 1 << 7 ? 5 : 6 :
                part1 < 1 << 21 ? 7 : 8 :
        part2 < 1 << 7 ? 9 : 10;
    let offset = grow(bb, size);
    let bytes = bb.bytes;
    switch (size) {
        case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
        case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
        case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
        case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
        case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
        case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
        case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
        case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
        case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
        case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
    }
}
function readVarint32ZigZag(bb) {
    let value = readVarint32(bb);
    // ref: src/google/protobuf/wire_format_lite.h
    return (value >>> 1) ^ -(value & 1);
}
function writeVarint32ZigZag(bb, value) {
    // ref: src/google/protobuf/wire_format_lite.h
    writeVarint32(bb, (value << 1) ^ (value >> 31));
}
function readVarint64ZigZag(bb) {
    let value = readVarint64(bb, /* unsigned */ false);
    let low = value.low;
    let high = value.high;
    let flip = -(low & 1);
    // ref: src/google/protobuf/wire_format_lite.h
    return {
        low: ((low >>> 1) | (high << 31)) ^ flip,
        high: (high >>> 1) ^ flip,
        unsigned: false,
    };
}
function writeVarint64ZigZag(bb, value) {
    let low = value.low;
    let high = value.high;
    let flip = high >> 31;
    // ref: src/google/protobuf/wire_format_lite.h
    writeVarint64(bb, {
        low: (low << 1) ^ flip,
        high: ((high << 1) | (low >>> 31)) ^ flip,
        unsigned: false,
    });
}


/***/ }),

/***/ "./src/RetroStoreTab.ts":
/*!******************************!*\
  !*** ./src/RetroStoreTab.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RetroStoreTab": () => (/* binding */ RetroStoreTab)
/* harmony export */ });
/* harmony import */ var _RetroStoreProto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RetroStoreProto */ "./src/RetroStoreProto.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./File */ "./src/File.ts");
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
// Generate this with: npx pbjs ApiProtos.proto --ts RetroStoreProto.ts






const RETRO_STORE_API_URL = "https://retrostore.org/api/";
const APP_FETCH_COUNT = 10;
/**
 * Stores info about a RetroStore app and its media.
 */
class RetroStoreApp {
    constructor(app) {
        this.element = undefined;
        this.app = app;
    }
}
/**
 * Fetch all apps from RetroStore. If an error occurs, returns an empty list.
 */
function fetchApps(start, count) {
    const query = "";
    const apiRequest = {
        start: start,
        num: count,
        query: query,
        trs80: {
            mediaTypes: [],
        },
    };
    const fetchOptions = {
        method: "POST",
        cache: "no-cache",
        body: JSON.stringify(apiRequest),
    };
    return fetch(RETRO_STORE_API_URL + "listApps", fetchOptions)
        .then(response => {
        if (response.status === 200) {
            return response.arrayBuffer();
        }
        else {
            throw new Error("Error code " + response.status);
        }
    })
        .then(array => {
        var _a;
        const apps = _RetroStoreProto__WEBPACK_IMPORTED_MODULE_0__.decodeApiResponseApps(new Uint8Array(array));
        if (apps.success) {
            return Promise.resolve((_a = apps.app) !== null && _a !== void 0 ? _a : []);
        }
        else {
            // TODO.
            console.error("Can't get apps: " + apps.message);
            return Promise.resolve([]);
        }
    })
        .catch(error => {
        // TODO
        console.error(error);
        return Promise.resolve([]);
    });
}
/**
 * Fetch all media images for the specified app ID. If an error occurs, returns an empty list.
 */
function fetchMediaImages(appId) {
    const apiRequest = {
        appId: appId,
    };
    const fetchOptions = {
        method: "POST",
        cache: "no-cache",
        body: JSON.stringify(apiRequest),
    };
    return fetch(RETRO_STORE_API_URL + "fetchMediaImages", fetchOptions)
        .then(response => {
        if (response.status === 200) {
            return response.arrayBuffer();
        }
        else {
            throw new Error("Error code " + response.status);
        }
    })
        .then(array => {
        var _a;
        const mediaImages = _RetroStoreProto__WEBPACK_IMPORTED_MODULE_0__.decodeApiResponseMediaImages(new Uint8Array(array));
        if (mediaImages.success) {
            return Promise.resolve((_a = mediaImages.mediaImage) !== null && _a !== void 0 ? _a : []);
        }
        else {
            // TODO.
            console.error("Can't get media images for " + appId + ": " + mediaImages.message);
            return Promise.reject();
        }
    })
        .catch(error => {
        // TODO
        console.error(error);
        return Promise.reject();
    });
}
/**
 * The tab for showing apps from RetroStore.org.
 */
class RetroStoreTab extends _PageTab__WEBPACK_IMPORTED_MODULE_5__.PageTab {
    constructor(context) {
        super("RetroStore");
        this.apps = [];
        this.complete = false;
        this.fetching = false;
        this.context = context;
        this.element.classList.add("retro-store-tab");
        this.appsDiv = document.createElement("div");
        this.appsDiv.classList.add("retro-store-apps");
        this.appsDiv.addEventListener("scroll", () => this.fetchNextBatchIfNecessary());
        this.element.append(this.appsDiv);
        this.moreDiv = document.createElement("div");
        this.moreDiv.classList.add("retro-store-more");
        this.moreDiv.append((0,_Utils__WEBPACK_IMPORTED_MODULE_2__.makeIcon)("cached"));
        this.populateApps();
        // If the window is resized, it might reveal slots to load.
        window.addEventListener("resize", () => this.fetchNextBatchIfNecessary());
    }
    onShow() {
        // When showing the tab, wait for layout and maybe fetch more.
        setTimeout(() => this.fetchNextBatchIfNecessary(), 0);
    }
    /**
     * If the "More" section is visible, fetch more apps.
     */
    fetchNextBatchIfNecessary() {
        const moreVisible = this.moreDiv.getBoundingClientRect().top < this.appsDiv.getBoundingClientRect().bottom;
        if (moreVisible && !this.complete && !this.fetching) {
            this.fetchNextBatch();
        }
    }
    /**
     * Get the next batch of apps if necessary.
     */
    fetchNextBatch() {
        if (!this.complete) {
            this.fetching = true;
            fetchApps(this.apps.length, APP_FETCH_COUNT)
                .then(apps => {
                this.fetching = false;
                if (apps.length !== APP_FETCH_COUNT) {
                    // Got all apps.
                    this.complete = true;
                }
                this.apps.push(...apps.map(a => new RetroStoreApp(a)));
                this.populateApps();
                // See if we need to fetch any more.
                this.fetchNextBatchIfNecessary();
            })
                .catch(error => {
                // TODO.
                console.error(error);
                this.fetching = false;
                this.complete = true;
            });
        }
    }
    /**
     * Populate the UI with the apps we have.
     */
    populateApps() {
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_1__.clearElement)(this.appsDiv);
        for (const app of this.apps) {
            if (app.element === undefined) {
                app.element = this.createAppTile(app.app);
            }
            this.appsDiv.append(app.element);
        }
        if (!this.complete) {
            this.appsDiv.append(this.moreDiv);
        }
    }
    /**
     * Create a tile for an app.
     */
    createAppTile(app) {
        var _a;
        const appDiv = document.createElement("div");
        appDiv.classList.add("retro-store-app");
        const screenshotDiv = document.createElement("img");
        screenshotDiv.classList.add("screenshot");
        if (app.screenshot_url !== undefined && app.screenshot_url.length > 0) {
            screenshotDiv.src = app.screenshot_url[0];
        }
        appDiv.append(screenshotDiv);
        const nameDiv = document.createElement("div");
        nameDiv.classList.add("name");
        const appName = (_a = app.name) !== null && _a !== void 0 ? _a : "Unknown name";
        nameDiv.innerText = appName;
        if (app.release_year !== undefined) {
            const releaseYearSpan = document.createElement("span");
            releaseYearSpan.classList.add("release-year");
            releaseYearSpan.innerText = " (" + app.release_year + ")";
            nameDiv.append(releaseYearSpan);
        }
        appDiv.append(nameDiv);
        if (app.author !== undefined && app.author !== "") {
            const authorDiv = document.createElement("div");
            authorDiv.classList.add("author");
            authorDiv.innerText = app.author;
            appDiv.append(authorDiv);
        }
        if (app.version !== undefined && app.version !== "") {
            const versionDiv = document.createElement("div");
            versionDiv.classList.add("version");
            versionDiv.innerText = "Version " + app.version;
            appDiv.append(versionDiv);
        }
        if (app.description !== undefined && app.description !== "") {
            const descriptionDiv = document.createElement("div");
            descriptionDiv.classList.add("description");
            descriptionDiv.innerText = app.description;
            appDiv.append(descriptionDiv);
        }
        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("button-set");
        appDiv.append(buttonDiv);
        let validMediaImage = undefined;
        const playButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_2__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_2__.makeIcon)("play_arrow"), "Run app", () => {
            if (validMediaImage !== undefined && validMediaImage.data !== undefined) {
                const cmdProgram = (0,trs80_base__WEBPACK_IMPORTED_MODULE_3__.decodeTrs80File)(validMediaImage.data, validMediaImage.filename);
                // TODO should set context.runningFile
                this.context.trs80.runTrs80File(cmdProgram);
                this.context.panelManager.close();
            }
        });
        playButton.disabled = true;
        buttonDiv.append(playButton);
        const importButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_2__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_2__.makeIcon)("get_app"), "Import app", () => {
            var _a, _b;
            if (validMediaImage !== undefined && validMediaImage.data !== undefined && this.context.user !== undefined) {
                const noteParts = [];
                if (app.description !== undefined && app.description !== "") {
                    noteParts.push(app.description);
                }
                if (validMediaImage.description !== undefined && validMediaImage.description !== "") {
                    noteParts.push(validMediaImage.description);
                }
                noteParts.push("Imported from RetroStore.org.");
                const note = noteParts.join("\n\n");
                let file = new _File__WEBPACK_IMPORTED_MODULE_4__.FileBuilder()
                    .withUid(this.context.user.uid)
                    .withName(appName)
                    .withNote(note)
                    .withAuthor((_a = app.author) !== null && _a !== void 0 ? _a : "")
                    .withReleaseYear(app.release_year === undefined ? "" : app.release_year.toString())
                    .withTags(["RetroStore"])
                    .withFilename((_b = validMediaImage.filename) !== null && _b !== void 0 ? _b : "UNKNOWN")
                    .withBinary(validMediaImage.data)
                    .build();
                this.context.db.addFile(file)
                    .then(docRef => {
                    file = file.builder().withId(docRef.id).build();
                    this.context.library.addFile(file);
                    this.context.openFilePanel(file);
                })
                    .catch(error => {
                    // TODO
                    console.error("Error adding document: ", error);
                });
            }
        });
        importButton.classList.add("import-button");
        importButton.disabled = true;
        buttonDiv.append(importButton);
        if (app.id !== undefined) {
            fetchMediaImages(app.id)
                .then(mediaImages => {
                console.log(app.id, app.name, mediaImages);
                for (const mediaImage of mediaImages) {
                    if (mediaImage.type === "COMMAND" /* COMMAND */ ||
                        mediaImage.type === "BASIC" /* BASIC */ ||
                        mediaImage.type === "DISK" /* DISK */) {
                        validMediaImage = mediaImage;
                        playButton.disabled = false;
                        importButton.disabled = false;
                        break;
                    }
                }
            })
                .catch(error => {
                // TODO. Caught already?
                console.error(error);
            });
        }
        return appDiv;
    }
}


/***/ }),

/***/ "./src/Sha1.ts":
/*!*********************!*\
  !*** ./src/Sha1.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sha1": () => (/* binding */ sha1)
/* harmony export */ });
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(z80_base__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Rotate the 32-bit value left "count" bits.
 */
function rotateLeft(value, count) {
    return ((value << count) | (value >>> (32 - count))) & 0xFFFFFFFF;
}
/**
 * Compute the SHA-1 hash of the byte array.
 *
 * https://en.wikipedia.org/wiki/SHA-1
 *
 * @return the hash as a hex string.
 */
function sha1(bytes) {
    // Make sure we have a multiple of 64 bytes. Make space for the 0x80 byte and the 64-bit length.
    let newLength = bytes.length + 9;
    if (newLength % 64 !== 0) {
        newLength += 64 - newLength % 64;
    }
    const newBytes = new Uint8Array(newLength);
    newBytes.set(bytes);
    const view = new DataView(newBytes.buffer);
    // Add the 0x80 byte.
    newBytes[bytes.length] = 0x80;
    // Add the length. This is a 64-bit number but we don't have binaries that need more than 32 bits.
    view.setUint32(newBytes.length - 4, bytes.length * 8, false);
    // Reusable array for each chunk.
    const w = new Uint32Array(80);
    // Initial hash value.
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4 = 0xC3D2E1F0;
    // Process in 512-bit chunks.
    const wordCount = newBytes.length / 4;
    for (let wordOffset = 0; wordOffset < wordCount; wordOffset += 16) {
        // Hash value for this chunk.
        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        for (let i = 0; i < 80; i++) {
            w[i] = i < 16
                ? view.getUint32((wordOffset + i) * 4, false)
                : rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
            let f;
            let k;
            if (i < 20) {
                f = (b & c) | (~b & d);
                k = 0x5A827999;
            }
            else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            }
            else if (i < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            }
            else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            const temp = rotateLeft(a, 5) + f + e + k + w[i];
            e = d;
            d = c;
            c = rotateLeft(b, 30);
            b = a;
            a = temp;
        }
        // Add this chunk's hash to result so far.
        h0 = (h0 + a) & 0xFFFFFFFF;
        h1 = (h1 + b) & 0xFFFFFFFF;
        h2 = (h2 + c) & 0xFFFFFFFF;
        h3 = (h3 + d) & 0xFFFFFFFF;
        h4 = (h4 + e) & 0xFFFFFFFF;
    }
    // Convert to a string.
    return [h0, h1, h2, h3, h4].map(z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexLong).join("");
}


/***/ }),

/***/ "./src/SystemProgramTab.ts":
/*!*********************************!*\
  !*** ./src/SystemProgramTab.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemProgramTab": () => (/* binding */ SystemProgramTab)
/* harmony export */ });
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
/* harmony import */ var z80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(z80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var trs80_emulator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! trs80-emulator */ "./node_modules/trs80-emulator/dist/index.js");





/**
 * Add text to the line with the specified class.
 *
 * @param out the enclosing element to add to.
 * @param text the text to add.
 * @param className the name of the class for the item.
 */
function add(out, text, className) {
    const e = document.createElement("span");
    e.innerText = text;
    e.classList.add(className);
    out.appendChild(e);
    return e;
}
/**
 * Tab for displaying chunks of system files.
 */
class SystemProgramTab extends _PageTab__WEBPACK_IMPORTED_MODULE_1__.PageTab {
    constructor(systemProgram) {
        super("System");
        this.systemProgram = systemProgram;
        this.element.classList.add("system-program-tab");
        const outer = document.createElement("div");
        outer.classList.add("system-program-outer");
        this.element.append(outer);
        this.innerElement = document.createElement("div");
        this.innerElement.classList.add("system-program");
        outer.append(this.innerElement);
    }
    onFirstShow() {
        this.generateSystemProgram();
    }
    generateSystemProgram() {
        const lines = [];
        const systemProgram = this.systemProgram;
        if (systemProgram.error !== undefined) {
            const line = document.createElement("div");
            lines.push(line);
            add(line, systemProgram.error, "system-program-error");
        }
        // Prepare screenshot, in case loading process writes to screen.
        const screen = new trs80_emulator__WEBPACK_IMPORTED_MODULE_4__.CanvasScreen();
        let wroteToScreen = false;
        // Display a row for each chunk.
        let programAddress = undefined;
        for (const chunk of systemProgram.chunks) {
            const line = document.createElement("div");
            lines.push(line);
            // Address and length.
            let length = chunk.data.length;
            let text = (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(chunk.loadAddress) + "-" + (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(chunk.loadAddress + length - 1) +
                " (" + length + " byte" + (length === 1 ? "" : "s") + ")";
            text = text.padEnd(23, " ");
            add(line, text, "system-program-address");
            // First few bytes.
            const bytes = chunk.data.slice(0, Math.min(3, length));
            text = Array.from(bytes).map(z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexByte).join(" ") + (bytes.length < length ? " ..." : "");
            text = text.padEnd(14, " ");
            add(line, text, "system-program-hex");
            // Write explanation.
            if (chunk.loadAddress >= trs80_base__WEBPACK_IMPORTED_MODULE_2__.TRS80_SCREEN_BEGIN && chunk.loadAddress + chunk.data.length <= trs80_base__WEBPACK_IMPORTED_MODULE_2__.TRS80_SCREEN_END) {
                add(line, "Screen", "system-program-explanation");
                if (!wroteToScreen) {
                    add(line, " (see screenshot above)", "system-program-highlight");
                }
                for (let i = 0; i < length; i++) {
                    screen.writeChar(chunk.loadAddress + i, chunk.data[i]);
                }
                wroteToScreen = true;
            }
            else if (chunk.loadAddress === 0x4210) {
                add(line, "Port 0xEC bitmask", "system-program-explanation");
            }
            else if (chunk.loadAddress === 0x401E) {
                add(line, "Video driver pointer", "system-program-explanation");
            }
            else {
                add(line, "Program code", "system-program-explanation");
                if (programAddress !== undefined && chunk.loadAddress !== programAddress) {
                    add(line, " (not contiguous, expected " + (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(programAddress) + ")", "system-program-highlight");
                }
                programAddress = chunk.loadAddress + length;
            }
            if (!chunk.isChecksumValid()) {
                add(line, " (invalid checksum)", "system-program-highlight");
            }
        }
        const entryPointDiv = document.createElement("div");
        entryPointDiv.classList.add("system-program-entry-point");
        lines.push(entryPointDiv);
        add(entryPointDiv, "Entry point: ", "system-program-explanation");
        add(entryPointDiv, (0,z80_base__WEBPACK_IMPORTED_MODULE_0__.toHexWord)(systemProgram.entryPointAddress), "system-program-address");
        if (wroteToScreen) {
            const screenDiv = document.createElement("div");
            screenDiv.classList.add("system-program-screenshot");
            screen.asImageAsync().then(image => screenDiv.append(image));
            lines.unshift(screenDiv);
        }
        // Add the lines all at once.
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_3__.clearElement)(this.innerElement);
        this.innerElement.append(...lines);
    }
}


/***/ }),

/***/ "./src/TabbedPanel.ts":
/*!****************************!*\
  !*** ./src/TabbedPanel.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TabbedPanel": () => (/* binding */ TabbedPanel)
/* harmony export */ });
/* harmony import */ var _Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Panel */ "./src/Panel.ts");
/* harmony import */ var _PageTabs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PageTabs */ "./src/PageTabs.ts");


/**
 * Panel that has page tabs.
 */
class TabbedPanel extends _Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(context, title, panelCssClass, showBackButton) {
        super(context, title, panelCssClass, showBackButton);
        this.pageTabs = new _PageTabs__WEBPACK_IMPORTED_MODULE_1__.PageTabs(this.content);
    }
    onPanelDestroy() {
        this.pageTabs.destroy();
        super.onPanelDestroy();
    }
    onKeyDown(e) {
        return this.pageTabs.onKeyDown(e) || super.onKeyDown(e);
    }
}


/***/ }),

/***/ "./src/TagSet.ts":
/*!***********************!*\
  !*** ./src/TagSet.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TagSet": () => (/* binding */ TagSet)
/* harmony export */ });
/**
 * Compare two tags for sorting.
 */
function compareTags(t1, t2) {
    return t1.localeCompare(t2, undefined, {
        usage: "sort",
        sensitivity: "base",
        numeric: true,
    });
}
/**
 * Manages a set of tags for a File.
 */
class TagSet {
    constructor() {
        this.tagSet = new Set();
    }
    /**
     * Whether this tag set is empty (has no tags).
     */
    isEmpty() {
        return this.tagSet.size === 0;
    }
    /**
     * Add the given tags to this set.
     */
    add(...tags) {
        for (const tag of tags) {
            this.tagSet.add(tag);
        }
    }
    /**
     * Add the tags from the other tag set to this set.
     */
    addAll(tags) {
        for (const tag of tags.tagSet) {
            this.tagSet.add(tag);
        }
    }
    /**
     * Whether this tag set contains the specified tag.
     */
    has(tag) {
        return this.tagSet.has(tag);
    }
    /**
     * Whether this tag set has all of the tags in the other tag set.
     */
    hasAll(tags) {
        for (const tag of tags.tagSet) {
            if (!this.has(tag)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Whether this tag set has any of the tags in the other tag set.
     */
    hasAny(tags) {
        for (const tag of tags.tagSet) {
            if (this.has(tag)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Remove the tag, returning whether it was in the set before.
     */
    remove(tag) {
        return this.tagSet.delete(tag);
    }
    /**
     * Remove all tags from this tag set.
     */
    clear() {
        this.tagSet.clear();
    }
    /**
     * Returns a sorted array of the tags.
     */
    asArray() {
        const tags = [];
        for (const tag of this.tagSet) {
            tags.push(tag);
        }
        tags.sort(compareTags);
        return tags;
    }
}


/***/ }),

/***/ "./src/TrsdosTab.ts":
/*!**************************!*\
  !*** ./src/TrsdosTab.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TrsdosTab": () => (/* binding */ TrsdosTab)
/* harmony export */ });
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/* harmony import */ var trs80_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(trs80_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./File */ "./src/File.ts");
/* harmony import */ var jszip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! jszip */ "./node_modules/jszip/dist/jszip.min.js");
/* harmony import */ var jszip__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(jszip__WEBPACK_IMPORTED_MODULE_5__);






/**
 * Handles the TRSDOS tab in the file panel.
 */
class TrsdosTab extends _PageTab__WEBPACK_IMPORTED_MODULE_1__.PageTab {
    constructor(filePanel, trsdos) {
        super("TRSDOS");
        this.element.classList.add("trsdos-tab");
        const mainContents = document.createElement("div");
        mainContents.classList.add("trsdos");
        this.element.append(mainContents);
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("info");
        const addField = (label, value, cssClass) => {
            const labelSpan = document.createElement("div");
            labelSpan.classList.add(cssClass + "-label", "label");
            labelSpan.innerText = label + ":";
            infoDiv.append(labelSpan);
            const valueSpan = document.createElement("div");
            valueSpan.classList.add(cssClass, "value");
            if (value === "") {
                valueSpan.classList.add("empty-field");
                valueSpan.innerText = "None";
            }
            else {
                valueSpan.innerText = value;
            }
            infoDiv.append(valueSpan);
        };
        addField("Disk name", trsdos.gatInfo.name, "name");
        addField("Date", trsdos.gatInfo.date, "date");
        addField("Auto command", trsdos.gatInfo.autoCommand, "auto-command");
        mainContents.append(infoDiv);
        // Add directory.
        const dirDiv = document.createElement("div");
        dirDiv.classList.add("dir");
        mainContents.append(dirDiv);
        const addDirEntryField = (value, ...cssClass) => {
            const dirEntry = document.createElement("div");
            dirEntry.classList.add(...cssClass);
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
            const extraCssClasses = [];
            if (dirEntry.isHidden()) {
                extraCssClasses.push("hidden-file");
            }
            if (dirEntry.getExtension() === "CMD") {
                extraCssClasses.push("executable-file");
            }
            addDirEntryField(dirEntry.getFilename("/"), ...["filename", ...extraCssClasses]);
            addDirEntryField((0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_2__.withCommas)(dirEntry.getSize()), ...["size", ...extraCssClasses]);
            addDirEntryField(dirEntry.getDateString(), ...["date", ...extraCssClasses]);
            addDirEntryField((0,trs80_base__WEBPACK_IMPORTED_MODULE_0__.trsdosProtectionLevelToString)(dirEntry.getProtectionLevel()), ...["protection-level", ...extraCssClasses]);
            const playButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIcon)("play_arrow");
            playButton.classList.add(...["run", ...extraCssClasses]);
            playButton.addEventListener("click", () => {
                const binary = trsdos.readFile(dirEntry);
                const program = (0,trs80_base__WEBPACK_IMPORTED_MODULE_0__.decodeTrs80File)(binary, dirEntry.getFilename("."));
                // Not quite the right file, but makes screenshots go to the floppy.
                filePanel.context.runningFile = filePanel.file;
                filePanel.context.trs80.runTrs80File(program);
                filePanel.context.panelManager.close();
            });
            dirDiv.append(playButton);
            // TODO this breaks the grid.
            const user = filePanel.context.user;
            if (user !== undefined) {
                const importButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIcon)("get_app");
                importButton.classList.add(...["import", ...extraCssClasses]);
                importButton.addEventListener("click", () => {
                    const binary = trsdos.readFile(dirEntry);
                    let file = new _File__WEBPACK_IMPORTED_MODULE_4__.FileBuilder()
                        .withUid(user.uid)
                        .withName(dirEntry.getBasename())
                        .withNote(`Imported from "${filePanel.file.name}" floppy disk.`)
                        .withAuthor(filePanel.file.author)
                        .withReleaseYear(dirEntry.year > 75 ? (1900 + dirEntry.year).toString() : filePanel.file.releaseYear)
                        .withFilename(dirEntry.getFilename("."))
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
        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        this.element.append(actionBar);
        // Make a ZIP file for export.
        const exportZipButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTextButton)("Export ZIP", "get_app", "export-zip-button", () => {
            const zip = new (jszip__WEBPACK_IMPORTED_MODULE_5___default())();
            for (const dirEntry of trsdos.dirEntries) {
                zip.file(dirEntry.getFilename("."), trsdos.readFile(dirEntry), {
                    date: dirEntry.getDate(),
                });
            }
            zip.generateAsync({
                type: "blob",
            })
                .then(blob => {
                let filename = filePanel.file.filename;
                let i = filename.lastIndexOf("/");
                if (i >= 0) {
                    // Strip path.
                    filename = filename.substr(i + 1);
                }
                i = filename.lastIndexOf(".");
                if (i > 0) {
                    // Strip existing extension.
                    filename = filename.substr(0, i);
                }
                if (filename === "") {
                    filename = "trsdos";
                }
                filename += ".zip";
                const a = document.createElement("a");
                a.href = window.URL.createObjectURL(blob);
                a.download = filename;
                a.click();
            });
        });
        actionBar.append(exportZipButton);
    }
}


/***/ }),

/***/ "./src/User.ts":
/*!*********************!*\
  !*** ./src/User.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AuthUser": () => (/* binding */ AuthUser),
/* harmony export */   "User": () => (/* binding */ User)
/* harmony export */ });
/**
 * The user from the perspective of the auth system.
 */
class AuthUser {
    constructor(uid, emailAddress, name) {
        this.uid = uid;
        this.emailAddress = emailAddress;
        this.name = name;
    }
    /**
     * Upgrade an authdata to a full user based on data from the database.
     */
    toUser(data) {
        const changed = this.emailAddress !== data.emailAddress || this.name !== data.name;
        return new User(this.uid, this.emailAddress, this.name, data.admin, data.addedAt, changed ? new Date() : data.modifiedAt, data.lastActiveAt);
    }
    /**
     * Promote a new auth user to a full user.
     */
    toNewUser() {
        const now = new Date();
        return new User(this.uid, this.emailAddress, this.name, false, now, now, now);
    }
    /**
     * Make a new AuthUser from a Firebase user.
     */
    static fromFirebaseUser(firebaseUser) {
        var _a, _b;
        return new AuthUser(firebaseUser.uid, (_a = firebaseUser.email) !== null && _a !== void 0 ? _a : "", (_b = firebaseUser.displayName) !== null && _b !== void 0 ? _b : "");
    }
}
/**
 * Represents a user in our database, both basic data such as ID, as well as user preferences.
 */
class User extends AuthUser {
    constructor(uid, emailAddress, name, admin, addedAt, modifiedAt, lastActiveAt) {
        super(uid, emailAddress, name);
        this.admin = admin;
        this.addedAt = addedAt;
        this.modifiedAt = modifiedAt;
        this.lastActiveAt = lastActiveAt;
    }
}


/***/ }),

/***/ "./src/Utils.ts":
/*!**********************!*\
  !*** ./src/Utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TRASH_TAG": () => (/* binding */ TRASH_TAG),
/* harmony export */   "defer": () => (/* binding */ defer),
/* harmony export */   "formatDate": () => (/* binding */ formatDate),
/* harmony export */   "makeIcon": () => (/* binding */ makeIcon),
/* harmony export */   "makeIconButton": () => (/* binding */ makeIconButton),
/* harmony export */   "makeCloseIconButton": () => (/* binding */ makeCloseIconButton),
/* harmony export */   "makeTextButton": () => (/* binding */ makeTextButton),
/* harmony export */   "getLabelNodeForTextButton": () => (/* binding */ getLabelNodeForTextButton),
/* harmony export */   "makeTagCapsule": () => (/* binding */ makeTagCapsule),
/* harmony export */   "isSameStringArray": () => (/* binding */ isSameStringArray)
/* harmony export */ });
const MATERIAL_ICONS_CLASS = "material-icons-round";
// Name of tag we use for files in the trash.
const TRASH_TAG = "Trash";
// Functions to call.
const deferredFunctions = [];
// Whether we've already created a timer to call the deferred functions.
let deferredFunctionsScheduled = false;
/**
 * Defer a function until later. All deferred functions are queued up and
 * executed sequentially, in order.
 */
function defer(f) {
    // Add our function in order.
    deferredFunctions.push(f);
    // Call the next deferred function.
    const timeoutCallback = () => {
        const deferredFunction = deferredFunctions.shift();
        if (deferredFunction === undefined) {
            deferredFunctionsScheduled = false;
        }
        else {
            // Make sure we don't kill the process if the function throws.
            try {
                deferredFunction();
            }
            finally {
                setTimeout(timeoutCallback, 0);
            }
        }
    };
    // Kick it all off if necessary.
    if (!deferredFunctionsScheduled) {
        setTimeout(timeoutCallback, 0);
        deferredFunctionsScheduled = true;
    }
}
/**
 * Format a long date without a time.
 */
function formatDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
/**
 * Make a material design icon with the given name.
 *
 * https://google.github.io/material-design-icons/
 * https://material.io/resources/icons/?style=round
 */
function makeIcon(name) {
    const icon = document.createElement("i");
    icon.classList.add(MATERIAL_ICONS_CLASS);
    icon.classList.add("material-icons-override");
    if (name === "edit") {
        // Icon is too large.
        icon.classList.add("smaller-icon");
    }
    icon.innerText = name;
    return icon;
}
/**
 * Make a generic round button.
 */
function makeIconButton(icon, title, clickCallback) {
    const button = document.createElement("button");
    button.classList.add("icon-button");
    button.title = title;
    button.append(icon);
    button.addEventListener("click", clickCallback);
    return button;
}
/**
 * Make a float-right close button for dialog boxes.
 */
function makeCloseIconButton(closeCallback) {
    const button = makeIconButton(makeIcon("close"), "Close window (ESC)", closeCallback);
    button.classList.add("close-button");
    return button;
}
const TEXT_BUTTON_LABEL_CLASS = "text-button-label";
function makeTextButton(label, iconName, cssClass, clickCallback) {
    const button = document.createElement("button");
    button.classList.add("text-button", cssClass);
    // Add text.
    const labelNode = document.createElement("span");
    labelNode.classList.add(TEXT_BUTTON_LABEL_CLASS);
    labelNode.innerText = label;
    button.append(labelNode);
    // Add icons.
    if (iconName !== undefined) {
        if (typeof iconName === "string") {
            iconName = [iconName];
        }
        for (const i of iconName) {
            const icon = document.createElement("i");
            icon.classList.add(MATERIAL_ICONS_CLASS);
            icon.innerText = i;
            button.append(icon);
        }
    }
    // Action.
    if (clickCallback !== undefined) {
        button.addEventListener("click", clickCallback);
    }
    return button;
}
/**
 * Get the label node for a text button created by {@link makeTextButton}.
 */
function getLabelNodeForTextButton(button) {
    return button.querySelector("." + TEXT_BUTTON_LABEL_CLASS);
}
/**
 * Compute a hash for the tag string. See the "tag-#" CSS classes.
 */
function computeTagColor(tag) {
    if (tag === TRASH_TAG) {
        return "trash";
    }
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = (hash * 37 + tag.charCodeAt(i)) & 0xFFFFFFFF;
    }
    if (hash < 0) {
        hash += 0x100000000;
    }
    return (hash % 6).toString();
}
/**
 * Make a capsule to display a tag.
 */
function makeTagCapsule(options) {
    // The capsule itself.
    const capsule = document.createElement("div");
    capsule.classList.add("tag", "tag-" + computeTagColor(options.tag));
    if (options.exclude) {
        capsule.classList.add("tag-exclude");
    }
    if (options.faint) {
        capsule.classList.add("tag-faint");
    }
    // The text.
    const capsuleText = document.createElement("span");
    capsuleText.classList.add("tag-text");
    capsuleText.innerText = options.tag;
    capsule.append(capsuleText);
    // The icon.
    if (options.iconName !== undefined) {
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add(MATERIAL_ICONS_CLASS);
        deleteIcon.innerText = options.iconName;
        capsule.append(deleteIcon);
    }
    // The X for exclude.
    if (options.exclude) {
        const excludeIcon = document.createElement("i");
        excludeIcon.classList.add(MATERIAL_ICONS_CLASS, "tag-exclude-icon");
        excludeIcon.innerText = "clear";
        capsule.append(excludeIcon);
    }
    // Action.
    const clickCallback = options.clickCallback;
    if (clickCallback !== undefined) {
        capsule.addEventListener("click", e => {
            clickCallback(e);
            e.preventDefault();
            e.stopPropagation();
        });
        capsule.classList.add("tag-clickable");
    }
    return capsule;
}
/**
 * Returns whether two string arrays are the same.
 *
 * Lodash has isEqual(), but it adds about 15 kB after minimization! (It's a deep comparison
 * that has to deal with all sorts of data types.)
 */
function isSameStringArray(a, b) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}


/***/ }),

/***/ "./src/YourFilesTab.ts":
/*!*****************************!*\
  !*** ./src/YourFilesTab.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "YourFilesTab": () => (/* binding */ YourFilesTab)
/* harmony export */ });
/* harmony import */ var _Library__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Library */ "./src/Library.ts");
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./File */ "./src/File.ts");
/* harmony import */ var trs80_emulator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! trs80-emulator */ "./node_modules/trs80-emulator/dist/index.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! teamten-ts-utils */ "./node_modules/teamten-ts-utils/dist/index.js");
/* harmony import */ var teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _PageTab__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PageTab */ "./src/PageTab.ts");
/* harmony import */ var _TagSet__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TagSet */ "./src/TagSet.ts");







const FILE_ID_ATTR = "data-file-id";
const IMPORT_FILE_LABEL = "Import File";
/**
 * Quotes for the "no filter" error page.
 */
const NO_FILTER_QUOTE = [
    "No dance for you.",
    "I'm disappointed.",
    "Try being less demanding.",
    "And it's not for lack of trying.",
    "Try doing literally anything else.",
];
/**
 * Get a random quote for the "no filter" error page.
 */
function getRandomNoFilterQuote() {
    return NO_FILTER_QUOTE[Math.floor(Math.random() * NO_FILTER_QUOTE.length)];
}
/**
 * A TRS-80-like cursor in HTML.
 */
class AuthenticCursor {
    constructor() {
        this.visible = true;
        this.node = document.createElement("span");
        this.node.classList.add("authentic-cursor");
        this.update();
        this.handle = window.setInterval(() => {
            this.visible = !this.visible;
            this.update();
        }, AuthenticCursor.BLINK_PERIOD_MS);
    }
    /**
     * Stop the cursor. Only call this once.
     */
    disable() {
        this.node.remove();
        window.clearInterval(this.handle);
    }
    /**
     * Set the correct block for the current visibility.
     */
    update() {
        if (this.visible) {
            this.node.innerText = "\uE0B0"; // 131, bottom two pixels.
        }
        else {
            this.node.innerText = "\uE080"; // 128, blank.
        }
    }
}
// This is 7 ticks of the Model III timer (30 Hz).
AuthenticCursor.BLINK_PERIOD_MS = 233;
/**
 * Tap for the Your Files UI.
 */
class YourFilesTab extends _PageTab__WEBPACK_IMPORTED_MODULE_5__.PageTab {
    constructor(context, pageTabs) {
        super("Your Files", context.user !== undefined);
        this.emptyQuote = undefined;
        // If empty, show all files except Trash. Otherwise show only files that have all of these tags.
        this.includeTags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
        // Exclude files that have any of these tags.
        this.excludeTags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
        this.searchString = "";
        this.forceShowSearch = false;
        this.searchCursor = undefined;
        this.libraryInSync = false;
        this.context = context;
        // Make this blank screen synchronously so that it's immediately available when populating the file list.
        this.blankScreen = new trs80_emulator__WEBPACK_IMPORTED_MODULE_2__.CanvasScreen().asImage();
        this.element.classList.add("your-files-tab");
        context.onUser.subscribe(user => {
            this.visible = user !== undefined;
            pageTabs.configurationChanged();
        });
        this.filesDiv = document.createElement("div");
        this.filesDiv.classList.add("files");
        this.element.append(this.filesDiv);
        this.emptyLibrary = document.createElement("div");
        this.emptyLibrary.classList.add("empty-library");
        this.element.append(this.emptyLibrary);
        this.emptyTitle = document.createElement("h2");
        this.emptyBody = document.createElement("article");
        const demon = document.createElement("img");
        demon.src = "/demon.png";
        this.emptyLibrary.append(this.emptyTitle, this.emptyBody, demon);
        // Register for changes to library.
        this.libraryInSync = this.context.library.inSync;
        this.context.library.onEvent.subscribe(e => this.onLibraryEvent(e));
        this.context.library.onInSync.subscribe(inSync => this.onLibraryInSync(inSync));
        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        this.element.append(actionBar);
        this.openTrashButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTextButton)("Open Trash", "delete", "open-trash-button", () => this.openTrash());
        this.tagEditor = document.createElement("div");
        this.tagEditor.classList.add("tag-editor");
        this.searchButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTextButton)("Search", "search", "search-button", () => {
            this.forceShowSearch = true;
            this.refreshFilter();
        });
        const spacer = document.createElement("div");
        spacer.classList.add("action-bar-spacer");
        const exportAllButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTextButton)("Export All", "get_app", "export-all-button", () => this.exportAll());
        const uploadButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTextButton)(IMPORT_FILE_LABEL, "publish", "import-file-button", () => this.uploadFile());
        actionBar.append(this.openTrashButton, this.tagEditor, this.searchButton, spacer, exportAllButton, uploadButton);
        // Populate initial library state. Sort the files so that the screenshots get loaded in
        // display order and the top (visible) ones are done first.
        this.context.library.getAllFiles().sort(_File__WEBPACK_IMPORTED_MODULE_1__.File.compare).forEach(f => this.addFile(f));
        // Sort again anyway, since this updates various things.
        this.sortFiles();
    }
    onKeyDown(e) {
        // Plain letter.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            this.searchString += e.key;
            this.refreshFilter();
            return true;
        }
        else if (e.key === "Backspace" && this.searchString.length > 0) {
            // Backspace.
            if (e.ctrlKey || e.altKey) {
                // Backspace word. Mac uses Alt and Windows uses Ctrl, so support both.
                this.searchString = this.searchString.replace(/\S*\s*$/, "");
            }
            else if (e.metaKey) {
                // Backspace all.
                this.searchString = "";
            }
            else {
                // Backspace letter.
                this.searchString = this.searchString.substr(0, this.searchString.length - 1);
            }
            this.forceShowSearch = false;
            this.refreshFilter();
            return true;
        }
        return super.onKeyDown(e);
    }
    /**
     * Handle change to library files.
     */
    onLibraryEvent(event) {
        if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_0__.LibraryAddEvent) {
            this.addFile(event.newFile);
            this.sortFiles();
        }
        if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_0__.LibraryModifyEvent) {
            // Probably not worth modifying in-place.
            this.removeFile(event.oldFile.id);
            this.addFile(event.newFile);
            this.sortFiles();
        }
        if (event instanceof _Library__WEBPACK_IMPORTED_MODULE_0__.LibraryRemoveEvent) {
            this.removeFile(event.oldFile.id);
            this.refreshFilter();
        }
    }
    /**
     * React to whether library is now fully in sync.
     */
    onLibraryInSync(inSync) {
        this.libraryInSync = inSync;
        this.refreshFilter();
    }
    /**
     * Start a download of all data in the database.
     */
    exportAll() {
        // Download info about all files.
        const allFiles = {
            version: 1,
            files: this.context.library.getAllFiles().map(f => f.asMap()),
        };
        const contents = JSON.stringify(allFiles);
        const blob = new Blob([contents], { type: "application/json" });
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "my-trs-80.json";
        a.click();
    }
    /**
     * Configure and open the "open file" dialog for importing files.
     */
    uploadFile() {
        const uploadElement = document.createElement("input");
        uploadElement.type = "file";
        uploadElement.accept = ".cas, .bas, .cmd, .dmk, .dsk, .jv1, .jv3, .3bn";
        uploadElement.multiple = true;
        uploadElement.addEventListener("change", () => {
            var _a;
            const user = this.context.user;
            if (user === undefined) {
                console.error("Can't import with signed-out user");
                return;
            }
            const files = (_a = uploadElement.files) !== null && _a !== void 0 ? _a : [];
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
    importFile(uid, filename, binary, openFilePanel) {
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
        let file = new _File__WEBPACK_IMPORTED_MODULE_1__.FileBuilder()
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
                this.context.openFilePanel(file);
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
    addFile(file) {
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("file");
        fileDiv.setAttribute(FILE_ID_ATTR, file.id);
        this.filesDiv.append(fileDiv);
        const screenshotsDiv = document.createElement("div");
        screenshotsDiv.classList.add("screenshots");
        fileDiv.append(screenshotsDiv);
        screenshotsDiv.append(this.blankScreen.cloneNode(true));
        (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.defer)(() => {
            const screen = new trs80_emulator__WEBPACK_IMPORTED_MODULE_2__.CanvasScreen();
            if (file.screenshots.length > 0) {
                screen.displayScreenshot(file.screenshots[0]);
            }
            else {
                screenshotsDiv.classList.add("missing");
            }
            screen.asImageAsync().then(image => {
                (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4__.clearElement)(screenshotsDiv);
                screenshotsDiv.append(image);
            });
        });
        const nameDiv = document.createElement("div");
        nameDiv.classList.add("name");
        nameDiv.innerText = file.name;
        if (file.releaseYear !== "") {
            const releaseYearSpan = document.createElement("span");
            releaseYearSpan.classList.add("release-year");
            releaseYearSpan.innerText = " (" + file.releaseYear + ")";
            nameDiv.append(releaseYearSpan);
        }
        fileDiv.append(nameDiv);
        const filenameDiv = document.createElement("div");
        filenameDiv.classList.add("filename");
        filenameDiv.innerText = file.filename;
        fileDiv.append(filenameDiv);
        const noteDiv = document.createElement("div");
        noteDiv.classList.add("note");
        noteDiv.innerText = [file.author, file.note].filter(field => field !== "").join(" — ");
        fileDiv.append(noteDiv);
        const tagsDiv = document.createElement("span");
        tagsDiv.classList.add("tags");
        for (const tag of file.getAllTags().asArray()) {
            tagsDiv.append((0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTagCapsule)({
                tag: tag,
                clickCallback: (e) => {
                    if (e.shiftKey) {
                        this.excludeTags.add(tag);
                    }
                    else {
                        this.includeTags.add(tag);
                    }
                    this.refreshFilter();
                },
            }));
        }
        fileDiv.append(tagsDiv);
        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("buttons");
        fileDiv.append(buttonsDiv);
        const playButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIcon)("play_arrow"), "Run program", () => {
            this.context.runProgram(file);
            this.context.panelManager.close();
        });
        playButton.classList.add("play-button");
        buttonsDiv.append(playButton);
        const infoButton = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIconButton)((0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeIcon)("edit"), "File information", () => {
            this.context.openFilePanel(file);
        });
        infoButton.classList.add("info-button");
        buttonsDiv.append(infoButton);
    }
    /**
     * Remove a file from the UI by its ID.
     */
    removeFile(fileId) {
        const element = this.getFileElementById(fileId);
        if (element !== undefined) {
            element.remove();
        }
        else {
            console.error("removeFile(): No element with file ID " + fileId);
        }
    }
    /**
     * Update the hidden flags based on a new tag filter.
     */
    refreshFilter() {
        let anyFiles = false;
        let anyVisible = false;
        // Parse out the search terms.
        const searchWords = this.searchString.split(/\W+/).filter(s => s !== "");
        if (false) {}
        // Update hidden.
        for (const fileDiv of this.filesDiv.children) {
            let hidden = false;
            const fileId = fileDiv.getAttribute(FILE_ID_ATTR);
            if (fileId !== null) {
                const file = this.context.library.getFile(fileId);
                if (file !== undefined) {
                    anyFiles = true;
                    const fileTags = file.getAllTags();
                    // Only show files that have all the filter items.
                    if (!this.includeTags.isEmpty() && !fileTags.hasAll(this.includeTags)) {
                        hidden = true;
                    }
                    // If we're not explicitly filtering for trash, hide files in the trash.
                    if (!this.includeTags.has(_Utils__WEBPACK_IMPORTED_MODULE_3__.TRASH_TAG) && fileTags.has(_Utils__WEBPACK_IMPORTED_MODULE_3__.TRASH_TAG)) {
                        hidden = true;
                    }
                    // Excluded tags.
                    if (fileTags.hasAny(this.excludeTags)) {
                        hidden = true;
                    }
                    // Must match every word.
                    if (!searchWords.every(word => file.matchesFilterPrefix(word))) {
                        hidden = true;
                    }
                }
            }
            fileDiv.classList.toggle("hidden", hidden);
            if (!hidden) {
                anyVisible = true;
            }
        }
        // Update whether the splash screen is shown.
        let displaySplashScreen;
        if (this.libraryInSync) {
            if (anyFiles) {
                if (anyVisible) {
                    displaySplashScreen = false;
                    this.emptyQuote = undefined;
                }
                else {
                    displaySplashScreen = true;
                    this.emptyTitle.innerText = "No files match your filter.";
                    if (this.emptyQuote === undefined) {
                        this.emptyQuote = getRandomNoFilterQuote();
                    }
                    this.emptyBody.innerText = this.emptyQuote;
                }
            }
            else {
                displaySplashScreen = true;
                this.emptyTitle.innerText = "You have no files in your library!";
                this.emptyBody.innerHTML = `Upload a file from your computer using the “${IMPORT_FILE_LABEL.replace(/ /g, "&nbsp;")}” button below, or import one from the RetroStore tab.`;
            }
        }
        else {
            // Just show nothing at all while loading the library.
            displaySplashScreen = false;
        }
        this.filesDiv.classList.toggle("hidden", displaySplashScreen);
        this.emptyLibrary.classList.toggle("hidden", !displaySplashScreen);
        // Update filter UI in the action bar.
        const allTags = new _TagSet__WEBPACK_IMPORTED_MODULE_6__.TagSet();
        allTags.addAll(this.includeTags);
        allTags.addAll(this.excludeTags);
        if (allTags.isEmpty()) {
            this.tagEditor.classList.add("hidden");
            this.openTrashButton.classList.toggle("hidden", !this.anyFileInTrash());
        }
        else {
            this.tagEditor.classList.remove("hidden");
            this.openTrashButton.classList.add("hidden");
            (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4__.clearElement)(this.tagEditor);
            this.tagEditor.append("Filter tags:");
            for (const tag of allTags.asArray()) {
                const isExclude = this.excludeTags.has(tag);
                this.tagEditor.append((0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeTagCapsule)({
                    tag: tag,
                    iconName: "clear",
                    exclude: isExclude,
                    clickCallback: () => {
                        if (isExclude) {
                            this.excludeTags.remove(tag);
                        }
                        else {
                            this.includeTags.remove(tag);
                        }
                        this.refreshFilter();
                    },
                }));
            }
        }
        // Draw search prefix.
        const labelNode = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.getLabelNodeForTextButton)(this.searchButton);
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4__.clearElement)(labelNode);
        if (this.searchString !== "" || this.forceShowSearch) {
            const searchStringNode = document.createElement("span");
            searchStringNode.classList.add("search-string");
            searchStringNode.innerText = this.searchString;
            if (this.searchCursor === undefined) {
                this.searchCursor = new AuthenticCursor();
            }
            labelNode.append("Search:", searchStringNode, this.searchCursor.node);
        }
        else {
            labelNode.innerText = "Search";
            if (this.searchCursor !== undefined) {
                this.searchCursor.disable();
                this.searchCursor = undefined;
            }
        }
    }
    /**
     * Whether there's anything in the trash.
     */
    anyFileInTrash() {
        for (const file of this.context.library.getAllFiles()) {
            if (file.tags.indexOf(_Utils__WEBPACK_IMPORTED_MODULE_3__.TRASH_TAG) >= 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Adds trash to the filter.
     */
    openTrash() {
        this.includeTags.add(_Utils__WEBPACK_IMPORTED_MODULE_3__.TRASH_TAG);
        this.refreshFilter();
    }
    /**
     * Return an element for a file given its ID, or undefined if not found.
     */
    getFileElementById(fileId) {
        let selectors = ":scope > [" + FILE_ID_ATTR + "=\"" + fileId + "\"]";
        const element = this.filesDiv.querySelector(selectors);
        return element === null ? undefined : element;
    }
    /**
     * Sort files already displayed.
     */
    sortFiles() {
        // Sort existing files.
        const fileElements = [];
        for (const element of this.filesDiv.children) {
            const fileId = element.getAttribute(FILE_ID_ATTR);
            if (fileId !== null) {
                const file = this.context.library.getFile(fileId);
                if (file !== undefined) {
                    fileElements.push({ file: file, element: element });
                }
            }
        }
        fileElements.sort((a, b) => _File__WEBPACK_IMPORTED_MODULE_1__.File.compare(a.file, b.file));
        // Repopulate the UI in the right order.
        (0,teamten_ts_utils__WEBPACK_IMPORTED_MODULE_4__.clearElement)(this.filesDiv);
        this.filesDiv.append(...fileElements.map(e => e.element));
        // Update the hidden flags.
        this.refreshFilter();
    }
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Main */ "./src/Main.ts");

(0,_Main__WEBPACK_IMPORTED_MODULE_0__.main)();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	// It's empty as some runtime module handles the default behavior
/******/ 	__webpack_require__.x = x => {};
/************************************************************************/
/******/ 	/* webpack/runtime/amd define */
/******/ 	(() => {
/******/ 		__webpack_require__.amdD = function () {
/******/ 			throw new Error('define cannot be used indirect');
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// Promise = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		var deferredModules = [
/******/ 			["./src/index.ts","trs80-emulator","z80-emulator","trs80-z80","vendors"]
/******/ 		];
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		var checkDeferredModules = x => {};
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime, executeModules] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0, resolves = [];
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					resolves.push(installedChunks[chunkId][0]);
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			while(resolves.length) {
/******/ 				resolves.shift()();
/******/ 			}
/******/ 		
/******/ 			// add entry modules from loaded chunk to deferred list
/******/ 			if(executeModules) deferredModules.push.apply(deferredModules, executeModules);
/******/ 		
/******/ 			// run deferred modules when all chunks ready
/******/ 			return checkDeferredModules();
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkmy_trs_80"] = self["webpackChunkmy_trs_80"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 		
/******/ 		function checkDeferredModulesImpl() {
/******/ 			var result;
/******/ 			for(var i = 0; i < deferredModules.length; i++) {
/******/ 				var deferredModule = deferredModules[i];
/******/ 				var fulfilled = true;
/******/ 				for(var j = 1; j < deferredModule.length; j++) {
/******/ 					var depId = deferredModule[j];
/******/ 					if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferredModules.splice(i--, 1);
/******/ 					result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 				}
/******/ 			}
/******/ 			if(deferredModules.length === 0) {
/******/ 				__webpack_require__.x();
/******/ 				__webpack_require__.x = x => {};
/******/ 			}
/******/ 			return result;
/******/ 		}
/******/ 		var startup = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			// reset startup function so it can be called again when more startup code is added
/******/ 			__webpack_require__.x = startup || (x => {});
/******/ 			return (checkDeferredModules = checkDeferredModulesImpl)();
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;