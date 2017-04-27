import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MashTweetsComponent } from './mash-tweets/mash-tweets.component';

const routes: Routes = [
    { path: '', redirectTo: '/mashtweets', pathMatch: 'full' },
    { path: 'mashtweets',  component: MashTweetsComponent },
];

@NgModule({
    imports: [ RouterModule.forRoot ( routes ) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {}
