(self["webpackChunkmy_trs_80"] = self["webpackChunkmy_trs_80"] || []).push([["trs80-emulator"],{

/***/ "./node_modules/trs80-emulator/dist/CanvasScreen.js":
/*!**********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/CanvasScreen.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasScreen = exports.phosphorToRgb = exports.BLACK_BACKGROUND = exports.AUTHENTIC_BACKGROUND = void 0;
const Trs80Screen_1 = __webpack_require__(/*! ./Trs80Screen */ "./node_modules/trs80-emulator/dist/Trs80Screen.js");
const Fonts_1 = __webpack_require__(/*! ./Fonts */ "./node_modules/trs80-emulator/dist/Fonts.js");
const Config_1 = __webpack_require__(/*! ./Config */ "./node_modules/trs80-emulator/dist/Config.js");
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const trs80_base_1 = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
exports.AUTHENTIC_BACKGROUND = "#334843";
exports.BLACK_BACKGROUND = "#000000";
const PADDING = 10;
const BORDER_RADIUS = 8;
const WHITE_PHOSPHOR = [230, 231, 252];
const AMBER_PHOSPHOR = [247, 190, 64];
const GREEN_PHOSPHOR = [122, 244, 96];
// Gets an RGB array (0-255) for a phosphor.
function phosphorToRgb(phosphor) {
    switch (phosphor) {
        case Config_1.Phosphor.WHITE:
        default:
            return WHITE_PHOSPHOR;
        case Config_1.Phosphor.GREEN:
            return GREEN_PHOSPHOR;
        case Config_1.Phosphor.AMBER:
            return AMBER_PHOSPHOR;
    }
}
exports.phosphorToRgb = phosphorToRgb;
/**
 * TRS-80 screen based on an HTML canvas element.
 */
class CanvasScreen extends Trs80Screen_1.Trs80Screen {
    /**
     * Create a canvas screen.
     *
     * @param scale size multiplier. If greater than 1, use multiples of 0.5.
     */
    constructor(scale = 1) {
        super();
        this.scale = 1;
        this.memory = new Uint8Array(trs80_base_1.TRS80_SCREEN_END - trs80_base_1.TRS80_SCREEN_BEGIN);
        this.glyphs = [];
        this.config = Config_1.Config.makeDefault();
        this.glyphWidth = 0;
        this.node = document.createElement("div");
        // Fit canvas horizontally so that the nested objects (panels and progress bars) are
        // displayed in the canvas.
        this.node.style.maxWidth = "max-content";
        this.scale = scale;
        this.padding = Math.round(PADDING * this.scale);
        this.canvas = document.createElement("canvas");
        // Make it block so we don't have any weird text margins on the bottom.
        this.canvas.style.display = "block";
        this.canvas.width = 64 * 8 * this.scale + 2 * this.padding;
        this.canvas.height = 16 * 24 * this.scale + 2 * this.padding;
        this.node.append(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.updateFromConfig();
    }
    getWidth() {
        return this.canvas.width;
    }
    getHeight() {
        return this.canvas.height;
    }
    setConfig(config) {
        this.config = config;
        this.updateFromConfig();
    }
    /**
     * Update the font and screen from the config and other state.
     */
    updateFromConfig() {
        let font;
        switch (this.config.cgChip) {
            case Config_1.CGChip.ORIGINAL:
                font = Fonts_1.MODEL1A_FONT;
                break;
            case Config_1.CGChip.LOWER_CASE:
            default:
                switch (this.config.modelType) {
                    case Config_1.ModelType.MODEL1:
                        font = Fonts_1.MODEL1B_FONT;
                        break;
                    case Config_1.ModelType.MODEL3:
                    default:
                        font = this.isAlternateCharacters() ? Fonts_1.MODEL3_ALT_FONT : Fonts_1.MODEL3_FONT;
                        break;
                }
                break;
        }
        const glyphOptions = {
            color: phosphorToRgb(this.config.phosphor),
            scanLines: this.config.scanLines === Config_1.ScanLines.ON,
        };
        for (let i = 0; i < 256; i++) {
            this.glyphs[i] = font.makeImage(i, this.isExpandedCharacters(), glyphOptions);
        }
        this.glyphWidth = font.width;
        this.drawBackground();
        this.refresh();
    }
    writeChar(address, value) {
        const offset = address - trs80_base_1.TRS80_SCREEN_BEGIN;
        this.memory[offset] = value;
        this.drawChar(offset, value);
    }
    getForegroundColor() {
        const color = phosphorToRgb(this.config.phosphor);
        return "#" + z80_base_1.toHexByte(color[0]) + z80_base_1.toHexByte(color[1]) + z80_base_1.toHexByte(color[2]);
    }
    /**
     * Get the background color as a CSS color based on the current config.
     */
    getBackgroundColor() {
        switch (this.config.background) {
            case Config_1.Background.BLACK:
                return exports.BLACK_BACKGROUND;
            case Config_1.Background.AUTHENTIC:
            default:
                return exports.AUTHENTIC_BACKGROUND;
        }
    }
    getBorderRadius() {
        return BORDER_RADIUS * this.scale;
    }
    /**
     * Draw a single character to the canvas.
     */
    drawChar(offset, value) {
        const screenX = (offset % 64) * 8 * this.scale + this.padding;
        const screenY = Math.floor(offset / 64) * 24 * this.scale + this.padding;
        this.context.fillStyle = this.getBackgroundColor();
        if (this.isExpandedCharacters()) {
            if (offset % 2 === 0) {
                this.context.fillRect(screenX, screenY, 16 * this.scale, 24 * this.scale);
                this.context.drawImage(this.glyphs[value], 0, 0, this.glyphWidth * 2, 24, screenX, screenY, 16 * this.scale, 24 * this.scale);
            }
        }
        else {
            this.context.fillRect(screenX, screenY, 8 * this.scale, 24 * this.scale);
            this.context.drawImage(this.glyphs[value], 0, 0, this.glyphWidth, 24, screenX, screenY, 8 * this.scale, 24 * this.scale);
        }
    }
    getNode() {
        return this.node;
    }
    setExpandedCharacters(expanded) {
        if (expanded !== this.isExpandedCharacters()) {
            super.setExpandedCharacters(expanded);
            this.updateFromConfig();
        }
    }
    setAlternateCharacters(alternate) {
        if (alternate !== this.isAlternateCharacters()) {
            super.setAlternateCharacters(alternate);
            this.updateFromConfig();
        }
    }
    /**
     * Draw the background of the canvas.
     */
    drawBackground() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const radius = this.getBorderRadius();
        this.context.fillStyle = this.getBackgroundColor();
        this.context.beginPath();
        this.context.moveTo(radius, 0);
        this.context.arcTo(width, 0, width, radius, radius);
        this.context.arcTo(width, height, width - radius, height, radius);
        this.context.arcTo(0, height, 0, height - radius, radius);
        this.context.arcTo(0, 0, radius, 0, radius);
        this.context.fill();
    }
    /**
     * Refresh the display based on what we've kept track of.
     */
    refresh() {
        for (let offset = 0; offset < this.memory.length; offset++) {
            this.drawChar(offset, this.memory[offset]);
        }
    }
    /**
     * Returns the canvas as an <img> element that can be resized. This is relatively
     * expensive.
     *
     * This method is deprecated, use asImageAsync instead.
     */
    asImage() {
        const image = document.createElement("img");
        image.src = this.canvas.toDataURL();
        return image;
    }
    /**
     * Returns the canvas as an <img> element that can be resized. Despite the
     * "async" name, there's still some synchronous work, about 13ms.
     */
    asImageAsync() {
        return new Promise((resolve, reject) => {
            // According to this answer:
            //     https://stackoverflow.com/a/59025746/211234
            // the toBlob() method still has to copy the image synchronously, so this whole method still
            // takes about 13ms. It's better than toDataUrl() because it doesn't have to make an actual
            // base64 string. The Object URL is just a reference to the blob.
            this.canvas.toBlob(blob => {
                if (blob === null) {
                    reject("Cannot make image from screen");
                }
                else {
                    const image = document.createElement("img");
                    const url = URL.createObjectURL(blob);
                    image.addEventListener("load", () => {
                        URL.revokeObjectURL(url);
                        // Resolve when the image is fully loaded so that there's no UI glitching.
                        resolve(image);
                    });
                    image.src = url;
                }
            });
        });
    }
}
exports.CanvasScreen = CanvasScreen;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/CassettePlayer.js":
/*!************************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/CassettePlayer.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CassettePlayer = void 0;
/**
 * Interface for fetching cassette audio data. We make this a concrete
 * class because rollup.js can't handle exported interfaces.
 */
class CassettePlayer {
    constructor() {
        /**
         * The number of samples per second that this audio represents.
         */
        this.samplesPerSecond = 44100;
    }
    /**
     * Called when the motor starts.
     */
    onMotorStart() {
        // Optional function.
    }
    /**
     * Read the next sample. Must be in the range -1 to 1. If we try to read off
     * the end of the cassette, just return zero.
     */
    readSample() {
        return 0;
    }
    /**
     * Called when the motor stops.
     */
    onMotorStop() {
        // Optional function.
    }
}
exports.CassettePlayer = CassettePlayer;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Config.js":
/*!****************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Config.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = exports.ScanLines = exports.Background = exports.Phosphor = exports.RamSize = exports.CGChip = exports.BasicLevel = exports.ModelType = void 0;
/**
 * The TRS-80 models we support.
 */
var ModelType;
(function (ModelType) {
    ModelType[ModelType["MODEL1"] = 0] = "MODEL1";
    ModelType[ModelType["MODEL3"] = 1] = "MODEL3";
})(ModelType = exports.ModelType || (exports.ModelType = {}));
/**
 * The levels of Basic.
 */
var BasicLevel;
(function (BasicLevel) {
    BasicLevel[BasicLevel["LEVEL1"] = 0] = "LEVEL1";
    BasicLevel[BasicLevel["LEVEL2"] = 1] = "LEVEL2";
})(BasicLevel = exports.BasicLevel || (exports.BasicLevel = {}));
/**
 * The character generator chip we support.
 */
var CGChip;
(function (CGChip) {
    CGChip[CGChip["ORIGINAL"] = 0] = "ORIGINAL";
    CGChip[CGChip["LOWER_CASE"] = 1] = "LOWER_CASE";
})(CGChip = exports.CGChip || (exports.CGChip = {}));
/**
 * The amounts of RAM we support.
 */
var RamSize;
(function (RamSize) {
    RamSize[RamSize["RAM_4_KB"] = 0] = "RAM_4_KB";
    RamSize[RamSize["RAM_16_KB"] = 1] = "RAM_16_KB";
    RamSize[RamSize["RAM_32_KB"] = 2] = "RAM_32_KB";
    RamSize[RamSize["RAM_48_KB"] = 3] = "RAM_48_KB";
})(RamSize = exports.RamSize || (exports.RamSize = {}));
/**
 * Phosphor color.
 */
var Phosphor;
(function (Phosphor) {
    Phosphor[Phosphor["WHITE"] = 0] = "WHITE";
    Phosphor[Phosphor["GREEN"] = 1] = "GREEN";
    Phosphor[Phosphor["AMBER"] = 2] = "AMBER";
})(Phosphor = exports.Phosphor || (exports.Phosphor = {}));
/**
 * Background color.
 */
var Background;
(function (Background) {
    Background[Background["BLACK"] = 0] = "BLACK";
    Background[Background["AUTHENTIC"] = 1] = "AUTHENTIC";
})(Background = exports.Background || (exports.Background = {}));
/**
 * Whether to display scan lines.
 */
var ScanLines;
(function (ScanLines) {
    ScanLines[ScanLines["OFF"] = 0] = "OFF";
    ScanLines[ScanLines["ON"] = 1] = "ON";
})(ScanLines = exports.ScanLines || (exports.ScanLines = {}));
/**
 * A specific configuration of model and RAM.
 */
class Config {
    constructor(modelType, basicLevel, cgChip, ramSize, phosphor, background, scanLines) {
        this.modelType = modelType;
        this.basicLevel = basicLevel;
        this.cgChip = cgChip;
        this.ramSize = ramSize;
        this.phosphor = phosphor;
        this.background = background;
        this.scanLines = scanLines;
    }
    withModelType(modelType) {
        return new Config(modelType, this.basicLevel, this.cgChip, this.ramSize, this.phosphor, this.background, this.scanLines);
    }
    withBasicLevel(basicLevel) {
        return new Config(this.modelType, basicLevel, this.cgChip, this.ramSize, this.phosphor, this.background, this.scanLines);
    }
    withCGChip(cgChip) {
        return new Config(this.modelType, this.basicLevel, cgChip, this.ramSize, this.phosphor, this.background, this.scanLines);
    }
    withRamSize(ramSize) {
        return new Config(this.modelType, this.basicLevel, this.cgChip, ramSize, this.phosphor, this.background, this.scanLines);
    }
    withPhosphor(phosphor) {
        return new Config(this.modelType, this.basicLevel, this.cgChip, this.ramSize, phosphor, this.background, this.scanLines);
    }
    withBackground(background) {
        return new Config(this.modelType, this.basicLevel, this.cgChip, this.ramSize, this.phosphor, background, this.scanLines);
    }
    withScanLines(scanLines) {
        return new Config(this.modelType, this.basicLevel, this.cgChip, this.ramSize, this.phosphor, this.background, scanLines);
    }
    /**
     * Make a default configuration.
     */
    static makeDefault() {
        return new Config(ModelType.MODEL3, BasicLevel.LEVEL2, CGChip.LOWER_CASE, RamSize.RAM_48_KB, Phosphor.WHITE, Background.AUTHENTIC, ScanLines.OFF);
    }
    /**
     * Whether this particular config is valid.
     */
    isValid() {
        // Model III only had Level 2. (I've read that it actually shipped with Level 1, but
        // we don't have that ROM.)
        if (this.modelType === ModelType.MODEL3 && this.basicLevel === BasicLevel.LEVEL1) {
            return false;
        }
        // Model III only had lower case.
        if (this.modelType === ModelType.MODEL3 && this.cgChip === CGChip.ORIGINAL) {
            return false;
        }
        // Rest are okay.
        return true;
    }
    /**
     * Whether this new config needs to be rebooted, if the emulator currently is running the old config.
     */
    needsReboot(oldConfig) {
        // Maybe here we could not reboot if only the CG chip changed. The software is able to detect the
        // difference (since bit 6 is synthetic in one case).
        return this.modelType !== oldConfig.modelType ||
            this.basicLevel !== oldConfig.basicLevel ||
            this.cgChip !== oldConfig.cgChip ||
            this.ramSize !== oldConfig.ramSize;
    }
    /**
     * Return the RAM size in bytes.
     */
    getRamSize() {
        let kb;
        switch (this.ramSize) {
            case RamSize.RAM_4_KB:
                kb = 4;
                break;
            case RamSize.RAM_16_KB:
                kb = 16;
                break;
            case RamSize.RAM_32_KB:
                kb = 32;
                break;
            case RamSize.RAM_48_KB:
            default:
                kb = 48;
                break;
        }
        return kb * 1024;
    }
}
exports.Config = Config;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/ControlPanel.js":
/*!**********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/ControlPanel.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ControlPanel = void 0;
const Utils_1 = __webpack_require__(/*! ./Utils */ "./node_modules/trs80-emulator/dist/Utils.js");
const SettingsPanel_1 = __webpack_require__(/*! ./SettingsPanel */ "./node_modules/trs80-emulator/dist/SettingsPanel.js");
const gCssPrefix = Utils_1.CSS_PREFIX + "-control-panel";
const gScreenNodeCssClass = gCssPrefix + "-screen-node";
const gPanelCssClass = gCssPrefix + "-panel";
const gButtonCssClass = gCssPrefix + "-button";
const gButtonHiddenCssClass = gCssPrefix + "-button-hidden";
const gShowingOtherPanelCssClass = gCssPrefix + "-showing-other-panel";
// https://thenounproject.com/search/?q=reset&i=3012384
const RESET_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <title>Reboot the computer</title>
    <g fill="white">
        <path d="M5273.1,2400.1v-2c0-2.8-5-4-9.7-4s-9.7,1.3-9.7,4v2c0,1.8,0.7,3.6,2,4.9l5,4.9c0.3,0.3,0.4,0.6,0.4,1v6.4     c0,0.4,0.2,0.7,0.6,0.8l2.9,0.9c0.5,0.1,1-0.2,1-0.8v-7.2c0-0.4,0.2-0.7,0.4-1l5.1-5C5272.4,2403.7,5273.1,2401.9,5273.1,2400.1z      M5263.4,2400c-4.8,0-7.4-1.3-7.5-1.8v0c0.1-0.5,2.7-1.8,7.5-1.8c4.8,0,7.3,1.3,7.5,1.8C5270.7,2398.7,5268.2,2400,5263.4,2400z"/>
        <path d="M5268.4,2410.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1c0-0.6-0.4-1-1-1H5268.4z"/>
        <path d="M5272.7,2413.7h-4.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1C5273.7,2414.1,5273.3,2413.7,5272.7,2413.7z"/>
        <path d="M5272.7,2417h-4.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1C5273.7,2417.5,5273.3,2417,5272.7,2417z"/>
        <path d="M84.3,18C67.1,0.8,39.5,0.4,21.8,16.5l-4.1-4.1c-1.6-1.6-4-2.2-6.2-1.6c-2.2,0.7-3.9,2.5-4.3,4.7L2.6,36.9    c-0.4,2.1,0.2,4.2,1.7,5.7c1.5,1.5,3.6,2.1,5.7,1.7l21.4-4.5c1.2-0.3,2.3-0.9,3.1-1.7c0.7-0.7,1.3-1.6,1.6-2.6    c0.6-2.2,0-4.6-1.6-6.2l-3.9-3.9C43.5,14,63.1,14.5,75.4,26.8c12.8,12.8,12.8,33.6,0,46.4C62.6,86,41.8,86,29,73.2    c-4.1-4.1-7-9.2-8.5-14.8c-0.9-3.3-4.3-5.3-7.6-4.4c-3.3,0.9-5.3,4.3-4.4,7.6c2,7.7,6.1,14.8,11.8,20.4    c17.7,17.7,46.4,17.7,64.1,0C101.9,64.4,101.9,35.6,84.3,18z"/>
    </g>
</svg>
`;
// https://thenounproject.com/search/?q=camera&i=1841396
const CAMERA_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <title>Take a screenshot</title>
    <g fill="white">
        <circle cx="50" cy="55.4" r="13.8"/>
        <path d="M80.6,25.4H67.1l-1.8-7.2c-0.5-2.1-2.5-3.6-4.7-3.6H39.3c-2.2,0-4.1,1.5-4.7,3.6l-1.8,7.2H19.4C11.5,25.4,5,31.9,5,39.8V71   c0,7.9,6.5,14.4,14.4,14.4h61.2C88.5,85.4,95,78.9,95,71V39.8C95,31.9,88.5,25.4,80.6,25.4z M50,76.4c-11.6,0-21-9.4-21-21   s9.4-21,21-21s21,9.4,21,21S61.6,76.4,50,76.4z M81.4,40.3c-2,0-3.6-1.6-3.6-3.6c0-2,1.6-3.6,3.6-3.6s3.6,1.6,3.6,3.6   C85,38.7,83.4,40.3,81.4,40.3z"/>
    </g>
</svg>
`;
// https://thenounproject.com/search/?q=previous%20track&i=658409
const PREVIOUS_TRACK_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 16 21">
    <title>Rewind the cassette</title>
    <g fill="white" fill-rule="evenodd">
        <g transform="translate(-320.000000, -618.000000)">
            <path d="M330,628.032958 L330,634.00004 C330,634.545291 330.45191,635 331.009369,635 L332.990631,635 C333.556647,635 334,634.552303 334,634.00004 L334,618.99996 C334,618.454709 333.54809,618 332.990631,618 L331.009369,618 C330.443353,618 330,618.447697 330,618.99996 L330,624.967057 C329.894605,624.850473 329.775773,624.739153 329.643504,624.634441 L322.356496,618.865559 C321.054403,617.834736 320,618.3432 320,620.000122 L320,632.999878 C320,634.663957 321.055039,635.164761 322.356496,634.134441 L329.643504,628.365559 C329.775779,628.260841 329.894611,628.149527 330,628.032958 Z" transform="translate(327.000000, 626.500000) scale(-1, 1) translate(-327.000000, -626.500000) "/>
        </g>
    </g>
</svg>
`;
// https://thenounproject.com/search/?q=settings&i=3593545
const HARDWARE_SETTINGS_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="7 7 121 121">
    <title>Show the settings panel</title>
    <g fill="white" transform="translate(0,-161.53332)">
        <path d="m 61.57997,173.33818 c -1.653804,0 -3.159177,0.77847 -4.132553,1.85984 -0.973402,1.08136 -1.513575,2.40442 -1.771491,3.76721 a 2.1609049,2.1609049 0 0 0 0,0.002 l -1.654678,8.74831 c -2.047981,0.67947 -4.038494,1.50768 -5.964476,2.48047 l -7.367508,-5.02347 c -1.145302,-0.78076 -2.462953,-1.33572 -3.916045,-1.41232 -1.4546,-0.0764 -3.068029,0.44118 -4.235926,1.60921 l -8.699209,8.69921 c -1.169405,1.16909 -1.685211,2.78351 -1.609725,4.23643 0.07501,1.45291 0.629259,2.7738 1.410256,3.92018 l 5.001762,7.336 c -0.9702,1.93582 -1.794192,3.93628 -2.468589,5.99392 l -8.740034,1.65417 c -1.362789,0.25787 -2.688378,0.79815 -3.769783,1.77147 -1.081405,0.97346 -1.859333,2.4815 -1.859333,4.13526 v 12.30262 c 0,1.65378 0.777928,3.1592 1.859333,4.13255 1.081405,0.97338 2.406994,1.51567 3.769783,1.77353 l 8.754004,1.6583 c 0.679477,2.04603 1.506088,4.03461 2.478379,5.95882 l -5.025522,7.3675 c -0.781606,1.14644 -1.334744,2.4664 -1.410256,3.91967 -0.07498,1.45325 0.439817,3.06745 1.609725,4.23643 l 8.699209,8.69921 c 1.1693,1.16941 2.782914,1.68325 4.235926,1.60713 1.452986,-0.0761 2.771908,-0.63037 3.918109,-1.41179 l 7.33597,-5.00022 c 1.9363,0.97001 3.937926,1.79294 5.996014,2.46702 l 1.654175,8.74004 c 0.257889,1.36284 0.798486,2.68843 1.771994,3.76981 0.973402,1.08138 2.478749,1.8593 4.132553,1.8593 H 73.88672 c 1.653805,0 3.159152,-0.77792 4.132554,-1.8593 0.973005,-1.0809 1.513999,-2.40554 1.771994,-3.76772 v -0.003 l 1.656212,-8.74778 c 2.048113,-0.67943 4.038415,-1.50768 5.964502,-2.48047 l 7.365445,5.02142 c 1.146095,0.78144 2.465096,1.33567 3.918108,1.41179 1.452905,0.0761 3.068585,-0.43786 4.237995,-1.60713 l 8.6992,-8.69921 c 1.16931,-1.16946 1.68395,-2.78551 1.60767,-4.23852 -0.076,-1.45301 -0.63074,-2.77196 -1.41232,-3.91811 l -5.00177,-7.33547 c 0.9705,-1.93617 1.79398,-3.93639 2.46857,-5.99445 l 8.74003,-1.65418 c 1.36271,-0.25794 2.68841,-0.80018 3.76981,-1.77352 1.0813,-0.97335 1.85931,-2.47881 1.85931,-4.13256 v -12.30312 c 0,-1.65378 -0.77801,-3.16127 -1.85931,-4.13465 -1.0809,-0.97292 -2.40562,-1.51344 -3.76772,-1.77146 l -8.74988,-1.65624 c -0.67918,-2.04684 -1.50825,-4.03585 -2.48046,-5.96088 l 5.02348,-7.36698 c 0.78118,-1.14583 1.33572,-2.46501 1.41232,-3.91811 0.077,-1.45309 -0.43952,-3.06905 -1.60973,-4.2385 l -8.69714,-8.69921 c -1.16962,-1.16891 -2.78461,-1.68557 -4.238494,-1.6092 -1.4528,0.0768 -2.770425,0.63186 -3.915542,1.41232 l -7.33597,5.00176 c -1.9363,-0.96998 -3.937926,-1.79297 -5.996014,-2.46703 l -1.656768,-8.74211 c -0.257783,-1.36269 -0.798062,-2.68582 -1.771464,-3.76721 -0.973297,-1.0814 -2.478749,-1.85984 -4.132554,-1.85984 z m 6.152595,34.74051 c 11.726704,0 21.185664,9.46065 21.185267,21.18735 0,11.7262 -9.459066,21.18696 -21.185267,21.18733 -11.726704,0 -21.187463,-9.4606 -21.18786,-21.18733 0,-11.72726 9.460653,-21.18772 21.18786,-21.18735 z"/>
    </g>
</svg>
`;
// https://thenounproject.com/search/?q=view&i=485540
const VIEW_SETTINGS_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 20 60 60">
    <title>Show the settings panel</title>
    <g fill="white">
        <path d="M80,48.6c-7.8-10.4-18.4-16.7-30-16.7c-11.6,0-22.2,6.4-30,16.7c-0.6,0.9-0.6,2,0,2.9c7.8,10.4,18.4,16.7,30,16.7  s22.2-6.4,30-16.7C80.7,50.6,80.7,49.4,80,48.6z M62.8,50.8c-0.4,6.4-5.6,11.6-12,12c-7.7,0.5-14.1-5.9-13.6-13.6  c0.4-6.4,5.6-11.6,12-12C56.9,36.7,63.3,43.1,62.8,50.8z M56.9,50.4c-0.2,3.4-3,6.2-6.4,6.4c-4.2,0.3-7.6-3.2-7.3-7.3  c0.2-3.4,3-6.2,6.4-6.4C53.7,42.8,57.2,46.3,56.9,50.4z"/>
    </g>
</svg>
`;
// https://thenounproject.com/search/?q=edit&i=1072354
const EDIT_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -25 562 562">
    <title>Edit the program (Ctrl-Enter)</title>
    <g fill="white">
        <path d="M318.37,85.45L422.53,190.11,158.89,455,54.79,350.38ZM501.56,60.2L455.11,13.53a45.93,45.93,0,0,0-65.11,0L345.51,58.24,449.66,162.9l51.9-52.15A35.8,35.8,0,0,0,501.56,60.2ZM0.29,497.49a11.88,11.88,0,0,0,14.34,14.17l116.06-28.28L26.59,378.72Z"/>
    </g>
</svg>
`;
// https://thenounproject.com/search/?q=checkmark&i=1409439
const CHECK_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <title>Save (Ctrl-Enter)</title>
    <g fill="white">
        <line x1="19.713" y1="55.055" x2="33.258" y2="68.6"/>
        <path d="M92.059,19.7c-2.733-2.733-7.165-2.734-9.9,0L33.258,68.6L17.841,53.183c-2.734-2.732-7.166-2.733-9.899,0.001   c-2.734,2.733-2.734,7.165,0,9.899l20.367,20.366c1.367,1.366,3.158,2.05,4.95,2.05s3.583-0.684,4.95-2.05l53.85-53.85   C94.792,26.866,94.792,22.434,92.059,19.7z"/>
    </g>
</svg>

`;
// https://thenounproject.com/search/?q=close&i=1609004
const CROSS_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 110 110">
    <title>Cancel</title>
    <path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M61.2,50.5l32.1,32.1c3,3,3,7.7,0,10.7c-3,3-7.7,3-10.7,0L50.5,61.2L18.4,93.3c-3,3-7.7,3-10.7,0  c-3-3-3-7.7,0-10.7l32.1-32.1L7.7,18.4c-3-3-3-7.7,0-10.7s7.7-3,10.7,0l32.1,32.1L82.6,7.7c3-3,7.7-3,10.7,0c3,3,3,7.7,0,10.7  L61.2,50.5z"/>
</svg>
`;
// https://thenounproject.com/term/mute/1915537
const MUTED_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 0 1024 1024">
    <title>Unmute</title>
    <path fill="white" d="M 706,852.3 V 781 c -6.7,-6.6 -13.3,-13.3 -20,-19.9 -6.7,-6.6 -13.3,-13.3 -20,-19.9 -2.3,-2.2 -4.5,-4.5 -6.8,-6.7 L 469,545.2 c -61.6,-61.3 -123.3,-122.6 -184.9,-184 -1.6,-1.6 -3.3,-3.2 -4.9,-4.9 -5.2,-5.1 -10.3,-10.2 -15.5,-15.4 -6.7,-6.7 -13.4,-13 -20.1,-20 H 90 c -10.8,0 -20,9.1 -20,20 v 299.9 c 0,13.8 -0.4,27.7 0,41.5 v 0.6 c 0,10.8 9.2,20 20,20 h 214.7 c 22,19 44,37.6 66,56.3 46.5,39.8 93.1,79.5 139.6,119.3 29.3,25 58.7,50.1 88,75.2 22.8,19.5 58,30.7 83.1,9.3 17.3,-14.7 23.1,-40.3 24.5,-62 1,-16 0.1,-32.5 0.1,-48.7 z"/>
    <path fill="white" d="m 694.3,70.7 c -8,-11.7 -19.6,-19.1 -33.6,-21 -16.8,-2.3 -34.9,2.8 -49.5,11.3 -5.1,2.9 -9.6,7.5 -14,11.3 -10.3,8.8 -20.7,17.6 -31,26.4 -33.9,28.9 -67.8,57.7 -101.7,86.5 -23.5,19.9 -47,39.8 -70.4,59.8 4.7,4.7 9.4,9.4 14.2,14.1 4.7,4.7 9.4,9.4 14.2,14.1 6.5,6.5 13,13 19.6,19.5 63.4,63.1 126.8,126.1 190.1,189.2 11.3,11.2 22.6,22.5 33.8,33.7 6.7,6.6 13.3,13.3 20,19.9 6.7,6.6 13.3,13.3 20,19.9 V 119 c -0.1,-16.3 -2.2,-34.5 -11.7,-48.3 z"/>
    <path stroke="white" stroke-width="80.1" stroke-linecap="round" d="M 139.75018,103.02184 934.53553,895.07339"/>
</svg>
`;
// https://thenounproject.com/term/mute/1915537 (modified by me to get rid of line).
const UNMUTED_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 0 1024 1024">
    <title>Mute</title>
    <path fill="white" d="M 88.65873,702.7619 304.7,702.9 605.71429,960 c 40.51022,32.06833 100.31746,5.28523 100.31746,-46.98413 l -0.41421,-806.94435 c 0,-57.136329 -64.88295,-70.781271 -94.96826,-45.714278 L 304.7,320.8616 93.968254,321.01984 c -14.687138,0 -23.396825,7.42695 -23.396825,21.27778 l -0.08532,344.06151 c 0,7.13959 8.057136,16.40277 18.172619,16.40277 z"/>
</svg>
`;
const GLOBAL_CSS = `
.${gPanelCssClass} {
    background-color: rgba(40, 40, 40, 0.8);
    position: absolute;
    right: 10px;
    top: 10px;
    border-radius: 5px;
    opacity: 0;
    transition: opacity .20s ease-in-out;
}

.${gScreenNodeCssClass} {
    /* Force the screen node to relative positioning. Hope that doesn't screw anything up. */
    position: relative;
}

.${gScreenNodeCssClass}:hover .${gPanelCssClass} {
    opacity: 1;
}

/* Hide the control panel if any other panel is showing (like settings). */
.${gScreenNodeCssClass}.${gShowingOtherPanelCssClass}:hover .${gPanelCssClass} {
    opacity: 0;
}

.${gButtonCssClass} {
    display: block;
    /* background-color: red; */
    margin: 15px;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity .05s ease-in-out, transform 0.05s ease-in-out;

    /* For icons that stick out a bit: */
    overflow: visible;
}

.${gButtonCssClass}:hover {
    opacity: 1;
}

.${gButtonCssClass}:active {
    transform: scale(1.15);
}

.${gButtonCssClass}.${gButtonHiddenCssClass} {
    display: none;
}

`;
/**
 * Control panel that hovers in the screen for doing things like resetting the computer.
 */
class ControlPanel {
    /**
     * @param screenNode the node from the Trs80Screen object's getNode() method.
     */
    constructor(screenNode) {
        // Make global CSS if necessary.
        ControlPanel.configureStyle();
        this.screenNode = screenNode;
        screenNode.classList.add(gScreenNodeCssClass);
        this.panelNode = document.createElement("div");
        this.panelNode.classList.add(gPanelCssClass);
        screenNode.appendChild(this.panelNode);
    }
    /**
     * Generic function to add a button to the control panel.
     */
    addButton(iconSvg, callback) {
        const icon = new DOMParser().parseFromString(iconSvg, "image/svg+xml").documentElement;
        icon.classList.add(gButtonCssClass);
        icon.setAttribute("width", "30");
        icon.setAttribute("height", "30");
        if (callback !== undefined) {
            icon.addEventListener("click", callback);
        }
        this.panelNode.append(icon);
        return icon;
    }
    /**
     * Add a reset button.
     */
    addResetButton(callback) {
        this.addButton(RESET_ICON, callback);
        return this.addButton(RESET_ICON, callback);
    }
    /**
     * Add a screenshot button.
     */
    addScreenshotButton(callback) {
        return this.addButton(CAMERA_ICON, callback);
    }
    /**
     * Add a tape rewind button.
     */
    addTapeRewindButton(callback) {
        return this.addButton(PREVIOUS_TRACK_ICON, callback);
    }
    /**
     * Add a settings button.
     */
    addSettingsButton(settingsPanel) {
        settingsPanel.onOpen = () => this.screenNode.classList.add(gShowingOtherPanelCssClass);
        settingsPanel.onClose = () => this.screenNode.classList.remove(gShowingOtherPanelCssClass);
        let iconSvg;
        switch (settingsPanel.panelType) {
            case SettingsPanel_1.PanelType.HARDWARE:
            default:
                iconSvg = HARDWARE_SETTINGS_ICON;
                break;
            case SettingsPanel_1.PanelType.VIEW:
                iconSvg = VIEW_SETTINGS_ICON;
                break;
        }
        return this.addButton(iconSvg, () => settingsPanel.open());
    }
    /**
     * Add a button to edit the program.
     */
    addEditorButton(callback) {
        return this.addButton(EDIT_ICON, callback);
    }
    /**
     * Add button to toggle mute.
     */
    addMuteButton(mutable) {
        const mutedButton = this.addButton(MUTED_ICON);
        const unmutedButton = this.addButton(UNMUTED_ICON);
        const updateVisibility = () => {
            const isMuted = mutable.isMuted();
            mutedButton.classList.toggle(gButtonHiddenCssClass, !isMuted);
            unmutedButton.classList.toggle(gButtonHiddenCssClass, isMuted);
        };
        mutedButton.addEventListener("click", () => {
            mutable.unmute();
            updateVisibility();
        });
        unmutedButton.addEventListener("click", () => {
            mutable.mute();
            updateVisibility();
        });
        updateVisibility();
    }
    /**
     * Add a button to save.
     */
    addSaveButton(callback) {
        this.addButton(CHECK_ICON, callback);
    }
    /**
     * Add a button to cancel.
     */
    addCancelButton(callback) {
        this.addButton(CROSS_ICON, callback);
    }
    /**
     * Make a global stylesheet for all TRS-80 emulators on this page.
     */
    static configureStyle() {
        const styleId = gCssPrefix;
        if (document.getElementById(styleId) !== null) {
            // Already created.
            return;
        }
        const node = document.createElement("style");
        node.id = styleId;
        node.innerHTML = GLOBAL_CSS;
        document.head.appendChild(node);
    }
}
exports.ControlPanel = ControlPanel;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/DriveIndicators.js":
/*!*************************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/DriveIndicators.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DriveIndicators = void 0;
const Utils_1 = __webpack_require__(/*! ./Utils */ "./node_modules/trs80-emulator/dist/Utils.js");
const FloppyDiskController_1 = __webpack_require__(/*! ./FloppyDiskController */ "./node_modules/trs80-emulator/dist/FloppyDiskController.js");
const gCssPrefix = Utils_1.CSS_PREFIX + "-drive-indicators";
const gScreenNodeCssClass = gCssPrefix + "-screen-node";
const gIndicatorCssClass = gCssPrefix + "-indicator";
const gIndicatorDriveOnCssClass = gCssPrefix + "-drive-on";
const GLOBAL_CSS = `
.${gScreenNodeCssClass} {
    /* Force the screen node to relative positioning. Hope that doesn't screw anything up. */
    position: relative;
}

.${gIndicatorCssClass} {
    position: absolute;
    background-color: #CC0000;
    right: 10px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    opacity: 0;
    transition: opacity .20s ease-in-out;
    filter: drop-shadow(0 0 3px #ff0000);
}

.${gIndicatorDriveOnCssClass} {
    opacity: .75;
}
`;
/**
 * Red lights on top of the screen that indicate which drives are spinning.
 */
