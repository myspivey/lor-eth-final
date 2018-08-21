import { OnDestroy } from '@angular/core';
import { LoggerService } from '@lor/core/services';

import { Subject } from 'rxjs';

/**
 * Common base component
 * Provides destroy$ observable for subclasses to use .takeUntil(this.destroy$)
 * Avoids having to keep up with so many subscriptions
 */
export abstract class BaseComponent implements OnDestroy {
  public destroy$: Subject<any> = new Subject();

  constructor(
    protected _logger: LoggerService,
  ) {
    _logger.setNamespace(this.constructor.name);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
