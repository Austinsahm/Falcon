import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
// import { UserService } from "../services/user.service";
// import { UserService } from 'src/app/services/user.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Domain } from 'src/app/models/domain.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyTypeCode } from 'src/app/models/company.model';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginPageComponent implements OnInit {
  hide = true;
  passwordVisible = false;

  loginForm: FormGroup;

  isLoading: boolean;
  domain: Domain;

  constructor(
    private formBuilder: FormBuilder,
    // private toastrService: ToastrService,
    // private UserService: UserService,
    private userInfoService: UserInfoService,
    private readonly route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toastr: ToastrService
  ) {
    this.domain = this.route.parent?.snapshot.data['companyInitData'];

    this.loginForm = this.formBuilder.group({
      // userCompanyId: [this.domain.companyId, [Validators.required]],
      userId: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.isLoading = false;
  }

  ngOnInit(): void {
    // if (this.userInfoService.isAuthenticated()) {
    //   if (
    //     [CompanyTypeCode.CORPORATE, CompanyTypeCode.INDIVIDUAL].includes(
    //       this.domain.companyType
    //     )
    //   ) {
    //     // this.router.navigateByUrl("corporate");
    //     console.log('corporate');
    //   } else {
    //     // this.router.navigateByUrl("partner");
    //     console.log('partner');
    //   }
    //   return;
    // }
    this.toastr.clear();
  }

  onSubmit() {
    this.isLoading = true;
    const { userId, password } = this.loginForm.value;
    const data = { userId, password };

    this.auth.login(data).subscribe((user) => {
      if (!user) {
        console.log('error');
        this.isLoading = false;
        this.toastr.error('User not found', 'Invalid userid or password');
        this.loginForm.reset();
      } else {
        this.router.navigate(['/monitor']);
        this.isLoading = false;
        this.loginForm.reset();
        // console.log('yes');
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // login() {
  //   this.isLoading = true;
  //   this.userService
  //   .login(this.loginForm.value)
  //   .pipe(finalize(() => (this.isLoading = false)))
  //   .subscribe(
  //     (state) => {
  //       if (!state.passed) {
  //         this.toastrService.error(state.error?.message, "");
  //         return;
  //       }

  //       this.userInfoService.setUserInfo(state.session);
  //     },
  //     (error) => {
  //       this.toastrService.error(error.message, "Error");
  //     }
  //   );
  // }
}
