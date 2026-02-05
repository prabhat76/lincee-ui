import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('0.8s ease-out', style({ opacity: 1 })),
  ]),
]);

export const slideInUpAnimation = trigger('slideInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(50px)' }),
    animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('100ms',
        animate('0.6s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      )
    ], { optional: true })
  ])
]);
