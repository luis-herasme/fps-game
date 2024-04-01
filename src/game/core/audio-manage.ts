export class AudioManager<T extends string[]> {
  private readonly audios: Map<T[number], HTMLAudioElement> = new Map();
  private loaded = false;
  private muted: boolean = false;
  private audioFiles: T;

  constructor(audioFiles: T) {
    this.audioFiles = audioFiles;
  }

  async load() {
    return new Promise<void>(async (resolve) => {
      if (this.loaded) {
        resolve();
      }

      let loaded = 0;

      for (const audioFile of this.audioFiles) {
        const audio = new Audio(audioFile);
        this.audios.set(audioFile, audio);

        audio.onloadeddata = () => {
          loaded = loaded + 1;

          if (loaded === this.audioFiles.length) {
            this.loaded = true;
            resolve();
          }
        };
      }
    });
  }

  play<K extends T[number]>(name: K) {
    if (!this.loaded || this.muted) return;

    const audio = this.audios.get(name);
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.currentTime = 0;
    }
  }
}
