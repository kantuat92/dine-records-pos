import { createReducer, on } from '@ngrx/store';
import { setRestaurantId } from './restaurant.actions';

export interface RestaurantState {
  restaurantId: string | null;
}

export const initialState: RestaurantState = {
  restaurantId: null
};

// export const restaurantReducer = createReducer(
//   initialState,
//   on(setRestaurantId, (state, { restaurantId }) => ({
    
//     ...state,
//     restaurantId
//     //restaurantId: restaurantId
//   }))
// );

export const restaurantReducer = createReducer(
  initialState,
  on(setRestaurantId, (state, { restaurantId }) => {
    console.log('Setting restaurant ID:', restaurantId);  // Debug log
    return {
      ...state,
      restaurantId
    };
  })
);

