import { inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { of } from 'rxjs';

import { UnAuthGuard } from './unauth.guard';


describe('UnAuthGuard', () => {
  const mockRouter = jest.fn();
  const mockStoreSelectOnce = jest.fn().mockReturnValueOnce(of(false)).mockReturnValueOnce(of(true));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireAuthModule,
      ],
      providers: [
        UnAuthGuard,
        { provide: Router, useValue: { navigate: mockRouter } },
        { provide: Store, useValue: { selectOnce: mockStoreSelectOnce } }
      ]
    });
  });

  test('it can activate if not logged in', inject([UnAuthGuard], (guard: UnAuthGuard) => {
    guard.canActivate().subscribe((canActivate) => expect(canActivate).toBe(true));
  }));

  test('it cant activate if not logged out', inject([UnAuthGuard], (guard: UnAuthGuard) => {
    guard.canActivate().subscribe((canActivate) => expect(canActivate).toBe(false));
  }));

  test('it routes to login if not logged in', () => {
    expect(mockRouter).toHaveBeenCalledWith(['/']);
  });
});
