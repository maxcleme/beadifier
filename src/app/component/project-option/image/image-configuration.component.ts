import * as _ from 'lodash';

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ImageConfiguration } from '../../../model/configuration/image-configuration.model';

const DEFAULT_CONTRAST = 100;
const DEFAULT_SATURATION = 100;
const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_GRAYSCALE = 0;

@Component({
    selector: 'image-configuration',
    templateUrl: './image-configuration.component.html',
    styleUrls: ['./image-configuration.component.scss']
})
export class ImageConfigurationComponent {
    @Input() configuration: ImageConfiguration;
    @Output() onChange = new EventEmitter<ImageConfiguration>();

    imgSettings: any;
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
        _.values(this.imgSettings).forEach(f => this.configuration.add(f));
        this.onChange.emit(this.configuration)
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