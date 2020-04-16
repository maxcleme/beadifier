import { Component, Input, EventEmitter, Output } from '@angular/core';
import { RendererConfiguration } from '../../../model/configuration/renderer-configuration.model';

@Component({
    selector: 'renderer-configuration',
    templateUrl: './renderer-configuration.component.html',
    styleUrls: ['./renderer-configuration.component.scss']
})
export class RendererConfigurationComponent {
    @Input() configuration: RendererConfiguration;
    @Output() onChange = new EventEmitter<RendererConfiguration>();

    constructor() {
    }

    callback() {
        this.onChange.emit(this.configuration)
    }

}