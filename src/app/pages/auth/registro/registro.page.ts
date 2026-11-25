import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonText,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { IRegisterRequest } from '../../../models/auth.model';
import { IPokemon } from '../../../models/pokemon.model';
import { Auth } from '../../../services/auth';
import { Pokemon } from '../../../services/pokemon';

interface IStagePokemon {
  pokemon: IPokemon;
  glowClass: string;
  top: string;
  left: string;
  rotation: string;
}

interface ILedgePokemon {
  pokemon: IPokemon;
  slotClass: string;
  glowClass: string;
}

// Función validadora personalizada para comprobar que ambas contraseñas sean iguales
function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonText,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class RegistroPage implements OnInit {
  private auth = inject(Auth);
  private pokemonService = inject(Pokemon);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  public errorMessage = signal<string>('');
  public showPassword = signal<boolean>(false);
  public showConfirmPassword = signal<boolean>(false);
  public passwordValue = signal<string>('');

  public stagePokemons = signal<IStagePokemon[]>([]);
  public ledgePokemons = signal<ILedgePokemon[]>([]);
  public buttonPokemon = signal<IPokemon | undefined>(undefined);

  // Calcula automáticamente el nivel de seguridad según lo que el usuario escribe
  public passwordStrength = computed(() => {
    const pwd = this.passwordValue();

    if (!pwd) {
      return { label: 'SEGURIDAD', cssClass: 'strength-neutral' };
    }

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) {
      return { label: 'DÉBIL', cssClass: 'strength-weak' };
    }
    if (score === 2) {
      return { label: 'MEDIA', cssClass: 'strength-medium' };
    }
    return { label: 'FUERTE', cssClass: 'strength-strong' };
  });

  public registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatchValidator }
  );

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      shieldCheckmarkOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  async ngOnInit() {
    const stagePool = [
      { id: 151, glowClass: 'glow-pink' },   // Mew
      { id: 150, glowClass: 'glow-purple' }, // Mewtwo
      { id: 39,  glowClass: 'glow-pink' },   // Jigglypuff
      { id: 9,   glowClass: 'glow-cyan' },   // Blastoise
      { id: 448, glowClass: 'glow-cyan' },   // Lucario
      { id: 197, glowClass: 'glow-cyan' },   // Umbreon
      { id: 52,  glowClass: 'glow-lime' },   // Meowth
      { id: 6,   glowClass: 'glow-pink' },   // Charizard
      { id: 149, glowClass: 'glow-lime' },   // Dragonite
      { id: 54,  glowClass: 'glow-lime' },   // Psyduck
      { id: 94,  glowClass: 'glow-purple' }, // Gengar
      { id: 282, glowClass: 'glow-pink' },   // Gardevoir
      { id: 778, glowClass: 'glow-purple' }, // Mimikyu
      { id: 658, glowClass: 'glow-cyan' },   // Greninja
    ];

    const scatteredAnchors = [
      { top: 3,  left: 4 },
      { top: 7,  left: 20 },
      { top: 23, left: 10 },
      { top: 37, left: 2 },
      { top: 50, left: 19 },
      { top: 65, left: 5 },
      { top: 77, left: 21 },
      { top: 2,  left: 83 },
      { top: 8,  left: 69 },
      { top: 25, left: 80 },
      { top: 39, left: 68 },
      { top: 53, left: 83 },
      { top: 67, left: 70 },
      { top: 77, left: 82 },
    ];

    // Los 3 iniciales de Kanto + Pikachu para dar la bienvenida a nuevos entrenadores
    const ledgeConfig = [
      { id: 1,  slotClass: 'ledge-edge', glowClass: 'glow-lime' }, // Bulbasaur
      { id: 4,  slotClass: 'ledge-mid',  glowClass: 'glow-pink' }, // Charmander
      { id: 7,  slotClass: 'ledge-mid',  glowClass: 'glow-cyan' }, // Squirtle
      { id: 25, slotClass: 'ledge-edge', glowClass: 'glow-lime' }, // Pikachu
    ];

    try {
      const [fetchedStage, ledgeResults, eeveeResult] = await Promise.all([
        Promise.all(
          stagePool.map(async (item) => ({
            pokemon: await this.pokemonService.getPokemon(item.id),
            glowClass: item.glowClass,
          }))
        ),
        Promise.all(
          ledgeConfig.map(async (item) => ({
            pokemon: await this.pokemonService.getPokemon(item.id),
            slotClass: item.slotClass,
            glowClass: item.glowClass,
          }))
        ),
        this.pokemonService.getPokemon(133), // Eevee posado sobre el botón
      ]);

      const shuffledAnchors = this.shuffleArray(scatteredAnchors);

      const randomizedStage: IStagePokemon[] = fetchedStage.map((entry, idx) => {
        const anchor = shuffledAnchors[idx];
        const jitterTop = anchor.top + (Math.random() - 0.5) * 4;
        const jitterLeft = anchor.left + (Math.random() - 0.5) * 4;
        const randomDeg = Math.round((Math.random() - 0.5) * 24);

        return {
          pokemon: entry.pokemon,
          glowClass: entry.glowClass,
          top: `${Math.max(1, Math.min(82, jitterTop)).toFixed(1)}%`,
          left: `${Math.max(1, Math.min(86, jitterLeft)).toFixed(1)}%`,
          rotation: `rotate(${randomDeg}deg)`,
        };
      });

      this.stagePokemons.set(randomizedStage);
      this.ledgePokemons.set(ledgeResults);
      this.buttonPokemon.set(eeveeResult);
    } catch (error) {
      console.error('No se pudieron cargar los sprites de la API:', error);
    }
  }

  public onPasswordInput(event: Event): void {
    const input = event.target as HTMLIonInputElement;
    this.passwordValue.set(String(input.value ?? ''));
  }

  public togglePasswordVisibility(): void {
    this.showPassword.update((current) => !current);
  }

  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((current) => !current);
  }

  private shuffleArray<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  async onSubmit() {
    this.errorMessage.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.registerForm.getRawValue();
    const newUser: IRegisterRequest = { username, email, password };

    const loading = await this.loadingController.create({
      message: 'Creando cuenta de entrenador...',
    });
    await loading.present();

    try {
      const createdUser = await this.auth.register(newUser);
      console.log('Usuario registrado en FakeStoreAPI con ID:', createdUser.id);

      const toast = await this.toastController.create({
        message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.',
        duration: 2800,
        position: 'top',
        color: 'success',
      });
      await toast.present();

      this.router.navigateByUrl('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';

      if (message === 'SERVER_ERROR') {
        this.errorMessage.set('Error en el servidor. Intenta más tarde.');
      } else {
        this.errorMessage.set('No se pudo conectar con la API.');
      }
    } finally {
      await loading.dismiss();
    }
  }
}