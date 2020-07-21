import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CoronavirusService } from "./coronavirus.service";
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  subscription: Subscription;
  islogin: boolean;
  constructor(private router: Router, private coronavirusService: CoronavirusService, private location: Location) {

    
    this.subscription = this.coronavirusService.getCart().subscribe(data => {
      if (data) {
        this.islogin = data;
      } else {
        this.islogin = data;
      }
    });

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logout() {
    this.coronavirusService.addToCart(false);
    localStorage.clear();
    this.router.navigateByUrl('/login');

  }
}
