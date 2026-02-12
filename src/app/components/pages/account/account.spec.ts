import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AccountComponent } from './account';
import { OrderService } from '../../../services/order.service';

describe('Account', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: () => {}
          }
        },
        {
          provide: OrderService,
          useValue: {
            getUserOrders: () => of([])
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
