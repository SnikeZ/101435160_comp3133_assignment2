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
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
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
    Dialog, ConfirmDialog, Select, InputNumber, DatePicker,
  ],
  providers: [ConfirmationService],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class EmployeesComponent implements OnInit {
  private auth = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);

  // Table state
  employees = signal<Employee[]>([]);
  loading = signal(true);
  error = signal('');

  // Search state
  searchDepartment = signal('');
  searchDesignation = signal('');

  onSearch() {
    const dept = this.searchDepartment().trim() || undefined;
    const desig = this.searchDesignation().trim() || undefined;
    this.loading.set(true);
    this.error.set('');
    this.employeeService.searchEmployees(dept, desig).subscribe({
      next: (data) => { this.employees.set(data); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.graphQLErrors?.[0]?.message ?? 'Search failed');
        this.loading.set(false);
      },
    });
  }

  clearSearch() {
    this.searchDepartment.set('');
    this.searchDesignation.set('');
    this.loading.set(true);
    this.error.set('');
    this.employeeService.getEmployees().subscribe({
      next: (data) => { this.employees.set(data); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.graphQLErrors?.[0]?.message ?? 'Failed to load employees');
        this.loading.set(false);
      },
    });
  }

  // Dialog state
  dialogVisible = signal(false);
  dialogMode = signal<'add' | 'edit'>('add');
  editingId = signal<string | null>(null);
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
    this.dialogMode.set('add');
    this.editingId.set(null);
    this.form.reset();
    this.imagePreview.set(null);
    this.formError.set('');
    this.dialogVisible.set(true);
  }

  openEditDialog(employee: Employee) {
    this.dialogMode.set('edit');
    this.editingId.set(employee.id);
    this.formError.set('');

    const dateOfJoining = employee.date_of_joining ? new Date(employee.date_of_joining) : null;

    this.form.setValue({
      first_name: employee.first_name ?? '',
      last_name: employee.last_name ?? '',
      email: employee.email ?? '',
      gender: employee.gender ?? '',
      designation: employee.designation ?? '',
      salary: employee.salary ?? null,
      date_of_joining: dateOfJoining,
      department: employee.department ?? '',
      employee_photo: employee.employee_photo ?? null,
    });

    this.imagePreview.set(employee.employee_photo ?? null);
    this.dialogVisible.set(true);
  }

  confirmDelete(employee: Employee) {
    this.confirmationService.confirm({
      message: `Delete ${employee.first_name ?? ''} ${employee.last_name ?? ''}? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.employeeService.deleteEmployee(employee.id).subscribe({
          next: () => {
            this.employees.update((list) => list.filter((e) => e.id !== employee.id));
          },
          error: (err) => {
            this.error.set(err.graphQLErrors?.[0]?.message ?? 'Failed to delete employee');
          },
        });
      },
    });
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

    if (this.dialogMode() === 'edit') {
      this.employeeService.updateEmployee({
        id: this.editingId()!,
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
        next: (updated) => {
          this.employees.update((list) =>
            list.map((e) => (e.id === updated.id ? updated : e))
          );
          this.dialogVisible.set(false);
          this.submitting.set(false);
        },
        error: (err) => {
          this.formError.set(err.graphQLErrors?.[0]?.message ?? 'Failed to update employee');
          this.submitting.set(false);
        },
      });
    } else {
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
