import { Input, Component, EventEmitter, Output } from "@angular/core";
import { PaletteEntry } from "../../model/palette/palette.model";

@Component({
    selector: 'palette-entry',
    templateUrl: './palette-entry.component.html',
    styleUrls: ['./palette-entry.component.scss']
})
export class PaletteEntryComponent {
    @Input("entry") entry: PaletteEntry;

    @Output("onToggleCallback") onToggleCallback = new EventEmitter<void>();

    toggle() {
        this.entry.enabled = !this.entry.enabled;
        this.onToggleCallback.emit();
    }
}