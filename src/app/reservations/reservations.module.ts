import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '@lor/shared';
import { NgxsModule } from '@ngxs/store';

import { CreateReservationModalComponent } from './components/create-reservation-modal/create-reservation-modal.component';
import { ReservationsComponent } from './components/reservations.component';
import { StatePipe } from './pipes/state.pipe';
import { ReservationsRoutingModule } from './reservations-routing.module';
import { ReservationsService } from './services/reservations.service';
import { ReservationsState } from './state/reservations/reservations.state';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReservationsRoutingModule,
    NgxsModule.forFeature([ReservationsState]),
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  declarations: [ReservationsComponent, CreateReservationModalComponent, StatePipe],
  providers: [ReservationsService],
})
export class ReservationsModule { }
