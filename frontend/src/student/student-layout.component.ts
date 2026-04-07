import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-layout',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLayoutComponent {
  isSidebarExpanded = true;
  menuItems = this.userService.getStudentMenuForUser(null);
  pageTitle$: Observable<string>;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.menuItems = this.userService.getStudentMenuForUser(user);
    });

    this.pageTitle$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute.firstChild;
        let child = route;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
            route = child;
          } else {
            child = null;
          }
        }
        return route?.snapshot.data['title'] || 'Overview';
      }),
      startWith('Overview')
    );
  }
}
