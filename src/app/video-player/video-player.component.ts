import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AdService } from '../services/ad.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true })
  player!: ElementRef<HTMLVideoElement>;

  mainVideoUrl = 'assets/jagan.mp4';
  isAdPlaying = false;
  canSkipAd = false;
  skipTimer = 0;
  skipInterval: any;
  adInterval: any; // Timer to trigger ad every 5 mins
  mainVideoCurrentTime = 0;

  constructor(private adService: AdService) {}

  ngOnInit() {
    this.registerRemoteControl();
  }

  ngAfterViewInit() {
    this.playMainVideo();
    this.scheduleAds(); // Start periodic ads
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.onRemoteKeyPress);
    clearInterval(this.skipInterval);
    clearInterval(this.adInterval);
  }

  // ------------------- VIDEO FLOW -------------------

  playMainVideo() {
    const video = this.player.nativeElement;
    video.src = this.mainVideoUrl;
    video.currentTime = this.mainVideoCurrentTime;

    video.play().catch(() => {
      console.log('Autoplay blocked, waiting for user interaction');
    });
  }

  scheduleAds() {
    // Play ad every 5 mins (300000ms)
    this.adInterval = setInterval(() => {
      this.playAd();
    }, 1 * 60 * 1000); // 5 mins
  }

  playAd() {
    const video = this.player.nativeElement;

    // Pause main video
    this.mainVideoCurrentTime = video.currentTime;
    video.pause();

    // Play ad
    this.isAdPlaying = true;
    this.canSkipAd = false;
    this.skipTimer = this.adService.getSkipTime();

    video.src = this.adService.getNextAd();
    video.currentTime = 0;

    video.play().catch(() => {
      console.log('Ad autoplay blocked');
    });

    this.startSkipCountdown();
  }

  startSkipCountdown() {
    clearInterval(this.skipInterval);
    this.skipInterval = setInterval(() => {
      this.skipTimer--;
      if (this.skipTimer === 0) {
        this.canSkipAd = true;
        clearInterval(this.skipInterval);
      }
    }, 1000);
  }

  skipAd() {
    clearInterval(this.skipInterval);
    this.isAdPlaying = false;
    this.playMainVideo();
  }

  onVideoEnded() {
    if (this.isAdPlaying) {
      this.isAdPlaying = false;
      this.playMainVideo();
    }
  }

  // ------------------- SMART TV REMOTE -------------------

  registerRemoteControl() {
    window.addEventListener('keydown', this.onRemoteKeyPress);
  }

  onRemoteKeyPress = (event: KeyboardEvent) => {
    const video = this.player.nativeElement;

    switch (event.keyCode) {
      case 13: // OK
        if (this.canSkipAd && this.isAdPlaying) {
          this.skipAd();
        } else {
          video.paused ? video.play() : video.pause();
        }
        break;
      case 39: // ➡️ Forward
        video.currentTime += 10;
        break;
      case 37: // ⬅️ Backward
        video.currentTime -= 10;
        break;
    }
  };
}
