import * as _ from 'lodash';

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatchingConfiguration } from '../../../model/configuration/matching-configuration.model';
import { Matching, MATCHINGS } from '../../../model/matching/matching.model';

@Component({
    selector: 'app-matching-configuration',
    templateUrl: './matching-configuration.component.html',
    styleUrls: ['./matching-configuration.component.scss'],
})
export class MatchingConfigurationComponent {
    @Input() configuration: MatchingConfiguration;
    @Output() onChange = new EventEmitter<MatchingConfiguration>();

    availableMatchings: Matching[];

    constructor() {
        this.availableMatchings = _.values(MATCHINGS);
    }

    callback() {
        this.onChange.emit(this.configuration);
    }
}
