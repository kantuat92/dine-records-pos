import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoaderComponent } from './common-component/loader/loader.component';
import { sharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//NgRx
import { StoreModule }                     from '@ngrx/store';
import { StoreDevtoolsModule }             from '@ngrx/store-devtools';
import { StoreRouterConnectingModule }     from '@ngrx/router-store';

import { AngularFireModule }              from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { restaurantReducer } from './core/store/restaurant.reducer';
import { metaReducers } from './core/store/restaurant.meta-reducer';

@NgModule({
  declarations: [AppComponent, LoaderComponent],
  imports: [BrowserModule, AppRoutingModule, sharedModule, BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), StoreModule.forRoot({}, {}),
    StoreModule.forRoot({ restaurant: restaurantReducer }, { metaReducers }), 
    StoreDevtoolsModule.instrument({
      maxAge: 25 // Number of states to retain
    }),
    StoreRouterConnectingModule.forRoot()
  ],
  exports: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
