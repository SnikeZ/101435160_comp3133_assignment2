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

const EMPLOYEE_FIELDS = `
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
`;

const GET_EMPLOYEES = gql`
  query GetEmployees {
    getEmployees { ${EMPLOYEE_FIELDS} }
  }
`;

const ADD_EMPLOYEE = gql`
  mutation AddEmployee(
    $first_name: String!
    $last_name: String!
    $email: String!
    $gender: String!
    $designation: String!
    $salary: Float!
    $date_of_joining: Date!
    $department: String!
    $employee_photo: String
  ) {
    addEmployee(
      first_name: $first_name
      last_name: $last_name
      email: $email
      gender: $gender
      designation: $designation
      salary: $salary
      date_of_joining: $date_of_joining
      department: $department
      employee_photo: $employee_photo
    ) { ${EMPLOYEE_FIELDS} }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $id: ID!
    $first_name: String
    $last_name: String
    $email: String
    $gender: String
    $designation: String
    $salary: Float
    $date_of_joining: Date
    $department: String
    $employee_photo: String
  ) {
    updateEmployee(
      id: $id
      first_name: $first_name
      last_name: $last_name
      email: $email
      gender: $gender
      designation: $designation
      salary: $salary
      date_of_joining: $date_of_joining
      department: $department
      employee_photo: $employee_photo
    ) { ${EMPLOYEE_FIELDS} }
  }
`;

export interface AddEmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: Date;
  department: string;
  employee_photo?: string;
}

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

export interface UpdateEmployeeInput extends Partial<AddEmployeeInput> {
  id: string;
}

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

  addEmployee(input: AddEmployeeInput) {
    return this.apollo
      .mutate<{ addEmployee: Employee }>({
        mutation: ADD_EMPLOYEE,
        variables: input,
      })
      .pipe(map((res) => res.data!.addEmployee));
  }

  updateEmployee(input: UpdateEmployeeInput) {
    return this.apollo
      .mutate<{ updateEmployee: Employee }>({
        mutation: UPDATE_EMPLOYEE,
        variables: input,
      })
      .pipe(map((res) => res.data!.updateEmployee));
  }

  deleteEmployee(id: string) {
    return this.apollo
      .mutate<{ deleteEmployee: boolean }>({
        mutation: DELETE_EMPLOYEE,
        variables: { id },
      })
      .pipe(map((res) => res.data!.deleteEmployee));
  }
}
