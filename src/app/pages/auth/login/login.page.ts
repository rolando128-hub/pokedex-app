import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosedOutline, logInOutline, personOutline } from 'ionicons/icons';
import { ILoginRequest } from '../../../models/auth.model';
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

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
export class LoginPage implements OnInit {
  private auth = inject(Auth);
  private pokemonService = inject(Pokemon);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private loadingController = inject(LoadingController);

  public errorMessage = signal<string>('');
  public stagePokemons = signal<IStagePokemon[]>([]);
  public ledgePokemons = signal<ILedgePokemon[]>([]);
  public buttonPokemon = signal<IPokemon | undefined>(undefined);

  public loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  constructor() {
    addIcons({ personOutline, lockClosedOutline, logInOutline });
  }

  async ngOnInit() {
    const stagePool = [
      { id: 151, glowClass: 'glow-pink' },   // Mew
      { id: 150, glowClass: 'glow-purple' }, // Mewtwo
      { id: 1,   glowClass: 'glow-lime' },   // Bulbasaur
      { id: 9,   glowClass: 'glow-cyan' },   // Blastoise
      { id: 448, glowClass: 'glow-cyan' },   // Lucario
      { id: 197, glowClass: 'glow-cyan' },   // Umbreon
      { id: 52,  glowClass: 'glow-lime' },   // Meowth
      { id: 6,   glowClass: 'glow-pink' },   // Charizard
      { id: 149, glowClass: 'glow-lime' },   // Dragonite
      { id: 4,   glowClass: 'glow-pink' },   // Charmander
      { id: 94,  glowClass: 'glow-purple' }, // Gengar
      { id: 282, glowClass: 'glow-pink' },   // Gardevoir
      { id: 778, glowClass: 'glow-purple' }, // Mimikyu
      { id: 658, glowClass: 'glow-cyan' },   // Greninja
    ];

    // 14 zonas esparcidas por toda la pantalla sin tapar el formulario central
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

    const ledgeConfig = [
      { id: 39,  slotClass: 'ledge-edge', glowClass: 'glow-cyan' }, // Jigglypuff
      { id: 54,  slotClass: 'ledge-mid',  glowClass: 'glow-lime' }, // Psyduck
      { id: 196, slotClass: 'ledge-mid',  glowClass: 'glow-pink' }, // Espeon
      { id: 133, slotClass: 'ledge-edge', glowClass: 'glow-cyan' }, // Eevee
    ];

    try {
      const [fetchedStage, ledgeResults, pikachuResult] = await Promise.all([
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
        this.pokemonService.getPokemon(25), // Pikachu sobre el botón Conectar
      ]);

      // Mezcla aleatoria de posiciones y ángulos en cada carga
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
      this.buttonPokemon.set(pikachuResult);
    } catch (error) {
      console.error('No se pudieron cargar los sprites de la API:', error);
    }
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

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password, remember } = this.loginForm.getRawValue();
    const credentials: ILoginRequest = { username, password };

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    try {
      await this.auth.login(credentials, remember);
      this.router.navigateByUrl('/list-pokemon');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';

      if (message === 'INVALID_CREDENTIALS') {
        this.errorMessage.set('Usuario o contraseña incorrectos.');
      } else if (message === 'SERVER_ERROR') {
        this.errorMessage.set('Error en el servidor. Intenta más tarde.');
      } else {
        this.errorMessage.set('No se pudo conectar con la API.');
      }
    } finally {
      await loading.dismiss();
    }
  }
}