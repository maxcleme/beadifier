import { Injectable } from '@angular/core';

import { environment } from './../../environments/environment';

/**
 * Interface between component and Analytics technologies
 */
@Injectable()
export class AnalyticsService {
    /**
     * Track something
     */
    track(...args: any[]): void {
        environment.mixpanel.track(...args);
    }
}