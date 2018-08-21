import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserState } from '@lor/core/state';
import { NgxsModule } from '@ngxs/store';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { of } from 'rxjs';

import { RentalVehiclesService } from '../services/rental-vehicles.service';
import { RentalVehiclesState } from '../state/rental-vehicles/rental-vehicles.state';
import { RentalVehiclesComponent } from './rental-vehicles.component';

describe('RentalVehiclesComponent', () => {
  let component: RentalVehiclesComponent;
  let fixture: ComponentFixture<RentalVehiclesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NgxsModule.forRoot([UserState, RentalVehiclesState])],
      declarations: [RentalVehiclesComponent],
      providers: [
        { provide: RentalVehiclesService, useValue: {} },
        { provide: AngularFireAuth, useValue: { authState: of(false) } },
        { provide: AngularFirestore, useValue: {} }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
