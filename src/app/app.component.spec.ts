import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { states } from '@lor/core/state';
import { NgxsModule } from '@ngxs/store';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule,
        NgxsModule.forRoot(states),
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AngularFireAuth, useValue: { authState: of(false) } },
        { provide: AngularFirestore, useValue: {} },
      ]
    }).compileComponents();
  }));
  test('it creates the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
