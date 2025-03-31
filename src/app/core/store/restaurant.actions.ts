import { createAction, props } from '@ngrx/store';

export const setRestaurantId = createAction(
  '[Restaurant] Set Restaurant ID',
  props<{ restaurantId: string }>()
);
