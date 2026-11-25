import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonImg,
  IonProgressBar,
  IonRow,
  IonText,
  LoadingController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { IPokemon } from '../../models/pokemon.model';
import { GetStatPipe } from '../../pipes/get-stat-pipe';
import { Pokemon } from '../../services/pokemon';

@Component({
  selector: 'app-detail-pokemon',
  templateUrl: './detail-pokemon.page.html',
  styleUrls: ['./detail-pokemon.page.scss'],
  imports: [
    IonContent,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonProgressBar,
    IonFab,
    IonFabButton,
    IonIcon,
    GetStatPipe,
  ],
})
export class DetailPokemonPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pokemonService = inject(Pokemon);
  private loadingController = inject(LoadingController);

  // Signal donde guardaremos el Pokémon que llegue de la API
  public pokemon = signal<IPokemon | null>(null);

  // Arreglo con las 6 estadísticas en el orden exacto de los colores del SCSS
  public pokemonStats = [
    { name: 'hp', display: 'HP' },
    { name: 'attack', display: 'Ataque' },
    { name: 'defense', display: 'Defensa' },
    { name: 'special-attack', display: 'At. Esp.' },
    { name: 'special-defense', display: 'Def. Esp.' },
    { name: 'speed', display: 'Velocidad' },
  ];

  constructor() {
    // Registramos el ícono de flecha hacia atrás para el botón flotante
    addIcons({ arrowBack });
  }

  ionViewWillEnter() {
    // Leemos el parámetro ':id' que viene en la URL
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.getPokemon(Number(id));
    }
  }

  async getPokemon(id: number) {
    const loading = await this.loadingController.create({
      message: 'Cargando Pokémon...',
    });
    await loading.present();

    this.pokemonService
      .getPokemon(id)
      .then((pokemon: IPokemon) => {
        console.log('Detalle del Pokémon:', pokemon);
        this.pokemon.set(pokemon);
      })
      .catch((error) => {
        console.error('Error al obtener el detalle del Pokémon:', error);
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  goBack() {
    this.router.navigateByUrl('list-pokemon');
  }
}
