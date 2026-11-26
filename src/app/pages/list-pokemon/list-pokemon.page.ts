import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { IPokemon } from '../../models/pokemon.model';
import { Auth } from '../../services/auth';
import { Pokemon } from '../../services/pokemon';

@Component({
  selector: 'app-list-pokemon',
  templateUrl: './list-pokemon.page.html',
  styleUrls: ['./list-pokemon.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class ListPokemonPage implements OnInit {
  private pokemonService = inject(Pokemon);
  private auth = inject(Auth);
  private router = inject(Router);

  public pokemons = signal<IPokemon[]>([]);

  constructor() {
    addIcons({ logOutOutline });
  }

  async ngOnInit() {
    this.pokemonService.resetPagination();
    await this.morePokemon();
  }

  async morePokemon(event?: InfiniteScrollCustomEvent) {
    try {
      const newPokemons = await this.pokemonService.getPokemons();
      if (newPokemons) {
        this.pokemons.update((current) => [...current, ...newPokemons]);
      } else if (event) {
        event.target.disabled = true;
      }
    } catch (error) {
      console.error('Error al cargar los Pokémon:', error);
    } finally {
      event?.target.complete();
    }
  }

  goToDetail(pokemon: IPokemon) {
    this.router.navigate(['/detail-pokemon', pokemon.id]);
  }

  async onLogout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}