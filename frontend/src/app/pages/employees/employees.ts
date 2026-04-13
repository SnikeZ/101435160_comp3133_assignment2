import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { AuthService } from '../../services/auth.service';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-employees',
  imports: [
    TableModule, Button, Tag, IconField, InputIcon, InputText,
    CurrencyPipe, DatePipe, ReactiveFormsModule,
    Dialog, Select, InputNumber, DatePicker,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class EmployeesComponent implements OnInit {
  private auth = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Table state
  employees = signal<Employee[]>([]);
  loading = signal(true);
  error = signal('');

  // Dialog state
  dialogVisible = signal(false);
  submitting = signal(false);
  imagePreview = signal<string | null>(null);
  formError = signal('');
  dialogStyle = { width: '640px' };

  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: ['' as string, Validators.required],
    designation: ['', Validators.required],
    salary: [null as number | null, [Validators.required, Validators.min(1000)]],
    date_of_joining: [null as Date | null, Validators.required],
    department: ['', Validators.required],
    employee_photo: [null as string | null],
  });

  ngOnInit() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.graphQLErrors?.[0]?.message ?? 'Failed to load employees');
        this.loading.set(false);
      },
    });
  }

  openAddDialog() {
    this.form.reset();
    this.imagePreview.set(null);
    this.formError.set('');
    this.dialogVisible.set(true);
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview.set(base64);
      this.form.patchValue({ employee_photo: base64 });
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.formError.set('');

    const v = this.form.value;
    this.employeeService.addEmployee({
      first_name: v.first_name!,
      last_name: v.last_name!,
      email: v.email!,
      gender: v.gender!,
      designation: v.designation!,
      salary: v.salary!,
      date_of_joining: v.date_of_joining!,
      department: v.department!,
      employee_photo: v.employee_photo ?? undefined,
    }).subscribe({
      next: (employee) => {
        this.employees.update((list) => [...list, employee]);
        this.dialogVisible.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        this.formError.set(err.graphQLErrors?.[0]?.message ?? 'Failed to add employee');
        this.submitting.set(false);
      },
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