class DriveIndicators {
    /**
     * @param screenNode the node from the Trs80Screen object's getNode() method.
     */
    constructor(screenNode) {
        this.lights = [];
        // Make global CSS if necessary.
        DriveIndicators.configureStyle();
        screenNode.classList.add(gScreenNodeCssClass);
        for (let i = 0; i < FloppyDiskController_1.FLOPPY_DRIVE_COUNT; i++) {
            const light = document.createElement("div");
            light.classList.add(gIndicatorCssClass);
            light.style.bottom = (12 + 20 * i) + "px";
            screenNode.append(light);
            this.lights.push(light);
        }
    }
    /**
     * Set the drive number (0-based) that's currently on, if any.
     * @param drive
     */
    setActiveDrive(drive) {
        for (let i = 0; i < FloppyDiskController_1.FLOPPY_DRIVE_COUNT; i++) {
            this.lights[i].classList.toggle(gIndicatorDriveOnCssClass, i === drive);
        }
    }
    /**
     * Make a global stylesheet for all TRS-80 emulators on this page.
     */
    static configureStyle() {
        const styleId = gCssPrefix;
        if (document.getElementById(styleId) !== null) {
            // Already created.
            return;
        }
        const node = document.createElement("style");
        node.id = styleId;
        node.innerHTML = GLOBAL_CSS;
        document.head.appendChild(node);
    }
}
exports.DriveIndicators = DriveIndicators;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Editor.js":
/*!****************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Editor.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Editor = void 0;
const trs80_base_1 = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
const EditorFont_1 = __webpack_require__(/*! ./EditorFont */ "./node_modules/trs80-emulator/dist/EditorFont.js");
const ControlPanel_1 = __webpack_require__(/*! ./ControlPanel */ "./node_modules/trs80-emulator/dist/ControlPanel.js");
/**
 * Allows the user to edit the in-memory Basic program directly in an HTML text widget,
 * writing the result back into memory.
 */
