import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';

@Component({
    selector: 'app-upload-image-button',
    templateUrl: './upload-image-button.component.html',
    styleUrls: ['./upload-image-button.component.scss'],
})
export class UploadImageButtonComponent {
    @Output() onLoad = new EventEmitter<String>();

    @ViewChild('input', { static: true }) input: ElementRef;

    triggerInput() {
        this.input.nativeElement.click();
    }

    readImage(event: Event) {
        if (
            this.input.nativeElement.files &&
            this.input.nativeElement.files[0]
        ) {
            const reader = new FileReader();
            reader.addEventListener('load', (e) => {
                if (this.onLoad) {
                    this.onLoad.emit((e.target as any).result);
                }
            });
            reader.readAsDataURL(this.input.nativeElement.files[0]);
        }
    }
}
