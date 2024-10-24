import {
    Component,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { LoadImage } from '../../model/image/load-image.model';

@Component({
    selector: 'app-upload-image-button',
    templateUrl: './upload-image-button.component.html',
    styleUrls: ['./upload-image-button.component.scss'],
})
export class UploadImageButtonComponent {
    @Output() loadImage = new EventEmitter<LoadImage>();

    @ViewChild('input', { static: true }) input: ElementRef | undefined;

    triggerInput() {
        this.input?.nativeElement.click();
    }

    readImage(_event: Event) {
        if (
            this.input?.nativeElement.files &&
            this.input?.nativeElement.files[0]
        ) {
            const reader = new FileReader();
            reader.addEventListener('load', (e) => {
                if (this.loadImage) {
                    const loadedSrc = e.target?.result;
                    this.loadImage.emit({
                        name: this.input?.nativeElement.files[0].name.replace(
                            /\.[^/.]+$/,
                            '',
                        ),
                        src: typeof loadedSrc === 'string' ? loadedSrc : null,
                    });
                }
            });
            reader.readAsDataURL(this.input.nativeElement.files[0]);
        }
    }
}