class Editor {
    constructor(trs80, screen) {
        this.editing = false;
        this.wasStarted = false;
        this.trs80 = trs80;
        this.screen = screen;
        const width = screen.getWidth();
        const height = screen.getHeight();
        EditorFont_1.addCssFontToPage();
        // This is the "stage" node, which provides perspective for its children.
        this.node = document.createElement("div");
        this.node.style.perspective = "1000px";
        // This is the card that will be flipped around.
        this.card = document.createElement("div");
        this.card.style.width = width + "px";
        this.card.style.height = height + "px";
        this.card.style.position = "relative";
        this.card.style.transition = "transform 0.5s ease-in-out";
        this.card.style.transformStyle = "preserve-3d";
        this.node.append(this.card);
        // This is the "front" of the card, which is the TRS-80 screen.
        const screenNode = screen.getNode();
        screenNode.style.position = "absolute";
        screenNode.style.backfaceVisibility = "hidden";
        screenNode.style.webkitBackfaceVisibility = "hidden";
        screenNode.style.transform = "rotateY(0deg)"; // Need this for backface-visibility to work.
        // This is the "back" of the card, which is the editor.
        this.editorNode = document.createElement("div");
        this.editorNode.style.position = "absolute";
        this.editorNode.style.width = width + "px";
        this.editorNode.style.height = height + "px";
        this.editorNode.style.backfaceVisibility = "hidden";
        this.editorNode.style.webkitBackfaceVisibility = "hidden";
        this.editorNode.style.transform = "rotateY(180deg)";
        this.card.append(screenNode, this.editorNode);
        // The text editor sits in the editor node, on the back of the card.
        const fontSize = Math.round(24 * screen.scale);
        this.textarea = document.createElement("textarea");
        this.textarea.style.width = width + "px";
        this.textarea.style.height = height + "px";
        this.textarea.style.padding = this.screen.padding + "px";
        this.textarea.style.border = "0";
        this.textarea.style.borderRadius = this.screen.getBorderRadius() + "px";
        this.textarea.style.fontFamily = `"TreasureMIII64C", monospace`;
        this.textarea.style.fontSize = fontSize + "px";
        this.textarea.style.lineHeight = fontSize + "px";
        this.textarea.style.outline = "0";
        this.textarea.style.boxSizing = "border-box";
        this.textarea.placeholder = "Write your Basic program here...";
        this.editorNode.append(this.textarea);
        // Control panel for saving/canceling.
        const controlPanel = new ControlPanel_1.ControlPanel(this.editorNode);
        controlPanel.addSaveButton(() => this.save());
        controlPanel.addCancelButton(() => this.cancel());
        this.hide();
        // For Ctrl-Enter quick edit/save.
        window.addEventListener("keydown", e => this.keyboardListener(e));
    }
    /**
     * Grab the program from memory and start the editor.
     */
    startEdit() {
        const basicProgram = this.trs80.getBasicProgramFromMemory();
        if (typeof basicProgram === "string") {
            // TODO show error.
            console.error(basicProgram);
        }
        else {
            this.wasStarted = this.trs80.stop();
            this.setProgram(basicProgram);
            this.show();
        }
    }
    /**
     * Provide hot key for edit/save.
     * @param e
     */
    keyboardListener(e) {
        if (e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.key === "Enter") {
            if (this.editing) {
                this.save();
                e.preventDefault();
                e.stopPropagation();
            }
            else {
                // If the emulator is not running, then the user's not paying attention to it and
                // we shouldn't invoke the editor.
                if (this.trs80.started) {
                    this.startEdit();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    }
    /**
     * Save the program back out to memory and close the editor.
     */
    save() {
        const newBasicBinary = trs80_base_1.parseBasicText(this.textarea.value);
        if (typeof newBasicBinary === "string") {
            this.showError(newBasicBinary);
            return;
        }
        const newBasicProgram = trs80_base_1.decodeBasicProgram(newBasicBinary);
        if (newBasicProgram === undefined) {
            // I don't know how this might happen.
            this.showError("Can't decode Basic program");
            return;
        }
        this.trs80.loadBasicProgram(newBasicProgram);
        this.close();
    }
    /**
     * Cancel the editor, losing the contents.
     */
    cancel() {
        this.close();
    }
    /**
     * Close the editor and restart the emulator, if necessary.
     */
    close() {
        if (this.wasStarted) {
            this.trs80.start();
        }
        this.hide();
    }
    /**
     * Show a temporary compile error.
     */
    showError(error) {
        const errorNode = document.createElement("div");
        errorNode.innerText = error;
        errorNode.style.position = "absolute";
        errorNode.style.left = "50%";
        errorNode.style.top = "40%";
        errorNode.style.transform = "translate(-50%, 0)";
        errorNode.style.whiteSpace = "nowrap";
        errorNode.style.fontFamily = `"TreasureMIII64C", monospace`;
        errorNode.style.fontSize = "48px";
        errorNode.style.padding = "20px 30px 0 30px";
        errorNode.style.color = "white";
        errorNode.style.backgroundColor = "rgba(40, 40, 40, 0.8)";
        errorNode.style.borderRadius = "999px";
        errorNode.style.opacity = "0";
        errorNode.style.transition = "opacity .20s ease-in-out";
        this.editorNode.append(errorNode);
        setTimeout(() => {
            errorNode.style.opacity = "1";
            setTimeout(() => {
                errorNode.style.opacity = "0";
                setTimeout(() => {
                    errorNode.remove();
                }, 500);
            }, 2000);
        }, 0);
    }
    /**
     * Fill the text editor with this program.
     */
    setProgram(basicProgram) {
        const parts = [];
        for (const element of basicProgram.elements) {
            if (element.elementType === trs80_base_1.ElementType.LINE_NUMBER && parts.length > 0) {
                parts.push("\n");
            }
            // Convert to the font we're using.
            parts.push(element.asAnotherMansTreasure());
        }
        const fullText = parts.join("");
        if (fullText !== this.textarea.value) {
            // Try to keep the selection where it is.
            const selectionStart = this.textarea.selectionStart;
            const selectionEnd = this.textarea.selectionEnd;
            this.textarea.value = fullText;
            this.textarea.selectionStart = selectionStart;
            this.textarea.selectionEnd = selectionEnd;
        }
    }
    /**
     * Show the editor (back of the card).
     */
    show() {
        this.card.style.transform = "rotateY(180deg)";
        this.textarea.style.color = this.screen.getForegroundColor();
        this.textarea.style.backgroundColor = this.screen.getBackgroundColor();
        this.textarea.focus();
        this.editing = true;
    }
    /**
     * Hide the editor (show the front).
     */
    hide() {
        this.card.style.transform = "rotateY(0deg)";
        this.editing = false;
    }
}
exports.Editor = Editor;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/EditorFont.js":
/*!********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/EditorFont.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// Another Man's Treasure font, for the editor.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addCssFontToPage = void 0;
const Utils_1 = __webpack_require__(/*! ./Utils */ "./node_modules/trs80-emulator/dist/Utils.js");
const FONT_CSS_ID_NAME = Utils_1.CSS_PREFIX + "-css-font";
// Kept in a different file so the long text isn't in our way.
const FONT_CSS = `
@font-face {
    /* http://www.kreativekorp.com/software/fonts/index.shtml#retro */
    font-family: "TreasureMIII64C";
    src: url("data:font/ttf;base64,AAEAAAAKAIAAAwAgT1MvMo/ITg4AAAEoAAAAYGNtYXDl2APGAAAQrAAAAiRnbHlmfKdewwAAIfgAAZTcaGVhZAblu0AAAACsAAAANmhoZWEOdglCAAAA5AAAACRobXR42mHlKAAAAYgAAA8kbG9jYQMSP6AAABLQAAAPKG1heHAD+gDCAAABCAAAACBuYW1lQWtiywABttQAAAdncG9zdIeZwIkAAb48AAAeKAABAAAAAQAAQWWVvF8PPPUAAwlgAAAAAM9qOacAAAAAz2o5pwAA/BgI/AV4AAAADAAAAAEAAAAAAAEAAAV4/BgAAAlgAAAAAAj8AAEAAAAAAAAAAAAAAAAAAAPJAAEAAAPJAMAAMAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAwMjAfQABQAABLAJYAAABLAEsAlgAAAEsADIArwAAAAAAAAAAAAAAACAAACvUAfwygAAADAAAAAAS0JuUAAAAAD//QV4/BgAAAV4A+ggAAABAAAAAAPoBXgAAAAgAAAAAAAAAyAAAAAAAAADIAAAAyABkAMgAMgDIABkAyAAyAMgAGQDIABkAyABLAMgASwDIADIAyAAyAMgAMgDIAEsAyAAZAMgAZADIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAZADIAEsAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgASwDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAMgDIABkAyAAyAMgAMgDIAAAAyABLAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyABLAMgAGQDIABkAyABLAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAZADIADIAyAAZAMgAAADIAGQAyAAyAMgAGQDIABkAyAAyAMgAZADIADIAyAAyAMgAAADIABkAyAAZAMgAGQDIABkAyAAAAMgAGQDIADIAyAAyAMgAMgDIADIAyABLAMgAMgDIABkAyABkAMgASwDIAEsAyAAZAMgAAADIABkAyAAZAMgAGQDIABkAyAAyAMgAMgDIADIAyAAZAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAMgDIADIAyABLAMgASwDIAEsAyABLAMgAGQDIABkAyAAyAMgAMgDIADIAyAAZAMgAMgDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIAEsAyABLAMgASwDIAEsAyAAZAMgAGQDIADIAyAAyAMgAMgDIABkAyAAyAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIABkAyABLAMgAGQDIAEsAyAAyAMgAMgDIABkAyAAZAMgAMgDIABkAyAAZAMgAAADIADIAyAAZAMgAGQDIADIAyAAyAMgASwDIAGQAyAAyAMgAZADIAEsAyABLAMgAGQDIADIAyAAAAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyABLAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIADIAyAAyAMgAGQDIABkAyAAZAMgASwDIADIAyAAZAMgAMgDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIAEsAyAAyAMgASwDIABkAyAAyAMgAMgDIABkAyAAZAMgAMgDIADIAyAAyAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAAAMgAAADIAEsAyABLAMgASwDIAEsAyAAyAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAMgDIAGQAyAAyAMgAGQDIAGQAyAAZAMgAGQDIADIAyAAyAMgAMgDIABkAyAAAAMgAGQDIAAAAyAAAAMgAAADIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIAAAAyAAZAMgAGQDIADIAyAAyAMgAMgDIADIAyAAyAMgAGQDIABkAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAZADIAAAAyAAAAMgAAADIAAAAyACvAMgAAADIAGQAyAAAAMgAAADIAAAAyAAAAMgAAADIAGQAyAAAAMgAAADIABkAyAAZAMgAGQDIABkAyAAAAMgAAADIAAAAyAAAAMgAMgJYABkCWAAZAMgAAADIAAAAyAAAAMgAMgDIADIAyAAAAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIABkAyABLAMgASwDIAEsAyAAyAMgASwDIAEsAyAAZAMgAGQDIABkAyAAZAMgAMgDIABkAyABLAMgAGQDIADIAyAAZAMgAMgDIADIAyAAyAMgAGQDIABkAyAAAAMgAGQDIAAAAyAAZAMgAAADIABkAyAAAAMgAGQDIAAAAyAAZAMgAAADIABkAyAAAAMgAMgDIABkAyAAZAMgAAADIABkAyAAAAMgAGQDIAAAAyAAZAMgAAADIADIAyAAZAMgAAADIABkAyAAAAMgASwDIADIAyAAZAMgAGQDIADIAyAAZAMgAMgDIABkAyAAAAMgAAADIABkAyAAAAMgAAADIABkAyAAAAMgAAADIABkAyAAAAMgAAADIABkAyAAAAMgAAADIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIABkAyAAyAMgAGQDIADIAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAAAMgAMgDIABkAyAAAAMgAAADIAAAAyAAAAMgASwDIADIAyAAAAMgAGQDIAGQAyAAZAMgAGQDIADIAyAAZAMgAMgDIABkAyAAZAMgAGQDIAGQAyAAZAMgAGQDIADIAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAMgDIADIAyAAyAMgAGQDIAAAAyABkAMgAMgDIABkAyAAyAMgAGQDIABkAyABLAMgASwDIADIAyAAyAMgAMgDIAEsAyAAZAMgAZADIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAZADIAEsAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgASwDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAMgDIABkAyAAyAMgAMgDIAAAAyABLAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyABLAMgAGQDIABkAyABLAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAZADIADIAyAAZAMgAMgDIAAAAyAAAAMgAZADIAAAAyAAAAMgAAADIAAAAyAAAAMgAZADIAAAAyABkAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAZADIAAAAyABkAMgAAADIAAAAyAAAAMgAAADIAAAAyABkAMgAAADIAGQAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAZAMgAGQDIABkAyAAZAMgAAADIAAAAyAAyAMgAMgDIABkAyAAZAMgAGQDIAEsAyAAyAMgASwDIABkAyAAyAMgAMgDIABkAyAAZAMgAMgDIADIAyAAyAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIADIAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAyAMgAGQDIAAAAyAAZAMgAGQDIADIAyAAAAMgAGQDIAAAAyAAAAMgAGQDIAAAAyAAAAMgAMgDIAGQAyAAAAMgAMgDIADIAyAAyAMgAMgDIABkAyAAyAMgAGQDIABkAyAAyAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAMgDIABkAyAAZAMgAMgDIADIAyAAyAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAMgDIADIAyAAyAMgAGQDIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgASwDIAEsAyAAyAMgASwDIABkAyAAyAMgASwDIADIAyAAyAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAGQDIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIAEsAyAAZAMgAGQDIADIAyAAZAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAMgDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIAEsAyABLAMgAMgDIAEsAyAAZAMgAMgDIAEsAyAAyAMgAMgDIADIAyAAyAMgAMgDIADIAyAAyAMgAMgDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyABLAMgAGQDIABkAyAAyAMgAGQDIADIAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAyAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAGQDIABkAyAAZAMgAAAAAAACAAAAAwAAABQAAwABAAAAFAAEAhAAAACAAIAABgAAAAAAfgEBATEBQgFTAWEBeAF+AZICJwI3AscCywLdA6EDziAVICcgMSA6ID0gRCCsIQYhFyEeISAhIiEnIgIiDSISIhUiHiIrIkgiYCJlIwIjByMYI34lnyXIJcol5iYcJh4mOyZCJmcnEzACMBEwnDD84X/2GfcF+wL/n//9//8AAAAAACAAoAExAUEBUgFgAXgBfQGSAiYCNwLGAsoC2AOQA6MgECAYIDAgOSA8IEQgrCEFIRchHiEgISIhJiICIgYiDyIV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AAEG+AABBzwAAQekAAEICAABCLgAAQkMAAEJhAABCbQAAQowAAEKYAABCsgAAQroAAELLAABC6QAAQwcAAEMhAABDPwAAQ1YAAENvAABDjQAAQ6IAAEO1AABDzQAAQ/AAAEP+AABEFgAARCsAAERBAABEWwAARHUAAESKAABEpAAARL0AAETSAABE7AAARQYAAEUyAABFTAAARWUAAEV/AABFjAAARaYAAEXAAABF1QAARdUAAEXdAABF5QAARe0AAEX1AABF/QAARgoAAEYUAABGHAAARikAAEYxAABGOwAARkMAAEZNAABGVwAARl8AAEZnAABGdAAARoEAAEaOAABGlgAARp4AAEarAABGtQAARsIAAEbTAABG4AAARu8AAEb5AABHBQAARxEAAEcbAABHIwAARzAAAEc9AABHSgAAR1cAAEdkAABHdQAAR4QAAEeMAABHmQAAR6EAAEerAABHtQAAR8EAAEfNAABH1wAAR98AAEfsAABH+QAASAYAAEgQAABIGgAASCkAAEg1AABIPwAASE4AAEhYAABIZAAASGwAAEh2AABIgAAASIgAAEikAABIwAAASOAAAEkAAABJPgAASXwAAEmhAABJxgAASeUAAEoFAABKJQAASkoAAEpsAABKjQAASqcAAErSAABK4wAASwoAAEsrAABLQAAAS1cAAEt+AABLpgAAS7sAAEvQAABL5QAAS/YAAEwOAABMLwAATFsAAEx9AABMoAAATMYAAEzZAABM6gAATQwAAE00AABNUgAATXEAAE2SAABNtAAATfYAAE4cAABOPwAATl0AAE6FAABO4wAATxgAAE9SAABPaQAAT48AAE/BAABP6gAAUA8AAFAgAABQRwAAUI4AAFCuAABQ0AAAUNwAAFD7AABRNAAAUW8AAFGWAABRwAAAUdYAAFHgAABR6gAAUgAAAFIIAABSHQAAUjIAAFJHAABSXAAAUmwAAFKDAABSlQAAUqMAAFKzAABSzQAAUtUAAFLxAABTCwAAUykAAFM5AABTVgAAU3MAAFOLAABTqQAAU8IAAFPOAABT7wAAVA4AAFQ1AABUUgAAVHoAAFSYAABUuQAAVNUAAFTvAABVBAAAVR0AAFUqAABVVAAAVXgAAFWZAABVuAAAVc0AAFXpAABWCAAAViEAAFZCAABWbgAAVpgAAFbEAABW4QAAVvg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/zgAAAAAAAD/OAAAAMgAAP84AAAAAgDIAAACvAV4AAsADwAACQ8AyADIAAAAZAAAAMgAAP84AAD/nAAA/zgB9AAA/gwAAAPoAAABkAAA/nAAAP84AAD+cAAAAZAAAP2o/zgAAADIAAAAAQAAAlgBkAV4AAMAAAkDAAAAAAGQAAACWAMgAAD84AABAZACWAMgBXgAAwAACQMDIP5wAAABkAJYAAADIAAAAAEAAAJYAyAFeAADAAAJAwAAAAADIAAAAlgDIAAA/OAAAQAA/zgBkAJYAAMAAAkDAAAAAAGQAAD/OAMgAAD84AABAAD/OAGQBXgAAwAACQMAAAAAAZAAAP84BkAAAPnAAAIAAP84AyAFeAADAAcAAAkHAAAAAAGQAAABkP5wAAABkP84AyAAAPzgAyAAAAMgAAAAAAABAAD/OAMgBXgABQAACQUAAAAAAyAAAP5wAAD/OAZAAAD84AAA/OAAAQGQ/zgDIAJYAAMAAAkDAyD+cAAAAZD/OAAAAyAAAAACAAD/OAMgBXgAAwAHAAAJBwAAAAABkAAAAZD+cAAAAZACWAMgAAD84PzgAAADIAAAAAAAAQGQ/zgDIAV4AAMAAAkDAyD+cAAAAZD/OAAABkAAAAABAAD/OAMgBXgABQAACQUAAAAAAyAAAP5wAAACWAMgAAD5wAAAAyAAAQAA/zgDIAJYAAMAAAkDAAAAAAMgAAD/OAMgAAD84AABAAD/OAMgBXgABQAACQUAAAAAAZAAAAGQAAD/OAZAAAD84AAA/OAAAQAA/zgDIAV4AAUAAAkFAAAAAAGQAAABkAAA/zgDIAAAAyAAAPnAAAEAAP84AyAFeAADAAAJAwAAAAADIAAA/zgGQAAA+cAAAQAA/BgBkP84AAMAAAkDAAABkAAA/nD/OAAA/OAAAAACAAD8GAGQBXgAAwAHAAAJBwAAAZAAAP5wAAAAAAGQAAD/OAAA/OAAAAZAAyAAAPzgAAAAAgAA/BgDIAV4AAMABwAACQcAAAGQAAD+cAMg/nAAAAGQ/zgAAPzgAAAGQAAAAyAAAAAAAAIAAPwYAyAFeAADAAcAAAkHAAABkAAA/nAAAAAAAyAAAP84AAD84AAABkADIAAA/OAAAAABAAD8GAGQAlgAAwAACQMAAAGQAAD+cAJYAAD5wAAAAAEAAPwYAZAFeAADAAAJAwAAAZAAAP5wBXgAAPagAAAAAgAA/BgDIAV4AAMABwAACQcAAAGQAAD+cAMg/nAAAAGQAlgAAPnAAAAGQAAAAyAAAAAAAAEAAPwYAyAFeAAFAAAJBQAAAyAAAP5wAAD+cAV4AAD84AAA+cAAAAACAAD8GAMgAlgAAwAHAAAJBwAAAZAAAP5wAyD+cAAAAZD/OAAA/OAAAAMgAAADIAAAAAAAAwAA/BgDIAV4AAMABwALAAAJCwAAAZAAAP5wAAAAAAGQAAABkP5wAAABkP84AAD84AAABkADIAAA/OD84AAAAyAAAAACAAD8GAMgBXgAAwAHAAAJBwAAAZAAAP5wAyD+cAAAAZD/OAAA/OAAAAMgAAAGQAAAAAAAAgAA/BgDIAV4AAMACQAACQkAAAGQAAD+cAAAAAADIAAA/nAAAP84AAD84AAABkADIAAA+cAAAAMgAAAAAQAA/BgDIAJYAAUAAAkFAAADIAAA/nAAAP5wAlgAAPzgAAD84AAAAAEAAPwYAyAFeAAHAAAJBwAAAZAAAAGQAAD+cAAA/nAFeAAA/OAAAPzgAAD84AAAAAEAAPwYAyAFeAAHAAAJBwAAAZAAAAGQAAD+cAAA/nACWAAAAyAAAPnAAAD84AAAAAEAAPwYAyAFeAAFAAAJBQAAAyAAAP5wAAD+cAV4AAD5wAAA/OAAAAABAZD8GAMg/zgAAwAACQMDIP5wAAABkPwYAAADIAAAAAIAAPwYAyAFeAADAAcAAAkHAAAAAAGQAAABkP5wAAABkAJYAyAAAPzg+cAAAAMgAAAAAAACAZD8GAMgBXgAAwAHAAAJBwMg/nAAAAGQAAD+cAAAAZD8GAAAAyAAAAMgAAADIAAAAAAAAgAA/BgDIAV4AAMABwAACQcAAAAAAyAAAAAA/nAAAAGQAlgDIAAA/OD5wAAAAyAAAAAAAAIAAPwYAyACWAADAAcAAAkHAAAAAAGQAAABkP5wAAABkP84AyAAAPzg/OAAAAMgAAAAAAACAAD8GAMgBXgAAwAHAAAJBwAAAAABkAAAAZD+cAAAAZD/OAZAAAD5wPzgAAADIAAAAAAAAwAA/BgDIAV4AAMABwALAAAJCwAAAAABkAAAAZD+cAAAAZAAAP5wAAABkP84AyAAAPzg/OAAAAMgAAADIAAAAyAAAAACAAD8GAMgBXgABQAJAAAJCQAAAAADIAAA/nAAAAGQ/nAAAAGQ/zgGQAAA/OAAAPzg/OAAAAMgAAAAAAABAZD8GAMgAlgAAwAACQMDIP5wAAABkPwYAAAGQAAAAAIAAPwYAyAFeAADAAcAAAkHAAAAAAGQAAABkP5wAAABkAJYAyAAAPzg+cAAAAZAAAAAAAABAZD8GAMgBXgAAwAACQMDIP5wAAABkPwYAAAJYAAAAAEAAPwYAyAFeAAFAAAJBQAAAAADIAAA/nAAAAJYAyAAAPagAAAGQAABAAD8GAMgAlgABQAACQUAAAAAAyAAAP5wAAD/OAMgAAD5wAAAAyAAAQAA/BgDIAV4AAcAAAkHAAAAAAGQAAABkAAA/nAAAP84BkAAAPzgAAD5wAAAAyAAAQAA/BgDIAV4AAcAAAkHAAAAAAGQAAABkAAA/nAAAP84AyAAAAMgAAD2oAAAAyAAAQAA/BgDIAV4AAUAAAkFAAAAAAMgAAD+cAAA/zgGQAAA9qAAAAMgAAEAAPwYAyD/OAADAAAJAwAAAyAAAPzg/zgAAPzgAAAAAgAA/BgDIAV4AAMABwAACQcAAAMgAAD84AAAAAABkAAA/zgAAPzgAAAGQAMgAAD84AAAAAIAAPwYAyAFeAADAAcAAAkHAAADIAAA/OADIP5wAAABkP84AAD84AAABkAAAAMgAAAAAAACAAD8GAMgBXgAAwAHAAAJBwAAAyAAAPzgAAAAAAMgAAD/OAAA/OAAAAZAAyAAAPzgAAAAAQAA/BgDIAJYAAUAAAkFAAABkAAAAZAAAPzgAlgAAPzgAAD84AAAAAEAAPwYAyAFeAAFAAAJBQAAAZAAAAGQAAD84AV4AAD5wAAA/OAAAAACAAD8GAMgBXgABQAJAAAJCQAAAZAAAAGQAAD84AMg/nAAAAGQAlgAAPzgAAD84AAABkAAAAMgAAAAAAABAAD8GAMgBXgABwAACQcAAAMgAAD+cAAAAZAAAPzgBXgAAPzgAAD84AAA/OAAAAABAAD8GAMgAlgABQAACQUAAAGQAAABkAAA/OD/OAAAAyAAAPnAAAAAAgAA/BgDIAV4AAUACQAACQkAAAGQAAABkAAA/OAAAAAAAZAAAP84AAADIAAA+cAAAAZAAyAAAPzgAAAAAQAA/BgDIAV4AAUAAAkFAAABkAAAAZAAAPzg/zgAAAZAAAD2oAAAAAEAAPwYAyAFeAAHAAAJBwAAAZAAAP5w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Q01lZGl1bUJpdHNOUGljYXM6IEFub3RoZXJNYW5zVHJlYXN1cmVNSUlJNjRDOiAyMDE0QW5vdGhlciBNYW5zIFRyZWFzdXJlIE1JSUkgNjRDVmVyc2lvbiAxLjBBbm90aGVyTWFuc1RyZWFzdXJlTUlJSTY0Q01hZGUgd2l0aCBCaXRzJ24nUGljYXMgYnkgS3JlYXRpdmUgU29mdHdhcmVodHRwOi8vd3d3LmtyZWF0aXZla29ycC5jb20vc29mdHdhcmUvYml0c25waWNhcy8AQwByAGUAYQB0AGUAZAAgAGIAeQAgAFIAZQBiAGUAYwBjAGEAIABCAGUAdAB0AGUAbgBjAG8AdQByAHQAIAB3AGkAdABoACAARgBvAG4AdABGAG8AcgBnAGUAIAAyAC4AMAAgACgAaAB0AHQAcAA6AC8ALwBmAG8AbgB0AGYAbwByAGcAZQAuAHMAZgAuAG4AZQB0ACkAQQBuAG8AdABoAGUAcgAgAE0AYQBuAHMAIABUAHIAZQBhAHMAdQByAGUAIABNAEkASQBJACAANgA0AEMATQBlAGQAaQB1AG0AQgBpAHQAcwBOAFAAaQBjAGEAcwA6ACAAQQBuAG8AdABoAGUAcgBNAGEAbgBzAFQAcgBlAGEAcwB1AHIAZQBNAEkASQBJADYANABDADoAIAAyADAAMQA0AEEAbgBvAHQAaABlAHIAIABNAGEAbgBzACAAVAByAGUAYQBzAHUAcgBlACAATQBJAEkASQAgADYANABDAFYAZQByAHMAaQBvAG4AIAAxAC4AMABBAG4AbwB0AGgAZQByAE0AYQBuAHMAVAByAGUAYQBzAHUAcgBlAE0ASQBJAEkANgA0AEMATQBhAGQAZQAgAHcAaQB0AGgAIABCAGkAdABzACcAbgAnAFAAaQBjAGEAcwAgAGIAeQAgAEsAcgBlAGEAdABpAHYAZQAgAFMAbwBmAHQAdwBhAHIAZQBoAHQAdABwADoALwAvAHcAdwB3AC4AawByAGUAYQB0AGkAdgBlAGsAbwByAHAALgBjAG8AbQAvAHMAbwBmAHQAdwBhAHIAZQAvAGIAaQB0AHMAbgBwAGkAYwBhAHMALwAAAgAAAAAAAP84AMgAAAAAAAAAAAAAAAAAAAAAAAAAAAPJAAAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8AEAARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAB4AHwAgACEAIgAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGAAYQCsAKMAhACFAL0AlgDoAIYAjgCLAJ0AqQCkAQIAigDaAIMAkwDyAPMAjQCXAIgBAwDeAPEAngCqAPUA9AD2AKIArQDJAMcArgBiAGMAkABkAMsAZQDIAMoAzwDMAM0AzgDpAGYA0wDQANEArwBnAPAAkQDWANQA1QBoAOsA7QCJAGoAaQBrAG0AbABuAKAAbwBxAHAAcgBzAHUAdAB2AHcA6gB4AHoAeQB7AH0AfAC4AKEAfwB+AIAAgQDsAO4AugEEAQUA1wDiAOMAsACxAOQA5QC7AOYA5wCmAQYBBwEIANgA4QEJAQoA2wDcAN0A4AELAN8BDAENAQ4BDwEQAREBEgETARQBFQEWARcBGAEZARoBGwEcAR0BHgEfASABIQEiASMBJAElASYBJwEoASkBKgErASwBLQEuAS8BMAExATIBMwE0ATUBNgE3ATgBOQE6AJsBOwE8AT0BPgE/AUABQQFCAUMBRAFFAUYBRwFIAUkBSgFLALIAswFMALYAtwDEAU0AtAC1AMUBTgCCAMIAhwFPAVABUQCrAVIAxgFTAL4AvwFUAVUBVgFXAVgBWQFaAVsBXACMAJ8BXQCYAKgBXgFfAWABYQFiAWMBZACaAWUAmQDvALwApQFmAWcBaACSAJwApwCPAJQAlQFpAWoBawFsAW0BbgFvAXABcQFyAXMBdAF1AXYBdwF4AXkBegF7AXwBfQF+AX8BgAGBAYIBgwGEAYUBhgGHAYgBiQGKAYsBjAGNAY4BjwGQALkBkQGSAZMBlAGVAZYBlwGYAZkBmgGbAZwBnQGeAZ8BoAGhAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAbQBtQG2AbcBuAG5AboBuwG8Ab0BvgG/AcABwQHCAcMBxAHFAcYBxwHIAckBygHLAcwBzQHOAc8B0AHRAdIB0wHUAdUB1gHXAdgB2QHaAdsB3AHdAd4B3wHgAeEB4gHjAeQB5QHmAecB6AHpAeoB6wHsAe0B7gHvAfAB8QHyAfMB9AH1AfYB9wH4AfkB+gH7AfwB/QH+Af8CAAIBAgICAwIEAgUCBgIHAggCCQIKAgsCDAINAg4CDwIQAhECEgITAhQCFQIWAhcCGAIZAhoCGwIcAh0CHgIfAiACIQIiAiMCJAIlAiYCJwIoAikCKgIrAiwCLQIuAi8CMAIxAjICMwI0AjUCNgI3AjgCOQI6AjsCPAI9Aj4CPwJAAkECQgJDAkQCRQJGAkcCSAJJAkoCSwJMAk0CTgJPAlACUQJSAlMCVAJVAlYCVwJYAlkCWgJbAlwCXQJeAl8CYAJhAmICYwJkAmUCZgJnAmgCaQJqAmsCbAJtAm4CbwJwAnECcgJzAnQCdQJ2AncCeAJ5AnoCewJ8An0CfgJ/AoACgQKCAoMChAKFAoYChwKIAokCigKLAowCjQKOAo8CkAKRApICkwKUApUClgKXApgCmQKaApsCnAKdAp4CnwKgAqECogKjAqQCpQKmAqcCqAKpAqoCqwKsAq0CrgKvArACsQKyArMCtAK1ArYCtwK4ArkCugK7ArwCvQK+Ar8CwALBAsICwwLEAsUCxgLHAsgCyQLKAssCzALNAs4CzwLQAtEC0gLTAtQC1QLWAtcC2ALZAtoC2wLcAt0C3gLfAuAC4QLiAuMC5ALlAuYC5wLoAukC6gLrAuwC7QLuAu8C8ALxAvIC8wL0AvUC9gL3AvgC+QL6AvsC/AL9Av4C/wMAAwEDAgMDAwQDBQMGAwcDCAMJAwoDCwMMAw0DDgMPAxADEQMSAxMDFAMVAxYDFwMYAxkDGgMbAxwDHQMeAx8DIAMhAyIDIwMkAyUDJgMnAygDKQMqAysDLAMtAy4DLwMwAzEDMgMzAzQDNQM2AzcDOAM5AzoDOwM8Az0DPgM/A0ADQQNCA0MDRANFA0YDRwNIA0kDSgNLA0wDTQNOA08DUANRA1IDUwNUA1UDVgNXA1gDWQNaA1sDXANdA14DXwNgA2EDYgNjA2QDZQNmA2cDaANpA2oDawNsA20DbgNvA3ADcQNyA3MDdAN1A3YDdwN4A3kDegN7A3wDfQN+A38DgAOBA4IDgwOEA4UDhgOHA4gDiQOKA4sDjAONA44DjwOQA5EDkgOTA5QDlQOWAMAAwQOXA5gDmQOaA5sDnAOdA54DnwOgA6EDogOjA6QDpQOmA6cDqAOpA6oDqwOsA60DrgOvA7ADsQOyA7MDtAO1A7YDtwO4A7kDugO7A7wDvQO+A78DwAPBA8IDwwPEA8UDxgPHA8gDyQPKA8sDzAPNA84DzwPQA9ED0gPTA9QD1QPWBmh5cGhlbg5wZXJpb2RjZW50ZXJlZAdBbWFjcm9uB2FtYWNyb24HdW5pMDIyNgd1bmkwMjI3B3VuaTAyMzcHdW5pMDJDQQd1bmkwMkNCBXRpbGRlEWlvdGFkaWVyZXNpc3Rvbm9zBUFscGhhBEJldGEFR2FtbWEFRGVsdGEHRXBzaWxvbgRaZXRhA0V0YQVUaGV0YQRJb3RhBUthcHBhBkxhbWJkYQJNdQJOdQJYaQdPbWljcm9uAlBpA1JobwVTaWdtYQNUYXUHVXBzaWxvbgNQaGkDQ2hpA1BzaQVPbWVnYQxJb3RhZGllcmVzaXMPVXBzaWxvbmRpZXJlc2lzCmFscGhhdG9ub3MMZXBzaWxvbnRvbm9zCGV0YXRvbm9zCWlvdGF0b25vcxR1cHNpbG9uZGllcmVzaXN0b25vcwVhbHBoYQRiZXRhBWdhbW1hBWRlbHRhB2Vwc2lsb24EemV0YQNldGEFdGhldGEEaW90YQVrYXBwYQZsYW1iZGECbXUCbnUCeGkHb21pY3JvbgNyaG8Gc2lnbWExBXNpZ21hA3RhdQd1cHNpbG9uA3BoaQNjaGkDcHNpBW9tZWdhDGlvdGFkaWVyZXNpcw91cHNpbG9uZGllcmVzaXMMb21pY3JvbnRvbm9zDHVwc2lsb250b25vcwpvbWVnYXRvbm9zB3VuaTIwMTAHdW5pMjAxMQd1bmkyMDEyCWFmaWkwMDIwOA1xdW90ZXJldmVyc2VkB3VuaTIwMUYHdW5pMjAyMwd1bmkyMDI0B3VuaTIwMjUHdW5pMjAyNwd1bmkyMDMxCWV4Y2xhbWRibAd1bmkyMDNECGZyYWN0aW9uBEV1cm8JYWZpaTYxMjQ4B3VuaTIxMDYHdW5pMjExNwd1bmkyMTFFB3VuaTIxMjAHdW5pMjEyNwd1bmkyMjA3B3VuaTIyMDgHdW5pMjIwOQd1bmkyMjBBB3VuaTIyMEIHdW5pMjIwQwd1bmkyMjBEB3VuaTIyMTAHdW5pMjIxQgd1bmkyMjFDB3VuaTIyMUQHdW5pMjMwMQVob3VzZQd1bmkyMzA3B3VuaTIzMTgHdW5pMjM3RQd1cGJsb2NrB3VuaTI1ODEHdW5pMjU4Mgd1bmkyNTgzB2RuYmxvY2sHdW5pMjU4NQd1bmkyNTg2B3VuaTI1ODcFYmxvY2sHdW5pMjU4OQd1bmkyNThBB3VuaTI1OEIHbGZibG9jawd1bmkyNThEB3VuaTI1OEUHdW5pMjU4RgdydGJsb2NrB2x0c2hhZGUFc2hhZGUHZGtzaGFkZQd1bmkyNTk0B3VuaTI1OTUHdW5pMjU5Ngd1bmkyNTk3B3VuaTI1OTgHdW5pMjU5OQd1bmkyNTlBB3VuaTI1OUIHdW5pMjU5Qwd1bmkyNTlEB3VuaTI1OUUHdW5pMjU5Rgd1bmkyNUM2B3VuaTI1QzcHdW5pMjVDOAd1bmkyNUUyB3VuaTI1RTMHdW5pMjVFNAd1bmkyNUU1Cm9wZW5idWxsZXQHdW5pMjYxQwd1bmkyNjFFB3VuaTI2MzkJc21pbGVmYWNlDGludnNtaWxlZmFjZQZmZW1hbGUHdW5pMjY0MQRtYWxlBXNwYWRlB3VuaTI2NjEHdW5pMjY2MgRjbHViB3VuaTI2NjQFaGVhcnQHZGlhbW9uZAd1bmkyNjY3B3VuaTI3MTMHdW5pMzAwMQd1bmkzMDAyB3VuaTMwMEMHdW5pMzAwRAd1bmkzMDBFB3VuaTMwMEYHdW5pMzAxMAd1bmkzMDExB3VuaTMwOTkHdW5pMzA5QQd1bmkzMDlCB3VuaTMwOUMHdW5pMzBBMQd1bmkzMEEyB3VuaTMwQTMHdW5pMzBBNAd1bmkzMEE1B3VuaTMwQTYHdW5pMzBBNwd1bmkzMEE4B3VuaTMwQTkHdW5pMzBBQQd1bmkzMEFCB3VuaTMwQUMHdW5pMzBBRAd1bmkzMEFFB3VuaTMwQUYHdW5pMzBCMAd1bmkzMEIxB3VuaTMwQjIHdW5pMzBCMwd1bmkzMEI0B3VuaTMwQjUHdW5pMzBCNgd1bmkzMEI3B3VuaTMwQjgHdW5pMzBCOQd1bmkzMEJBB3VuaTMwQkIHdW5pMzBCQwd1bmkzMEJEB3VuaTMwQkUHdW5pMzBCRgd1bmkzMEMwB3VuaTMwQzEHdW5pMzBDMgd1bmkzMEMzB3VuaTMwQzQHdW5pMzBDNQd1bmkzMEM2B3VuaTMwQzcHdW5pMzBDOAd1bmkzMEM5B3VuaTMwQ0EHdW5pMzBDQgd1bmkzMENDB3VuaTMwQ0QHdW5pMzBDRQd1bmkzMENGB3VuaTMwRDAHdW5pMzBEMQd1bmkzMEQyB3VuaTMwRDMHdW5pMzBENAd1bmkzMEQ1B3VuaTMwRDYHdW5pMzBENwd1bmkzMEQ4B3VuaTMwRDkHdW5pMzBEQQd1bmkzMERCB3VuaTMwREMHdW5pMzBERAd1bmkzMERFB3VuaTMwREYHdW5pMzBFMAd1bmkzMEUxB3VuaTMwRTIHdW5pMzBFMwd1bmkzMEU0B3VuaTMwRTUHdW5pMzBFNgd1bmkzMEU3B3VuaTMwRTgHdW5pMzBFOQd1bmkzMEVBB3VuaTMwRUIHdW5pMzBFQwd1bmkzMEVEB3VuaTMwRUUHdW5pMzBFRgd1bmkzMEYwB3VuaTMwRjEHdW5pMzBGMgd1bmkzMEYzB3VuaTMwRjQHdW5pMzBGNQd1bmkzMEY2B3VuaTMwRjcHdW5pMzBGOAd1bmkzMEY5B3VuaTMwRkEHdW5pMzBGQgd1bmkzMEZDB3VuaUUwMDAHdW5pRTAwMQd1bmlFMDAyB3VuaUUwMDMHdW5pRTAwNAd1bmlFMDA1B3VuaUUwMDYHdW5pRTAwNwd1bmlFMDA4B3VuaUUwMDkHdW5pRTAwQQd1bmlFMDBCB3VuaUUwMEMHdW5pRTAwRAd1bmlFMDBFB3VuaUUwMEYHdW5pRTAxMAd1bmlFMDExB3VuaUUwMTIHdW5pRTAxMwd1bmlFMDE0B3VuaUUwMTUHdW5pRTAxNgd1bmlFMDE3B3VuaUUwMTgHdW5pRTAxOQd1bmlFMDFBB3VuaUUwMUIHdW5pRTAxQwd1bmlFMDFEB3VuaUUwMUUHdW5pRTAxRgd1bmlFMDIwB3VuaUUwMjEHdW5pRTAyMgd1bmlFMDIzB3VuaUUwMjQHdW5pRTAyNQd1bmlFMDI2B3VuaUUwMjcHdW5pRTAyOAd1bmlFMDI5B3VuaUUwMkEHdW5pRTAyQgd1bmlFMDJDB3VuaUUwMkQHdW5pRTAyRQd1bmlFMDJGB3VuaUUwMzAHdW5pRTAzMQd1bmlFMDMyB3VuaUUwMzMHdW5pRTAzNAd1bmlFMDM1B3VuaUUwMzYHdW5pRTAzNwd1bmlFMDM4B3VuaUUwMzkHdW5pRTAzQQd1bmlFMDNCB3VuaUUwM0MHdW5pRTAzRAd1bmlFMDNFB3VuaUUwM0YHdW5pRTA0MAd1bmlFMDQxB3VuaUUwNDIHdW5pRTA0Mwd1bmlFMDQ0B3VuaUUwNDUHdW5pRTA0Ngd1bmlFMDQ3B3VuaUUwNDgHdW5pRTA0OQd1bmlFMDRBB3VuaUUwNEIHdW5pRTA0Qwd1bmlFMDREB3VuaUUwNEUHdW5pRTA0Rgd1bmlFMDUwB3VuaUUwNTEHdW5pRTA1Mgd1bmlFMDUzB3VuaUUwNTQHdW5pRTA1NQd1bmlFMDU2B3VuaUUwNTcHdW5pRTA1OAd1bmlFMDU5B3VuaUUwNUEHdW5pRTA1Qgd1bmlFMDVDB3VuaUUwNUQHdW5pRTA1RQd1bmlFMDVGB3VuaUUwNjAHdW5pRTA2MQd1bmlFMDYyB3VuaUUwNjMHdW5pRTA2NAd1bmlFMDY1B3VuaUUwNjYHdW5pRTA2Nwd1bmlFMDY4B3VuaUUwNjkHdW5pRTA2QQd1bmlFMDZCB3VuaUUwNkMHdW5pRTA2RAd1bmlFMDZFB3VuaUUwNkYHdW5pRTA3MAd1bmlFMDcxB3VuaUUwNzIHdW5pRTA3Mwd1bmlFMDc0B3VuaUUwNzUHdW5pRTA3Ngd1bmlFMDc3B3VuaUUwNzgHdW5pRTA3OQd1bmlFMDdBB3VuaUUwN0IHdW5pRTA3Qwd1bmlFMDdEB3VuaUUwN0UHdW5pRTA3Rgd1bmlFMDgwB3VuaUUwODEHdW5pRTA4Mgd1bmlFMDgzB3VuaUUwODQHdW5pRTA4NQd1bmlFMDg2B3VuaUUwODcHdW5pRTA4OAd1bmlFMDg5B3VuaUUwOEEHdW5pRTA4Qgd1bmlFMDhDB3VuaUUwOEQHdW5pRTA4RQd1bmlFMDhGB3VuaUUwOTAHdW5pRTA5MQd1bmlFMDkyB3VuaUUwOTMHdW5pRTA5NAd1bmlFMDk1B3VuaUUwOTYHdW5pRTA5Nwd1bmlFMDk4B3VuaUUwOTkHdW5pRTA5QQd1bmlFMDlCB3VuaUUwOUMHdW5pRTA5RAd1bmlFMDlFB3VuaUUwOUYHdW5pRTBBMAd1bmlFMEExB3VuaUUwQTIHdW5pRTBBMwd1bmlFMEE0B3VuaUUwQTUHdW5pRTBBNgd1bmlFMEE3B3VuaUUwQTgHdW5pRTBBOQd1bmlFMEFBB3VuaUUwQUIHdW5pRTBBQwd1bmlFMEFEB3VuaUUwQUUHdW5pRTBBRgd1bmlFMEIwB3VuaUUwQjEHdW5pRTBCMgd1bmlFMEIzB3VuaUUwQjQHdW5pRTBCNQd1bmlFMEI2B3VuaUUwQjcHdW5pRTBCOAd1bmlFMEI5B3VuaUUwQkEHdW5pRTBCQgd1bmlFMEJDB3VuaUUwQkQHdW5pRTBCRQd1bmlFMEJGB3VuaUUwQzAHdW5pRTBDMQd1bmlFMEMyB3VuaUUwQzMHdW5pRTBDNAd1bmlFMEM1B3VuaUUwQzYHdW5pRTBDNwd1bmlFMEM4B3VuaUUwQzkHdW5pRTBDQQd1bmlFMENCB3VuaUUwQ0MHdW5pRTBDRAd1bmlFMENFB3VuaUUwQ0YHdW5pRTBEMAd1bmlFMEQxB3VuaUUwRDIHdW5pRTBEMwd1bmlFMEQ0B3VuaUUwRDUHdW5pRTBENgd1bmlFMEQ3B3VuaUUwRDgHdW5pRTBEOQd1bmlFMERBB3VuaUUwREIHdW5pRTBEQwd1bmlFMEREB3VuaUUwREUHdW5pRTBERgd1bmlFMEUwB3VuaUUwRTEHdW5pRTBFMgd1bmlFMEUzB3VuaUUwRTQHdW5pRTBFNQd1bmlFMEU2B3VuaUUwRTcHdW5pRTBFOAd1bmlFMEU5B3VuaUUwRUEHdW5pRTBFQgd1bmlFMEVDB3VuaUUwRUQHdW5pRTBFRQd1bmlFMEVGB3VuaUUwRjAHdW5pRTBGMQd1bmlFMEYyB3VuaUUwRjMHdW5pRTBGNAd1bmlFMEY1B3VuaUUwRjYHdW5pRTBGNwd1bmlFMEY4B3VuaUUwRjkHdW5pRTBGQQd1bmlFMEZCB3VuaUUwRkMHdW5pRTBGRAd1bmlFMEZFB3VuaUUwRkYHdW5pRTEwMAd1bmlFMTAxB3VuaUUxMDIHdW5pRTEwMwd1bmlFMTA0B3VuaUUxMDUHdW5pRTEwNgd1bmlFMTA3B3VuaUUxMDgHdW5pRTEwOQd1bmlFMTBBB3VuaUUxMEIHdW5pRTEwQwd1bmlFMTBEB3VuaUUxMEUHdW5pRTEwRgd1bmlFMTEwB3VuaUUxMTEHdW5pRTExMgd1bmlFMTEzB3VuaUUxMTQHdW5pRTExNQd1bmlFMTE2B3VuaUUxMTcHdW5pRTExOAd1bmlFMTE5B3VuaUUxMUEHdW5pRTExQgd1bmlFMTFDB3VuaUUxMUQHdW5pRTExRQd1bmlFMTFGB3VuaUUxMjAHdW5pRTEyMQd1bmlFMTIyB3VuaUUxMjMHdW5pRTEyNAd1bmlFMTI1B3VuaUUxMjYHdW5pRTEyNwd1bmlFMTI4B3VuaUUxMjkHdW5pRTEyQQd1bmlFMTJCB3VuaUUxMkMHdW5pRTEyRAd1bmlFMTJFB3VuaUUxMkYHdW5pRTEzMAd1bmlFMTMxB3VuaUUxMzIHdW5pRTEzMwd1bmlFMTM0B3VuaUUxMzUHdW5pRTEzNgd1bmlFMTM3B3VuaUUxMzgHdW5pRTEzOQd1bmlFMTNBB3VuaUUxM0IHdW5pRTEzQwd1bmlFMTNEB3VuaUUxM0UHdW5pRTEzRgd1bmlFMTQwB3VuaUUxNDEHdW5pRTE0Mgd1bmlFMTQzB3VuaUUxNDQHdW5pRTE0NQd1bmlFMTQ2B3VuaUUxNDcHdW5pRTE0OAd1bmlFMTQ5B3VuaUUxNEEHdW5pRTE0Qgd1bmlFMTRDB3VuaUUxNEQHdW5pRTE0RQd1bmlFMTRGB3VuaUUxNTAHdW5pRTE1MQd1bmlFMTUyB3VuaUUxNTMHdW5pRTE1NAd1bmlFMTU1B3VuaUUxNTYHdW5pRTE1Nwd1bmlFMTU4B3VuaUUxNTkHdW5pRTE1QQd1bmlFMTVCB3VuaUUxNUMHdW5pRTE1RAd1bmlFMTVFB3VuaUUxNUYHdW5pRTE2MAd1bmlFMTYxB3VuaUUxNjIHdW5pRTE2Mwd1bmlFMTY0B3VuaUUxNjUHdW5pRTE2Ngd1bmlFMTY3B3VuaUUxNjgHdW5pRTE2OQd1bmlFMTZBB3VuaUUxNkIHdW5pRTE2Qwd1bmlFMTZEB3VuaUUxNkUHdW5pRTE2Rgd1bmlFMTcwB3VuaUUxNzEHdW5pRTE3Mgd1bmlFMTczB3VuaUUxNzQHdW5pRTE3NQd1bmlFMTc2B3VuaUUxNzcHdW5pRTE3OAd1bmlFMTc5B3VuaUUxN0EHdW5pRTE3Qgd1bmlFMTdDB3VuaUUxN0QHdW5pRTE3RQd1bmlFMTdGB3VuaUY2MTgHdW5pRjYxOQd1bmlGNzAwB3VuaUY3MDEHdW5pRjcwMgd1bmlGNzAzB3VuaUY3MDQHdW5pRjcwNQd1bmlGRjYxB3VuaUZGNjIHdW5pRkY2Mwd1bmlGRjY0B3VuaUZGNjUHdW5pRkY2Ngd1bmlGRjY3B3VuaUZGNjgHdW5pRkY2OQd1bmlGRjZBB3VuaUZGNkIHdW5pRkY2Qwd1bmlGRjZEB3VuaUZGNkUHdW5pRkY2Rgd1bmlGRjcwB3VuaUZGNzEHdW5pRkY3Mgd1bmlGRjczB3VuaUZGNzQHdW5pRkY3NQd1bmlGRjc2B3VuaUZGNzcHdW5pRkY3OAd1bmlGRjc5B3VuaUZGN0EHdW5pRkY3Qgd1bmlGRjdDB3VuaUZGN0QHdW5pRkY3RQd1bmlGRjdGB3VuaUZGODAHdW5pRkY4MQd1bmlGRjgyB3VuaUZGODMHdW5pRkY4NAd1bmlGRjg1B3VuaUZGODYHdW5pRkY4Nwd1bmlGRjg4B3VuaUZGODkHdW5pRkY4QQd1bmlGRjhCB3VuaUZGOEMHdW5pRkY4RAd1bmlGRjhFB3VuaUZGOEYHdW5pRkY5MAd1bmlGRjkxB3VuaUZGOTIHdW5pRkY5Mwd1bmlGRjk0B3VuaUZGOTUHdW5pRkY5Ngd1bmlGRjk3B3VuaUZGOTgHdW5pRkY5OQd1bmlGRjlBB3VuaUZGOUIHdW5pRkY5Qwd1bmlGRjlEB3VuaUZGOUUHdW5pRkY5Rgd1bmlGRkZE");
}
`;
/**
 * Add the above CSS to the page if it's not already there. Idempotent.
 */
function addCssFontToPage() {
    if (document.getElementById(FONT_CSS_ID_NAME) === null) {
        const node = document.createElement("style");
        node.id = FONT_CSS_ID_NAME;
        node.innerHTML = FONT_CSS;
        document.head.append(node);
    }
}
exports.addCssFontToPage = addCssFontToPage;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/EventScheduler.js":
/*!************************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/EventScheduler.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventScheduler = exports.ScheduledEvent = exports.EventType = void 0;
/**
 * Type of event, for mass canceling.
 */
var EventType;
(function (EventType) {
    // Disk events.
    EventType[EventType["DISK_DONE"] = 1] = "DISK_DONE";
    EventType[EventType["DISK_LOST_DATA"] = 2] = "DISK_LOST_DATA";
    EventType[EventType["DISK_FIRST_DRQ"] = 4] = "DISK_FIRST_DRQ";
    // All disk events.
    EventType[EventType["DISK_ALL"] = 7] = "DISK_ALL";
})(EventType = exports.EventType || (exports.EventType = {}));
/**
 * An event scheduled for the future.
 */
class ScheduledEvent {
    constructor(eventType, handle, tStateCount, callback) {
        this.eventType = eventType;
        this.handle = handle;
        this.tStateCount = Math.round(tStateCount);
        this.callback = callback;
    }
    /**
     * Whether the event type of this event is included in the mask.
     */
    matchesEventTypeMask(eventTypeMask) {
        return this.eventType !== undefined && (this.eventType & eventTypeMask) !== 0;
    }
}
exports.ScheduledEvent = ScheduledEvent;
/**
 * Stores events in chronological order and fires them off.
 */
class EventScheduler {
    constructor() {
        this.counter = 1;
        // Sorted by tStateCount.
        this.events = [];
    }
    /**
     * Dispatch all events ready to go.
     *
     * @param tStateCount current clock count.
     */
    dispatch(tStateCount) {
        while (this.events.length > 0 && tStateCount >= this.events[0].tStateCount) {
            const scheduledEvent = this.events.shift();
            scheduledEvent.callback();
        }
    }
    /**
     * Schedule an event to happen at tStateCount clocks. The callback will be called
     * at the end of an instruction step.
     *
     * @return a handle that can be passed to cancel().
     */
    add(eventType, tStateCount, callback) {
        let handle = this.counter++;
        this.events.push(new ScheduledEvent(eventType, handle, tStateCount, callback));
        this.events.sort((a, b) => {
            if (a.tStateCount < b.tStateCount) {
                return -1;
            }
            else if (a.tStateCount > b.tStateCount) {
                return 1;
            }
            else {
                return 0;
            }
        });
        return handle;
    }
    /**
     * Cancel an event scheduled by add().
     */
    cancel(handle) {
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].handle === handle) {
                this.events.splice(i, 1);
                break;
            }
        }
    }
    /**
     * Cancel all events that are included in the mask.
     */
    cancelByEventTypeMask(eventTypeMask) {
        this.events = this.events.filter(e => !e.matchesEventTypeMask(eventTypeMask));
    }
    /**
     * Returns the first (next to dispatch) event included in the mask, or undefined if none.
     * Does not remove the event from the queue.
     */
    getFirstEvent(eventTypeMask) {
        for (const event of this.events) {
            if (event.matchesEventTypeMask(eventTypeMask)) {
                return event;
            }
        }
        return undefined;
    }
}
exports.EventScheduler = EventScheduler;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/FloppyDiskController.js":
/*!******************************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/FloppyDiskController.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Floppy disk controller for the TRS-80.
 *
 * References:
 *
 * https://hansotten.file-hunter.com/technical-info/wd1793/
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FloppyDiskController = exports.FLOPPY_DRIVE_COUNT = void 0;
const trs80_base_1 = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
const strongly_typed_events_1 = __webpack_require__(/*! strongly-typed-events */ "./node_modules/strongly-typed-events/dist/index.js");
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const EventScheduler_1 = __webpack_require__(/*! ./EventScheduler */ "./node_modules/trs80-emulator/dist/EventScheduler.js");
// Whether this controller supports writing.
const SUPPORT_WRITING = false;
// Number of physical drives.
exports.FLOPPY_DRIVE_COUNT = 4;
// Width of the index hole as a fraction of the circumference.
const HOLE_WIDTH = 0.01;
// Speed of disk.
const RPM = 300;
// How long the disk motor stays on after drive selected, in seconds.
const MOTOR_TIME_AFTER_SELECT = 2;
/**
 * Converts boolean for "back" to a Side.
 */
