import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id username email }
    }
  }
`;

const SIGN_UP = gql`
  mutation SignUp($username: String!, $email: String!, $password: String!) {
    signUp(username: $username, email: $email, password: $password) {
      id username email
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apollo = inject(Apollo);

  login(email: string, password: string) {
    return this.apollo
      .mutate<{ login: { token: string; user: { id: string; username: string; email: string } } }>({
        mutation: LOGIN,
        variables: { email, password },
      })
      .pipe(map((res) => res.data!.login));
  }

  signUp(username: string, email: string, password: string) {
    return this.apollo
      .mutate<{ signUp: { id: string; username: string; email: string } }>({
        mutation: SIGN_UP,
        variables: { username, email, password },
      })
      .pipe(map((res) => res.data!.signUp));
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}
