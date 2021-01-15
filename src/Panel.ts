import {Context} from "./Context";
import {makeCloseIconButton, makeIcon, makeIconButton} from "./Utils";

/**
 * Base class for panels.
 */
export abstract class Panel {
    public readonly context: Context;
    public readonly element: HTMLElement;
    public readonly headerTextNode: HTMLElement;
    public readonly content: HTMLElement;
    private readonly keyboardListener: (e: KeyboardEvent) => void;

    /**
     * Construct the panel and its basic UI.
     *
     * @param context the app's context object.
     * @param title title for the header.
     * @param panelCssClass class for the whole panel.
     * @param showBackButton whether to show a back button.
     */
    protected constructor(context: Context, title: string, panelCssClass: string, showBackButton: boolean) {
        this.context = context;

        this.element = document.createElement("div");
        this.element.classList.add("panel", panelCssClass);

        // Handler for hotkeys.
        this.keyboardListener = (e: KeyboardEvent) => {
            if (e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.key === "Backspace") {
                this.context.panelManager.popPanel();
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const header = document.createElement("h1");
        if (showBackButton) {
            const backButton = makeIconButton(makeIcon("arrow_back"), "Back (Ctrl-Backspace)",
                () => this.context.panelManager.popPanel());
            backButton.classList.add("back-button");
            header.append(backButton);
            window.addEventListener("keydown", this.keyboardListener);
        }
        this.headerTextNode = document.createElement("span");
        this.headerTextNode.innerText = title;
        header.append(this.headerTextNode);
        header.append(makeCloseIconButton(() => this.context.panelManager.close()));
        this.element.append(header);

        this.content = document.createElement("div");
        this.content.classList.add("panel-content");
        this.element.append(this.content);
    }

    /**
     * Called when the panel is no longer visible and is being destroyed.
     */
    public onPanelDestroy(): void {
        // Okay if wasn't registered.
        window.removeEventListener("keydown", this.keyboardListener);
    }
}