function booleanToSide(back) {
    return back ? trs80_base_1.Side.BACK : trs80_base_1.Side.FRONT;
}
// Type I status bits.
const STATUS_BUSY = 0x01; // Whether a command is in progress.
const STATUS_INDEX = 0x02; // The head is currently over the index hole.
const STATUS_TRACK_ZERO = 0x04; // Head is on track 0.
const STATUS_CRC_ERROR = 0x08; // CRC error.
const STATUS_SEEK_ERROR = 0x10; // Seek error.
const STATUS_HEAD_ENGAGED = 0x20; // Head engaged.
const STATUS_WRITE_PROTECTED = 0x40; // Write-protected.
const STATUS_NOT_READY = 0x80; // Disk not ready (motor not running).
// Type II and III status bits.
//    STATUS_BUSY = 0x01;
const STATUS_DRQ = 0x02; // Data is ready to be read or written.
const STATUS_LOST_DATA = 0x04; // CPU was too slow to read.
//    STATUS_CRC_ERROR = 0x08;
const STATUS_NOT_FOUND = 0x10; // Track, sector, or side were not found.
const STATUS_DELETED = 0x20; // On read: Sector was deleted (data is invalid, 0xF8 DAM).
const STATUS_FAULT = 0x20; // On write: Indicates a write fault.
const STATUS_REC_TYPE = 0x60;
//    STATUS_WRITE_PROTECTED = 0x40;
//    STATUS_NOT_READY = 0x80;
// Select register bits for writeSelect().
const SELECT_DRIVE_0 = 0x01;
const SELECT_DRIVE_1 = 0x02;
const SELECT_DRIVE_2 = 0x04;
const SELECT_DRIVE_3 = 0x08;
const SELECT_SIDE = 0x10; // 0 = front, 1 = back.
const SELECT_PRECOMP = 0x20;
const SELECT_WAIT = 0x40; // Controller should block OUT until operation is done.
const SELECT_MFM = 0x80; // Double density.
const SELECT_DRIVE_MASK = SELECT_DRIVE_0 | SELECT_DRIVE_1 | SELECT_DRIVE_2 | SELECT_DRIVE_3;
// Type of command (see below for specific commands in each type).
var CommandType;
(function (CommandType) {
    CommandType[CommandType["TYPE_I"] = 0] = "TYPE_I";
    CommandType[CommandType["TYPE_II"] = 1] = "TYPE_II";
    CommandType[CommandType["TYPE_III"] = 2] = "TYPE_III";
    CommandType[CommandType["TYPE_IV"] = 3] = "TYPE_IV";
})(CommandType || (CommandType = {}));
// Commands and various sub-flags.
const COMMAND_MASK = 0xF0;
// Type I commands: cccchvrr, where
//     cccc = command number
//     h = head load
//     v = verify (i.e., read next address to check we're on the right track)
//     rr = step rate:  00=6ms, 01=12ms, 10=20ms, 11=40ms
const COMMAND_RESTORE = 0x00;
const COMMAND_SEEK = 0x10;
const COMMAND_STEP = 0x20; // Doesn't update track register.
const COMMAND_STEPU = 0x30; // Updates track register.
const COMMAND_STEP_IN = 0x40;
const COMMAND_STEP_INU = 0x50;
const COMMAND_STEP_OUT = 0x60;
const COMMAND_STEP_OUTU = 0x70;
const MASK_H = 0x08;
const MASK_V = 0x04;
// Type II commands: ccccbecd, where
//     cccc = command number
//     e = delay for head engage (10ms)
//     b = side expected
//     c = side compare (0=disable, 1=enable)
//     d = select data address mark (writes only, 0 for reads):
//         0=FB (normal), 1=F8 (deleted)
const COMMAND_READ = 0x80; // Single sector.
const COMMAND_READM = 0x90; // Multiple sectors.
const COMMAND_WRITE = 0xA0;
const COMMAND_WRITEM = 0xB0;
const MASK_B = 0x08; // Side (0 = front, 1 = back).
const MASK_E = 0x04;
const MASK_C = 0x02; // Whether side (MASK_B) is defined.
const MASK_D = 0x01; // Deleted: 0 = Data is valid, DAM is 0xFB; 1 = Data is invalid, DAM is 0xF8.
// Type III commands: ccccxxxs (?), where
//     cccc = command number
//     xxx = ?? (usually 010)
//     s = 1=READ_TRACK no synchronize; otherwise 0
const COMMAND_READ_ADDRESS = 0xC0;
const COMMAND_READ_TRACK = 0xE0;
const COMMAND_WRITE_TRACK = 0xF0;
// Type IV command: cccciiii, where
//     cccc = command number
//     iiii = bitmask of events to terminate and interrupt on (unused on TRS-80).
//            0000 for immediate terminate with no interrupt.
const COMMAND_FORCE_INTERRUPT = 0xD0;
/**
 * Given a command, returns its type.
 */
function getCommandType(command) {
    switch (command & COMMAND_MASK) {
        case COMMAND_RESTORE:
        case COMMAND_SEEK:
        case COMMAND_STEP:
        case COMMAND_STEPU:
        case COMMAND_STEP_IN:
        case COMMAND_STEP_INU:
        case COMMAND_STEP_OUT:
        case COMMAND_STEP_OUTU:
            return CommandType.TYPE_I;
        case COMMAND_READ:
        case COMMAND_READM:
        case COMMAND_WRITE:
        case COMMAND_WRITEM:
            return CommandType.TYPE_II;
        case COMMAND_READ_ADDRESS:
        case COMMAND_READ_TRACK:
        case COMMAND_WRITE_TRACK:
            return CommandType.TYPE_III;
        case COMMAND_FORCE_INTERRUPT:
            return CommandType.TYPE_IV;
        default:
            throw new Error("Unknown command 0x" + z80_base_1.toHexByte(command));
    }
}
/**
 * Whether a command is for reading or writing.
 */
function isReadWriteCommand(command) {
    switch (getCommandType(command)) {
        case CommandType.TYPE_II:
        case CommandType.TYPE_III:
            return true;
        default:
            return false;
    }
}
/**
 * State of a physical drive.
 */
class FloppyDrive {
    constructor() {
        this.physicalTrack = 0;
        this.writeProtected = true;
        this.floppyDisk = undefined;
    }
}
/**
 * The disk controller. We only emulate the WD1791/93, not the Model I's WD1771.
 */
class FloppyDiskController {
    constructor(foo) {
        // Registers.
        this.status = STATUS_TRACK_ZERO | STATUS_NOT_READY;
        this.track = 0;
        this.sector = 0;
        this.data = 0;
        // Internal state.
        this.currentCommand = COMMAND_RESTORE;
        this.side = trs80_base_1.Side.FRONT;
        this.doubleDensity = false;
        this.currentDrive = 0;
        this.motorOn = false;
        // ID index found in by last COMMAND_READ_ADDRESS.
        this.lastReadAddress = undefined;
        // State for current command.
        this.dataIndex = 0;
        this.sectorData = undefined;
        // Floppy drives.
        this.drives = [];
        // Timeout handle for turning off the motor.
        this.motorOffTimeoutHandle = undefined;
        // Which drive is currently active, for lighting up an LED.
        this.onActiveDrive = new strongly_typed_events_1.SimpleEventDispatcher();
        // Event when a drive moves the head this many tracks.
        this.onTrackMove = new strongly_typed_events_1.SimpleEventDispatcher();
        this.machine = foo;
        for (let i = 0; i < exports.FLOPPY_DRIVE_COUNT; i++) {
            this.drives.push(new FloppyDrive());
        }
    }
    /**
     * Put a floppy in the specified drive (0 to 3).
     */
    loadFloppyDisk(floppyDisk, driveNumber) {
        if (driveNumber < 0 || driveNumber >= this.drives.length) {
            throw new Error("Invalid drive number " + driveNumber);
        }
        this.drives[driveNumber].floppyDisk = floppyDisk;
    }
    readStatus() {
        // If no disk was loaded into drive 0, just pretend that we don't
        // have a disk system. Otherwise we have to hold down Break while
        // booting (to get to cassette BASIC) and that's annoying.
        if (this.drives[0].floppyDisk === undefined) {
            return 0xFF;
        }
        this.updateStatus();
        // Clear interrupt.
        this.machine.diskIntrqInterrupt(false);
        return this.status;
    }
    readTrack() {
        return this.track;
    }
    readSector() {
        return this.sector;
    }
    /**
     * Read a byte of data from the sector.
     */
    readData() {
        const drive = this.drives[this.currentDrive];
        // The read command can do various things depending on the specific
        // current command, but we only support reading from the diskette.
        switch (this.currentCommand & COMMAND_MASK) {
            case COMMAND_READ:
                // Keep reading from the buffer.
                if (this.sectorData !== undefined && (this.status & STATUS_DRQ) !== 0 && drive.floppyDisk !== undefined) {
                    this.data = this.sectorData.data[this.dataIndex];
                    this.dataIndex++;
                    if (this.dataIndex >= this.sectorData.data.length) {
                        this.sectorData = undefined;
                        this.status &= ~STATUS_DRQ;
                        this.machine.diskDrqInterrupt(false);
                        this.machine.eventScheduler.cancelByEventTypeMask(EventScheduler_1.EventType.DISK_LOST_DATA);
                        this.machine.eventScheduler.add(EventScheduler_1.EventType.DISK_DONE, this.machine.tStateCount + 64, () => this.done(0));
                    }
                }
                break;
            default:
                // Might be okay, not sure.
                throw new Error("Unhandled case in readData()");
        }
        return this.data;
    }
    /**
     * Set current command.
     */
    writeCommand(cmd) {
        const drive = this.drives[this.currentDrive];
        // Cancel "lost data" event.
        this.machine.eventScheduler.cancelByEventTypeMask(EventScheduler_1.EventType.DISK_LOST_DATA);
        this.machine.diskIntrqInterrupt(false);
        this.sectorData = undefined;
        this.currentCommand = cmd;
        // Kick off anything that's based on the command.
        switch (cmd & COMMAND_MASK) {
            case COMMAND_RESTORE:
                this.lastReadAddress = undefined;
                drive.physicalTrack = 0;
                this.track = 0;
                this.status = STATUS_TRACK_ZERO | STATUS_BUSY;
                if ((cmd & MASK_V) != 0) {
                    this.verify();
                }
                this.machine.eventScheduler.add(EventScheduler_1.EventType.DISK_DONE, this.machine.tStateCount + 2000, () => this.done(0));
                break;
            case COMMAND_SEEK:
                this.lastReadAddress = undefined;
                const moveCount = this.data - this.track;
                if (moveCount !== 0) {
                    this.onTrackMove.dispatch(moveCount);
                }
                drive.physicalTrack += moveCount;
                this.track = this.data;
                if (drive.physicalTrack <= 0) {
                    // this.track too?
                    drive.physicalTrack = 0;
                    this.status = STATUS_TRACK_ZERO | STATUS_BUSY;
                }
                else {
                    this.status = STATUS_BUSY;
                }
                // Should this set lastDirection?
                if ((cmd & MASK_V) != 0) {
                    this.verify();
                }
                this.machine.eventScheduler.add(EventScheduler_1.EventType.DISK_DONE, this.machine.tStateCount + 2000, () => this.done(0));
                break;
            case COMMAND_READ:
                // Read the sector. The bytes will be read later.
                this.lastReadAddress = undefined;
                this.status = STATUS_BUSY;
                // Not sure how to use this. Ignored for now:
                const goalSide = (cmd & MASK_C) === 0 ? undefined : booleanToSide((cmd & MASK_B) !== 0);
                console.log(`Sector read: ${drive.physicalTrack}, ${this.sector}, ${this.side}`);
                const sectorData = drive.floppyDisk === undefined
                    ? undefined
                    : drive.floppyDisk.readSector(drive.physicalTrack, this.side, this.sector);
                if (sectorData === undefined) {
                    this.machine.eventScheduler.add(EventScheduler_1.EventType.DISK_DONE, this.machine.tStateCount + 512, () => this.done(0));
                    console.error(`Didn't find sector ${this.sector} on track ${drive.physicalTrack}`);
                }
                else {
                    let newStatus = 0;
                    if (sectorData.deleted) {
                        newStatus |= STATUS_DELETED;
                    }
                    if (sectorData.crcError) {
                        newStatus |= STATUS_CRC_ERROR;
                    }
                    this.sectorData = sectorData;
                    this.dataIndex = 0;
                    this.machine.eventScheduler.add(EventScheduler_1.EventType.DISK_FIRST_DRQ, this.machine.tStateCount + 64, () => this.firstDrq(newStatus));
                }
                break;
            case COMMAND_WRITE:
                console.log(`Sector write: ${drive.physicalTrack}, ${this.sector}, ${this.side}`);
                this.status = STATUS_WRITE_PROTECTED;
                break;
            case COMMAND_FORCE_INTERRUPT:
                // Stop whatever is going on and forget it.
                this.machine.eventScheduler.cancelByEventTypeMask(EventScheduler_1.EventType.DISK_ALL);
                this.status = 0;
                this.updateStatus();
                if ((cmd & 0x07) !== 0) {
                    throw new Error("Conditional interrupt features not implemented");
                }
                else if ((cmd & 0x08) !== 0) {
                    // Immediate interrupt.
                    this.machine.diskIntrqInterrupt(true);
                }
                else {
                    this.machine.diskIntrqInterrupt(false);
                }
                break;
            default:
                throw new Error("Don't handle command 0x" + z80_base_1.toHexByte(cmd));
        }
    }
    writeTrack(track) {
        this.track = track;
    }
    writeSector(sector) {
        this.sector = sector;
    }
    writeData(data) {
        const command = this.currentCommand & COMMAND_MASK;
        if (command === COMMAND_WRITE || command === COMMAND_WRITE_TRACK) {
            throw new Error("Can't yet write data");
        }
        this.data = data;
    }
    /**
     * Select a drive.
     */
    writeSelect(value) {
        this.status &= ~STATUS_NOT_READY;
        this.side = booleanToSide((value & SELECT_SIDE) !== 0);
        this.doubleDensity = (value & SELECT_MFM) != 0;
        if ((value & SELECT_WAIT) != 0) {
            // If there was an event pending, simulate waiting until it was due.
            const event = this.machine.eventScheduler.getFirstEvent(EventScheduler_1.EventType.DISK_ALL & ~EventScheduler_1.EventType.DISK_LOST_DATA);
            if (event !== undefined) {
                // This puts the clock ahead immediately, but the main loop of the emulator
                // will then sleep to make the real-time correct.
                // TODO is this legit? Can we use another method?
                this.machine.tStateCount = event.tStateCount;
                this.machine.eventScheduler.dispatch(this.machine.tStateCount);
            }
        }
        // Which drive is being enabled?
        const previousDrive = this.currentDrive;
        switch (value & SELECT_DRIVE_MASK) {
            case 0:
                this.status |= STATUS_NOT_READY;
                break;
            case SELECT_DRIVE_0:
                this.currentDrive = 0;
                break;
            case SELECT_DRIVE_1:
                this.currentDrive = 1;
                break;
            case SELECT_DRIVE_2:
                this.currentDrive = 2;
                break;
            case SELECT_DRIVE_3:
                this.currentDrive = 3;
                break;
            default:
                throw new Error("Not drive specified in select: 0x" + z80_base_1.toHexByte(value));
        }
        if (this.currentDrive !== previousDrive) {
            this.updateMotorOn();
        }
        // If a drive was selected, turn on its motor.
        if ((this.status & STATUS_NOT_READY) == 0) {
            this.setMotorOn(true);
            // Set timer to later turn off motor.
            if (this.motorOffTimeoutHandle !== undefined) {
                this.machine.eventScheduler.cancel(this.motorOffTimeoutHandle);
            }
            this.motorOffTimeoutHandle = this.machine.eventScheduler.add(undefined, this.machine.tStateCount + MOTOR_TIME_AFTER_SELECT * this.machine.clockHz, () => {
                this.motorOffTimeoutHandle = undefined;
                this.status |= STATUS_NOT_READY;
                this.setMotorOn(false);
            });
        }
    }
    /**
     * Verify that head is on the expected track. Set either STATUS_NOT_FOUND or
     * STATUS_SEEK_ERROR if a problem is found.
     */
    verify() {
        const drive = this.drives[this.currentDrive];
        if (drive.floppyDisk === undefined) {
            this.status |= STATUS_NOT_FOUND;
        }
        else if (drive.physicalTrack !== this.track) {
            this.status |= STATUS_SEEK_ERROR;
        }
        else {
            // Make sure a sector exists on this track.
            const sectorData = drive.floppyDisk.readSector(this.track, trs80_base_1.Side.FRONT, undefined);
            if (sectorData === undefined) {
                this.status |= STATUS_NOT_FOUND;
            }
            if (this.doubleDensity && !drive.floppyDisk.supportsDoubleDensity) {
                this.status |= STATUS_NOT_FOUND;
            }
        }
    }
    /**
     * If we're doing a non-read/write command, update the status with the state
     * of the disk, track, and head position.
     */
    updateStatus() {
        if (isReadWriteCommand(this.currentCommand)) {
            // Don't modify status.
            return;
        }
        const drive = this.drives[this.currentDrive];
        if (drive.floppyDisk === undefined) {
            this.status |= STATUS_INDEX;
        }
        else {
            // See if we're over the index hole.
            if (this.angle() < HOLE_WIDTH) {
                this.status |= STATUS_INDEX;
            }
            else {
                this.status &= ~STATUS_INDEX;
            }
            // See if the diskette is write protected.
            if (drive.writeProtected || !SUPPORT_WRITING) {
                this.status |= STATUS_WRITE_PROTECTED;
            }
            else {
                this.status &= ~STATUS_WRITE_PROTECTED;
            }
        }
        // See if we're on track 0, which for some reason has a special bit.
        if (drive.physicalTrack === 0) {
            this.status |= STATUS_TRACK_ZERO;
        }
        else {
            this.status &= ~STATUS_TRACK_ZERO;
        }
        // RDY and HLT inputs are wired together on TRS-80 I/III/4/4P.
        if ((this.status & STATUS_NOT_READY) !== 0) {
            this.status &= ~STATUS_HEAD_ENGAGED;
        }
        else {
            this.status |= STATUS_HEAD_ENGAGED;
        }
    }
    /**
     * Turn motor on or off.
     */
    setMotorOn(motorOn) {
        if (motorOn !== this.motorOn) {
            this.motorOn = motorOn;
            this.machine.diskMotorOffInterrupt(!motorOn);
            this.updateMotorOn();
        }
    }
    /**
     * Dispatch a change to the motor light.
     */
    updateMotorOn() {
        this.onActiveDrive.dispatch(this.motorOn ? this.currentDrive : undefined);
    }
    // Return a value in [0,1) indicating how far we've rotated
    // from the leading edge of the index hole. For the first HOLE_WIDTH we're
    // on the hole itself.
    angle() {
        // Use simulated time.
        const clocksPerRevolution = Math.round(this.machine.clockHz / (RPM / 60));
        return (this.machine.tStateCount % clocksPerRevolution) / clocksPerRevolution;
    }
    /**
     * Event used for delayed command completion.  Clears BUSY,
     * sets any additional bits specified, and generates a command
     * completion interrupt.
     */
    done(bits) {
        this.status &= ~STATUS_BUSY;
        this.status |= bits;
        this.machine.diskIntrqInterrupt(true);
    }
    /**
     * Event to abort the last command with LOST_DATA if it is
     * still in progress.
     */
    lostData(cmd) {
        if (this.currentCommand === cmd) {
            this.status &= ~STATUS_BUSY;
            this.status |= STATUS_LOST_DATA;
            this.sectorData = undefined;
            this.machine.diskIntrqInterrupt(true);
        }
    }
    /**
     * Event used as a delayed command start. Sets DRQ, generates a DRQ interrupt,
     * sets any additional bits specified, and schedules a lostData() event.
     */
    firstDrq(bits) {
        this.status |= STATUS_DRQ | bits;
        this.machine.diskDrqInterrupt(true);
        // Evaluate this now, not when the callback is run.
        const currentCommand = this.currentCommand;
        // If we've not finished our work within half a second, trigger a lost data interrupt.
        this.machine.eventScheduler.add(EventScheduler_1.EventType.DISK_LOST_DATA, this.machine.tStateCount + this.machine.clockHz / 2, () => this.lostData(currentCommand));
    }
}
exports.FloppyDiskController = FloppyDiskController;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Fonts.js":
/*!***************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Fonts.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * These fonts are from the xtrs emulator, and the CG# references match those.
 * They're identical to the fonts in the sdltrs emulator. They don't include
 * the 2x3 graphical characters; we generate those procedurally.
 *
 * See the original trs_chars.c file for Tim Mann's explanations and historical
 * notes.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MODEL3_ALT_FONT = exports.MODEL3_FONT = exports.MODEL1B_FONT = exports.MODEL1A_FONT = exports.Font = void 0;
// Here is the LICENSE file from the xtrs emulator:
/*

Copyright (C) 1992 Clarendon Hill Software.

Permission is granted to any individual or institution to use, copy,
or redistribute this software, provided this copyright notice is retained.

This software is provided "as is" without any expressed or implied
warranty.  If this software brings on any sort of damage -- physical,
monetary, emotional, or brain -- too bad.  You've got no one to blame
but yourself.

The software may be modified for your own purposes, but modified versions
must retain this notice.

***

Copyright (c) 1996-2020, Timothy P. Mann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/**
 * Original Model I character set.
 */
const GLYPH_CG1 = [
    0x00, 0x1f, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x04, 0x08, 0x1e, 0x04, 0x08, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x11, 0x1b, 0x15, 0x1b, 0x11, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x08, 0x05, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x1f, 0x0a, 0x0a, 0x1b, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x02, 0x0f, 0x12, 0x14, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x08, 0x1f, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x04, 0x15, 0x0e, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x15, 0x0e, 0x04, 0x15, 0x0e, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x02, 0x1f, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x1b, 0x15, 0x1b, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x15, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x15, 0x15, 0x1d, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x1d, 0x15, 0x15, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x17, 0x15, 0x15, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x15, 0x15, 0x17, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x14, 0x08, 0x15, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x0a, 0x0a, 0x0a, 0x0a, 0x0a, 0x1b, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x10, 0x10, 0x1f, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x0e, 0x0e, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x15, 0x15, 0x17, 0x11, 0x11, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x11, 0x11, 0x17, 0x15, 0x15, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x11, 0x11, 0x1d, 0x15, 0x15, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x15, 0x15, 0x1d, 0x11, 0x11, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0a, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0a, 0x0a, 0x1f, 0x0a, 0x1f, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x1e, 0x05, 0x0e, 0x14, 0x0f, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x03, 0x13, 0x08, 0x04, 0x02, 0x19, 0x18, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x05, 0x05, 0x02, 0x15, 0x09, 0x16, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x06, 0x06, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x15, 0x0e, 0x1f, 0x0e, 0x15, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x06, 0x06, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x08, 0x04, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x19, 0x15, 0x13, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x06, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x10, 0x0e, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x10, 0x0c, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x0c, 0x0a, 0x09, 0x1f, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x01, 0x0f, 0x10, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0c, 0x02, 0x01, 0x0f, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x10, 0x08, 0x04, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x1e, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x06, 0x06, 0x00, 0x06, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x06, 0x06, 0x00, 0x06, 0x06, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x10, 0x08, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x10, 0x16, 0x15, 0x15, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x0a, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0f, 0x12, 0x12, 0x0e, 0x12, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x01, 0x01, 0x01, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0f, 0x12, 0x12, 0x12, 0x12, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x01, 0x01, 0x07, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x01, 0x01, 0x07, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1e, 0x01, 0x01, 0x19, 0x11, 0x11, 0x1e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x10, 0x10, 0x10, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x09, 0x05, 0x03, 0x05, 0x09, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x13, 0x15, 0x19, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0f, 0x11, 0x11, 0x0f, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x11, 0x11, 0x15, 0x09, 0x16, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0f, 0x11, 0x11, 0x0f, 0x05, 0x09, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x11, 0x01, 0x0e, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x11, 0x0a, 0x0a, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x11, 0x11, 0x15, 0x1b, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x10, 0x08, 0x04, 0x02, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x0e, 0x15, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x04, 0x04, 0x15, 0x0e, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x02, 0x1f, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x08, 0x1f, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0c, 0x0c, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0e, 0x10, 0x1e, 0x11, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x01, 0x0d, 0x13, 0x11, 0x13, 0x0d, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x0e, 0x11, 0x01, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x10, 0x16, 0x19, 0x11, 0x19, 0x16, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x0e, 0x11, 0x1f, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x14, 0x04, 0x0e, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x16, 0x19, 0x19, 0x16, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x01, 0x0d, 0x13, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x00, 0x06, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x00, 0x10, 0x10, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x01, 0x09, 0x05, 0x03, 0x05, 0x09, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x06, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x0b, 0x15, 0x15, 0x15, 0x15, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x0d, 0x13, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x0e, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0d, 0x13, 0x11, 0x13, 0x0d, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x16, 0x19, 0x11, 0x19, 0x16, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x0d, 0x13, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x1e, 0x01, 0x0e, 0x10, 0x0f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x14, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x11, 0x11, 0x11, 0x19, 0x16, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x11, 0x11, 0x11, 0x0a, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x11, 0x11, 0x15, 0x15, 0x0a, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x11, 0x11, 0x11, 0x1e, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x1f, 0x08, 0x04, 0x02, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x04, 0x04, 0x02, 0x04, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x04, 0x00, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x04, 0x04, 0x08, 0x04, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x15, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0a, 0x15, 0x0a, 0x15, 0x0a, 0x15, 0x0a, 0x00, 0x00, 0x00, 0x00,
];
/**
 * Model I character set with official Radio Shack upgrade.
 */
