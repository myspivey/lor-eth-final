import { inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { of } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: { authState: of(false) } },
        { provide: AngularFirestore, useValue: {} },
        { provide: Router, useValue: {} },
      ]
    });
  });

  test('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
