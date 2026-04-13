import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

export interface Employee {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  gender?: string | null;
  designation?: string | null;
  salary?: number | null;
  date_of_joining?: string | null;
  department?: string | null;
  employee_photo?: string | null;
}

const GET_EMPLOYEES = gql`
  query GetEmployees {
    getEmployees {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apollo = inject(Apollo);

  getEmployees() {
    return this.apollo
      .query<{ getEmployees: Employee[] }>({
        query: GET_EMPLOYEES,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data!.getEmployees));
  }
}
