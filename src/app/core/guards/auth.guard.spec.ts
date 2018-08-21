import { inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { of } from 'rxjs';

import { NotifyService } from '../services/notify.service';
import { AuthGuard } from './auth.guard';


describe('AuthGuard', () => {
  const mockRouter = jest.fn();
  const mockNotifyUpdate = jest.fn();
  const mockStoreSelectOnce = jest.fn().mockReturnValueOnce(of(true)).mockReturnValueOnce(of(false));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireAuthModule,
      ],
      providers: [
        AuthGuard,
        { provide: Router, useValue: { navigate: mockRouter } },
        { provide: NotifyService, useValue: { update: mockNotifyUpdate } },
        { provide: Store, useValue: { selectOnce: mockStoreSelectOnce } }
      ]
    });
  });

  test('it can activate if logged in', inject([AuthGuard], (guard: AuthGuard) => {
    guard.canActivate().subscribe((canActivate) => expect(canActivate).toBe(true));
  }));

  test('it cant activate if logged out', inject([AuthGuard], (guard: AuthGuard) => {
    guard.canActivate().subscribe((canActivate) => expect(canActivate).toBe(false));
  }));

  test('it notifies if not logged in', () => {
    expect(mockNotifyUpdate).toHaveBeenCalled();
  });

  test('it routes to login if not logged in', () => {
    expect(mockRouter).toHaveBeenCalledWith(['/login']);
  });
});
