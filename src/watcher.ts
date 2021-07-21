import config from 'config';
import { singleton } from 'tsyringe';
import { PullManager } from './pullManager';
import { Readiness } from './probe/readindess';
import { Liveness } from './probe/liveness';

@singleton()
export class Watcher {
  public constructor(private readonly pullManager: PullManager, private readonly liveness: Liveness, private readonly readiness: Readiness) {}

  public async watch(): Promise<void> {
    try {
      const pullTimeOutMS = config.get<number>('pullTimeOutMS');
      const livenessKillTimeOutMS = config.get<number>('livenessKillTimeOutMS');
      if (await this.pullManager.pullAndCheckForUpdate()) {
        console.log('do something');
      } else {
        this.readiness.kill();
        await this.delay(livenessKillTimeOutMS);
        this.liveness.kill();
      }
      setTimeout(() => {
        void this.watch();
      }, pullTimeOutMS);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`${error}`);
    }
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
