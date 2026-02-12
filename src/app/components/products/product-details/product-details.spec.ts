import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetailsComponent } from './product-details';
import { ProductService } from '../../../services/product.service';

describe('ProductDetails', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 1 })
          }
        },
        {
          provide: ProductService,
          useValue: {
            getProduct: () => of({ id: 1, name: 'Test Product', description: '', price: 0, images: [] })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
