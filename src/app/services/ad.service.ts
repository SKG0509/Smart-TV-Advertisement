import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdService {
  private ads: string[] = ['assets/ad.mp4'];
  private currentAdIndex = 0;

  getSkipTime(): number {
    return 5; // seconds
  }

  getNextAd(): string {
    const ad = this.ads[this.currentAdIndex];
    this.currentAdIndex = (this.currentAdIndex + 1) % this.ads.length;
    return ad;
  }
}
