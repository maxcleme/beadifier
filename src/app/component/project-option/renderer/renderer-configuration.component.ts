import { Component, Input, EventEmitter, Output } from '@angular/core';
import { RendererConfiguration } from '../../../model/configuration/renderer-configuration.model';

@Component({
    selector: 'app-renderer-configuration',
    templateUrl: './renderer-configuration.component.html',
    styleUrls: ['./renderer-configuration.component.scss'],
})
export class RendererConfigurationComponent {
    @Input({ required: true }) configuration!: RendererConfiguration;
    @Output() configurationChange = new EventEmitter<RendererConfiguration>();

    callback() {
        this.configurationChange.emit(this.configuration);
    }
}
