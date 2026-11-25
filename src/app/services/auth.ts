import { computed, Injectable, signal } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import {
  ILoginRequest,
  ILoginResponse,
  IRegisterRequest,
  IRegisterResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly URL_BASE = 'https://fakestoreapi.com/auth/login';
  private readonly USERS_URL = 'https://fakestoreapi.com/users';
  private readonly TOKEN_KEY = 'auth_token';

  public token = signal<string | null>(null);
  public isLoggedIn = computed(() => this.token() !== null);

  async login(credentials: ILoginRequest, remember: boolean): Promise<void> {
    const response: HttpResponse = await CapacitorHttp.post({
      url: this.URL_BASE,
      headers: { 'Content-Type': 'application/json' },
      data: credentials,
    });

    if (response.status === 401) {
      throw new Error('INVALID_CREDENTIALS');
    }
    if (response.status < 200 || response.status >= 300) {
      throw new Error('SERVER_ERROR');
    }

    const { token } = response.data as ILoginResponse;
    this.token.set(token);

    if (remember) {
      await Preferences.set({ key: this.TOKEN_KEY, value: token });
    }
  }

  async register(userData: IRegisterRequest): Promise<IRegisterResponse> {
    const response: HttpResponse = await CapacitorHttp.post({
      url: this.USERS_URL,
      headers: { 'Content-Type': 'application/json' },
      data: userData,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('SERVER_ERROR');
    }

    return response.data as IRegisterResponse;
  }

  async loadToken(): Promise<void> {
    const { value } = await Preferences.get({ key: this.TOKEN_KEY });
    this.token.set(value);
  }

  async logout(): Promise<void> {
    this.token.set(null);
    await Preferences.remove({ key: this.TOKEN_KEY });
  }
}