const GLYPH_CG2 = [
    0x0e, 0x11, 0x10, 0x16, 0x15, 0x15, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x0a, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x12, 0x12, 0x0e, 0x12, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x01, 0x01, 0x01, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x12, 0x12, 0x12, 0x12, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x01, 0x01, 0x07, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x01, 0x01, 0x07, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1e, 0x01, 0x01, 0x19, 0x11, 0x11, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x10, 0x10, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x09, 0x05, 0x03, 0x05, 0x09, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x13, 0x15, 0x19, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x11, 0x11, 0x0f, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x11, 0x11, 0x15, 0x09, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x11, 0x11, 0x0f, 0x05, 0x09, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x01, 0x0e, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x0a, 0x0a, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x11, 0x15, 0x1b, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x10, 0x08, 0x04, 0x02, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x0e, 0x15, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x04, 0x04, 0x15, 0x0e, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x02, 0x1f, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x08, 0x1f, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0a, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0a, 0x0a, 0x1f, 0x0a, 0x1f, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x1e, 0x05, 0x0e, 0x14, 0x0f, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x03, 0x13, 0x08, 0x04, 0x02, 0x19, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x05, 0x05, 0x02, 0x15, 0x09, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x06, 0x06, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x15, 0x0e, 0x1f, 0x0e, 0x15, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x06, 0x06, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x08, 0x04, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x19, 0x15, 0x13, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x06, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x10, 0x0e, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x10, 0x0c, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x0c, 0x0a, 0x09, 0x1f, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x01, 0x0f, 0x10, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0c, 0x02, 0x01, 0x0f, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x10, 0x08, 0x04, 0x02, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x11, 0x1e, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x06, 0x06, 0x00, 0x06, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x06, 0x06, 0x00, 0x06, 0x06, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x10, 0x08, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x10, 0x16, 0x15, 0x15, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x0a, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x12, 0x12, 0x0e, 0x12, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x01, 0x01, 0x01, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x12, 0x12, 0x12, 0x12, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x01, 0x01, 0x07, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x01, 0x01, 0x07, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1e, 0x01, 0x01, 0x19, 0x11, 0x11, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x10, 0x10, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x09, 0x05, 0x03, 0x05, 0x09, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x13, 0x15, 0x19, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x11, 0x11, 0x0f, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x11, 0x11, 0x15, 0x09, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0f, 0x11, 0x11, 0x0f, 0x05, 0x09, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0e, 0x11, 0x01, 0x0e, 0x10, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x0a, 0x0a, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x11, 0x11, 0x15, 0x1b, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1f, 0x10, 0x08, 0x04, 0x02, 0x01, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x0e, 0x15, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x04, 0x04, 0x15, 0x0e, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x02, 0x1f, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x08, 0x1f, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x0a, 0x02, 0x07, 0x02, 0x12, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0e, 0x10, 0x1e, 0x11, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x01, 0x0d, 0x13, 0x11, 0x13, 0x0d, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0e, 0x11, 0x01, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x16, 0x19, 0x11, 0x19, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0e, 0x11, 0x1f, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x14, 0x04, 0x0e, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0e, 0x11, 0x11, 0x1e, 0x10, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x01, 0x0d, 0x13, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x00, 0x06, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x00, 0x18, 0x10, 0x10, 0x10, 0x12, 0x0c, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x02, 0x12, 0x0a, 0x06, 0x0a, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x06, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0b, 0x15, 0x15, 0x15, 0x15, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0d, 0x13, 0x11, 0x11, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0e, 0x11, 0x11, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0d, 0x13, 0x13, 0x0d, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x19, 0x19, 0x16, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0d, 0x13, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x1e, 0x01, 0x0e, 0x10, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x0e, 0x04, 0x04, 0x14, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x11, 0x11, 0x11, 0x19, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x11, 0x11, 0x11, 0x0a, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x11, 0x11, 0x15, 0x15, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x11, 0x11, 0x11, 0x1e, 0x10, 0x0e, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x1f, 0x08, 0x04, 0x02, 0x1f, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x04, 0x04, 0x02, 0x04, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x04, 0x00, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x04, 0x04, 0x08, 0x04, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x11, 0x0a, 0x04, 0x1f, 0x04, 0x1f, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x15, 0x0a, 0x15, 0x0a, 0x15, 0x0a, 0x15, 0x0a, 0x00, 0x00, 0x00, 0x00,
];
/**
 * Original Model III character set.
 */
const GLYPH_CG4 = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x30, 0x48, 0x08, 0x3e, 0x08, 0x48, 0x3e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x3c, 0x42, 0x7e, 0x02, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x24, 0x00, 0x42, 0x42, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x28, 0x10, 0x28, 0x44, 0x7c, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x7e, 0x40, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x28, 0x00, 0x38, 0x44, 0x44, 0x44, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xb8, 0x44, 0x64, 0x54, 0x4c, 0x44, 0x3a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x10, 0x42, 0x42, 0x42, 0x62, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x4c, 0x32, 0x00, 0x34, 0x4c, 0x44, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x20, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1c, 0x00, 0x1c, 0x20, 0x3c, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7c, 0x5e, 0x22, 0x22, 0x1e, 0x12, 0x22, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x28, 0x00, 0x10, 0x28, 0x44, 0x7c, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x4c, 0x32, 0x10, 0x28, 0x44, 0x7c, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x4c, 0x32, 0x44, 0x4c, 0x54, 0x64, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x28, 0x38, 0x44, 0x44, 0x44, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x90, 0x68, 0x64, 0x54, 0x4c, 0x2c, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x4c, 0x32, 0x00, 0x3c, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x44, 0x44, 0x3c, 0x44, 0x44, 0x3e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x24, 0x00, 0x42, 0x42, 0x42, 0x62, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x4c, 0x32, 0x00, 0x18, 0x24, 0x24, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x54, 0x50, 0x38, 0x14, 0x54, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x14, 0x00, 0x1c, 0x20, 0x3c, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x08, 0x1c, 0x20, 0x3c, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x00, 0x1c, 0x20, 0x3c, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x02, 0x3e, 0x42, 0x7c, 0x40, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x7c, 0x04, 0x7c, 0x04, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x78, 0x24, 0x64, 0x3c, 0x24, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x04, 0x04, 0x44, 0x38, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x4c, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x10, 0x10, 0x10, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x24, 0x24, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x24, 0x24, 0x7e, 0x24, 0x7e, 0x24, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x78, 0x14, 0x38, 0x50, 0x3c, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x46, 0x26, 0x10, 0x08, 0x64, 0x62, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0c, 0x12, 0x12, 0x0c, 0x52, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x08, 0x08, 0x08, 0x10, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x08, 0x10, 0x10, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x54, 0x38, 0x7c, 0x38, 0x54, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x10, 0x7c, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x62, 0x5a, 0x46, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x18, 0x14, 0x10, 0x10, 0x10, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x40, 0x30, 0x0c, 0x02, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x40, 0x38, 0x40, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x30, 0x28, 0x24, 0x7e, 0x20, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x02, 0x1e, 0x20, 0x40, 0x22, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x04, 0x02, 0x3e, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x42, 0x20, 0x10, 0x08, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x42, 0x3c, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x42, 0x7c, 0x40, 0x20, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x00, 0x00, 0x10, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x60, 0x30, 0x18, 0x0c, 0x18, 0x30, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7e, 0x00, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x06, 0x0c, 0x18, 0x30, 0x18, 0x0c, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x40, 0x30, 0x08, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x52, 0x6a, 0x32, 0x04, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x18, 0x24, 0x42, 0x7e, 0x42, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3e, 0x44, 0x44, 0x3c, 0x44, 0x44, 0x3e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x02, 0x02, 0x02, 0x44, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1e, 0x24, 0x44, 0x44, 0x44, 0x24, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x02, 0x02, 0x1e, 0x02, 0x02, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x02, 0x02, 0x1e, 0x02, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x02, 0x72, 0x42, 0x44, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x42, 0x42, 0x7e, 0x42, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x10, 0x10, 0x10, 0x10, 0x10, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x70, 0x20, 0x20, 0x20, 0x20, 0x22, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x22, 0x12, 0x0e, 0x12, 0x22, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x66, 0x5a, 0x5a, 0x42, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x46, 0x4a, 0x52, 0x62, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3e, 0x42, 0x42, 0x3e, 0x02, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x42, 0x42, 0x52, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3e, 0x42, 0x42, 0x3e, 0x12, 0x22, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0x02, 0x3c, 0x40, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7c, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x42, 0x42, 0x24, 0x24, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x42, 0x42, 0x5a, 0x5a, 0x66, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x42, 0x24, 0x18, 0x24, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x44, 0x44, 0x44, 0x38, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x20, 0x18, 0x04, 0x02, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x04, 0x04, 0x04, 0x04, 0x04, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x20, 0x20, 0x20, 0x20, 0x20, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x28, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x10, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x1c, 0x20, 0x3c, 0x22, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x02, 0x3a, 0x46, 0x42, 0x46, 0x3a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3c, 0x42, 0x02, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x40, 0x40, 0x5c, 0x62, 0x42, 0x62, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3c, 0x42, 0x7e, 0x02, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x30, 0x48, 0x08, 0x3e, 0x08, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x5c, 0x62, 0x62, 0x5c, 0x40, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x02, 0x3a, 0x46, 0x42, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x00, 0x18, 0x10, 0x10, 0x10, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x00, 0x30, 0x20, 0x20, 0x20, 0x22, 0x1c, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x02, 0x22, 0x12, 0x0a, 0x16, 0x22, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x18, 0x10, 0x10, 0x10, 0x10, 0x10, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x6e, 0x92, 0x92, 0x92, 0x92, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3a, 0x46, 0x42, 0x42, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3c, 0x42, 0x42, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3a, 0x46, 0x46, 0x3a, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x5c, 0x62, 0x62, 0x5c, 0x40, 0x40, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3a, 0x46, 0x02, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7c, 0x02, 0x3c, 0x40, 0x3e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x08, 0x3e, 0x08, 0x08, 0x48, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x42, 0x42, 0x42, 0x62, 0x5c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x42, 0x42, 0x42, 0x24, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x82, 0x92, 0x92, 0x92, 0x6c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x42, 0x24, 0x18, 0x24, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x42, 0x42, 0x62, 0x5c, 0x40, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7e, 0x20, 0x18, 0x04, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x30, 0x08, 0x08, 0x04, 0x08, 0x08, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x10, 0x00, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0c, 0x10, 0x10, 0x20, 0x10, 0x10, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0c, 0x92, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x10, 0x7c, 0x10, 0x10, 0x00, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x38, 0x7c, 0xfe, 0xfe, 0x7c, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x6c, 0xfe, 0xfe, 0x7c, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x38, 0x7c, 0xfe, 0x7c, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x38, 0x10, 0xd6, 0xfe, 0xd6, 0x10, 0x38, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0xa5, 0x81, 0xa5, 0x99, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0xa5, 0x81, 0x99, 0xa5, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x08, 0x04, 0x08, 0x10, 0x20, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x08, 0x10, 0x20, 0x10, 0x08, 0x04, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x9c, 0x62, 0x62, 0x9c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x44, 0x3c, 0x44, 0x44, 0x3c, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00,
    0x86, 0x48, 0x28, 0x18, 0x08, 0x0c, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x30, 0x48, 0x08, 0x30, 0x50, 0x48, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x60, 0x10, 0x08, 0x7c, 0x08, 0x10, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x68, 0x60, 0x10, 0x08, 0x38, 0x40, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x34, 0x4a, 0x48, 0x48, 0x40, 0x40, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x28, 0x44, 0x7c, 0x44, 0x28, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x04, 0x04, 0x04, 0x44, 0x44, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x12, 0x0a, 0x06, 0x0a, 0x52, 0x22, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x08, 0x08, 0x08, 0x18, 0x24, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x24, 0x24, 0x24, 0x24, 0x5c, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x4c, 0x48, 0x28, 0x18, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x38, 0x04, 0x18, 0x04, 0x38, 0x40, 0x30, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x18, 0x24, 0x42, 0x42, 0x24, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7c, 0x2a, 0x28, 0x28, 0x28, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x18, 0x24, 0x24, 0x1c, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7c, 0x12, 0x12, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7c, 0x12, 0x10, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x40, 0x26, 0x24, 0x24, 0x24, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x38, 0x54, 0x54, 0x54, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x46, 0x28, 0x10, 0x28, 0xc4, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x92, 0x54, 0x54, 0x38, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x44, 0x82, 0x92, 0x92, 0x6c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x82, 0x82, 0xc6, 0x44, 0xc6, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x78, 0x08, 0x08, 0x08, 0x0a, 0x0c, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x00, 0x7c, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x04, 0x08, 0x30, 0x08, 0x04, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x4c, 0x32, 0x00, 0x4c, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x28, 0x44, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x08, 0x08, 0x10, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x80, 0x40, 0xfe, 0x10, 0xfe, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x10, 0x20, 0x7c, 0x08, 0x10, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xfc, 0x4a, 0x24, 0x10, 0x48, 0xa4, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x82, 0x82, 0xfe, 0x44, 0x44, 0xc6, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x6c, 0x92, 0x92, 0x6c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x40, 0x20, 0x12, 0x0a, 0x06, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x78, 0x04, 0x38, 0x44, 0x38, 0x40, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x44, 0xaa, 0x54, 0x28, 0x54, 0xaa, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x42, 0xb9, 0x85, 0x85, 0xb9, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x24, 0x18, 0x24, 0x18, 0x24, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7c, 0x52, 0x52, 0x5c, 0x50, 0x50, 0x50, 0x50, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x38, 0x54, 0x14, 0x54, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x5e, 0xa5, 0xa5, 0x9d, 0x95, 0x66, 0x3c, 0x00, 0x00, 0x00, 0x00,
    0xfa, 0x06, 0xc6, 0x46, 0x26, 0xde, 0x06, 0xfa, 0x00, 0x00, 0x00, 0x00,
    0xff, 0x20, 0xc0, 0x3f, 0x40, 0x3f, 0x20, 0x1f, 0x00, 0x00, 0x00, 0x00,
    0x3f, 0x40, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1e, 0x22, 0x22, 0x1e, 0x52, 0x22, 0xd2, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x86, 0x41, 0x21, 0x16, 0x68, 0x94, 0x92, 0x61, 0x00, 0x00, 0x00, 0x00,
    0x70, 0x60, 0x50, 0x0e, 0x09, 0x09, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x44, 0x44, 0x44, 0x38, 0x10, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00,
    0x70, 0x10, 0x10, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xff, 0xc7, 0xbb, 0xcf, 0xef, 0xff, 0xef, 0xff, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x28, 0x10, 0x38, 0x54, 0x10, 0x28, 0x44, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x28, 0x10, 0x38, 0x54, 0x28, 0x7c, 0x28, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x28, 0x44, 0x44, 0x44, 0x54, 0x6c, 0x44, 0x00, 0x00, 0x00, 0x00,
    0x44, 0x28, 0x10, 0x7c, 0x10, 0x7c, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x04, 0x0a, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7c, 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x20, 0x20, 0x20, 0x20, 0x3e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x02, 0x04, 0x08, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x3c, 0x20, 0x3c, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7c, 0x40, 0x30, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x20, 0x10, 0x18, 0x14, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x7c, 0x44, 0x40, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x38, 0x10, 0x10, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x10, 0x3c, 0x18, 0x14, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x08, 0x7c, 0x48, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x38, 0x20, 0x20, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7c, 0x40, 0x78, 0x40, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x54, 0x54, 0x44, 0x20, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x28, 0x18, 0x08, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x40, 0x20, 0x10, 0x18, 0x14, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x7c, 0x44, 0x44, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7c, 0x10, 0x10, 0x10, 0x10, 0x10, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x7e, 0x10, 0x18, 0x14, 0x12, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x7e, 0x48, 0x48, 0x48, 0x44, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x38, 0x10, 0x7c, 0x10, 0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7c, 0x44, 0x44, 0x42, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x7c, 0x14, 0x12, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x24, 0x7e, 0x24, 0x24, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1c, 0x40, 0x4e, 0x40, 0x40, 0x24, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x20, 0x10, 0x18, 0x24, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x7e, 0x48, 0x28, 0x08, 0x48, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x44, 0x48, 0x20, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x42, 0x42, 0x50, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x50, 0x3e, 0x10, 0x7c, 0x10, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x00, 0x7e, 0x40, 0x20, 0x10, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x00, 0x7c, 0x10, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x1c, 0x24, 0x44, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x7c, 0x10, 0x10, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x40, 0x28, 0x10, 0x28, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x7e, 0x40, 0x20, 0x30, 0x58, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x60, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x20, 0x50, 0x50, 0x50, 0x48, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x02, 0x7e, 0x02, 0x02, 0x42, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x40, 0x20, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x08, 0x14, 0x22, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x10, 0x7c, 0x10, 0x54, 0x54, 0x54, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x40, 0x28, 0x10, 0x20, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x3c, 0x42, 0x3c, 0x42, 0x3c, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x10, 0x08, 0x04, 0x12, 0x22, 0x5e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x40, 0x44, 0x28, 0x10, 0x28, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x08, 0x3c, 0x08, 0x08, 0x48, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x7e, 0x48, 0x28, 0x08, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3c, 0x20, 0x20, 0x20, 0x10, 0x08, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x40, 0x40, 0x7c, 0x40, 0x40, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x54, 0x54, 0x44, 0x40, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x42, 0x42, 0x42, 0x42, 0x22, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0a, 0x0a, 0x0a, 0x4a, 0x4a, 0x2a, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x04, 0x04, 0x44, 0x44, 0x24, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x42, 0x42, 0x42, 0x42, 0x42, 0x7e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x7e, 0x42, 0x42, 0x40, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x4e, 0x40, 0x40, 0x40, 0x20, 0x12, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x12, 0x24, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x04, 0x0a, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
/**
 * Class representing a font and able to generate its glyphs.
 */
