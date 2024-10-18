import * as ld from 'lodash';

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ImageConfiguration } from '../../../model/configuration/image-configuration.model';

const DEFAULT_CONTRAST = 100;
const DEFAULT_SATURATION = 100;
const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_GRAYSCALE = 0;

@Component({
    selector: 'app-image-configuration',
    templateUrl: './image-configuration.component.html',
    styleUrls: ['./image-configuration.component.scss'],
})
export class ImageConfigurationComponent {
    @Input({required: true}) configuration!: ImageConfiguration;
    @Output() configurationChange = new EventEmitter<ImageConfiguration>();

    imgSettings: Partial<{grayscale:string,brightness:string,saturation:string,contrast:string}>;
    contrast: number;
    saturation: number;
    brightness: number;
    grayscale: number;

    constructor() {
        this.imgSettings = {};
        this.contrast = DEFAULT_CONTRAST;
        this.saturation = DEFAULT_SATURATION;
        this.brightness = DEFAULT_BRIGHTNESS;
        this.grayscale = DEFAULT_GRAYSCALE;
    }

    callback() {
        this.configuration.clear();
        ld.values(this.imgSettings).forEach((f) => this.configuration.add(f));
        this.configurationChange.emit(this.configuration);
    }

    setGrayscale() {
        this.imgSettings.grayscale = `grayscale(${this.grayscale}%)`;
        this.callback();
    }

    resetGrayscale() {
        this.grayscale = DEFAULT_GRAYSCALE;
        this.setGrayscale();
    }

    setBrightness() {
        this.imgSettings.brightness = `brightness(${this.brightness}%)`;
        this.callback();
    }

    resetBrightness() {
        this.brightness = DEFAULT_BRIGHTNESS;
        this.setBrightness();
    }

    setContrast() {
        this.imgSettings.contrast = `contrast(${this.contrast}%)`;
        this.callback();
    }

    resetContrast() {
        this.contrast = DEFAULT_CONTRAST;
        this.setContrast();
    }

    setSaturation() {
        this.imgSettings.saturation = `saturate(${this.saturation}%)`;
        this.callback();
    }

    resetSaturation() {
        this.saturation = DEFAULT_SATURATION;
        this.setSaturation();
    }
}
