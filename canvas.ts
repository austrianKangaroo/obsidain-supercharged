import MyPlugin from 'main';
import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';

export const CanvasContextViewType = 'canvas-context-view';

export class CanvasView extends ItemView {
    plugin : MyPlugin;

    private painting : boolean = false;

    private canvas : HTMLCanvasElement;

    private strokeColor = '#000000';
    private strokeWidth = 10;

    constructor(plugin: MyPlugin, leaf: WorkspaceLeaf) {
		super(leaf);
		this.plugin = plugin;
	}

    getDisplayText(): string {
		return 'Obsidian Supercharged Drawing Canvas';
	}

    getViewType(): string {
		return CanvasContextViewType;
	}

    onunload(): void {
		this.plugin.canvasLeaf = null;
	}

    onload(): void {
		if (!this.plugin.activeEditor) {
			/*
			this branch gets executed if the app gets closed and reopened
			in this case, we want to close the leaf as we have no access to an editor.
			this means that our button callbacks can't know where to insert text
			*/
			this.leaf.detach();
			return;
		}

		const container = this.contentEl;

		const rootEl = container.createDiv({ cls: 'supercharged-canvas-div' });

        const buttonDiv = rootEl.createDiv();

        /*
        const INSERT_BUTTON = rootEl.createEl('button');
        INSERT_BUTTON.textContent = 'insert image';
        INSERT_BUTTON.onClickEvent(() => { this.insertImage(this.canvas.toDataURL()); });
        */

        const COPY_BUTTON = buttonDiv.createEl('button');
        COPY_BUTTON.textContent = 'copy to clipboard';
        COPY_BUTTON.onClickEvent(() => { this.copyToClipboard(this.canvas.toDataURL()); });
          

        const CLEAR_BUTTON = buttonDiv.createEl('button');
        CLEAR_BUTTON.textContent = 'clear canvas';
        CLEAR_BUTTON.onClickEvent(() => {
            var ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });


        const colorPicker = rootEl.createDiv();
        const colorPickerLabel = colorPicker.createEl('label');
        const colorInput = colorPicker.createEl('input', { type : 'color' });
        const COLOR_PICKER_ID = 'color-picker';
        colorInput.id = COLOR_PICKER_ID;
        colorInput.addEventListener('change', event => { this.strokeColor = colorInput.value; });
        
        colorPickerLabel.setAttribute('for', COLOR_PICKER_ID);
        colorPickerLabel.textContent = 'Color';

        const strokeWidthSlider = rootEl.createDiv();
        const sliderInputLabel = strokeWidthSlider.createEl('label');
        const sliderInput = strokeWidthSlider.createEl('input', { type : 'range' });
        sliderInput.setAttribute('min', '5');
        sliderInput.setAttribute('max', '25');
        const SLIDER_INPUT_ID = 'slider-input';
        sliderInput.id = SLIDER_INPUT_ID;
        sliderInput.oninput = () => { this.strokeWidth = parseInt(sliderInput.value); }
        sliderInputLabel.setAttribute('for', SLIDER_INPUT_ID);
        sliderInputLabel.textContent = 'Pencil width';


        this.canvas = rootEl.createEl('canvas', { cls: 'supercharged-canvas' });

        const ctx = this.canvas.getContext("2d");

        //resizing
        /*
        this.canvas.height = container.scrollHeight;
        this.canvas.width = container.scrollWidth;
        */
       this.canvas.height = 500; // TODO: define proper size
       this.canvas.width = 500;

        this.canvas.on('mousedown', '.supercharged-canvas', (event, _target) => {
            this.painting = true;
            this.draw(event, ctx);
        });

        this.canvas.on('mouseup', '.supercharged-canvas', (event, _target) => {
            this.painting = false;
            ctx.beginPath();
        });

        this.canvas.on('mousemove', '.supercharged-canvas', (event, _target) => { this.draw(event, ctx); });
	}

    /*
    onResize() : void {
        console.log('LOG: resize');
        console.log(this.containerEl.scrollWidth);
    }
    */

    private draw(event : MouseEvent, ctx : CanvasRenderingContext2D) : void {
        if(!this.painting){
            return;
        }

        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = "round";
        
        ctx.strokeStyle = /*this.erase ? TRANSPARENT : */this.strokeColor;


        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
    }

    /*
    private insertImage(urlData : string) : void {
        if(this.canvas && this.plugin?.activeEditor) {
            this.plugin.insertText(this.plugin.activeEditor, this.convertToImage(urlData));
        }
    }
    */

    private convertToImage(urlData : string) {
        return '\n<div><img src = \"' + urlData + '\"></div>\n';
    }

    /*
    private download() : void { // TODO: do we need this?
        console.log(this.canvas.toDataURL());
        const link = this.containerEl.createEl('a');
        link.download = 'download.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
    */

    private async copyToClipboard(urlData : string) : Promise<void> {
        navigator.clipboard.writeText(this.convertToImage(urlData));
        new Notice('Copied to clipboard');
    }
}