class Font {
    constructor(bits, width, height, banks) {
        // Cache from glyph key (see makeImage()) to the canvas element for it.
        this.glyphCache = new Map();
        this.bits = bits;
        this.width = width;
        this.height = height;
        this.banks = banks;
    }
    /**
     * Make a bitmap for the specified character (0-255). "on" pixels are the
     * specified color, "off" pixels are fully transparent.
     */
    makeImage(char, expanded, options) {
        const key = {
            char: char,
            expanded: expanded,
            options: options,
        };
        const stringKey = JSON.stringify(key);
        // Cache the glyph since we create a set of these for each created canvas.
        let glyph = this.glyphCache.get(stringKey);
        if (glyph === undefined) {
            glyph = this.makeImageInternal(char, expanded, options);
            this.glyphCache.set(stringKey, glyph);
        }
        return glyph;
    }
    /**
     * Actually creates the glyph.
     */
    makeImageInternal(char, expanded, options) {
        const canvas = document.createElement("canvas");
        let expandedMultiplier = expanded ? 2 : 1;
        canvas.width = this.width * expandedMultiplier;
        canvas.height = this.height * 2;
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("2d context not supported");
        }
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        // Light pixel at (x,y) in imageData if bit "bit" of "byte" is on.
        const lightPixel = (x, y, byte, bit) => {
            const pixel = (byte & (1 << bit)) !== 0;
            if (pixel) {
                const pixelOffset = (y * canvas.width + x) * 4;
                const alpha = options.scanLines ? (y % 2 == 0 ? 0xFF : 0xAA) : 0xFF;
                imageData.data[pixelOffset + 0] = options.color[0];
                imageData.data[pixelOffset + 1] = options.color[1];
                imageData.data[pixelOffset + 2] = options.color[2];
                imageData.data[pixelOffset + 3] = alpha;
            }
        };
        const bankOffset = this.banks[Math.floor(char / 64)];
        if (bankOffset === -1) {
            // Graphical character.
            const byte = char % 64;
            for (let y = 0; y < canvas.height; y++) {
                const py = Math.floor(y / (canvas.height / 3));
                for (let x = 0; x < canvas.width; x++) {
                    const px = Math.floor(x / (canvas.width / 2));
                    const bit = py * 2 + px;
                    lightPixel(x, y, byte, bit);
                }
            }
        }
        else {
            // Bitmap character.
            const charOffset = bankOffset + char % 64;
            const byteOffset = charOffset * 12;
            for (let y = 0; y < canvas.height; y++) {
                const byte = this.bits[byteOffset + Math.floor(y / 2)];
                for (let x = 0; x < canvas.width; x++) {
                    lightPixel(x, y, byte, Math.floor(x / expandedMultiplier));
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
}
exports.Font = Font;
// Original Model I.
exports.MODEL1A_FONT = new Font(GLYPH_CG1, 6, 12, [0, 64, -1, -1]);
// Model I with lower case mod.
exports.MODEL1B_FONT = new Font(GLYPH_CG2, 6, 12, [0, 64, -1, -1]);
// Original Model III, with special symbols.
exports.MODEL3_FONT = new Font(GLYPH_CG4, 8, 12, [0, 64, -1, 128]);
// Original Model III, with Katakana.
exports.MODEL3_ALT_FONT = new Font(GLYPH_CG4, 8, 12, [0, 64, -1, 192]);


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Keyboard.js":
/*!******************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Keyboard.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Handle keyboard mapping. The TRS-80 Model III keyboard has keys in different
// places, so we must occasionally fake a Shift key being up or down when it's
// really not.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Keyboard = void 0;
// Keyboard is in several identical (mirrored) banks.
const BANK_SIZE = 0x100;
const BANK_COUNT = 4;
const BEGIN_ADDR = 0x3800;
const END_ADDR = BEGIN_ADDR + BANK_SIZE * BANK_COUNT;
const KEY_DELAY_CLOCK_CYCLES = 50000;
// Whether to force a Shift key, and how.
var ShiftState;
(function (ShiftState) {
    ShiftState[ShiftState["NEUTRAL"] = 0] = "NEUTRAL";
    ShiftState[ShiftState["FORCE_DOWN"] = 1] = "FORCE_DOWN";
    ShiftState[ShiftState["FORCE_UP"] = 2] = "FORCE_UP";
})(ShiftState || (ShiftState = {}));
// For each ASCII character or key we keep track of how to trigger it.
class KeyInfo {
    constructor(byteIndex, bitNumber, shiftForce) {
        this.byteIndex = byteIndex;
        this.bitNumber = bitNumber;
        this.shiftForce = shiftForce;
    }
}
// A queued-up key.
class KeyActivity {
    constructor(keyInfo, isPressed) {
        this.keyInfo = keyInfo;
        this.isPressed = isPressed;
    }
}
// Map from ASCII or special key to the info of which byte and bit it's mapped
// to, and whether to force Shift.
const keyMap = new Map();
// http://www.trs-80.com/trs80-zaps-internals.htm#keyboard13
keyMap.set("@", new KeyInfo(0, 0, ShiftState.FORCE_UP));
keyMap.set("`", new KeyInfo(0, 0, ShiftState.FORCE_DOWN));
keyMap.set("A", new KeyInfo(0, 1, ShiftState.FORCE_DOWN));
keyMap.set("B", new KeyInfo(0, 2, ShiftState.FORCE_DOWN));
keyMap.set("C", new KeyInfo(0, 3, ShiftState.FORCE_DOWN));
keyMap.set("D", new KeyInfo(0, 4, ShiftState.FORCE_DOWN));
keyMap.set("E", new KeyInfo(0, 5, ShiftState.FORCE_DOWN));
keyMap.set("F", new KeyInfo(0, 6, ShiftState.FORCE_DOWN));
keyMap.set("G", new KeyInfo(0, 7, ShiftState.FORCE_DOWN));
keyMap.set("H", new KeyInfo(1, 0, ShiftState.FORCE_DOWN));
keyMap.set("I", new KeyInfo(1, 1, ShiftState.FORCE_DOWN));
keyMap.set("J", new KeyInfo(1, 2, ShiftState.FORCE_DOWN));
keyMap.set("K", new KeyInfo(1, 3, ShiftState.FORCE_DOWN));
keyMap.set("L", new KeyInfo(1, 4, ShiftState.FORCE_DOWN));
keyMap.set("M", new KeyInfo(1, 5, ShiftState.FORCE_DOWN));
keyMap.set("N", new KeyInfo(1, 6, ShiftState.FORCE_DOWN));
keyMap.set("O", new KeyInfo(1, 7, ShiftState.FORCE_DOWN));
keyMap.set("P", new KeyInfo(2, 0, ShiftState.FORCE_DOWN));
keyMap.set("Q", new KeyInfo(2, 1, ShiftState.FORCE_DOWN));
keyMap.set("R", new KeyInfo(2, 2, ShiftState.FORCE_DOWN));
keyMap.set("S", new KeyInfo(2, 3, ShiftState.FORCE_DOWN));
keyMap.set("T", new KeyInfo(2, 4, ShiftState.FORCE_DOWN));
keyMap.set("U", new KeyInfo(2, 5, ShiftState.FORCE_DOWN));
keyMap.set("V", new KeyInfo(2, 6, ShiftState.FORCE_DOWN));
keyMap.set("W", new KeyInfo(2, 7, ShiftState.FORCE_DOWN));
keyMap.set("X", new KeyInfo(3, 0, ShiftState.FORCE_DOWN));
keyMap.set("Y", new KeyInfo(3, 1, ShiftState.FORCE_DOWN));
keyMap.set("Z", new KeyInfo(3, 2, ShiftState.FORCE_DOWN));
keyMap.set("a", new KeyInfo(0, 1, ShiftState.FORCE_UP));
keyMap.set("b", new KeyInfo(0, 2, ShiftState.FORCE_UP));
keyMap.set("c", new KeyInfo(0, 3, ShiftState.FORCE_UP));
keyMap.set("d", new KeyInfo(0, 4, ShiftState.FORCE_UP));
keyMap.set("e", new KeyInfo(0, 5, ShiftState.FORCE_UP));
keyMap.set("f", new KeyInfo(0, 6, ShiftState.FORCE_UP));
keyMap.set("g", new KeyInfo(0, 7, ShiftState.FORCE_UP));
keyMap.set("h", new KeyInfo(1, 0, ShiftState.FORCE_UP));
keyMap.set("i", new KeyInfo(1, 1, ShiftState.FORCE_UP));
keyMap.set("j", new KeyInfo(1, 2, ShiftState.FORCE_UP));
keyMap.set("k", new KeyInfo(1, 3, ShiftState.FORCE_UP));
keyMap.set("l", new KeyInfo(1, 4, ShiftState.FORCE_UP));
keyMap.set("m", new KeyInfo(1, 5, ShiftState.FORCE_UP));
keyMap.set("n", new KeyInfo(1, 6, ShiftState.FORCE_UP));
keyMap.set("o", new KeyInfo(1, 7, ShiftState.FORCE_UP));
keyMap.set("p", new KeyInfo(2, 0, ShiftState.FORCE_UP));
keyMap.set("q", new KeyInfo(2, 1, ShiftState.FORCE_UP));
keyMap.set("r", new KeyInfo(2, 2, ShiftState.FORCE_UP));
keyMap.set("s", new KeyInfo(2, 3, ShiftState.FORCE_UP));
keyMap.set("t", new KeyInfo(2, 4, ShiftState.FORCE_UP));
keyMap.set("u", new KeyInfo(2, 5, ShiftState.FORCE_UP));
keyMap.set("v", new KeyInfo(2, 6, ShiftState.FORCE_UP));
keyMap.set("w", new KeyInfo(2, 7, ShiftState.FORCE_UP));
keyMap.set("x", new KeyInfo(3, 0, ShiftState.FORCE_UP));
keyMap.set("y", new KeyInfo(3, 1, ShiftState.FORCE_UP));
keyMap.set("z", new KeyInfo(3, 2, ShiftState.FORCE_UP));
keyMap.set("0", new KeyInfo(4, 0, ShiftState.FORCE_UP));
keyMap.set("1", new KeyInfo(4, 1, ShiftState.FORCE_UP));
keyMap.set("2", new KeyInfo(4, 2, ShiftState.FORCE_UP));
keyMap.set("3", new KeyInfo(4, 3, ShiftState.FORCE_UP));
keyMap.set("4", new KeyInfo(4, 4, ShiftState.FORCE_UP));
keyMap.set("5", new KeyInfo(4, 5, ShiftState.FORCE_UP));
keyMap.set("6", new KeyInfo(4, 6, ShiftState.FORCE_UP));
keyMap.set("7", new KeyInfo(4, 7, ShiftState.FORCE_UP));
keyMap.set("8", new KeyInfo(5, 0, ShiftState.FORCE_UP));
keyMap.set("9", new KeyInfo(5, 1, ShiftState.FORCE_UP));
keyMap.set("_", new KeyInfo(4, 0, ShiftState.FORCE_DOWN)); // Simulate Shift-0, like trsemu.
keyMap.set("!", new KeyInfo(4, 1, ShiftState.FORCE_DOWN));
keyMap.set("\"", new KeyInfo(4, 2, ShiftState.FORCE_DOWN));
keyMap.set("#", new KeyInfo(4, 3, ShiftState.FORCE_DOWN));
keyMap.set("$", new KeyInfo(4, 4, ShiftState.FORCE_DOWN));
keyMap.set("%", new KeyInfo(4, 5, ShiftState.FORCE_DOWN));
keyMap.set("&", new KeyInfo(4, 6, ShiftState.FORCE_DOWN));
keyMap.set("'", new KeyInfo(4, 7, ShiftState.FORCE_DOWN));
keyMap.set("(", new KeyInfo(5, 0, ShiftState.FORCE_DOWN));
keyMap.set(")", new KeyInfo(5, 1, ShiftState.FORCE_DOWN));
keyMap.set(":", new KeyInfo(5, 2, ShiftState.FORCE_UP));
keyMap.set(";", new KeyInfo(5, 3, ShiftState.FORCE_UP));
keyMap.set(",", new KeyInfo(5, 4, ShiftState.FORCE_UP));
keyMap.set("-", new KeyInfo(5, 5, ShiftState.FORCE_UP));
keyMap.set(".", new KeyInfo(5, 6, ShiftState.FORCE_UP));
keyMap.set("/", new KeyInfo(5, 7, ShiftState.FORCE_UP));
keyMap.set("*", new KeyInfo(5, 2, ShiftState.FORCE_DOWN));
keyMap.set("+", new KeyInfo(5, 3, ShiftState.FORCE_DOWN));
keyMap.set("<", new KeyInfo(5, 4, ShiftState.FORCE_DOWN));
keyMap.set("=", new KeyInfo(5, 5, ShiftState.FORCE_DOWN));
keyMap.set(">", new KeyInfo(5, 6, ShiftState.FORCE_DOWN));
keyMap.set("?", new KeyInfo(5, 7, ShiftState.FORCE_DOWN));
keyMap.set("Enter", new KeyInfo(6, 0, ShiftState.NEUTRAL));
keyMap.set("\\", new KeyInfo(6, 1, ShiftState.NEUTRAL)); // Clear
keyMap.set("Escape", new KeyInfo(6, 2, ShiftState.NEUTRAL)); // Break
keyMap.set("ArrowUp", new KeyInfo(6, 3, ShiftState.NEUTRAL));
keyMap.set("ArrowDown", new KeyInfo(6, 4, ShiftState.NEUTRAL));
keyMap.set("ArrowLeft", new KeyInfo(6, 5, ShiftState.NEUTRAL));
keyMap.set("Backspace", new KeyInfo(6, 5, ShiftState.NEUTRAL)); // Left arrow
keyMap.set("ArrowRight", new KeyInfo(6, 6, ShiftState.NEUTRAL));
keyMap.set(" ", new KeyInfo(6, 7, ShiftState.NEUTRAL));
keyMap.set("Shift", new KeyInfo(7, 0, ShiftState.NEUTRAL));
class Keyboard {
    constructor() {
        // We queue up keystrokes so that we don't overwhelm the ROM polling routines.
        this.keyQueue = [];
        // Whether browser keys should be intercepted.
        this.interceptKeys = false;
        this.keyProcessMinClock = 0;
        // 8 bytes, each a bitfield of keys currently pressed.
        this.keys = new Uint8Array(8);
        this.shiftForce = ShiftState.NEUTRAL;
    }
    static isInRange(address) {
        return address >= BEGIN_ADDR && address < END_ADDR;
    }
    // Release all keys.
    clearKeyboard() {
        this.keys.fill(0);
        this.shiftForce = ShiftState.NEUTRAL;
    }
    // Read a byte from the keyboard memory bank. This is an odd system where
    // bits in the address map to the various bytes, and you can read the OR'ed
    // addresses to read more than one byte at a time. For the last byte we fake
    // the Shift key if necessary.
    readKeyboard(addr, clock) {
        addr = (addr - BEGIN_ADDR) % BANK_SIZE;
        let b = 0;
        // Dequeue if necessary.
        if (clock > this.keyProcessMinClock) {
            const keyWasPressed = this.processKeyQueue();
            if (keyWasPressed) {
                this.keyProcessMinClock = clock + KEY_DELAY_CLOCK_CYCLES;
            }
        }
        // OR together the various bytes.
        for (let i = 0; i < this.keys.length; i++) {
            let keys = this.keys[i];
            if ((addr & (1 << i)) !== 0) {
                if (i === 7) {
                    // Modify keys based on the shift force.
                    switch (this.shiftForce) {
                        case ShiftState.NEUTRAL:
                            // Nothing.
                            break;
                        case ShiftState.FORCE_UP:
                            // On the Model III the first two bits are left and right shift,
                            // though we don't handle the right shift anywhere.
                            keys &= ~0x03;
                            break;
                        case ShiftState.FORCE_DOWN:
                            keys |= 0x01;
                            break;
                    }
                }
                b |= keys;
            }
        }
        return b;
    }
    // Enqueue a key press or release.
    keyEvent(key, isPressed) {
        // Look up the key info.
        const keyInfo = keyMap.get(key);
        if (keyInfo === undefined) {
            if (key !== "Meta" && key !== "Control" && key !== "Alt" && key !== "Tab") {
                console.log("Unknown key \"" + key + "\"");
            }
        }
        else {
            // Append key to queue.
            this.keyQueue.push(new KeyActivity(keyInfo, isPressed));
        }
    }
    // Convert keys on the keyboard to ASCII letters or special strings like "Enter".
    configureKeyboard() {
        // Handle a key event by mapping it and sending it to the emulator.
        const keyEvent = (event, isPressed) => {
            // Don't do anything if we're not active.
            if (!this.interceptKeys) {
                return;
            }
            // Don't send to virtual computer if a text input field is selected.
            // if ($(document.activeElement).attr("type") === "text") {
            //     return;
            // }
            // Don't interfere with browser keys.
            if (event.metaKey || event.ctrlKey) {
                return;
            }
            const key = event.key;
            if (key !== "") {
                this.keyEvent(key, isPressed);
                event.preventDefault();
            }
        };
        const body = document.getElementsByTagName("body")[0];
        body.addEventListener("keydown", (event) => keyEvent(event, true));
        body.addEventListener("keyup", (event) => keyEvent(event, false));
        body.addEventListener("paste", (event) => {
            // Don't do anything if we're not active.
            if (!this.interceptKeys) {
                return;
            }
            if (event.clipboardData) {
                const pastedText = event.clipboardData.getData("text/plain");
                if (pastedText) {
                    this.simulateKeyboardText(pastedText);
                }
            }
            event.preventDefault();
        });
    }
    /**
     * Simulate this text being entered by the user.
     */
    simulateKeyboardText(text) {
        for (let ch of text) {
            if (ch === "\n" || ch === "\r") {
                ch = "Enter";
            }
            this.keyEvent(ch, true);
            this.keyEvent(ch, false);
        }
    }
    // Dequeue the next key and set its bit. Return whether a key was processed.
    processKeyQueue() {
        const keyActivity = this.keyQueue.shift();
        if (keyActivity === undefined) {
            return false;
        }
        this.shiftForce = keyActivity.keyInfo.shiftForce;
        const bit = 1 << keyActivity.keyInfo.bitNumber;
        if (keyActivity.isPressed) {
            this.keys[keyActivity.keyInfo.byteIndex] |= bit;
        }
        else {
            this.keys[keyActivity.keyInfo.byteIndex] &= ~bit;
        }
        return true;
    }
}
exports.Keyboard = Keyboard;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Model1Level1Rom.js":
/*!*************************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Model1Level1Rom.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.model1Level1Rom = void 0;
exports.model1Level1Rom = `
8yH/AMOOAQDj777DmAA+DdkIzfAPw8sKza0HAMNdBwB8usB9u8kAABr+IMATwygA8c2zCMPJCADv1kHY/ho/2BOnID7PKDrNCwgjKSnaogHlzyk14dXlKmpA7VtsQK/tUtHnw3YA8zEAQq8ykEDT/z4M18PJAdr1CCpqQO1S0a/JryZAFxdvr8nDyQga/jDY/jo/2BPmD8kjKAfFTgYACcEbEyPjyc1VAQYASO/NsgAY+82MADggy/DLeCAVzcUAy0DIDcnNXgHI2WJrCE/Zy/jxy0DADMnPLgXLQMvAyPHLcMguGCYAxdXZzQAOAQoA3QnRAfsAxdXDDw3B1c9FHM8rAhgFzy0Cy8jNVwHNjAA4DsvozV4BwqIBGPHRrxgXy2go+PHZebQgJ33Zy3/CogHLSCgC7USBpygTy38oBzz1zZUMGAU99c2EDPEY6stwydnDogHLsNkuAGVN2ckI2VRdeQYA9SnLEcsQKcsRyxAZiU8+AIhH8SnLEcsQCIVvPgCMZz4AiU8+AIhH2cklfi93riD5ImpArzKQQDEAQsN7A9URqQHDzQhIT1c/DVJFQURZDVdIQVQ/DVNPUlJZDUJSRUFLIEFUADEAQs3kD80OABGuAc1PCTEAQs05At0h9EDN+gjVEaxAzcQOfLXBykADG3wSG30SxdV5k/XNKgnVIBDVzUUJwSpsQM1vCmBpImxAwSpsQPHl/gMou4VvPgCMZ+1bakDn0vQIImxA0c13CtHhzW8KGJ8GCuUhnUA2ACMQ+xEAQuHJTElTVIQBUlVOg4xORVeDeENPTlSD60NMT0FEjulDU0FWRY87TkVYVIWjTEVUhrhJTlBVVIYjSUaF+09OhP5HT1RPg7VHT1NVQoTEUkVTRVSIOFJFVFVSToTmUkVBRIb5UkVTVE9SRYbNUkVNhfZEQVRBhfZGT1KFRlBSSU5UhC9TRVSIPFNUT1CDxUVORIOHQ0xThLWGs0dPVE+FD0dPU1VChReIyVJORI5HQUJTiBlNRU2IIUlOVIgvUE9JTlSIQIfyVE+FVYjJU1RFUIVghWVUQUKEn0FUhHNBJIRZQiSEXoRSPodjPYeLPIdzh5dUSEVOhhGGFyFIAu/VGhMjvigGy34gDBgRGhMjvij6y34oAxsYEv4uKAkjy34o+yPRGNgjy34o+34jbuZ/Z/HpzcUIPgzXIQBCImxAw8kBzcUIGPjNwgjNOQIYAyEAAM0tCTjo7VOfQBMTzUAL/gMoHM3kD90h9EAhbAIYjs29DtXNxQjNKgnCowHxGNftU51APg3XEcABzU8JKp9AIpdAXiNWIQAAIp9A681tCT4N18PeAc3FCCqdQHy1KI/rKpdAIp9AzbMIGKHNwgjNKgkODDgiDSgKxc1jCsHNLQkY8c1jCs0tCTgNzUALKPv+Gyjv/g0g8xi5zyMJIaxAIplAzekPzzoFzQ4AGLzPDQbNDgDDlAMhGQPDQwPNWwkYQhgLIXBAGAMhgEDNuQTPLCY6aEDmDygiPiDXGPTNBwjtS2hAPiACfPb85j9nNl8iaEDPLAIYA887Bc2zCBi3zQ4A99/NcAkYxc0UCH3mP286aEDmP70o2jDYPiDXGPE+DNf3fiOnyNd95g/IGPXNnwrNvQ7VzSoJwqMBKp9A5SqjQOUhAAAipUA5IqNAw5wDzcUIKqNAfLXKyQj54SKjQOEin0DRw/IFzQsIfLUoBuUh3wIYR808BffhzSYF1cO8A+HNJgUim0DNnwoqm0AYpC0oEBr+DSjd/joo2RP+LCjvGPDNvQ4a/jrI/g3IExj2zZ8KzagIIqVAIQsDw0MDzQcIIm5AIREDGPLNBwgYAyEBACKRQCqfQCKTQOsilUABCgAqpUDrYGg5Pgl+I7YoGH4ruiD1frsg8eshAAA5RE0hCgAZzXcK+SqVQOv3/9rJCCKbQNXrKqVAfLXKygjnKAnRzYQKKptAGOrNwwvNCwzrKpFA5RnlzVkMKqVAzekL0SpuQPG38uAF63yq8uYF6+fROAgqk0Ain0AYrM2ECvchAAAYA80HCHy1IAnNRwnSnAPDyQEhNwPDQwPNxA7CEwXDogPte5tA4SKfQNHPIwrN9A7VKp9A5Rge1c1bCRgDzzsYKp9A5SEwBiKfQO1zm0DVPj/N/AjRw9QG8Rh2yq4I7xr+DSgS/iIoF/4sKAp3IxN95g8oHRjpNgAjfeYPIPjJExr+DSjxE/4iKOx3I33mDyDvGv4syP4NyBMY9v/YGxoT/inIGv4kKAKvyX3+B9LJCBPLJ8snxnBvp8ka/g0oDc2UBjgN9c89CfHNVAb34SKfQMPJCCEAACKhQPfNlAY47dURrEDNVAbtU5lA0c8sU82UBjjZ1fXtW5lAzyxL8RjkzZQG1ThD9e1boUB6syApEQBC5c1RB+E4M/HtS59AxQEAAO1Dn0DNVAbB7UOfQO1ToUDRzywRGMjPLAIY3M8NCBjQ4SKfQPH38cPKCPHDowGvyRoT/g0g+hMTKmxA59ghugsYTc2nB8NZDM89Bs2ZB9gYN82ZB8jYGDDPPQzNmQchAQDI2CEAAMnPPgzNmQfIGBjNmQfAGBLNmQfQGAzxyc2tB82xDCEAAMkhAQDJISwDw0MDzy0IIQAAzVkMGBTPKwDN1AfPKwjN1AfN0wwY9c8tN83UB82/DBjqze0HzyoIze0HzYcMGPXPLx7N7QfNmAwY6iHuAhi4/zgDw8MLzaYAwM8oBd/PKQHJw8kI38MLDM0HCMt8wqIByc38BxjvzfwH3cv/vsnV7VtsQCpqQK/tUtEYBs38B80ICMNZDD6AGAY+ARgCPgCn9c8oUs0LCOXPLEvNCwjPKUUBMACn7UIw/Al9Jv8k1gMw+8YDwUTLIcsYyxnLGMsZFzw3JgDLFD0g+3j2/OY/RwrLfyADPoAC8QooDPKlCHwvZwqkAvcYLqQhAAAoASzDWQy0Avf/OB7PPRvl38PoC886BPHDogPPDQTxw5QDyc3EDu/+DcjVEbQBzU8J7VufQHqzKBkTGhu3+hoG4X71l3fNYwob8RI+P9eXzU8Jw8kB1RG6ARjTPj7XEaxAzUALKPv+DSgM/h0oFf4DKOD+IDjrEhP+Dch7/vMg4T4d13v+rCjTGxjWEQBC5Xr+Qji+KmxAK+fh2BqVRxManDgEG7DJExMa/g0g+hMY3q9HGhO4yNf+DSD3yc8iDj4izVAJ/g3hypQDIyPpyc1ZDNXF5d1+/v6AIAk+INc+MNfDQQrdfv+nPiAoAj4t16/dd/8+//UhuQ7NpgwwB82EDPE9GPAhtQ7Npgw4CM2VDPE89Rjw3X7+7UQoC9nLOcscyx3ZPRjzBgfd5eE2ACM+AM1eAdl42XcjEPQGBg4AK37+BT8+ACuOyyH+CjgCPgB39acoAsvB8RDpecE4BgTFBgEY3094PPoTCv4HMAZHzU0KGC7FBgHNTQo+RdfBy3g+KygIPi3XeO1EGALXeAYA/go4Bcb2BBj39jBPePYw13nXPiDX4cHRAfv/3QnJBAUgAz4u1372MNcjyzkg8QUF+AQY6hpvExpnE81tCcNPCefIGgITAxj4eJIgA3mTyBsrGncY88HhIqVAfLUoEOEikUDhIm5A4SKTQOEilUDFySGAQXwvZ30vbyPBOdL0CCqlQHy1KBMqlUDlKpNA5SpuQOUqkUDlKqVA5cXJKBkI7VuZQBIT7VOZQP4N2cDV2SGsQM1LD9HJKmhACPX+IPoRC3cjfP5AIBIRADwhQDwBwAPtsOvNNwshwD82XyJoQPHZyf4NIAXNNwsY2P4MIBAhADzNNwt8/kAg+CEAPBjb/h0g1zYgKxjSNiAjfeY/IPjJOn84p8jZzVUL2den9Tp/OKcg+vHJBv8Q/hGsCyEBOD4AtiAKHMsl8mEL2fEY0utGBMs/IPt4/kAwF/48MCH+MDAWIbILIwUg/EbNpQvA5j/JzaULyOY/yc2lC8jmL8nNpQvAGPc6gDineMnJP0dPVy83AA0MA1tcXV4gREFUQYdJh0vV5fUBBADd5dHtsN3LAhbdywMWeB/ddwQ33csCHg4F3Qnx4dHJ4QH7/90JAQQA1eXr3eXh7bDrKyvLFiPdfgQXyx4ryx7h0cnZAfv/3QkRAADdfgPdTgT+gCg0/gH6LAz+EPowDNnDogE+/xgWR91+AN1uAd1mAssnyxXLFMsTyxIQ9MshMAi0tSgBE814DNXZ4ckhCgDV6wEKAN0JzXUM1SYAyxwuENnRLgBjSs0ADhgvr4Lwe+1EX3ovP84AVzfJzVYMzR4OKD67yg0NzScNGA/NVgzNHg4oLbvKowHNXA0Yac3DC80eDgH7/xgGzR4OAfb/3Qm9zZQN0cnNHg4gBc0DDRgwuyhUqlcYC83DC80eDigsuyhFzbMNKA4wB+vZ63lIR9nNyw0YIXyqIBseAc3zDRgW3X7/7oDdd//RydVia9lrYkjZGAIugN10+t11+dnddfbddPfdcfjZAfv/3QnRyXyqZx3lxQYY3W723Wb33U742a9vZ0/ZyznLHMsd2TAEGXmIT9kQBcHh2Rgw2csZyxzLHRjhe+1EX3yqZ+XFBhnZ7VJ5mE8wAxmIT9k/7WrLERAL5cXZweHZweHZGGTZKcsRMN0/7VJ5mE+3GN4oCrsoD3yqzLMNGAe7yDfLehgDyMt8IAUfN8sXyT/JfZMoB+K8De1EB8nZebggBny6IAJ9u9nJfZMoDv4Y0NnLOMsayxs9IPfZHgB8qvr6DdkZeYhPMAfLGcscyx032X2L6hUOb8nZ7VJ5mE8GGK8MDfoRDj0pyxEQ9y6AydmFGOB8t/oODvHDowHh1eXdVv/dXv7Z3V773Vb83Ub92d1m+t1u+dndbvbdZvfdTvjZPoC9yc0UCHy1ymQOy3zCogHNWQzNZA7NhwzNCwwjw1kM1dkhp0BeI1YjRtnNVQEhsg4OAwYIVtkpyxHZyxIwBtkZeYhP2RDvIw0g6CEAANkRp0B9xmUSE298zrASE2d5zgUST80ADgEKAN0Jww8NQOZNAACAAMzMzH7NxA7Aw8kIzVUBIQAARe/NjAA4CQTNXgEw9cOiAdnlect82eEg9Kcg8Xinyc30DiJsQCDQw8kBzekP1a/NgQ/+pSD5PioyADwyATzNoQ9XzaEPX82hD2fNoQ9vDgDNoQ8SE/4NIAr1OgE87goyATzxgU/nMOjlzeQP4dF5p8nN6Q8hAELtW2xAzUsPw8kBPoDFCK/NqQ8IPSD3PqXNqQ98zakPfc2pD8F6zakPe82pDw4Afs2pDyPnIPh57UTNqQ/N5A/J2Qjb/xcw+wZ8EP7N8A8G+BD+2/9HCMsQF/XN8A/x2ckGCM2BDxD7ydkOCFfNxQ/LAjALzcUPDSDzetmBT8kGABD+GPIhAfzN8w8GChD+IQL8zfMPBgoQ/iEA/M3zDwbaEP7JIQD7GAohBP/N8w/JIQD/OpBApLXT/zKQQMtXyQ==
`;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Model1Level2Rom.js":
/*!*************************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Model1Level2Rom.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.model1Level2Rom = void 0;
exports.model1Level2Rom = `
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
`;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Model3Rom.js":
/*!*******************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Model3Rom.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.model3Rom = void 0;
exports.model3Rom = `
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
`;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/ProgressBar.js":
/*!*********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/ProgressBar.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProgressBar = void 0;
const Utils_1 = __webpack_require__(/*! ./Utils */ "./node_modules/trs80-emulator/dist/Utils.js");
const gCssPrefix = Utils_1.CSS_PREFIX + "-progress-bar";
const gScreenNodeCssClass = gCssPrefix + "-screen-node";
const gBarCssClass = gCssPrefix + "-bar";
const gSubbarCssClass = gCssPrefix + "-subbar";
const GLOBAL_CSS = "." + gBarCssClass + ` {
    background-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    left: 15%;
    width: 70%;
    bottom: 10%;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    opacity: 0;
    transition: opacity .20s ease-in-out;
}

.` + gSubbarCssClass + ` {
    background-color: rgba(255, 255, 255, 0.4);
    width: 0;
    height: 20px;
}

.` + gScreenNodeCssClass + ` {
    /* Force the screen node to relative positioning. Hope that doesn't screw anything up. */
    position: relative;
}

`;
/**
 * Overlay on top of a screen to show progress, for instance the position of a cassette tape.
 */
class ProgressBar {
    /**
     * @param screenNode the node from the Trs80Screen object's getNode() method.
     */
    constructor(screenNode) {
        this.maxValue = 100;
        // Make global CSS if necessary.
        ProgressBar.configureStyle();
        screenNode.classList.add(gScreenNodeCssClass);
        this.barNode = document.createElement("div");
        this.barNode.classList.add(gBarCssClass);
        screenNode.appendChild(this.barNode);
        this.subbarNode = document.createElement("div");
        this.subbarNode.classList.add(gSubbarCssClass);
        this.barNode.appendChild(this.subbarNode);
    }
    setMaxValue(maxValue) {
        this.maxValue = maxValue;
    }
    setValue(value) {
        this.subbarNode.style.width = "" + Math.round(value * 100 / this.maxValue) + "%";
    }
    show() {
        this.barNode.style.opacity = "1";
    }
    hide() {
        this.barNode.style.opacity = "0";
    }
    /**
     * Make a global stylesheet for all TRS-80 emulators on this page.
     */
    static configureStyle() {
        const styleId = gCssPrefix;
        if (document.getElementById(styleId) !== null) {
            // Already created.
            return;
        }
        const node = document.createElement("style");
        node.id = styleId;
        node.innerHTML = GLOBAL_CSS;
        document.head.appendChild(node);
    }
}
exports.ProgressBar = ProgressBar;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/SettingsPanel.js":
/*!***********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/SettingsPanel.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsPanel = exports.PanelType = void 0;
const Utils_1 = __webpack_require__(/*! ./Utils */ "./node_modules/trs80-emulator/dist/Utils.js");
const Config_1 = __webpack_require__(/*! ./Config */ "./node_modules/trs80-emulator/dist/Config.js");
const CanvasScreen_1 = __webpack_require__(/*! ./CanvasScreen */ "./node_modules/trs80-emulator/dist/CanvasScreen.js");
const gCssPrefix = Utils_1.CSS_PREFIX + "-settings-panel";
const gScreenNodeCssClass = gCssPrefix + "-screen-node";
const gPanelCssClass = gCssPrefix + "-panel";
const gShownCssClass = gCssPrefix + "-shown";
const gAcceptButtonCssClass = gCssPrefix + "-accept";
const gRebootButtonCssClass = gCssPrefix + "-reboot";
const gOptionsClass = gCssPrefix + "-options";
const gButtonsClass = gCssPrefix + "-buttons";
const gColorButtonClass = gCssPrefix + "-color-button";
const gDarkColorButtonClass = gCssPrefix + "-dark-color-button";
const gAcceptButtonColor = "#449944";
const GLOBAL_CSS = `
.${gPanelCssClass} {
    display: flex;
    align-items: stretch;
    justify-content: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity .20s ease-in-out, visibility .20s ease-in-out;
}

.${gPanelCssClass}.${gShownCssClass} {
    opacity: 1;
    visibility: visible;
}

.${gPanelCssClass} > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    background-color: rgba(40, 40, 40, 0.8);
    border-radius: 15px;
    color: #ccc;
    font-family: sans-serif;
    font-size: 10pt;
    line-height: normal;
    margin: 20px 0;
    padding: 10px 30px;
    min-width: 200px;
}

.${gPanelCssClass} h1 {
    text-transform: uppercase;
    text-align: center;
    letter-spacing: .5px;
    font-size: 10pt;
    margin: 0 0 10px 0;
}

.${gPanelCssClass} .${gOptionsClass} {
    display: flex;
    justify-content: center;
}

.${gPanelCssClass} input[type=radio] {
    display: none;
}

.${gPanelCssClass} input[type=radio] + label {
    display: block;
    flex-grow: 1;
    flex-basis: 0;
    text-align: center;
    padding: 4px 16px;
    margin-left: 10px;
    border-radius: 3px;
    background-color: #44443A;
    white-space: nowrap;
}

.${gPanelCssClass} input[type=radio] + label.${gColorButtonClass} {
    flex-grow: 0;
    flex-basis: auto;
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 999px;
    border: 2px solid transparent;
    color: transparent;
    transition: color .20s ease-in-out;
}

.${gPanelCssClass} input[type=radio] + label.${gColorButtonClass}.${gDarkColorButtonClass} {
    border: solid 2px #ccc;
}

.${gPanelCssClass} input[type=radio]:checked + label.${gColorButtonClass}::after {
    content: "✓";
    font-size: 20px;
}

.${gPanelCssClass} input[type=radio]:checked + label.${gColorButtonClass} {
    color: black;
}

.${gPanelCssClass} input[type=radio]:checked + label.${gColorButtonClass}.${gDarkColorButtonClass} {
    color: #ccc;
}

.${gPanelCssClass} input[type=radio] + label:first-of-type {
    margin-left: 0;
}

.${gPanelCssClass} input[type=radio]:enabled + label:hover {
    background-color: #66665A;
}

.${gPanelCssClass} input[type=radio]:disabled + label {
    color: #666;
}

.${gPanelCssClass} input[type=radio]:enabled:checked + label {
    color: #444;
    background-color: #ccc;
}

.${gPanelCssClass} .${gButtonsClass} {
    display: flex;
}

.${gPanelCssClass} a {
    display: block;
    flex-grow: 1;
    flex-basis: 0;
    text-align: center;
    padding: 4px 16px;
    border-radius: 3px;
    margin-left: 10px;
    color: #ccc;
    background-color: #44443A;
    cursor: default;
}

.${gPanelCssClass} a:first-of-type {
    margin-left: 0;
}

.${gPanelCssClass} a.${gAcceptButtonCssClass} {
    font-weight: bold;
    color: #eee;
    background-color: ${gAcceptButtonColor};
}

.${gPanelCssClass} a.${gAcceptButtonCssClass}:hover {
    background-color: #338833;
}

.${gPanelCssClass} a.${gRebootButtonCssClass} {
    background-color: #D25F43;
}

.${gPanelCssClass} a:hover {
    background-color: #66665A;
}

.${gPanelCssClass} a.${gRebootButtonCssClass}:hover {
    background-color: #BD563C;
}

.${gScreenNodeCssClass} {
    /* Force the screen node to relative positioning. Hope that doesn't screw anything up. */
    position: relative;
}
`;
/**
 * An option that's currently displayed to the user.
 */
class DisplayedOption {
    constructor(input, block, option) {
        this.input = input;
        this.block = block;
        this.option = option;
    }
}
// Convert RGB array (0-255) to a CSS string.
function rgbToCss(color) {
    return "#" + color.map(c => c.toString(16).padStart(2, "0").toUpperCase()).join("");
}
// Multiplies an RGB (0-255) color by a factor.
function adjustColor(color, factor) {
    return color.map(c => Math.max(0, Math.min(255, Math.round(c * factor))));
}
/**
 * Our full configuration options.
 */
