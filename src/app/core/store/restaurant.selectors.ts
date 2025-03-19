import { createSelector, createFeatureSelector } from '@ngrx/store';
import { RestaurantState } from './restaurant.reducer';

export const selectRestaurantState = createFeatureSelector<RestaurantState>('restaurant');

export const selectRestaurantId = createSelector(
    selectRestaurantState, (state) => state.restaurantId
);