const HARDWARE_OPTION_BLOCKS = [
    {
        title: "Model",
        isChecked: (modelType, config) => modelType === config.modelType,
        updateConfig: (modelType, config) => config.withModelType(modelType),
        options: [
            {
                label: "Model I",
                value: Config_1.ModelType.MODEL1,
            },
            {
                label: "Model III",
                value: Config_1.ModelType.MODEL3,
            },
        ]
    },
    {
        title: "Basic",
        isChecked: (basicLevel, config) => basicLevel === config.basicLevel,
        updateConfig: (basicLevel, config) => config.withBasicLevel(basicLevel),
        options: [
            {
                label: "Level 1",
                value: Config_1.BasicLevel.LEVEL1,
            },
            {
                label: "Level 2",
                value: Config_1.BasicLevel.LEVEL2,
            },
        ]
    },
    {
        title: "Characters",
        isChecked: (cgChip, config) => cgChip === config.cgChip,
        updateConfig: (cgChip, config) => config.withCGChip(cgChip),
        options: [
            {
                label: "Original",
                value: Config_1.CGChip.ORIGINAL,
            },
            {
                label: "Lower case",
                value: Config_1.CGChip.LOWER_CASE,
            },
        ]
    },
    {
        title: "RAM",
        isChecked: (ramSize, config) => ramSize === config.ramSize,
        updateConfig: (ramSize, config) => config.withRamSize(ramSize),
        options: [
            {
                label: "4 kB",
                value: Config_1.RamSize.RAM_4_KB,
            },
            {
                label: "16 kB",
                value: Config_1.RamSize.RAM_16_KB,
            },
            {
                label: "32 kB",
                value: Config_1.RamSize.RAM_32_KB,
            },
            {
                label: "48 kB",
                value: Config_1.RamSize.RAM_48_KB,
            },
        ]
    },
];
const VIEW_OPTION_BLOCKS = [
    {
        title: "Phosphor",
        isChecked: (phosphor, config) => phosphor === config.phosphor,
        updateConfig: (phosphor, config) => config.withPhosphor(phosphor),
        options: [
            {
                label: rgbToCss(adjustColor(CanvasScreen_1.phosphorToRgb(Config_1.Phosphor.WHITE), 0.8)),
                value: Config_1.Phosphor.WHITE,
            },
            {
                // Cheat and use the green from the OK button so that the two greens don't clash.
                label: gAcceptButtonColor,
                value: Config_1.Phosphor.GREEN,
            },
            {
                label: rgbToCss(adjustColor(CanvasScreen_1.phosphorToRgb(Config_1.Phosphor.AMBER), 0.8)),
                value: Config_1.Phosphor.AMBER,
            },
        ]
    },
    {
        title: "Background",
        isChecked: (background, config) => background === config.background,
        updateConfig: (background, config) => config.withBackground(background),
        options: [
            {
                label: CanvasScreen_1.BLACK_BACKGROUND,
                value: Config_1.Background.BLACK,
            },
            {
                label: CanvasScreen_1.AUTHENTIC_BACKGROUND,
                value: Config_1.Background.AUTHENTIC,
            },
        ]
    },
    {
        title: "Scan Lines",
        isChecked: (scanLines, config) => scanLines === config.scanLines,
        updateConfig: (scanLines, config) => config.withScanLines(scanLines),
        options: [
            {
                label: "Off",
                value: Config_1.ScanLines.OFF,
            },
            {
                label: "On",
                value: Config_1.ScanLines.ON,
            },
        ]
    },
];
// Type of panel to show.
var PanelType;
(function (PanelType) {
    // Model, RAM, etc.
    PanelType[PanelType["HARDWARE"] = 0] = "HARDWARE";
    // Phosphor color, background, etc.
    PanelType[PanelType["VIEW"] = 1] = "VIEW";
})(PanelType = exports.PanelType || (exports.PanelType = {}));
// Get the right options blocks for the panel type.
function optionBlocksForPanelType(panelType) {
    switch (panelType) {
        case PanelType.HARDWARE:
        default:
            return HARDWARE_OPTION_BLOCKS;
        case PanelType.VIEW:
            return VIEW_OPTION_BLOCKS;
    }
}
/**
 * Whether the given CSS color is dark.
 *
 * @param color an CSS color in the form "#rrggbb".
 */
function isDarkColor(color) {
    if (!color.startsWith("#") || color.length !== 7) {
        throw new Error("isDarkColor: not a color (" + color + ")");
    }
    const red = parseInt(color.substr(1, 2), 16);
    const grn = parseInt(color.substr(3, 2), 16);
    const blu = parseInt(color.substr(5, 2), 16);
    const gray = red * 0.3 + grn * 0.6 + blu * 0.1;
    return gray < 110;
}
let gRadioButtonCounter = 1;
/**
 * A full-screen control panel for configuring the emulator.
 */
class SettingsPanel {
    constructor(screenNode, trs80, panelType) {
        this.displayedOptions = [];
        this.panelType = panelType;
        this.trs80 = trs80;
        // Make global CSS if necessary.
        SettingsPanel.configureStyle();
        screenNode.classList.add(gScreenNodeCssClass);
        this.panelNode = document.createElement("div");
        this.panelNode.classList.add(gPanelCssClass);
        screenNode.appendChild(this.panelNode);
        const div = document.createElement("div");
        this.panelNode.appendChild(div);
        for (const block of optionBlocksForPanelType(panelType)) {
            const name = gCssPrefix + "-" + gRadioButtonCounter++;
            const blockDiv = document.createElement("div");
            div.appendChild(blockDiv);
            const h1 = document.createElement("h1");
            h1.innerText = block.title;
            blockDiv.appendChild(h1);
            const optionsDiv = document.createElement("div");
            optionsDiv.classList.add(gOptionsClass);
            blockDiv.appendChild(optionsDiv);
            for (const option of block.options) {
                const id = gCssPrefix + "-" + gRadioButtonCounter++;
                const input = document.createElement("input");
                input.id = id;
                input.type = "radio";
                input.name = name;
                input.addEventListener("change", () => this.updateEnabledOptions());
                optionsDiv.appendChild(input);
                const label = document.createElement("label");
                label.htmlFor = id;
                if (option.label.startsWith("#")) {
                    // It's a color, show a swatch.
                    label.classList.add(gColorButtonClass);
                    label.style.backgroundColor = option.label;
                    if (isDarkColor(option.label)) {
                        label.classList.add(gDarkColorButtonClass);
                    }
                }
                else {
                    label.innerText = option.label;
                }
                optionsDiv.appendChild(label);
                this.displayedOptions.push(new DisplayedOption(input, block, option));
            }
        }
        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add(gButtonsClass);
        div.appendChild(buttonsDiv);
        this.acceptButton = document.createElement("a");
        this.acceptButton.classList.add(gAcceptButtonCssClass);
        this.acceptButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.accept();
        });
        buttonsDiv.appendChild(this.acceptButton);
        this.configureAcceptButton(this.trs80.getConfig());
        const cancelButton = document.createElement("a");
        cancelButton.innerText = "Cancel";
        cancelButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.close();
        });
        buttonsDiv.appendChild(cancelButton);
    }
    /**
     * Open the settings panel.
     */
    open() {
        if (this.onOpen !== undefined) {
            this.onOpen();
        }
        // Configure options.
        for (const displayedOption of this.displayedOptions) {
            displayedOption.input.checked = displayedOption.block.isChecked(displayedOption.option.value, this.trs80.getConfig());
        }
        this.updateEnabledOptions();
        this.panelNode.classList.add(gShownCssClass);
    }
    /**
     * Accept the changes, configure the machine, and close the dialog box.
     */
    accept() {
        this.trs80.setConfig(this.getConfig());
        this.close();
    }
    /**
     * Close the settings panel.
     */
    close() {
        this.panelNode.classList.remove(gShownCssClass);
        if (this.onClose !== undefined) {
            this.onClose();
        }
    }
    /**
     * Update which options are enabled based on the current selection.
     */
    updateEnabledOptions() {
        const config = this.getConfig();
        for (const displayedOption of this.displayedOptions) {
            const enabled = displayedOption.block.updateConfig(displayedOption.option.value, config).isValid();
            displayedOption.input.disabled = !enabled;
        }
        this.configureAcceptButton(config);
    }
    /**
     * Set the accept button to be OK or Reboot.
     */
    configureAcceptButton(config) {
        if (config.needsReboot(this.trs80.getConfig())) {
            this.acceptButton.classList.add(gRebootButtonCssClass);
            this.acceptButton.innerText = "Reboot";
        }
        else {
            this.acceptButton.classList.remove(gRebootButtonCssClass);
            this.acceptButton.innerText = "OK";
        }
    }
    /**
     * Make a new config from the user's currently selected options.
     */
    getConfig() {
        let config = this.trs80.getConfig();
        for (const displayedOption of this.displayedOptions) {
            if (displayedOption.input.checked) {
                config = displayedOption.block.updateConfig(displayedOption.option.value, config);
            }
        }
        return config;
    }
    /**
     * Make a global stylesheet for all TRS-80 emulators on this page.
     */
    static configureStyle() {
        const styleId = gCssPrefix;
        if (document.getElementById(styleId) !== null) {
            // Already created.
            return;
        }
        const node = document.createElement("style");
        node.id = styleId;
        node.innerHTML = GLOBAL_CSS;
        document.head.appendChild(node);
    }
}
exports.SettingsPanel = SettingsPanel;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/SoundPlayer.js":
/*!*********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/SoundPlayer.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoundPlayer = void 0;
const PROCESSOR_NAME = "trs80-audio-processor";
// Get these straight from my GitHub repo.
const SPIN_URL = "https://raw.githubusercontent.com/lkesteloot/trs80-emulator/83e7fabd7d26f3e197329ee05a7c8ffc4063362c/sounds/spin.mp3";
const TRACK_URL = "https://raw.githubusercontent.com/lkesteloot/trs80-emulator/83845b15b3c99daa8237e22b48f00426fcdc0cbf/sounds/track.mp3";
const SPIN_VOLUME = 0.6;
const TRACK_VOLUME = 0.3;
const PROCESSOR_JS = `
// Generates the TRS-80 sound.
class Trs80SoundProcessor extends AudioWorkletProcessor {
    // This parameter is the audio itself. We just pass it on.
    static get parameterDescriptors() {
        return [{
            name: "audioValue",
            defaultValue: 0,
        }];
    }

    constructor() {
        super();
    }

    // Process 128 audio samples at a time.
    process(inputs, outputs, parameters) {
        // We only have one output.
        const output = outputs[0];

        // The parameter that holds the actual audio.
        const audioValue = parameters.audioValue;

        // We should be mono, but send to all channels anyway.
        for (let channelNumber = 0; channelNumber < output.length; channelNumber++) {
            const channel = output[channelNumber];

            for (let i = 0; i < channel.length; i++) {
                const value = audioValue.length === 1 ? audioValue[0] : audioValue[i];
                
                // 10% volume.
                channel[i] = value/10;
            }
        }

        // Keep going.
        return true;
    }
}

// Register ourselves by name.
registerProcessor("${PROCESSOR_NAME}", Trs80SoundProcessor);
`;
/**
 * Minimum time of silence before we suspend the audio player. Be generous here because we lose a bit of
 * audio after resuming, so you really only want to do it after the sound-making program has stopped.
 */
const MIN_SILENT_TIME_S = 30;
/**
 * Handles playing of sound through the cassette port.
 */
class SoundPlayer {
    constructor() {
        this.muted = true;
        this.audioContext = undefined;
        this.audioValue = undefined;
        this.floppyMotorOn = false;
        this.floppySpinAudioBuffer = undefined;
        this.floppySpinSourceNode = undefined;
        this.floppySpinGainNode = undefined;
        this.trackAudioBuffer = undefined;
        // Difference between computer time and audio time, in seconds.
        this.adjustment = 0;
        this.lastAudioTime = 0;
        this.isSuspended = false;
    }
    /**
     * Resume the audio context if necessary.
     */
    resumeAudio() {
        if (this.isSuspended && this.audioContext !== undefined) {
            this.audioContext.resume();
            this.isSuspended = false;
        }
    }
    /**
     * Sets the value sent to the cassette, from the set -1, 0, or 1.
     */
    setAudioValue(value, tStateCount, clockHz) {
        if (!this.muted && this.audioContext !== undefined && this.audioValue !== undefined) {
            this.resumeAudio();
            const computerTime = tStateCount / clockHz;
            const audioTime = this.audioContext.currentTime;
            const delta = computerTime - audioTime;
            const error = delta - this.adjustment;
            if (error < 0 || error > 0.050) {
                // We always need computer time to be ahead of audio time or it won't be heard.
                this.adjustment = delta - 0.025;
            }
            this.audioValue.setValueAtTime(value, computerTime - this.adjustment);
            // Remember when we last played audio.
            this.lastAudioTime = audioTime;
        }
    }
    /**
     * Mutes the audio. This is the default.
     */
    mute() {
        if (!this.muted) {
            this.muted = true;
            if (this.audioContext !== undefined) {
                this.audioContext.suspend();
                this.isSuspended = true;
            }
        }
    }
    /**
     * Unmutes the audio.
     */
    unmute() {
        if (this.muted) {
            if (this.audioContext === undefined) {
                this.enableAudio();
            }
            this.muted = false;
            if (this.audioContext !== undefined) {
                this.audioContext.resume();
                this.isSuspended = false;
            }
        }
    }
    /**
     * Update the sound system about the state of the floppy motors.
     */
    setFloppyMotorOn(motorOn) {
        this.floppyMotorOn = motorOn;
        this.updateFloppySpin();
    }
    /**
     * Start or stop the background floppy spinning noise depending on the state of the motor.
     */
    updateFloppySpin() {
        if (!this.floppyMotorOn && this.floppySpinSourceNode !== undefined &&
            this.floppySpinGainNode !== undefined && this.audioContext !== undefined) {
            // Stop playing spin sound.
            const endTime = this.audioContext.currentTime + 0.2;
            this.floppySpinGainNode.gain.setValueAtTime(SPIN_VOLUME, this.audioContext.currentTime);
            this.floppySpinGainNode.gain.linearRampToValueAtTime(0, endTime);
            this.floppySpinSourceNode.stop(endTime);
            this.floppySpinSourceNode = undefined;
            this.floppySpinGainNode = undefined;
        }
        else if (this.floppyMotorOn && this.floppySpinSourceNode === undefined &&
            this.floppySpinAudioBuffer !== undefined && this.audioContext !== undefined) {
            // Start playing spin sound.
            this.resumeAudio();
            this.floppySpinGainNode = this.audioContext.createGain();
            this.floppySpinGainNode.connect(this.audioContext.destination);
            this.floppySpinGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.floppySpinGainNode.gain.linearRampToValueAtTime(SPIN_VOLUME, this.audioContext.currentTime + 0.2);
            this.floppySpinSourceNode = this.audioContext.createBufferSource();
            this.floppySpinSourceNode.buffer = this.floppySpinAudioBuffer;
            this.floppySpinSourceNode.connect(this.floppySpinGainNode);
            this.floppySpinSourceNode.loop = true;
            this.floppySpinSourceNode.start();
            // Remember when we last played audio.
            this.lastAudioTime = this.audioContext.currentTime;
        }
    }
    /**
     * Play the sound of the head moving one track over.
     */
    playTrackSound() {
        if (this.audioContext !== undefined && this.trackAudioBuffer !== undefined) {
            this.resumeAudio();
            const gainNode = this.audioContext.createGain();
            gainNode.connect(this.audioContext.destination);
            gainNode.gain.setValueAtTime(TRACK_VOLUME, this.audioContext.currentTime);
            const sourceNode = this.audioContext.createBufferSource();
            sourceNode.buffer = this.trackAudioBuffer;
            sourceNode.connect(gainNode);
            sourceNode.start();
            // Remember when we last played audio.
            this.lastAudioTime = this.audioContext.currentTime;
        }
    }
    /**
     * Inform the sound system that a drive head has moved.
     */
    trackMoved(moveCount) {
        // We don't currently pay attention to the track move count. We tried spacing them out by 5ms or 10ms
        // and it didn't sound good. So just play one track move sound.
        this.playTrackSound();
    }
    /**
     * Whether we're muted.
     */
    isMuted() {
        return this.muted;
    }
    /**
     * Check whether it's been too long since we played audio and we should suspend the player (so that the
     * speaker icon disappears from the tab).
     */
    checkAutoSuspend() {
        if (this.audioContext !== undefined && !this.isSuspended &&
            this.floppySpinSourceNode === undefined &&
            this.audioContext.currentTime - this.lastAudioTime >= MIN_SILENT_TIME_S) {
            this.audioContext.suspend();
            this.isSuspended = true;
        }
    }
    /**
     * Start the audio processor.
     */
    enableAudio() {
        // Create the audio context. We have to do this as a result of a user action, like a mouse click.
        this.audioContext = new AudioContext({
            latencyHint: "interactive",
        });
        const audioContext = this.audioContext;
        // Safari doesn't have this.
        if (window.AudioWorkletNode !== undefined) {
            // Load our module.
            const moduleUrl = "data:text/javascript;base64," + btoa(PROCESSOR_JS);
            this.audioContext.audioWorklet.addModule(moduleUrl).then(() => {
                // I don't know why we need this, but I can't figure out a way to "start" our own node.
                const constantSourceNode = audioContext.createConstantSource();
                /**
                 * Simple node to access the processor.
                 */
                class Trs80SoundNode extends AudioWorkletNode {
                    constructor(context) {
                        super(context, PROCESSOR_NAME);
                    }
                }
                // Our own node, which ignores its input and generates the audio.
                const node = new Trs80SoundNode(audioContext);
                // Into this parameter we'll write the actual audio values.
                this.audioValue = node.parameters.get("audioValue");
                if (this.audioValue === undefined) {
                    throw new Error("Unknown param audioValue");
                }
                // Automatically suspend the audio if we've not played sound in a while.
                setInterval(() => this.checkAutoSuspend(), 1000);
                // Hook up the pipeline.
                constantSourceNode.connect(node).connect(audioContext.destination);
                constantSourceNode.start();
            });
        }
        // Get the background spin sound.
        fetch(SPIN_URL)
            .then(response => {
            if (response.status === 200) {
                return response.blob();
            }
            else {
                return Promise.reject("fetch failed: " + response.statusText);
            }
        })
            .then(blob => blob.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
            this.floppySpinAudioBuffer = audioBuffer;
            this.updateFloppySpin();
        })
            .catch(e => {
            // TODO.
            console.error(e);
        });
        // Get the track movement sound.
        fetch(TRACK_URL)
            .then(response => {
            if (response.status === 200) {
                return response.blob();
            }
            else {
                return Promise.reject("fetch failed: " + response.statusText);
            }
        })
            .then(blob => blob.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
            this.trackAudioBuffer = audioBuffer;
        })
            .catch(e => {
            // TODO.
            console.error(e);
        });
    }
}
exports.SoundPlayer = SoundPlayer;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Trs80.js":
/*!***************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Trs80.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trs80 = void 0;
const z80_base_1 = __webpack_require__(/*! z80-base */ "./node_modules/z80-base/dist/index.js");
const z80_emulator_1 = __webpack_require__(/*! z80-emulator */ "./node_modules/z80-emulator/dist/index.js");
const Keyboard_1 = __webpack_require__(/*! ./Keyboard */ "./node_modules/trs80-emulator/dist/Keyboard.js");
const Model1Level1Rom_1 = __webpack_require__(/*! ./Model1Level1Rom */ "./node_modules/trs80-emulator/dist/Model1Level1Rom.js");
const Model1Level2Rom_1 = __webpack_require__(/*! ./Model1Level2Rom */ "./node_modules/trs80-emulator/dist/Model1Level2Rom.js");
const Model3Rom_1 = __webpack_require__(/*! ./Model3Rom */ "./node_modules/trs80-emulator/dist/Model3Rom.js");
const Config_1 = __webpack_require__(/*! ./Config */ "./node_modules/trs80-emulator/dist/Config.js");
const trs80_base_1 = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
const FloppyDisk_1 = __webpack_require__(/*! trs80-base/dist/FloppyDisk */ "./node_modules/trs80-base/dist/FloppyDisk.js");
const FloppyDiskController_1 = __webpack_require__(/*! ./FloppyDiskController */ "./node_modules/trs80-emulator/dist/FloppyDiskController.js");
const EventScheduler_1 = __webpack_require__(/*! ./EventScheduler */ "./node_modules/trs80-emulator/dist/EventScheduler.js");
const SoundPlayer_1 = __webpack_require__(/*! ./SoundPlayer */ "./node_modules/trs80-emulator/dist/SoundPlayer.js");
// IRQs
const M1_TIMER_IRQ_MASK = 0x80;
const M3_CASSETTE_RISE_IRQ_MASK = 0x01;
const M3_CASSETTE_FALL_IRQ_MASK = 0x02;
const M3_TIMER_IRQ_MASK = 0x04;
const M3_IO_BUS_IRQ_MASK = 0x08;
const M3_UART_SED_IRQ_MASK = 0x10;
const M3_UART_RECEIVE_IRQ_MASK = 0x20;
const M3_UART_ERROR_IRQ_MASK = 0x40;
const CASSETTE_IRQ_MASKS = M3_CASSETTE_RISE_IRQ_MASK | M3_CASSETTE_FALL_IRQ_MASK;
// NMIs
const RESET_NMI_MASK = 0x20;
const DISK_MOTOR_OFF_NMI_MASK = 0x40;
const DISK_INTRQ_NMI_MASK = 0x80;
// Timer.
const M1_TIMER_HZ = 40;
const M3_TIMER_HZ = 30;
const M4_TIMER_HZ = 60;
const ROM_SIZE = 14 * 1024;
const RAM_START = 16 * 1024;
// CPU clock speeds.
const M1_CLOCK_HZ = 1774080;
const M3_CLOCK_HZ = 2027520;
const M4_CLOCK_HZ = 4055040;
const INITIAL_CLICKS_PER_TICK = 2000;
/**
 * Converts the two-bit cassette port to an audio value. These values are from "More TRS-80 Assembly
 * Language Programming", page 222, with the last value taken from "The B00K" volume 2 (page 5-2).
 */
const CASSETTE_BITS_TO_AUDIO_VALUE = [0, 1, -1, -1];
const CASSETTE_THRESHOLD = 5000 / 32768.0;
// State of the cassette hardware. We don't support writing.
var CassetteState;
(function (CassetteState) {
    CassetteState[CassetteState["CLOSE"] = 0] = "CLOSE";
    CassetteState[CassetteState["READ"] = 1] = "READ";
    CassetteState[CassetteState["FAIL"] = 2] = "FAIL";
})(CassetteState || (CassetteState = {}));
// Value of wave in audio: negative, neutral (around zero), or positive.
var CassetteValue;
(function (CassetteValue) {
    CassetteValue[CassetteValue["NEGATIVE"] = 0] = "NEGATIVE";
    CassetteValue[CassetteValue["NEUTRAL"] = 1] = "NEUTRAL";
    CassetteValue[CassetteValue["POSITIVE"] = 2] = "POSITIVE";
})(CassetteValue || (CassetteValue = {}));
/**
 * Whether the memory address maps to a screen location.
 */
function isScreenAddress(address) {
    return address >= trs80_base_1.TRS80_SCREEN_BEGIN && address < trs80_base_1.TRS80_SCREEN_END;
}
/**
 * See the FONT.md file for an explanation of this, but basically bit 6 is the NOR of bits 5 and 7.
 */
function computeVideoBit6(value) {
    const bit5 = (value >> 5) & 1;
    const bit7 = (value >> 7) & 1;
    const bit6 = (bit5 | bit7) ^ 1;
    return (value & 0xBF) | (bit6 << 6);
}
const WARN_ONCE_SET = new Set();
/**
 * Send this warning message to the console once. This is to avoid a program repeatedly doing something
 * that results in a warning (such as reading from an unmapped memory address) and crashing the browser.
 */
function warnOnce(message) {
    if (!WARN_ONCE_SET.has(message)) {
        WARN_ONCE_SET.add(message);
        console.warn(message + " (further warnings suppressed)");
    }
}
/**
 * HAL for the TRS-80 Model III.
 */
class Trs80 {
    constructor(screen, cassette) {
        this.timerHz = M3_TIMER_HZ;
        this.clockHz = M3_CLOCK_HZ;
        this.tStateCount = 0;
        this.fdc = new FloppyDiskController_1.FloppyDiskController(this);
        this.memory = new Uint8Array(0);
        this.keyboard = new Keyboard_1.Keyboard();
        this.modeImage = 0x80;
        // Which IRQs should be handled.
        this.irqMask = 0;
        // Which IRQs have been requested by the hardware.
        this.irqLatch = 0;
        // Which NMIs should be handled.
        this.nmiMask = 0;
        // Which NMIs have been requested by the hardware.
        this.nmiLatch = 0;
        // Whether we've seen this NMI and handled it.
        this.nmiSeen = false;
        this.previousTimerClock = 0;
        this.z80 = new z80_emulator_1.Z80(this);
        this.clocksPerTick = INITIAL_CLICKS_PER_TICK;
        this.startTime = Date.now();
        this.started = false;
        // Internal state of the cassette controller.
        // Whether the motor is running.
        this.cassetteMotorOn = false;
        // State machine.
        this.cassetteState = CassetteState.CLOSE;
        // Internal register state.
        this.cassetteValue = CassetteValue.NEUTRAL;
        this.cassetteLastNonZeroValue = CassetteValue.NEUTRAL;
        this.cassetteFlipFlop = false;
        // When we turned on the motor (started reading the file) and how many samples
        // we've read since then.
        this.cassetteMotorOnClock = 0;
        this.cassetteSamplesRead = 0;
        this.cassetteRiseInterruptCount = 0;
        this.cassetteFallInterruptCount = 0;
        this.soundPlayer = new SoundPlayer_1.SoundPlayer();
        this.eventScheduler = new EventScheduler_1.EventScheduler();
        this.screen = screen;
        this.cassette = cassette;
        this.config = Config_1.Config.makeDefault();
        this.updateFromConfig();
        this.loadRom();
        this.tStateCount = 0;
        this.keyboard.configureKeyboard();
        this.fdc.onActiveDrive.subscribe(activeDrive => this.soundPlayer.setFloppyMotorOn(activeDrive !== undefined));
        this.fdc.onTrackMove.subscribe(moveCount => this.soundPlayer.trackMoved(moveCount));
    }
    /**
     * Get the current emulator's configuration.
     */
    getConfig() {
        return this.config;
    }
    /**
     * Sets a new configuration and reboots into it if necessary.
     */
    setConfig(config) {
        const needsReboot = config.needsReboot(this.config);
        this.config = config;
        this.screen.setConfig(this.config);
        if (needsReboot) {
            this.updateFromConfig();
            this.reset();
        }
    }
    /**
     * Update our settings based on the config. Wipes memory.
     */
    updateFromConfig() {
        this.memory = new Uint8Array(RAM_START + this.config.getRamSize());
        this.memory.fill(0);
        this.loadRom();
        switch (this.config.modelType) {
            case Config_1.ModelType.MODEL1:
                this.timerHz = M1_TIMER_HZ;
                this.clockHz = M1_CLOCK_HZ;
                break;
            case Config_1.ModelType.MODEL3:
            default:
                this.timerHz = M3_TIMER_HZ;
                this.clockHz = M3_CLOCK_HZ;
                break;
        }
    }
    /**
     * Load the config-specific ROM into memory.
     */
    loadRom() {
        let rom;
        switch (this.config.modelType) {
            case Config_1.ModelType.MODEL1:
                switch (this.config.basicLevel) {
                    case Config_1.BasicLevel.LEVEL1:
                        rom = Model1Level1Rom_1.model1Level1Rom;
                        break;
                    case Config_1.BasicLevel.LEVEL2:
                    default:
                        rom = Model1Level2Rom_1.model1Level2Rom;
                        break;
                }
                break;
            case Config_1.ModelType.MODEL3:
            default:
                rom = Model3Rom_1.model3Rom;
                break;
        }
        const raw = window.atob(rom);
        for (let i = 0; i < raw.length; i++) {
            this.memory[i] = raw.charCodeAt(i);
        }
    }
    /**
     * Event dispatcher for floppy drive activity, indicating which drive (0-based) has its motor on, if any.
     */
    get onMotorOn() {
        return this.fdc.onActiveDrive;
    }
    /**
     * Reset the state of the Z80 and hardware.
     */
    reset() {
        this.setIrqMask(0);
        this.setNmiMask(0);
        this.resetCassette();
        this.keyboard.clearKeyboard();
        this.setTimerInterrupt(false);
        this.z80.reset();
    }
    /**
     * Jump the Z80 emulator to the specified address.
     */
    jumpTo(address) {
        this.z80.regs.pc = address;
    }
    /**
     * Set the stack pointer to the specified address.
     */
    setStackPointer(address) {
        this.z80.regs.sp = address;
    }
    /**
     * Start the executable at the given address. This sets up some
     * state and jumps to the address.
     */
    startExecutable(address) {
        // Disable the cursor.
        this.writeMemory(0x4022, 0);
        // Disable interrupts.
        this.z80.regs.iff1 = 0;
        this.z80.regs.iff2 = 0;
        this.jumpTo(address);
    }
    /**
     * Start the CPU and intercept browser keys.
     */
    start() {
        if (!this.started) {
            this.keyboard.interceptKeys = true;
            this.scheduleNextTick();
            this.started = true;
        }
    }
    /**
     * Stop the CPU and no longer intercept browser keys.
     *
     * @return whether it was started.
     */
    stop() {
        if (this.started) {
            this.keyboard.interceptKeys = false;
            this.cancelTickTimeout();
            this.started = false;
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Set the mask for IRQ (regular) interrupts.
     */
    setIrqMask(irqMask) {
        this.irqMask = irqMask;
    }
    /**
     * Set the mask for non-maskable interrupts. (Yes.)
     */
    setNmiMask(nmiMask) {
        // Reset is always allowed:
        this.nmiMask = nmiMask | RESET_NMI_MASK;
        this.updateNmiSeen();
    }
    interruptLatchRead() {
        if (this.config.modelType === Config_1.ModelType.MODEL1) {
            const irqLatch = this.irqLatch;
            this.setTimerInterrupt(false);
            // TODO irq = this.irqLatch !== 0;
            return irqLatch;
        }
        else {
            return ~this.irqLatch & 0xFF;
        }
    }
    /**
     * Take one Z80 step and update the state of the hardware.
     */
    step() {
        this.z80.step();
        // Handle non-maskable interrupts.
        if ((this.nmiLatch & this.nmiMask) !== 0 && !this.nmiSeen) {
            this.z80.nonMaskableInterrupt();
            this.nmiSeen = true;
            // Simulate the reset button being released.
            this.resetButtonInterrupt(false);
        }
        // Handle interrupts.
        if ((this.irqLatch & this.irqMask) !== 0) {
            this.z80.maskableInterrupt();
        }
        // Set off a timer interrupt.
        if (this.tStateCount > this.previousTimerClock + this.clockHz / this.timerHz) {
            this.handleTimer();
            this.previousTimerClock = this.tStateCount;
        }
        // Update cassette state.
        this.updateCassette();
        // Dispatch scheduled events.
        this.eventScheduler.dispatch(this.tStateCount);
    }
    contendMemory(address) {
        // Ignore.
    }
    contendPort(address) {
        // Ignore.
    }
    readMemory(address) {
        if (address < ROM_SIZE || address >= RAM_START || isScreenAddress(address)) {
            return address < this.memory.length ? this.memory[address] : 0xFF;
        }
        else if (address === 0x37E8) {
            // Printer. 0x30 = Printer selected, ready, with paper, not busy.
            return 0x30;
        }
        else if (Keyboard_1.Keyboard.isInRange(address)) {
            // Keyboard.
            return this.keyboard.readKeyboard(address, this.tStateCount);
        }
        else {
            // Unmapped memory.
            warnOnce("Reading from unmapped memory at 0x" + z80_base_1.toHex(address, 4));
            return 0;
        }
    }
    readPort(address) {
        const port = address & 0xFF;
        let value = 0xFF; // Default value for missing ports.
        switch (port) {
            case 0x00:
                // Joystick.
                value = 0xFF;
                break;
            case 0xE0:
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    // IRQ latch read.
                    value = this.interruptLatchRead();
                }
                break;
            case 0xE4:
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    // NMI latch read.
                    value = ~this.nmiLatch & 0xFF;
                }
                break;
            case 0xEC:
            case 0xED:
            case 0xEE:
            case 0xEF:
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    // Acknowledge timer.
                    this.setTimerInterrupt(false);
                    value = 0xFF;
                }
                break;
            case 0xF0:
                value = this.fdc.readStatus();
                break;
            case 0xF1:
                value = this.fdc.readTrack();
                break;
            case 0xF2:
                value = this.fdc.readSector();
                break;
            case 0xF3:
                value = this.fdc.readData();
                break;
            case 0xF8:
                // Printer status. Printer selected, ready, with paper, not busy.
                value = 0x30;
                break;
            case 0xFF:
                // Cassette and various flags.
                if (this.config.modelType === Config_1.ModelType.MODEL1) {
                    value = 0x3F;
                    if (!this.screen.isExpandedCharacters()) {
                        value |= 0x40;
                    }
                }
                else {
                    value = this.modeImage & 0x7E;
                }
                value |= this.getCassetteByte();
                break;
            default:
                // Not sure what a good default value is, but other emulators use 0xFF.
                warnOnce("Reading from unknown port 0x" + z80_base_1.toHex(z80_base_1.lo(address), 2));
                value = 0xFF;
                break;
        }
        // console.log("Reading 0x" + toHex(value, 2) + " from port 0x" + toHex(lo(address), 2));
        return value;
    }
    writePort(address, value) {
        const port = address & 0xFF;
        switch (port) {
            case 0xE0:
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    // Set interrupt mask.
                    this.setIrqMask(value);
                }
                break;
            case 0xE4:
            case 0xE5:
            case 0xE6:
            case 0xE7:
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    // Set NMI state.
                    this.setNmiMask(value);
                }
                break;
            case 0xEC:
            case 0xED:
            case 0xEE:
            case 0xEF:
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    // Various controls.
                    this.modeImage = value;
                    this.setCassetteMotor((value & 0x02) !== 0);
                    this.screen.setExpandedCharacters((value & 0x04) !== 0);
                    this.screen.setAlternateCharacters((value & 0x08) === 0);
                }
                break;
            case 0xF0:
                this.fdc.writeCommand(value);
                break;
            case 0xF1:
                this.fdc.writeTrack(value);
                break;
            case 0xF2:
                this.fdc.writeSector(value);
                break;
            case 0xF3:
                this.fdc.writeData(value);
                break;
            case 0xF4:
            case 0xF5:
            case 0xF6:
            case 0xF7:
                this.fdc.writeSelect(value);
                break;
            case 0xF8:
            case 0xF9:
            case 0xFA:
            case 0xFB:
                // Printer write.
                console.log("Writing \"" + String.fromCodePoint(value) + "\" to printer");
                break;
            case 0xFC:
            case 0xFD:
            case 0xFE:
            case 0xFF:
                if (this.config.modelType === Config_1.ModelType.MODEL1) {
                    this.setCassetteMotor((value & 0x04) !== 0);
                    this.screen.setExpandedCharacters((value & 0x08) !== 0);
                }
                if ((value & 0x20) !== 0) {
                    // Model III Micro Labs graphics card.
                    console.log("Sending 0x" + z80_base_1.toHex(value, 2) + " to Micro Labs graphics card");
                }
                else {
                    // Do cassette emulation.
                    this.putCassetteByte(value & 0x03);
                }
                break;
            default:
                warnOnce("Writing 0x" + z80_base_1.toHex(value, 2) + " to unknown port 0x" + z80_base_1.toHex(port, 2));
                return;
        }
        // console.log("Wrote 0x" + toHex(value, 2) + " to port 0x" + toHex(port, 2));
    }
    writeMemory(address, value) {
        if (address < ROM_SIZE) {
            warnOnce("Warning: Writing to ROM location 0x" + z80_base_1.toHex(address, 4));
        }
        else {
            if (address >= trs80_base_1.TRS80_SCREEN_BEGIN && address < trs80_base_1.TRS80_SCREEN_END) {
                if (this.config.cgChip === Config_1.CGChip.ORIGINAL) {
                    // No bit 6 in video memory, need to compute it.
                    value = computeVideoBit6(value);
                }
                this.screen.writeChar(address, value);
            }
            else if (address < RAM_START) {
                warnOnce("Writing to unmapped memory at 0x" + z80_base_1.toHex(address, 4));
            }
            this.memory[address] = value;
        }
    }
    /**
     * Write a block of data to memory.
     *
     * @return the address just past the block.
     */
    writeMemoryBlock(address, values, startIndex = 0, length) {
        length = length !== null && length !== void 0 ? length : values.length;
        for (let i = 0; i < length; i++) {
            this.writeMemory(address++, values[startIndex + i]);
        }
        return address;
    }
    /**
     * Reset cassette edge interrupts.
     */
    cassetteClearInterrupt() {
        this.irqLatch &= ~CASSETTE_IRQ_MASKS;
    }
    /**
     * Check whether the software has enabled these interrupts.
     */
    cassetteInterruptsEnabled() {
        return (this.irqMask & CASSETTE_IRQ_MASKS) !== 0;
    }
    /**
     * Get an opaque string that represents the state of the screen. Flashes the screen.
     */
    getScreenshot() {
        const buf = [];
        // First byte is screen mode, where 0 means normal (64 columns) and 1 means wide (32 columns).
        buf.push(this.screen.isExpandedCharacters() ? 1 : 0);
        // Run-length encode bytes with (value,count) pairs, with a max count of 255. Bytes
        // in the range 33 to 127 inclusive have an implicit count of 1.
        for (let address = trs80_base_1.TRS80_SCREEN_BEGIN; address < trs80_base_1.TRS80_SCREEN_END; address++) {
            const value = this.memory[address];
            if (value > 32 && value < 128) {
                // Bytes in this range don't store a count.
                buf.push(value);
            }
            else if (buf.length < 2 || buf[buf.length - 1] === 255 || buf[buf.length - 2] !== value) {
                // New entry.
                buf.push(value);
                buf.push(1);
            }
            else {
                // Increment existing count.
                buf[buf.length - 1] += 1;
            }
        }
        // Convert to a binary string.
        let s = buf.map(n => String.fromCharCode(n)).join("");
        // Start visual flash effect.
        Trs80.flashNode(this.screen.getNode());
        // Base-64 encode and prefix with version number.
        return "0:" + btoa(s);
    }
    /**
     * Flash the node as if a photo were taken.
     */
    static flashNode(node) {
        // Position a semi-transparent white div over the screen, and reduce its transparency over time.
        const oldNodePosition = node.style.position;
        node.style.position = "relative";
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.right = "0";
        overlay.style.bottom = "0";
        overlay.style.backgroundColor = "#ffffff";
        // Fade out.
        let opacity = 1;
        const updateOpacity = () => {
            overlay.style.opacity = opacity.toString();
            opacity -= 0.1;
            if (opacity >= 0) {
                window.requestAnimationFrame(updateOpacity);
            }
            else {
                node.removeChild(overlay);
                node.style.position = oldNodePosition;
            }
        };
        updateOpacity();
        node.appendChild(overlay);
    }
    // Reset whether we've seen this NMI interrupt if the mask and latch no longer overlap.
    updateNmiSeen() {
        if ((this.nmiLatch & this.nmiMask) === 0) {
            this.nmiSeen = false;
        }
    }
    /**
     * Run a certain number of CPU instructions and schedule another tick.
     */
    tick() {
        for (let i = 0; i < this.clocksPerTick && this.started; i++) {
            this.step();
        }
        // We might have stopped in the step() routine (e.g., with scheduled event).
        if (this.started) {
            this.scheduleNextTick();
        }
    }
    /**
     * Figure out how many CPU cycles we should optimally run and how long
     * to wait until scheduling it, then schedule it to be run later.
     */
    scheduleNextTick() {
        let delay;
        if (this.cassetteMotorOn || this.keyboard.keyQueue.length > 4) {
            // Go fast if we're accessing the cassette or pasting.
            this.clocksPerTick = 100000;
            delay = 0;
        }
        else {
            // Delay to match original clock speed.
            const now = Date.now();
            const actualElapsed = now - this.startTime;
            const expectedElapsed = this.tStateCount * 1000 / this.clockHz;
            let behind = expectedElapsed - actualElapsed;
            if (behind < -100 || behind > 100) {
                // We're too far behind or ahead. Catch up artificially.
                this.startTime = now - expectedElapsed;
                behind = 0;
            }
            delay = Math.round(Math.max(0, behind));
            if (delay === 0) {
                // Delay too short, do more each tick.
                this.clocksPerTick = Math.min(this.clocksPerTick + 100, 10000);
            }
            else if (delay > 1) {
                // Delay too long, do less each tick.
                this.clocksPerTick = Math.max(this.clocksPerTick - 100, 100);
            }
        }
        // console.log(this.clocksPerTick, delay);
        this.cancelTickTimeout();
        this.tickHandle = window.setTimeout(() => {
            this.tickHandle = undefined;
            this.tick();
        }, delay);
    }
    /**
     * Stop the tick timeout, if it's running.
     */
    cancelTickTimeout() {
        if (this.tickHandle !== undefined) {
            window.clearTimeout(this.tickHandle);
            this.tickHandle = undefined;
        }
    }
    // Set or reset the timer interrupt.
    setTimerInterrupt(state) {
        if (this.config.modelType === Config_1.ModelType.MODEL1) {
            if (state) {
                this.irqLatch |= M1_TIMER_IRQ_MASK;
            }
            else {
                this.irqLatch &= ~M1_TIMER_IRQ_MASK;
            }
        }
        else {
            if (state) {
                this.irqLatch |= M3_TIMER_IRQ_MASK;
            }
            else {
                this.irqLatch &= ~M3_TIMER_IRQ_MASK;
            }
        }
    }
    // What to do when the hardware timer goes off.
    handleTimer() {
        this.setTimerInterrupt(true);
    }
    // Set the state of the reset button interrupt.
    resetButtonInterrupt(state) {
        if (state) {
            this.nmiLatch |= RESET_NMI_MASK;
        }
        else {
            this.nmiLatch &= ~RESET_NMI_MASK;
        }
        this.updateNmiSeen();
    }
    // Set the state of the disk motor off interrupt.
    diskMotorOffInterrupt(state) {
        if (state) {
            this.nmiLatch |= DISK_MOTOR_OFF_NMI_MASK;
        }
        else {
            this.nmiLatch &= ~DISK_MOTOR_OFF_NMI_MASK;
        }
        this.updateNmiSeen();
    }
    // Set the state of the disk interrupt.
    diskIntrqInterrupt(state) {
        if (state) {
            this.nmiLatch |= DISK_INTRQ_NMI_MASK;
        }
        else {
            this.nmiLatch &= ~DISK_INTRQ_NMI_MASK;
        }
        this.updateNmiSeen();
    }
    // Set the state of the disk interrupt.
    diskDrqInterrupt(state) {
        // No effect.
    }
    // Reset the controller to a known state.
    resetCassette() {
        this.setCassetteState(CassetteState.CLOSE);
    }
    // Get a byte from the I/O port.
    getCassetteByte() {
        // If the motor's running, and we're reading a byte, then get into read mode.
        if (this.cassetteMotorOn) {
            this.setCassetteState(CassetteState.READ);
        }
        // Clear any interrupt that may have triggered this read.
        this.cassetteClearInterrupt();
        // Cassette owns bits 0 and 7.
        let b = 0;
        if (this.cassetteFlipFlop) {
            b |= 0x80;
        }
        if (this.config.modelType !== Config_1.ModelType.MODEL1 && this.cassetteLastNonZeroValue === CassetteValue.POSITIVE) {
            b |= 0x01;
        }
        return b;
    }
    // Write to the cassette port. We don't support writing tapes, but this is used
    // for 500-baud reading to trigger the next analysis of the tape.
    putCassetteByte(b) {
        if (this.cassetteMotorOn) {
            if (this.cassetteState === CassetteState.READ) {
                this.updateCassette();
                this.cassetteFlipFlop = false;
            }
        }
        else {
            this.soundPlayer.setAudioValue(CASSETTE_BITS_TO_AUDIO_VALUE[b], this.tStateCount, this.clockHz);
        }
    }
    // Kick off the reading process when doing 1500-baud reads.
    kickOffCassette() {
        if (this.cassetteMotorOn &&
            this.cassetteState === CassetteState.CLOSE &&
            this.cassetteInterruptsEnabled()) {
            // Kick off the process.
            this.cassetteRiseInterrupt();
            this.cassetteFallInterrupt();
        }
    }
    // Turn the motor on or off.
    setCassetteMotor(cassetteMotorOn) {
        if (cassetteMotorOn !== this.cassetteMotorOn) {
            if (cassetteMotorOn) {
                this.cassetteFlipFlop = false;
                this.cassetteLastNonZeroValue = CassetteValue.NEUTRAL;
                // Waits a second before kicking off the cassette.
                // TODO this should be in CPU cycles, not browser cycles.
                if (this.config.modelType !== Config_1.ModelType.MODEL1) {
                    setTimeout(() => this.kickOffCassette(), 1000);
                }
            }
            else {
                this.setCassetteState(CassetteState.CLOSE);
            }
            this.cassetteMotorOn = cassetteMotorOn;
            if (cassetteMotorOn) {
                this.cassette.onMotorStart();
            }
            else {
                this.cassette.onMotorStop();
            }
        }
    }
    // Read some of the cassette to see if we should be triggering a rise/fall interrupt.
    updateCassette() {
        if (this.cassetteMotorOn && this.setCassetteState(CassetteState.READ) >= 0) {
            // See how many samples we should have read by now.
            const samplesToRead = Math.round((this.tStateCount - this.cassetteMotorOnClock) *
                this.cassette.samplesPerSecond / this.clockHz);
            // Catch up.
            while (this.cassetteSamplesRead < samplesToRead) {
                const sample = this.cassette.readSample();
                this.cassetteSamplesRead++;
                // Convert to state, where neutral is some noisy in-between state.
                let cassetteValue = CassetteValue.NEUTRAL;
                if (sample > CASSETTE_THRESHOLD) {
                    cassetteValue = CassetteValue.POSITIVE;
                }
                else if (sample < -CASSETTE_THRESHOLD) {
                    cassetteValue = CassetteValue.NEGATIVE;
                }
                // See if we've changed value.
                if (cassetteValue !== this.cassetteValue) {
                    if (cassetteValue === CassetteValue.POSITIVE) {
                        // Positive edge.
                        this.cassetteFlipFlop = true;
                        this.cassetteRiseInterrupt();
                    }
                    else if (cassetteValue === CassetteValue.NEGATIVE) {
                        // Negative edge.
                        this.cassetteFlipFlop = true;
                        this.cassetteFallInterrupt();
                    }
                    this.cassetteValue = cassetteValue;
                    if (cassetteValue !== CassetteValue.NEUTRAL) {
                        this.cassetteLastNonZeroValue = cassetteValue;
                    }
                }
            }
        }
    }
    // Returns 0 if the state was changed, 1 if it wasn't, and -1 on error.
    setCassetteState(newState) {
        const oldCassetteState = this.cassetteState;
        // See if we're changing anything.
        if (oldCassetteState === newState) {
            return 1;
        }
        // Once in error, everything will fail until we close.
        if (oldCassetteState === CassetteState.FAIL && newState !== CassetteState.CLOSE) {
            return -1;
        }
        // Change things based on new state.
        switch (newState) {
            case CassetteState.READ:
                this.openCassetteFile();
                break;
        }
        // Update state.
        this.cassetteState = newState;
        return 0;
    }
    // Open file, get metadata, and get read to read the tape.
    openCassetteFile() {
        // TODO open/rewind cassette?
        // Reset the clock.
        this.cassetteMotorOnClock = this.tStateCount;
        this.cassetteSamplesRead = 0;
    }
    // Saw a positive edge on cassette.
    cassetteRiseInterrupt() {
        this.cassetteRiseInterruptCount++;
        this.irqLatch = (this.irqLatch & ~M3_CASSETTE_RISE_IRQ_MASK) |
            (this.irqMask & M3_CASSETTE_RISE_IRQ_MASK);
    }
    // Saw a negative edge on cassette.
    cassetteFallInterrupt() {
        this.cassetteFallInterruptCount++;
        this.irqLatch = (this.irqLatch & ~M3_CASSETTE_FALL_IRQ_MASK) |
            (this.irqMask & M3_CASSETTE_FALL_IRQ_MASK);
    }
    /**
     * Clear screen and home cursor.
     */
    cls() {
        for (let address = trs80_base_1.TRS80_SCREEN_BEGIN; address < trs80_base_1.TRS80_SCREEN_END; address++) {
            this.writeMemory(address, 32);
        }
        this.positionCursor(0, 0);
    }
    /**
     * Move the cursor (where the ROM's write routine will write to next) to the
     * given location.
     *
     * @param col 0-based text column.
     * @param row 0-based text row.
     */
    positionCursor(col, row) {
        const address = trs80_base_1.TRS80_SCREEN_BEGIN + row * 64 + col;
        // This works on Model III, not sure if it works on Model I or in wide mode.
        this.writeMemory(0x4020, z80_base_1.lo(address));
        this.writeMemory(0x4021, z80_base_1.hi(address));
    }
    /**
     * Run a TRS-80 program. The exact behavior depends on the type of program.
     */
    runTrs80File(trs80File) {
        this.ejectAllFloppyDisks();
        if (trs80File instanceof trs80_base_1.CmdProgram) {
            this.runCmdProgram(trs80File);
        }
        else if (trs80File instanceof trs80_base_1.Cassette) {
            if (trs80File.files.length === 1) {
                this.runTrs80File(trs80File.files[0].file);
            }
            else {
                // TODO.
                console.error("Can't currently run multiple cassette files");
            }
        }
        else if (trs80File instanceof trs80_base_1.SystemProgram) {
            this.runSystemProgram(trs80File);
        }
        else if (trs80File instanceof trs80_base_1.BasicProgram) {
            this.runBasicProgram(trs80File);
        }
        else if (trs80File instanceof FloppyDisk_1.FloppyDisk) {
            this.runFloppyDisk(trs80File);
        }
        else {
            // TODO.
            console.error("Don't know how to run", trs80File);
        }
    }
    /**
     * Load a CMD program into memory and run it.
     */
    runCmdProgram(cmdProgram) {
        this.reset();
        this.eventScheduler.add(undefined, this.tStateCount + this.clockHz * 0.1, () => {
            this.cls();
            for (const chunk of cmdProgram.chunks) {
                if (chunk instanceof trs80_base_1.CmdLoadBlockChunk) {
                    this.writeMemoryBlock(chunk.address, chunk.loadData);
                }
                else if (chunk instanceof trs80_base_1.CmdTransferAddressChunk) {
                    this.startExecutable(chunk.address);
                    // Don't load any more after this. I assume on a real machine the jump
                    // happens immediately and CMD parsing ends.
                    break;
                }
            }
        });
    }
    /**
     * Load a system program into memory and run it.
     */
    runSystemProgram(systemProgram) {
        this.reset();
        this.eventScheduler.add(undefined, this.tStateCount + this.clockHz * 0.1, () => {
            this.cls();
            for (const chunk of systemProgram.chunks) {
                this.writeMemoryBlock(chunk.loadAddress, chunk.data);
            }
            // Do what the SYSTEM command does.
            this.setStackPointer(0x4288);
            this.startExecutable(systemProgram.entryPointAddress);
        });
    }
    /**
     * Load a Basic program into memory and run it.
     */
    runBasicProgram(basicProgram) {
        this.reset();
        // Wait for Cass?
        this.eventScheduler.add(undefined, this.tStateCount + this.clockHz * 0.1, () => {
            this.keyboard.simulateKeyboardText("\n0\n");
            // Wait for Ready prompt.
            this.eventScheduler.add(undefined, this.tStateCount + this.clockHz * 0.2, () => {
                this.loadBasicProgram(basicProgram);
                this.keyboard.simulateKeyboardText("RUN\n");
            });
        });
    }
    /**
     * Get the address of the first line of the Basic program, or a string explaining the error.
     */
    getBasicAddress() {
        const addr = this.readMemory(0x40A4) + (this.readMemory(0x40A5) << 8);
        if (addr < 0x4200) {
            return `Basic load address (0x${z80_base_1.toHexWord(addr)}) is uninitialized (0x${z80_base_1.toHexWord(addr)})`;
        }
        return addr;
    }
    /**
     * Load a Basic program into memory, replacing the one that's there. Does not run it.
     */
    loadBasicProgram(basicProgram) {
        // Find address to load to.
        const addrOrError = this.getBasicAddress();
        if (typeof (addrOrError) === "string") {
            console.error(addrOrError);
            return;
        }
        let addr = addrOrError;
        // Terminate current line (if any) and set up the new one.
        let lineStart;
        const newLine = () => {
            if (lineStart !== undefined) {
                // End-of-line marker.
                this.writeMemory(addr++, 0);
                // Update previous line's next-line pointer.
                this.writeMemory(lineStart, z80_base_1.lo(addr));
                this.writeMemory(lineStart + 1, z80_base_1.hi(addr));
            }
            // Remember address of next-line pointer.
            lineStart = addr;
            // Next-line pointer.
            this.writeMemory(addr++, 0);
            this.writeMemory(addr++, 0);
        };
        // Write elements to memory.
        for (const e of basicProgram.elements) {
            if (e.offset !== undefined) {
                if (e.elementType === trs80_base_1.ElementType.LINE_NUMBER) {
                    newLine();
                }
                // Write element.
                addr = this.writeMemoryBlock(addr, basicProgram.binary, e.offset, e.length);
            }
        }
        newLine();
        // End of Basic program pointer.
        this.writeMemory(0x40F9, z80_base_1.lo(addr));
        this.writeMemory(0x40FA, z80_base_1.hi(addr));
        // Start of array variables pointer.
        this.writeMemory(0x40FB, z80_base_1.lo(addr));
        this.writeMemory(0x40FC, z80_base_1.hi(addr));
        // Start of free memory pointer.
        this.writeMemory(0x40FD, z80_base_1.lo(addr));
        this.writeMemory(0x40FE, z80_base_1.hi(addr));
    }
    /**
     * Remove floppy disks from all drives.
     */
    ejectAllFloppyDisks() {
        for (let i = 0; i < FloppyDiskController_1.FLOPPY_DRIVE_COUNT; i++) {
            this.loadFloppyDisk(undefined, i);
        }
    }
    /**
     * Load the floppy disk into the specified drive.
     * @param floppyDisk the floppy, or undefined to unmount.
     * @param driveNumber the drive number, 0-based.
     */
    loadFloppyDisk(floppyDisk, driveNumber) {
        this.fdc.loadFloppyDisk(floppyDisk, driveNumber);
    }
    /**
     * Load a floppy and reboot into it.
     */
    runFloppyDisk(floppyDisk) {
        // Mount floppy.
        this.loadFloppyDisk(floppyDisk, 0);
        // Reboot.
        this.reset();
    }
    /**
     * Pulls the Basic program currently in memory, or returns a string with an error.
     */
    getBasicProgramFromMemory() {
        const addrOrError = this.getBasicAddress();
        if (typeof (addrOrError) === "string") {
            return addrOrError;
        }
        let addr = addrOrError;
        // Walk through the program lines to find the end.
        const beginAddr = addr;
        while (true) {
            // Find end address.
            const nextLine = this.readMemory(addr) + (this.readMemory(addr + 1) << 8);
            if (nextLine === 0) {
                break;
            }
            if (nextLine < addr) {
                // Error, went backward.
                return `Next address 0x${z80_base_1.toHexWord(nextLine)} is less than current address 0x${z80_base_1.toHexWord(addr)}`;
            }
            addr = nextLine;
        }
        const endAddr = addr + 2;
        // Put together the binary of just the program.
        const binary = new Uint8Array(endAddr - beginAddr + 1);
        binary[0] = trs80_base_1.BASIC_HEADER_BYTE;
        binary.set(this.memory.subarray(beginAddr, endAddr), 1);
        // Decode the program.
        const basic = trs80_base_1.decodeBasicProgram(binary);
        if (basic === undefined) {
            return "Basic couldn't be decoded";
        }
        return basic;
    }
}
exports.Trs80 = Trs80;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Trs80Screen.js":
/*!*********************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Trs80Screen.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trs80Screen = void 0;
const trs80_base_1 = __webpack_require__(/*! trs80-base */ "./node_modules/trs80-base/dist/index.js");
/**
 * Abstract base class for displaying a screen.
 */
class Trs80Screen {
    constructor() {
        this.expanded = false;
        this.alternate = false;
    }
    /**
     * Set the config for this screen. Before this is called, the screen is permitted to use any config
     * it wants.
     */
    setConfig(config) {
        throw new Error("Must be implemented");
    }
    /**
     * Write a character to the screen.
     * @param address address of the character, where 15360 is the upper-left of the screen.
     * @param value the 0-255 value to write.
     */
    writeChar(address, value) {
        throw new Error("Must be implemented");
    }
    /**
     * Get the HTML node for this screen.
     */
    getNode() {
        throw new Error("Must be implemented");
    }
    /**
     * Enable or disable expanded (wide) character mode.
     */
    setExpandedCharacters(expanded) {
        this.expanded = expanded;
    }
    /**
     * Return whether we're in expanded (wide) character mode.
     */
    isExpandedCharacters() {
        return this.expanded;
    }
    /**
     * Enable or disable alternate (Katakana) character mode.
     */
    setAlternateCharacters(alternate) {
        this.alternate = alternate;
    }
    /**
     * Return whether we're in alternate (Katakana) character mode.
     */
    isAlternateCharacters() {
        return this.alternate;
    }
    /**
     * Fill the screen with the screenshot.
     */
    displayScreenshot(screenshot) {
        // Leave it blank if screenshot string is blank.
        if (screenshot === "") {
            return;
        }
        if (!screenshot.startsWith("0:")) {
            throw new Error("Invalid screenshot version number");
        }
        // Decode screenshot.
        const s = atob(screenshot.substring(2));
        if (s.length === 0) {
            throw new Error("Screenshot string is empty");
        }
        // Set expanded mode.
        this.setExpandedCharacters(s.charCodeAt(0) === 1);
        let address = trs80_base_1.TRS80_SCREEN_BEGIN;
        for (let i = 1; i < s.length; i++) {
            const value = s.charCodeAt(i);
            let count = 1;
            if (value > 32 && value < 128) {
                // Implicit count of 1.
            }
            else {
                i++;
                if (i === s.length) {
                    throw new Error("Missing count in RLE");
                }
                count = s.charCodeAt(i);
            }
            // Emit "count" values.
            while (count--) {
                this.writeChar(address++, value);
            }
        }
        if (address !== trs80_base_1.TRS80_SCREEN_END) {
            throw new Error("Screenshot was of the wrong length");
        }
    }
}
exports.Trs80Screen = Trs80Screen;


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/Utils.js":
/*!***************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/Utils.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CSS_PREFIX = void 0;
exports.CSS_PREFIX = "trs80-emulator";


/***/ }),

/***/ "./node_modules/trs80-emulator/dist/index.js":
/*!***************************************************!*\
  !*** ./node_modules/trs80-emulator/dist/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var CassettePlayer_1 = __webpack_require__(/*! ./CassettePlayer */ "./node_modules/trs80-emulator/dist/CassettePlayer.js");
Object.defineProperty(exports, "CassettePlayer", ({ enumerable: true, get: function () { return CassettePlayer_1.CassettePlayer; } }));
var Trs80_1 = __webpack_require__(/*! ./Trs80 */ "./node_modules/trs80-emulator/dist/Trs80.js");
Object.defineProperty(exports, "Trs80", ({ enumerable: true, get: function () { return Trs80_1.Trs80; } }));
var CanvasScreen_1 = __webpack_require__(/*! ./CanvasScreen */ "./node_modules/trs80-emulator/dist/CanvasScreen.js");
Object.defineProperty(exports, "CanvasScreen", ({ enumerable: true, get: function () { return CanvasScreen_1.CanvasScreen; } }));
var ControlPanel_1 = __webpack_require__(/*! ./ControlPanel */ "./node_modules/trs80-emulator/dist/ControlPanel.js");
Object.defineProperty(exports, "ControlPanel", ({ enumerable: true, get: function () { return ControlPanel_1.ControlPanel; } }));
var SettingsPanel_1 = __webpack_require__(/*! ./SettingsPanel */ "./node_modules/trs80-emulator/dist/SettingsPanel.js");
Object.defineProperty(exports, "SettingsPanel", ({ enumerable: true, get: function () { return SettingsPanel_1.SettingsPanel; } }));
Object.defineProperty(exports, "PanelType", ({ enumerable: true, get: function () { return SettingsPanel_1.PanelType; } }));
var ProgressBar_1 = __webpack_require__(/*! ./ProgressBar */ "./node_modules/trs80-emulator/dist/ProgressBar.js");
Object.defineProperty(exports, "ProgressBar", ({ enumerable: true, get: function () { return ProgressBar_1.ProgressBar; } }));
var DriveIndicators_1 = __webpack_require__(/*! ./DriveIndicators */ "./node_modules/trs80-emulator/dist/DriveIndicators.js");
Object.defineProperty(exports, "DriveIndicators", ({ enumerable: true, get: function () { return DriveIndicators_1.DriveIndicators; } }));


/***/ })

}]);